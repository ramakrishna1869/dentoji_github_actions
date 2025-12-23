// Updated receptionistController.js - With Doctor Subscription Check
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Receptionist from '../models/Receptionist.js';
import Admin from '../models/Admin.js';
import Hospital from '../models/Hospital.js';
import { jwtDecode } from 'jwt-decode';
import { SubscriptionService } from '../services/subscriptionService.js'; // ADD THIS IMPORT
import Staff from '../models/Staff.js'; // Make sure to import
// Helper function to generate readable passwords
const generateReadablePassword = () => {
  const adjectives = ['Happy', 'Bright', 'Swift', 'Smart', 'Quick', 'Fresh', 'Clean', 'Sharp', 'Bold', 'Cool'];
  const nouns = ['Tiger', 'Eagle', 'River', 'Ocean', 'Mountain', 'Forest', 'Garden', 'Bridge', 'Star', 'Moon'];
  const numbers = Math.floor(Math.random() * 99) + 10;
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${adjective}${noun}${numbers}!`;
};

// Hash password helper
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Compare password helper
const comparePassword = async (plainPassword, hashedPassword) => {
  if (!hashedPassword) {
    return false;
  }
  
  if (!hashedPassword.startsWith('$2a$') && !hashedPassword.startsWith('$2b$')) {
    return plainPassword === hashedPassword;
  }
  
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Generate JWT token
const generateToken = (user, role) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: role,
      hospitalId: user.hospitalId
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// ============================================
// UPDATED LOGIN RECEPTIONIST FUNCTION
// ============================================
export const loginReceptionist = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find receptionist with password field
    const receptionist = await Receptionist.findOne({ email: email.toLowerCase().trim() })
      .select('+password +tempPassword')
      .populate('hospitalId', 'name location')
      .populate('admin', 'name email');

    if (!receptionist) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check account status
    if (receptionist.status === 'Suspended') {
      return res.status(403).json({ 
        message: 'Account suspended. Please contact administration.',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    if (receptionist.status === 'Inactive') {
      return res.status(403).json({ 
        message: 'Account inactive. Please contact administration.',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Check if account is locked
    if (receptionist.isLocked) {
      const lockExpiry = new Date(receptionist.lockUntil);
      const now = new Date();
      
      if (lockExpiry > now) {
        const minutesLeft = Math.ceil((lockExpiry - now) / (1000 * 60));
        return res.status(423).json({ 
          message: `Account temporarily locked. Try again in ${minutesLeft} minutes.`,
          code: 'ACCOUNT_LOCKED'
        });
      } else {
        receptionist.loginAttempts = 0;
        receptionist.lockUntil = null;
        await receptionist.save({ validateBeforeSave: false });
      }
    }

    // Password validation
    let isPasswordValid = false;

    if (!receptionist.password) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    try {
      isPasswordValid = await comparePassword(password, receptionist.password);
    } catch (compareError) {
      console.error('Password comparison error:', compareError);
      return res.status(500).json({ message: 'Authentication error. Please try again.' });
    }
    
    if (!isPasswordValid) {
      // Handle failed login attempts
      receptionist.loginAttempts = (receptionist.loginAttempts || 0) + 1;
      
      if (receptionist.loginAttempts >= 5) {
        receptionist.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        await receptionist.save({ validateBeforeSave: false });
        return res.status(423).json({ 
          message: 'Account temporarily locked due to too many failed attempts. Please try again in 15 minutes.',
          code: 'ACCOUNT_LOCKED'
        });
      }
      
      await receptionist.save({ validateBeforeSave: false });
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // ============================================
    // ✅ STEP 1: CHECK DOCTOR'S SUBSCRIPTION STATUS
    // ============================================
    const adminId = receptionist.admin?._id || receptionist.admin;
    
    if (!adminId) {
      return res.status(400).json({ 
        message: 'No associated doctor found. Please contact administration.',
        code: 'NO_DOCTOR_FOUND'
      });
    }

    console.log('🔍 Checking subscription for doctor:', adminId);

    // Check if doctor has active subscription
    const subscriptionStatus = await SubscriptionService.checkSubscriptionStatus(adminId);
    
    console.log('📊 Doctor Subscription Status:', subscriptionStatus);

    if (!subscriptionStatus.hasActiveSubscription) {
      return res.status(402).json({ 
        message: "Your doctor's subscription has expired. Please contact your doctor to renew their plan.",
        code: 'DOCTOR_SUBSCRIPTION_EXPIRED',
        doctorName: receptionist.admin?.name || 'your doctor',
        doctorEmail: receptionist.admin?.email || null
      });
    }

    // ============================================
    // ✅ STEP 2: GET RECEPTIONIST PERMISSIONS
    // ============================================
    const permissions = receptionist.permissions || [];
    
    // ============================================
    // ✅ STEP 3: SUCCESSFUL LOGIN
    // ============================================
    receptionist.loginAttempts = 0;
    receptionist.lockUntil = null;
    receptionist.lastLogin = new Date();
    
    if (receptionist.isFirstLogin) {
      receptionist.isFirstLogin = false;
    }
    
    await receptionist.save({ validateBeforeSave: false });

    // Generate JWT token
    const token = generateToken(receptionist, 'Receptionist');

    // Prepare response data
    const responseData = {
      id: receptionist._id,
      name: receptionist.name,
      email: receptionist.email,
      phone: receptionist.phone,
      role: 'Receptionist',
      position: receptionist.position,
      status: receptionist.status,
      permissions: permissions,
      adminId: receptionist.admin?._id || receptionist.admin,
      adminName: receptionist.admin?.name || null,
      hospitalId: receptionist.hospitalId?._id || receptionist.hospitalId,
      isFirstLogin: false,
      lastLogin: receptionist.lastLogin
    };

    // ============================================
    // ✅ STEP 4: RETURN SUCCESS RESPONSE WITH SUBSCRIPTION DATA
    // ============================================
    res.status(200).json({
      message: 'Login successful',
      token: token,
      receptionist: responseData,
      hospital: receptionist.hospitalId,
      // ✅ IMPORTANT: Include doctor's subscription in response
      doctorSubscription: {
        hasActiveSubscription: true,
        isActive: true,
        planType: subscriptionStatus.planType,
        daysRemaining: subscriptionStatus.daysRemaining,
        endDate: subscriptionStatus.endDate
      },
      redirectTo: '/patients'
    });

  } catch (error) {
    console.error('❌ Error logging in receptionist:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message
    });
  }
};

// ============================================
// OTHER FUNCTIONS (UNCHANGED)
// ============================================

export const fixPasswordEncryption = async (req, res) => {
  try {
    const receptionists = await Receptionist.find({
      $or: [
        { password: { $regex: /^(?!\$2[ab]\$).*/ } },
        { password: { $exists: false } },
        { password: null },
        { password: '' }
      ]
    });

    let fixed = 0;
    const results = [];

    for (let receptionist of receptionists) {
      try {
        let newTempPassword;
        let shouldGenerateNew = false;

        if (!receptionist.password || receptionist.password === '' || receptionist.password === null) {
          shouldGenerateNew = true;
          newTempPassword = generateReadablePassword();
        } else if (!receptionist.password.startsWith('$2a$') && !receptionist.password.startsWith('$2b$')) {
          newTempPassword = receptionist.password;
        }

        if (shouldGenerateNew || newTempPassword) {
          const passwordToHash = shouldGenerateNew ? newTempPassword : receptionist.password;
          const hashedPassword = await hashPassword(passwordToHash);
          
          receptionist.password = hashedPassword;
          receptionist.tempPassword = shouldGenerateNew ? newTempPassword : receptionist.tempPassword || passwordToHash;
          receptionist.isFirstLogin = true;
          receptionist.passwordResetAt = new Date();
          receptionist.loginAttempts = 0;
          receptionist.lockUntil = null;
          
          await receptionist.save({ validateBeforeSave: false });
          fixed++;
          
          results.push({
            email: receptionist.email,
            action: shouldGenerateNew ? 'Generated new password' : 'Converted plain text to hash',
            tempPassword: shouldGenerateNew ? newTempPassword : '[Existing password hashed]'
          });
        }
      } catch (updateError) {
        console.error(`Failed to fix password for ${receptionist.email}:`, updateError);
        results.push({
          email: receptionist.email,
          action: 'FAILED',
          error: updateError.message
        });
      }
    }

    res.status(200).json({
      message: `Password encryption fix completed. Fixed ${fixed} receptionist accounts.`,
      count: fixed,
      totalChecked: receptionists.length,
      results
    });

  } catch (error) {
    console.error('Password encryption fix error:', error);
    res.status(500).json({ message: 'Password encryption fix failed', error: error.message });
  }
};

// In receptionistController.js - registerReceptionist function

export const registerReceptionist = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      admin, 
      hospitalId, 
      position, // ✅ This might come as any staff role
      staffMemberId, // ✅ NEW: Staff member ID
      status = 'Active' 
    } = req.body;

    // Validation
    if (!name || !email || !admin || !hospitalId) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, email, admin, and hospitalId are required.' 
      });
    }

    // Check for duplicates
    const existingReceptionist = await Receptionist.findOne({ email: email.toLowerCase().trim() });
    if (existingReceptionist) {
      return res.status(400).json({ 
        message: 'Email is already used by another receptionist.' 
      });
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existingAdmin) {
      return res.status(400).json({ 
        message: 'This email is already used as an admin email.' 
      });
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(admin)) {
      return res.status(400).json({ message: 'Invalid admin ID format.' });
    }

    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ message: 'Invalid hospital ID format.' });
    }

    // Verify admin and hospital exist
    const adminDoc = await Admin.findById(admin);
    if (!adminDoc) {
      return res.status(404).json({ message: 'Admin not found.' });
    }

    const hospitalDoc = await Hospital.findById(hospitalId);
    if (!hospitalDoc) {
      return res.status(404).json({ message: 'Hospital not found.' });
    }

    // ✅ IMPORTANT: Always use 'Receptionist' regardless of what was sent
    // Only allow valid receptionist positions
    const validPositions = ['Receptionist', 'Senior Receptionist', 'Head Receptionist'];
    const finalPosition = validPositions.includes(position) ? position : 'Receptionist';

    console.log('🔄 Position conversion:', position, '→', finalPosition);

    // Generate password
    let tempPassword = password && password.trim() ? password.trim() : generateReadablePassword();
    const hashedPassword = await hashPassword(tempPassword);

    // Create receptionist
    const newReceptionist = new Receptionist({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      tempPassword: tempPassword,
      phone: phone ? phone.trim() : null,
      position: finalPosition, // ✅ Always valid enum value
      status,
      admin,
      hospitalId,
      isFirstLogin: true,
      role: 'Receptionist'
    });

    await newReceptionist.save();

    // ✅ UPDATE STAFF RECORD IF staffMemberId PROVIDED
    if (staffMemberId && mongoose.Types.ObjectId.isValid(staffMemberId)) {
      try {
        console.log('🔄 Updating staff record:', staffMemberId);
        await Staff.findByIdAndUpdate(
          staffMemberId,
          {
            role: 'Receptionist', // ✅ Convert staff role to Receptionist
            hasAccount: true,
            receptionistId: newReceptionist._id // ✅ Link to receptionist account
          }
        );
        console.log('✅ Staff record updated successfully');
      } catch (staffError) {
        console.error('⚠️ Failed to update staff record:', staffError);
        // Don't fail the whole operation if staff update fails
      }
    }

    // Populate and return
    const populatedReceptionist = await Receptionist.findById(newReceptionist._id)
      .select('-password')
      .populate('hospitalId', 'name location')
      .populate('admin', 'name email');

    res.status(201).json({
      message: 'Receptionist registered successfully.',
      receptionist: populatedReceptionist,
      tempPassword: tempPassword,
    });

  } catch (error) {
    console.error('Error registering receptionist:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message
    });
  }
};

export const updateReceptionist = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, phone, status, position } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid receptionist ID format.' });
    }

    const existingReceptionist = await Receptionist.findById(id);
    if (!existingReceptionist) {
      return res.status(404).json({ message: 'Receptionist not found.' });
    }

    if (email && email !== existingReceptionist.email) {
      const emailExists = await Receptionist.findOne({ 
        email: email.toLowerCase().trim(), 
        _id: { $ne: id } 
      });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already used by another receptionist.' });
      }
      
      const adminEmailExists = await Admin.findOne({ email: email.toLowerCase().trim() });
      if (adminEmailExists) {
        return res.status(400).json({ message: 'This email is already used as an admin email.' });
      }
    }

    if (status && !['Active', 'Inactive', 'On Leave', 'Suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    if (position && !['Receptionist', 'Senior Receptionist', 'Head Receptionist'].includes(position)) {
      return res.status(400).json({ message: 'Invalid position.' });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (status) updateData.status = status;
    if (position) updateData.position = position;

    if (password && password.trim() !== '') {
      const newPassword = password.trim();
      updateData.password = await hashPassword(newPassword);
      updateData.tempPassword = newPassword;
      updateData.isFirstLogin = true;
      updateData.passwordResetAt = new Date();
      updateData.loginAttempts = 0;
      updateData.lockUntil = null;
    }

    const updatedReceptionist = await Receptionist.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('hospitalId', 'name location')
      .populate('admin', 'name email');

    res.status(200).json({
      message: 'Receptionist updated successfully.',
      receptionist: updatedReceptionist,
    });

  } catch (error) {
    console.error('Error updating receptionist:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token format.' });
    }

    const role = decoded.role?.toLowerCase();
    
    if (role === 'receptionist' && decoded.id !== id) {
      return res.status(403).json({ message: 'You can only change your own password' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid receptionist ID format.' });
    }

    const receptionist = await Receptionist.findById(id).select('+password');
    if (!receptionist) {
      return res.status(404).json({ message: 'Receptionist not found.' });
    }

    if (role === 'receptionist') {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required.' });
      }
      
      if (!receptionist.password) {
        return res.status(400).json({ message: 'No current password set. Please contact admin.' });
      }
      
      const isCurrentPasswordValid = await comparePassword(currentPassword, receptionist.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const hashedNewPassword = await hashPassword(newPassword.trim());
    
    receptionist.password = hashedNewPassword;
    receptionist.tempPassword = newPassword.trim();
    receptionist.isFirstLogin = false;
    receptionist.passwordResetAt = new Date();
    receptionist.loginAttempts = 0;
    receptionist.lockUntil = null;
    
    await receptionist.save({ validateBeforeSave: false });

    res.status(200).json({ 
      message: 'Password changed successfully.',
      changedAt: new Date()
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};



// Delete Receptionist Controller
export const deleteReceptionist = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔍 Attempting to delete receptionist with ID:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid receptionist ID format.' });
    }

    // First, find the receptionist to get their email
    const receptionist = await Receptionist.findById(id);
    
    if (!receptionist) {
      console.log('❌ Receptionist not found with ID:', id);
      return res.status(404).json({ message: 'Receptionist not found.' });
    }

    const receptionistEmail = receptionist.email;
    console.log('📧 Receptionist email:', receptionistEmail);

    // Delete from Receptionist collection
    await Receptionist.findByIdAndDelete(id);
    console.log('✅ Receptionist deleted from Receptionist collection');

    // ✅ DON'T delete from Staff collection - let frontend handle it
    // This prevents issues when frontend tries to delete staff separately

    res.status(200).json({
      message: 'Receptionist deleted successfully.',
      deletedEmail: receptionistEmail
    });
  } catch (error) {
    console.error('❌ Error deleting receptionist:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message 
    });
  }
};



export const listofReceptionist = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No authentication token provided.' });
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token format.' });
    }

    const role = decoded.role?.toLowerCase();
    const userId = decoded.id;

    if (!userId) {
      return res.status(401).json({ message: 'Invalid token: missing user ID.' });
    }

    let query = {};
    let hospitalId = null;

    if (role === 'admin') {
      hospitalId = decoded.hospitalId;

      if (!hospitalId) {
        const admin = await Admin.findById(userId);
        if (admin && admin.hospitalId) {
          hospitalId = admin.hospitalId;
        }
      }

      if (!hospitalId) {
        const HospitalModel = mongoose.model('Hospital');
        const hospital = await HospitalModel.findOne({ adminId: userId });
        if (hospital) {
          hospitalId = hospital._id;
        }
      }

      if (!hospitalId) {
        return res.status(400).json({ message: 'No hospital ID found for admin.' });
      }

      query.admin = userId;
      query.hospitalId = hospitalId;

    } else if (role === 'receptionist') {
      hospitalId = decoded.hospitalId;

      if (!hospitalId) {
        const receptionistDoc = await Receptionist.findById(userId);
        if (!receptionistDoc) {
          return res.status(404).json({ message: 'Receptionist not found.' });
        }
        hospitalId = receptionistDoc.hospitalId;
      }

      if (!hospitalId) {
        return res.status(400).json({ message: 'No hospital ID found for receptionist.' });
      }

      query.hospitalId = hospitalId;

    } else {
      return res.status(403).json({ message: 'Unauthorized role.' });
    }

    const receptionists = await Receptionist.find(query)
      .select('-password')
      .populate('hospitalId', 'name location')
      .populate('admin', 'name email')
      .sort({ createdAt: -1 });

    const transformedReceptionists = receptionists.map((rec) => ({
      _id: rec._id,
      name: rec.name,
      email: rec.email,
      phone: rec.phone || 'N/A',
      role: rec.role,
      position: rec.position || 'Receptionist',
      status: rec.status || 'Active',
      permissions: rec.permissions || [],
      admin: rec.admin,
      hospitalId: rec.hospitalId?._id,
      hospital: {
        _id: rec.hospitalId?._id,
        name: rec.hospitalId?.name || 'Unknown Hospital',
      },
      createdAt: rec.createdAt,
      updatedAt: rec.updatedAt,
      isFirstLogin: rec.isFirstLogin || false,
      lastLogin: rec.lastLogin,
      isLocked: rec.isLocked,
      loginAttempts: rec.loginAttempts || 0
    }));

    res.status(200).json(transformedReceptionists);
  } catch (error) {
    console.error('Error fetching receptionists:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const getTempPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token format.' });
    }

    if (decoded.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only Admin users can access passwords' });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid receptionist ID format.' });
    }

    const receptionist = await Receptionist.findById(id).select('+tempPassword');
    if (!receptionist) {
      return res.status(404).json({ message: 'Receptionist not found' });
    }

    const adminId = decoded.id;
    if (receptionist.admin.toString() !== adminId) {
      return res.status(403).json({ message: 'Access denied. You can only view passwords for your own receptionists.' });
    }

    const tempPassword = receptionist.tempPassword;
    
    if (!tempPassword) {
      return res.status(200).json({ 
        tempPassword: 'No password available',
        hasTemp: false,
        isFirstLogin: receptionist.isFirstLogin || false,
        message: 'Password not available. Please update password through edit.'
      });
    }
    
    res.status(200).json({ 
      tempPassword: tempPassword,
      hasTemp: true,
      isFirstLogin: receptionist.isFirstLogin || false,
      lastReset: receptionist.passwordResetAt
    });

  } catch (error) {
    console.error('Error fetching temporary password:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message,
      tempPassword: 'Error loading password'
    });
  }
};

export const checkReceptionistLimit = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    const count = await Receptionist.countDocuments({ admin: adminId });
    
    const { default: ReceptionistPayment } = await import('../models/ReceptionistPayment.js');
    const paidSlots = await ReceptionistPayment.countDocuments({
      adminId,
      status: 'paid'
    });
    
    const maxAllowed = 30 + paidSlots;
    const canAdd = count < maxAllowed;
    
    res.status(200).json({
      canAdd,
      currentCount: count,
      maxAllowed,
      paidSlots,
      message: canAdd ? 'Can add receptionist' : 'Payment required for additional receptionist'
    });
    
  } catch (error) {
    console.error('Error checking receptionist limit:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update in receptionistController.js

export const getReceptionistCount = async (req, res) => {
  try {
    const adminId = req.user.id;
    
    // Get actual receptionist accounts count
    const count = await Receptionist.countDocuments({ admin: adminId });
    
    // ✅ Get paid slots count
    const { default: ReceptionistPayment } = await import('../models/ReceptionistPayment.js');
    const paidSlots = await ReceptionistPayment.countDocuments({
      adminId,
      status: 'paid'
    });
    
    // ✅ Calculate limits
    const FREE_LIMIT = 2;
    const totalAllowed = FREE_LIMIT + paidSlots;
    const canAddMore = count < totalAllowed;
    
    res.status(200).json({ 
      count,
      paidSlots,
      freeLimit: FREE_LIMIT,
      totalAllowed,
      canAddMore,
      remainingSlots: Math.max(0, totalAllowed - count)
    });
  } catch (error) {
    console.error('Error getting receptionist count:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};