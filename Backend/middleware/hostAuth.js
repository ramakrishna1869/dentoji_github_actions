// hostAuth.js (middleware)

import jwt from 'jsonwebtoken';
import Host from '../models/Host.js'; // Adjust path to your Host model

// IMPORTANT: Use the SAME HOST-specific JWT secret as in controller
const HOST_JWT_SECRET = process.env.HOST_JWT_SECRET || 'host-secret-key-change-in-production-different-from-admin';

const hostAuthMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token with HOST-specific secret
    const decoded = jwt.verify(token, HOST_JWT_SECRET);

    //console.log('🔓 Token decoded:', decoded);

    // Verify this is a HOST token
    if (decoded.type !== 'HOST_TOKEN' || decoded.userType !== 'host') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type. Host access required.'
      });
    }

    // Check if host exists
    const host = await Host.findById(decoded.id).select('-password');
    
    if (!host) {
      return res.status(401).json({
        success: false,
        message: 'Host not found. Authorization denied.'
      });
    }

    // Check if host is still active
    if (!host.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Host account is inactive.'
      });
    }

    // Attach host to request (use hostUser instead of host to avoid conflict)
    req.hostUser = {
      id: host._id,
      email: host.email,
      name: host.name,
      role: 'host',
      isActive: host.isActive
    };

    //console.log('✅ Host authenticated:', req.hostUser.email);

    next();

  } catch (error) {
    console.error('❌ Host auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. This may be an admin token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

export default hostAuthMiddleware;