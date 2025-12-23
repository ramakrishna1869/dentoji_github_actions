//authMiddleware.js
import jwt from 'jsonwebtoken';
import Subscription from '../models/Subscription.js';
import Admin from '../models/Admin.js';
import Hospital from '../models/Hospital.js';

// Enhanced service imports
import { SubscriptionService } from '../services/subscriptionService.js';

const JWT_SECRET = process.env.JWT_SECRET;

// ===== ENHANCED TOKEN UTILITIES =====

/**
 * Calculate seconds until next 12 AM (midnight)
 */
const getSecondsUntilMidnight = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0); // Set to 12:00 AM
  
  const secondsUntilMidnight = Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
  //console.log(`⏰ Token will expire in ${Math.floor(secondsUntilMidnight / 3600)}h ${Math.floor((secondsUntilMidnight % 3600) / 60)}m`);
  
  return secondsUntilMidnight;
};

/**
 * Generate token that expires at 12 AM
 */
export const generateDailyExpiringToken = (payload) => {
  const secondsUntilMidnight = getSecondsUntilMidnight();
  const token = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: secondsUntilMidnight 
  });
  
  //console.log('🔐 Generated token expiring at midnight for user:', payload.id);
  return token;
};

/**
 * Check if token is expired or will expire soon
 */
const checkTokenExpiry = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return { isExpired: true, timeLeft: 0 };
    }
    
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - now;
    const isExpired = timeLeft <= 0;
    const isExpiringSoon = timeLeft <= 300; // 5 minutes
    
    return {
      isExpired,
      isExpiringSoon,
      timeLeft,
      expiresAt: new Date(decoded.exp * 1000),
      minutesLeft: Math.floor(timeLeft / 60)
    };
  } catch (error) {
    return { isExpired: true, timeLeft: 0 };
  }
};

// ===== ENHANCED MIDDLEWARE =====

/**
 * Enhanced JWT verification with daily expiry and subscription check
 */
export const verifyTokenWithDailyExpiry = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  //console.log('🔍 Enhanced auth check at:', new Date().toLocaleString());

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //console.log('❌ No valid authorization header');
    return res.status(403).json({ 
      message: 'Your session has expired. Please login again.',
      redirectTo: '/login',
      authRequired: true,
      reason: 'missing_token'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Check token expiry status
    const expiryCheck = checkTokenExpiry(token);
    
    if (expiryCheck.isExpired) {
      //console.log('⏰ Token expired, redirecting to login');
      return res.status(401).json({ 
        message: 'Your daily session has expired. Please login again.',
        redirectTo: '/login',
        tokenExpired: true,
        expiredAt12AM: true,
        reason: 'daily_expiry'
      });
    }

    // Warn if token is expiring soon (within 5 minutes)
    if (expiryCheck.isExpiringSoon) {
      //console.log(`⚠️ Token expiring in ${expiryCheck.minutesLeft} minutes`);
      req.tokenWarning = {
        isExpiringSoon: true,
        minutesLeft: expiryCheck.minutesLeft,
        expiresAt: expiryCheck.expiresAt,
        message: `Your session will expire in ${expiryCheck.minutesLeft} minutes. Please save your work.`
      };
    }

    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET);
    //console.log('✅ Token verified for user:', decoded.id, 'Role:', decoded.role);

    if (!decoded.id || !decoded.role) {
      throw new Error('Token does not contain required id or role');
    }

    // Assign user data to request object
    req.user = {
      id: decoded.id,
      adminId: decoded.id,
      role: decoded.role,
      email: decoded.email,
      hospitalId: decoded.hospitalId,
      tokenIssuedAt: decoded.iat,
      tokenExpiresAt: decoded.exp,
      ...decoded
    };

    // Enhanced subscription check for Admin users
    if (decoded.role === 'Admin') {
      //console.log('🏥 Checking admin subscription status...');
      
      try {
        const subscriptionStatus = await SubscriptionService.checkSubscriptionStatus(decoded.id);
        //console.log("📋 Subscription service result:", subscriptionStatus);

        const subscription = await Subscription.findOne({ 
          adminId: decoded.id, 
          status: { $in: ['active', 'trial'] }
        }).sort({ createdAt: -1 });

        if (!subscription) {
          //console.log('💳 No active subscription found');
          return res.status(402).json({ 
            message: 'No active subscription found. Please choose a plan to continue.',
            redirectTo: '/pricing',
            requiresSubscription: true,
            reason: 'no_subscription'
          });
        }

        if (!subscription.isActive()) {
          //console.log('📅 Subscription expired');
          subscription.status = 'expired';
          await subscription.save();
          
          return res.status(402).json({ 
            message: subscription.planType === 'trial' 
              ? 'Your free trial has expired. Please choose a plan to continue.'
              : 'Your subscription has expired. Please renew your plan to continue.',
            redirectTo: '/pricing',
            subscriptionExpired: true,
            expiredPlan: subscription.planType,
            reason: 'subscription_expired'
          });
        }

        // Check if subscription is expiring soon
        if (subscription.isExpiringSoon()) {
          const daysRemaining = subscription.getDaysRemaining();
          req.subscriptionWarning = {
            daysRemaining,
            planType: subscription.planType,
            showWarning: true,
            isTrial: subscription.planType === 'trial',
            message: `Your ${subscription.planType} ${subscription.planType === 'trial' ? 'trial' : 'subscription'} expires in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}.`
          };
          //console.log(`⚠️ Subscription expiring in ${daysRemaining} days`);
        }

        // Attach subscription info to request
        req.subscription = subscription;
        req.planFeatures = subscription.features;

        /*console.log('✅ Active subscription confirmed:', {
          planType: subscription.planType,
          daysRemaining: subscription.getDaysRemaining(),
          endDate: subscription.endDate,
          status: subscription.status
        });*/

      } catch (subscriptionError) {
        console.error('❌ Subscription check failed:', subscriptionError);
        return res.status(500).json({
          message: 'Unable to verify subscription status. Please try again.',
          redirectTo: '/login',
          reason: 'subscription_check_failed'
        });
      }
    }

    next();

  } catch (err) {
    console.error('❌ JWT verification failed:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Your daily session has expired at 12 AM. Please login again.',
        redirectTo: '/login',
        tokenExpired: true,
        expiredAt12AM: true,
        reason: 'daily_token_expiry'
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid session. Please login again.',
        redirectTo: '/login',
        reason: 'invalid_token'
      });
    }
    
    return res.status(401).json({ 
      message: 'Session verification failed. Please login again.',
      redirectTo: '/login',
      error: err.message,
      reason: 'verification_failed'
    });
  }
};

/**
 * Enhanced hospital registration check with daily expiry
 */
export const checkHospitalRegistrationWithExpiry = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'Admin') {
      const hospital = await Hospital.findOne({ adminId: req.user.id });
      
      if (!hospital) {
        //console.log('🏥 Hospital registration required for admin:', req.user.id);
        return res.status(412).json({ 
          message: 'Hospital registration required. Please complete your hospital setup.',
          redirectTo: '/hospitalform',
          requiresHospitalSetup: true,
          reason: 'hospital_setup_required'
        });
      }

      // Attach hospital data to request
      req.hospital = hospital;
      req.user.hospitalId = hospital._id.toString();
      
      /*console.log('✅ Hospital registration confirmed:', {
        hospitalId: hospital._id,
        hospitalName: hospital.name,
        adminId: req.user.id
      });*/
    }
    
    next();
  } catch (err) {
    console.error('❌ Hospital registration check failed:', err.message);
    res.status(500).json({ 
      message: 'Server error during hospital verification. Please try again.',
      redirectTo: '/login',
      error: err.message,
      reason: 'hospital_check_failed'
    });
  }
};

/**
 * Enhanced role-based authorization with session management
 */
export const authorizeRolesWithExpiry = (roles) => {
  return (req, res, next) => {
    //console.log('🔐 Authorization check - Required roles:', roles, 'User role:', req.user?.role);
    
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required. Please login to access this resource.',
        redirectTo: '/login',
        reason: 'auth_required'
      });
    }

    if (!roles.includes(req.user.role)) {
      //console.log('❌ Access denied for role:', req.user.role);
      return res.status(403).json({
        message: `Access denied. Your role (${req.user.role}) is not authorized for this resource.`,
        requiredRoles: roles,
        userRole: req.user.role,
        redirectTo: req.user.role === 'Admin' ? '/dashboard' : '/patients',
        reason: 'insufficient_permissions'
      });
    }
    
    //console.log('✅ Authorization successful for role:', req.user.role);
    next();
  };
};

/**
 * Enhanced subscription feature check
 */
export const requireFeatureWithExpiry = (featureName) => {
  return (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
      if (!req.planFeatures || !req.planFeatures[featureName]) {
        //console.log('💎 Feature access denied:', featureName);
        return res.status(402).json({
          message: `This feature (${featureName}) requires a premium subscription. Please upgrade your plan.`,
          feature: featureName,
          currentPlan: req.subscription?.planType || 'No Plan',
          redirectTo: '/pricing',
          reason: 'feature_not_available'
        });
      }
    }
    //console.log('✅ Feature access granted:', featureName);
    next();
  };
};

/**
 * Enhanced active subscription requirement
 */
export const requireActiveSubscriptionWithExpiry = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to access this resource.',
        requiresAuth: true,
        redirectTo: '/login',
        reason: 'auth_required'
      });
    }

    // Check current subscription with enhanced validation
    const subscription = await Subscription.findOne({
      adminId: req.user.id,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    if (!subscription) {
      //console.log('💳 Active subscription required for user:', req.user.id);
      return res.status(402).json({
        success: false,
        message: 'Active subscription required to access this feature.',
        requiresSubscription: true,
        redirectTo: '/pricing',
        reason: 'subscription_required'
      });
    }

    // Check if subscription is about to expire
    if (subscription.isExpiringSoon()) {
      req.subscriptionWarning = {
        daysRemaining: subscription.getDaysRemaining(),
        planType: subscription.planType,
        showWarning: true,
        message: `Your subscription expires in ${subscription.getDaysRemaining()} days.`
      };
    }

    // Attach subscription to request
    req.subscription = subscription;
    //console.log('✅ Active subscription confirmed for user:', req.user.id);
    next();

  } catch (error) {
    console.error('❌ Subscription verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Subscription verification failed. Please try again.',
      error: error.message,
      redirectTo: '/login',
      reason: 'subscription_check_error'
    });
  }
};

/**
 * Enhanced patient limit check
 */
export const checkPatientLimitWithExpiry = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'Admin' && req.subscription) {
      const maxPatients = req.planFeatures.maxPatients;
      
      if (maxPatients !== -1) { // -1 means unlimited
        try {
          const { default: Patient } = await import('../models/Patient.js');
          
          const currentPatientCount = await Patient.countDocuments({ 
            adminId: req.user.id 
          });
          
          if (currentPatientCount >= maxPatients) {
            //console.log('📊 Patient limit reached:', currentPatientCount, '/', maxPatients);
            return res.status(402).json({
              message: `Patient limit reached (${maxPatients}). Please upgrade your subscription for unlimited patients.`,
              currentCount: currentPatientCount,
              maxAllowed: maxPatients,
              currentPlan: req.subscription.planType,
              redirectTo: '/pricing',
              reason: 'patient_limit_exceeded'
            });
          }
          
          // Add remaining patient slots to request
          req.remainingPatientSlots = maxPatients - currentPatientCount;
          //console.log('📈 Patient limit check passed:', currentPatientCount, '/', maxPatients);
          
        } catch (importError) {
          console.error('❌ Error importing Patient model:', importError);
          // Continue without patient limit check if model can't be imported
        }
      }
    }
    
    next();
  } catch (err) {
    console.error('❌ Patient limit check error:', err.message);
    // Don't fail the request, just continue without limit check
    next();
  }
};

/**
 * Enhanced basic token verification
 */
export const verifyTokenWithExpiry = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ 
      message: 'Your session has expired. Please login again.',
      redirectTo: '/login',
      reason: 'missing_token'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const expiryCheck = checkTokenExpiry(token);
    
    if (expiryCheck.isExpired) {
      return res.status(401).json({ 
        message: 'Your daily session expired at 12 AM. Please login again.',
        redirectTo: '/login',
        tokenExpired: true,
        expiredAt12AM: true,
        reason: 'daily_expiry'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded.id || !decoded.role) {
      throw new Error('Token does not contain required id or role');
    }

    let user;
    if (decoded.role === 'Admin') {
      user = await Admin.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          message: 'User account not found. Please login again.',
          redirectTo: '/login',
          reason: 'user_not_found'
        });
      }
    } else if (decoded.role === 'Receptionist') {
      try {
        const { default: Receptionist } = await import('../models/Receptionist.js');
        user = await Receptionist.findById(decoded.id);
        if (!user) {
          return res.status(401).json({
            message: 'User account not found. Please login again.',
            redirectTo: '/login',
            reason: 'user_not_found'
          });
        }
      } catch (importError) {
        console.error('❌ Error importing Receptionist model:', importError);
        return res.status(500).json({
          message: 'Server error during authentication. Please try again.',
          redirectTo: '/login',
          reason: 'server_error'
        });
      }
    } else {
      return res.status(401).json({
        message: 'Invalid session. Please login again.',
        redirectTo: '/login',
        reason: 'invalid_role'
      });
    }

    if (expiryCheck.isExpiringSoon) {
      req.tokenWarning = {
        isExpiringSoon: true,
        minutesLeft: expiryCheck.minutesLeft,
        expiresAt: expiryCheck.expiresAt,
        message: `Your session expires in ${expiryCheck.minutesLeft} minutes.`
      };
    }

    req.user = {
      id: decoded.id,
      userId: decoded.id,
      adminId: decoded.role === 'Admin' ? decoded.id : user.adminId,
      role: decoded.role,
      email: decoded.email,
      hospitalId: decoded.hospitalId,
      subscriptionStatus: decoded.role === 'Admin' ? user.subscriptionStatus : undefined,
      tokenIssuedAt: decoded.iat,
      tokenExpiresAt: decoded.exp,
      ...decoded
    };

    // ✅✅✅ ADD THIS LINE - Critical for referral controllers ✅✅✅
    req.admin = user;

    console.log('✅ Auth successful - User:', req.user.id, 'Admin set:', !!req.admin);
    
    next();

  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Your daily session expired at 12 AM. Please login again.',
        redirectTo: '/login',
        tokenExpired: true,
        expiredAt12AM: true,
        reason: 'daily_expiry'
      });
    }
    
    return res.status(401).json({ 
      message: 'Invalid or corrupted session. Please login again.', 
      error: err.message,
      redirectTo: '/login',
      reason: 'verification_failed'
    });
  }
};
// ===== SESSION MANAGEMENT UTILITIES =====

/**
 * Get session status for client-side checks
 */
export const getSessionStatus = (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.json({
        isValid: false,
        message: 'No session found',
        reason: 'no_token'
      });
    }

    const expiryCheck = checkTokenExpiry(token);
    
    return res.json({
      isValid: !expiryCheck.isExpired,
      isExpiringSoon: expiryCheck.isExpiringSoon,
      timeLeft: expiryCheck.timeLeft,
      minutesLeft: expiryCheck.minutesLeft,
      expiresAt: expiryCheck.expiresAt,
      message: expiryCheck.isExpired 
        ? 'Session expired' 
        : expiryCheck.isExpiringSoon 
        ? `Session expires in ${expiryCheck.minutesLeft} minutes`
        : 'Session is active',
      tokenWarning: req.tokenWarning || null,
      subscriptionWarning: req.subscriptionWarning || null
    });

  } catch (error) {
    console.error('❌ Session status check error:', error);
    return res.json({
      isValid: false,
      message: 'Session check failed',
      reason: 'check_error'
    });
  }
};

// Export aliases for backward compatibility
export const authenticateToken = verifyTokenWithExpiry;
export const verifyToken = verifyTokenWithExpiry;
export const verifyTokenWithSubscription = verifyTokenWithDailyExpiry;
export const checkHospitalRegistration = checkHospitalRegistrationWithExpiry;
export const authorizeRoles = authorizeRolesWithExpiry;
export const requireFeature = requireFeatureWithExpiry;
export const requireActiveSubscription = requireActiveSubscriptionWithExpiry;
export const checkPatientLimit = checkPatientLimitWithExpiry;