

 
// routes/permissionRoutes.js - UPDATED WITH DEFAULT PERMISSION LOGIC
import express from 'express';
import {
  getUserPermissions,
  getReceptionistPermissions,
  updateReceptionistPermissions,
  getHospitalPermissions,
  deleteReceptionistPermissions,
  getAvailablePermissions,
  createDefaultPermissionsForHospital
} from '../controllers/permissionController.js';
import {
  verifyToken,
  verifyTokenWithSubscription,
  checkHospitalRegistration,
  authorizeRoles
} from '../middleware/authMiddleware.js';
 
const router = express.Router();
 
// Public route to get available permissions (for reference)
router.get('/available', getAvailablePermissions);
 
// UPDATED: Get current user's permissions - enhanced to handle default permissions
// This route should return default permissions if no DB permissions exist
router.get('/user', verifyToken, getUserPermissions);
 
// ADDED: Alternative route that explicitly checks for DB permissions vs defaults
// Returns more detailed information about permission source
router.get('/user/detailed', verifyToken, async (req, res) => {
  try {
    const { userId, role, hospitalId } = req.user;
   
    /*console.log('Detailed permission check for user:', {
      userId,
      role,
      hospitalId
    });*/
 
    // Admin users get all permissions
    if (role === 'admin' || role === 'Admin') {
      const allPermissions = [
        'dashboard', 'patients', 'appointments', 'staff', 'labmanagement',
        'settings', 'consultant', 'finance', 'receptionisttable',
        'share',  'profile', 'pricing'
      ];
     
      return res.json({
        success: true,
        permissions: allPermissions,
        source: 'admin_role',
        hasPermissionsInDB: true,
        isUsingDefaults: false,
        role: role
      });
    }
 
    // For receptionist users, check if they have permissions in DB
    if (role === 'receptionist' || role === 'Receptionist') {
      const Permission = (await import('../models/Permission.js')).default;
     
      try {
        const permissionRecord = await Permission.findByReceptionist(userId, hospitalId);
       
        if (permissionRecord && permissionRecord.permissions.length > 0) {
          // User has permissions in database
          return res.json({
            success: true,
            permissions: permissionRecord.permissions,
            source: 'database',
            hasPermissionsInDB: true,
            isUsingDefaults: false,
            role: role,
            lastUpdated: permissionRecord.updatedAt
          });
        } else {
          // No permissions in database, return indication that defaults should be used
          return res.json({
            success: true,
            permissions: [], // Empty array indicates no DB permissions
            source: 'none',
            hasPermissionsInDB: false,
            isUsingDefaults: true,
            role: role,
            defaultPermissions: ['patients']
          });
        }
      } catch (dbError) {
        console.error('Database error fetching permissions:', dbError);
       
        // Database error - indicate defaults should be used
        return res.json({
          success: true,
          permissions: [], // Empty array indicates no DB permissions
          source: 'error_fallback',
          hasPermissionsInDB: false,
          isUsingDefaults: true,
          role: role,
          defaultPermissions: ['patients'],
          error: 'Database error, using defaults'
        });
      }
    }
 
    // Unknown role
    return res.status(403).json({
      success: false,
      message: 'Invalid user role for permission check',
      permissions: []
    });
 
  } catch (error) {
    console.error('Error in detailed permission check:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch detailed permissions',
      error: error.message
    });
  }
});
 
// ADDED: Route to check if user has specific permission (including default logic)
router.get('/check/:permission', verifyToken, async (req, res) => {
  try {
    const { userId, role, hospitalId } = req.user;
    const { permission } = req.params;
   
    const defaultPermissions = ['patients'];
   
    // Admin always has permission
    if (role === 'admin' || role === 'Admin') {
      return res.json({
        success: true,
        hasPermission: true,
        source: 'admin_role'
      });
    }
 
    // For receptionist, check DB first, then defaults
    if (role === 'receptionist' || role === 'Receptionist') {
      const Permission = (await import('../models/Permission.js')).default;
     
      try {
        const permissionRecord = await Permission.findByReceptionist(userId, hospitalId);
       
        if (permissionRecord && permissionRecord.permissions.length > 0) {
          // Check DB permissions
          const hasPermission = permissionRecord.permissions.includes(permission);
          return res.json({
            success: true,
            hasPermission,
            source: 'database',
            permissions: permissionRecord.permissions
          });
        } else {
          // Check default permissions
          const hasPermission = defaultPermissions.includes(permission);
          return res.json({
            success: true,
            hasPermission,
            source: 'defaults',
            permissions: defaultPermissions
          });
        }
      } catch (dbError) {
        // Database error - check against defaults
        const hasPermission = defaultPermissions.includes(permission);
        return res.json({
          success: true,
          hasPermission,
          source: 'error_fallback_defaults',
          permissions: defaultPermissions
        });
      }
    }
 
    return res.status(403).json({
      success: false,
      message: 'Invalid user role',
      hasPermission: false
    });
 
  } catch (error) {
    console.error('Error checking permission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check permission',
      error: error.message
    });
  }
});
 
// Admin-only routes for managing receptionist permissions
// These require subscription and hospital registration
 
// Get all permissions for admin's hospital
router.get('/hospital',
  verifyTokenWithSubscription,
  checkHospitalRegistration,
  authorizeRoles(['Admin']),
  getHospitalPermissions
);
 
// Get specific receptionist's permissions
router.get('/receptionist/:receptionistId',
  verifyTokenWithSubscription,
  checkHospitalRegistration,
  authorizeRoles(['Admin']),
  getReceptionistPermissions
);
 
// Update receptionist's permissions
router.post('/receptionist/:receptionistId',
  verifyTokenWithSubscription,
  checkHospitalRegistration,
  authorizeRoles(['Admin']),
  updateReceptionistPermissions
);
 
// Alternative PUT route for updating permissions
router.put('/receptionist/:receptionistId',
  verifyTokenWithSubscription,
  checkHospitalRegistration,
  authorizeRoles(['Admin']),
  updateReceptionistPermissions
);
 
// Delete receptionist's permissions (set to empty)
router.delete('/receptionist/:receptionistId',
  verifyTokenWithSubscription,
  checkHospitalRegistration,
  authorizeRoles(['Admin']),
  deleteReceptionistPermissions
);
 
// ADDED: Route to reset receptionist to default permissions
router.post('/receptionist/:receptionistId/reset-to-defaults',
  verifyTokenWithSubscription,
  checkHospitalRegistration,
  authorizeRoles(['Admin']),
  async (req, res) => {
    try {
      const { receptionistId } = req.params;
      const { hospitalId, userId: adminId } = req.user;
     
      const Permission = (await import('../models/Permission.js')).default;
      const defaultPermissions = ['patients', 'appointments',  'share'];
 
      // Find existing permission record
      let permissionRecord = await Permission.findByReceptionist(receptionistId, hospitalId);
 
      if (permissionRecord) {
        // Update existing record with default permissions
        permissionRecord.setPermissions(defaultPermissions, adminId);
        permissionRecord.notes = 'Reset to default permissions';
        await permissionRecord.save();
      } else {
        // Create new record with default permissions
        permissionRecord = await Permission.createDefaultPermissions(
          receptionistId,
          adminId,
          hospitalId
        );
      }
 
      res.json({
        success: true,
        message: 'Receptionist permissions reset to defaults',
        permissions: permissionRecord.permissions,
        defaults: defaultPermissions
      });
 
    } catch (error) {
      console.error('Error resetting permissions to defaults:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset permissions to defaults',
        error: error.message
      });
    }
  }
);
 
// ADDED: Route to remove all permissions (user will use defaults)
router.post('/receptionist/:receptionistId/remove-all',
  verifyTokenWithSubscription,
  checkHospitalRegistration,
  authorizeRoles(['Admin']),
  async (req, res) => {
    try {
      const { receptionistId } = req.params;
      const { hospitalId } = req.user;
     
      const Permission = (await import('../models/Permission.js')).default;
 
      // Find and deactivate permission record
      const permissionRecord = await Permission.findByReceptionist(receptionistId, hospitalId);
 
      if (permissionRecord) {
        permissionRecord.isActive = false;
        permissionRecord.notes = 'Permissions removed - using defaults';
        await permissionRecord.save();
      }
 
      res.json({
        success: true,
        message: 'All permissions removed. User will now use default permissions.',
        defaultPermissions: ['patients', 'appointments',  'share']
      });
 
    } catch (error) {
      console.error('Error removing all permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove permissions',
        error: error.message
      });
    }
  }
);
 
// Utility route to create default permissions for all receptionists in hospital
router.post('/hospital/setup-defaults',
  verifyTokenWithSubscription,
  checkHospitalRegistration,
  authorizeRoles(['Admin']),
  createDefaultPermissionsForHospital
);
 
// Alternative route for getting permissions (backward compatibility)
router.get('/list/:hospitalId',
  verifyTokenWithSubscription,
  checkHospitalRegistration,
  authorizeRoles(['Admin']),
  getHospitalPermissions
);
 
// ADDED: Get default permissions configuration
router.get('/defaults', (req, res) => {
  const defaultPermissions = ['patients', 'appointments',  'share'];
  const allPermissions = [
    'dashboard', 'patients', 'appointments', 'staff', 'labmanagement',
    'settings', 'consultant', 'finance', 'receptionisttable',
    'share', 'profile', 'pricing'
  ];
 
  res.json({
    success: true,
    defaultPermissions,
    allPermissions,
    restrictedPermissions: allPermissions.filter(p => !defaultPermissions.includes(p)),
    description: {
      defaultPermissions: 'Permissions granted when no database record exists',
      restrictedPermissions: 'Permissions that require explicit database entry'
    }
  });
});
 
export default router;
 