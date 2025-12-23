// hostAuthController.js

import jwt from 'jsonwebtoken';
import Host from '../models/Host.js';

// IMPORTANT: Use a different JWT secret for HOST authentication
const HOST_JWT_SECRET = process.env.HOST_JWT_SECRET || 'host-secret-key-change-in-production-different-from-admin';

// @desc    Login host
// @route   POST /api/host/auth/login
// @access  Public
export const hostLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    //console.log('🔍 Host login attempt:', { email, hasPassword: !!password });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find host and INCLUDE password field for comparison
    const host = await Host.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!host) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!host.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Verify password using the schema method
    const isPasswordValid = await host.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    host.lastLogin = new Date();
    await host.save();

    // Generate JWT token with HOST-specific secret and identifier
    const token = jwt.sign(
      { 
        id: host._id,
        email: host.email,
        role: 'host', // Explicitly set as 'host'
        userType: 'host', // Add userType for extra verification
        type: 'HOST_TOKEN' // Token type identifier
      },
      HOST_JWT_SECRET, // Use HOST-specific secret
      { expiresIn: '7d' }
    );

    // Prepare response (remove password)
    const hostData = {
      id: host._id,
      name: host.name,
      email: host.email,
      role: 'host',
      isActive: host.isActive,
      lastLogin: host.lastLogin
    };

    //console.log('✅ Host login successful:', host.email);
    //console.log('🔑 Generated HOST token with HOST_JWT_SECRET');

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      host: hostData,
      redirectTo: '/host/dashboard'
    });

  } catch (error) {
    console.error('❌ Host login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get host profile
// @route   GET /api/host/auth/profile
// @access  Private
export const getHostProfile = async (req, res) => {
  try {
    const host = await Host.findById(req.host.id).select('-password');
    
    if (!host) {
      return res.status(404).json({
        success: false,
        message: 'Host not found'
      });
    }

    return res.status(200).json({
      success: true,
      host: {
        id: host._id,
        name: host.name,
        email: host.email,
        role: 'host',
        isActive: host.isActive,
        lastLogin: host.lastLogin,
        createdAt: host.createdAt
      }
    });

  } catch (error) {
    console.error('Get host profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};