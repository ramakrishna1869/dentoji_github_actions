// middleware/subscriptionMiddleware.js
import Subscription from '../models/Subscription.js';
import Patient from '../models/Patient.js';
import Receptionist from '../models/Receptionist.js';
import Hospital from '../models/Hospital.js';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to get doctor's adminId for both Admin and Receptionist
const getDoctorAdminId = async (userRole, userId, tokenAdminId) => {
  // ADMIN → Use their own ID
  if (userRole === "Admin") {
    return userId;
  }
  
  // RECEPTIONIST → Use the DOCTOR's adminId
  if (userRole === "Receptionist") {
    // First try from token
    if (tokenAdminId) {
      return tokenAdminId;
    }
    
    // Fallback: find via receptionist record
    const receptionist = await Receptionist.findById(userId)
      .select('admin hospitalId')
      .populate('admin', '_id')
      .lean();

    if (!receptionist) {
      return null;
    }

    let doctorId = receptionist.admin?._id?.toString() 
      || receptionist.admin?.toString();

    // Fallback to hospital lookup
    if (!doctorId && receptionist.hospitalId) {
      const hospital = await Hospital.findById(receptionist.hospitalId)
        .select('adminId')
        .lean();
      doctorId = hospital?.adminId?.toString();
    }

    return doctorId;
  }

  return null;
};

// Check if user has active subscription
export const requireActiveSubscription = async (req, res, next) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const tokenAdminId = req.user?.adminId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get doctor's adminId (works for both Admin and Receptionist)
    const targetAdminId = await getDoctorAdminId(userRole, userId, tokenAdminId);

    if (!targetAdminId) {
      return res.status(400).json({
        success: false,
        message: 'Unable to determine doctor ID for subscription check.'
      });
    }

    const subscription = await Subscription.findOne({
      adminId: new mongoose.Types.ObjectId(targetAdminId),
      status: 'active',
      endDate: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required',
        needsSubscription: true,
        redirectTo: '/pricing'
      });
    }

    req.subscription = subscription;
    req.targetAdminId = targetAdminId; // Pass this to next middleware
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify subscription'
    });
  }
};

// Check patient limit for Basic Plan (250 patients)
export const checkPatientLimit = async (req, res, next) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const tokenAdminId = req.user?.adminId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get doctor's adminId (works for both Admin and Receptionist)
    const targetAdminId = await getDoctorAdminId(userRole, userId, tokenAdminId);

    if (!targetAdminId) {
      return res.status(400).json({
        success: false,
        message: 'Unable to determine doctor ID for patient limit check.'
      });
    }

    const subscription = await Subscription.findOne({
      adminId: new mongoose.Types.ObjectId(targetAdminId),
      status: 'active',
      endDate: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required',
        needsSubscription: true
      });
    }

    // Get current patient count using doctor's ID
    const currentPatientCount = await Patient.countDocuments({ 
      adminId: new mongoose.Types.ObjectId(targetAdminId),
      status: { $ne: 'deleted' }
    });

    const maxPatients = subscription.features.maxPatients;
    
    // Check if limit reached (-1 means unlimited for Monthly/Yearly)
    if (maxPatients !== -1 && currentPatientCount >= maxPatients) {
      return res.status(403).json({
        success: false,
        message: `Patient limit reached. Your ${subscription.planType} allows ${maxPatients} patients.`,
        currentPatients: currentPatientCount,
        maxPatients: maxPatients,
        needsUpgrade: true,
        planType: subscription.planType,
        redirectTo: '/pricing'
      });
    }

    req.subscription = subscription;
    req.currentPatientCount = currentPatientCount;
    req.maxPatients = maxPatients;
    req.targetAdminId = targetAdminId;
    next();
  } catch (error) {
    console.error('Patient limit check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check patient limit'
    });
  }
};

// Get subscription features endpoint
export const getSubscriptionFeatures = async (req, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "No token provided" 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userRole = decoded.role;
    const userId = decoded.id;
    const tokenAdminId = decoded.adminId;

    // Get doctor's adminId (works for both Admin and Receptionist)
    const targetAdminId = await getDoctorAdminId(userRole, userId, tokenAdminId);

    if (!targetAdminId) {
      return res.status(400).json({
        success: false,
        message: "Unable to determine doctor ID for subscription check."
      });
    }

    console.log("📊 Subscription Features Request:", { 
      userRole, 
      userId, 
      targetAdminId 
    });

    // Fetch subscription using doctor's ID
    const subscription = await Subscription.findOne({
      adminId: new mongoose.Types.ObjectId(targetAdminId),
      status: 'active',
      endDate: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    if (!subscription) {
      return res.status(200).json({
        success: true,
        hasSubscription: false,
        features: null
      });
    }

    // Get patient count using doctor's ID
    const currentPatientCount = await Patient.countDocuments({ 
      adminId: new mongoose.Types.ObjectId(targetAdminId),
      status: { $ne: 'deleted' }
    });

    res.status(200).json({
      success: true,
      hasSubscription: true,
      subscription: {
        planType: subscription.planType,
        features: subscription.features,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        daysRemaining: subscription.getDaysRemaining(),
        currentPatientCount,
        maxPatients: subscription.features.maxPatients
      }
    });

  } catch (err) {
    console.error("Get subscription features error:", err);
    
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false,
        message: "Invalid or expired token" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: err.message 
    });
  }
};