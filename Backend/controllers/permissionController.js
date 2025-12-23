// controllers/permissionController.js
import Permission from '../models/Permission.js';
import Receptionist from '../models/Receptionist.js';
import Admin from '../models/Admin.js';
import mongoose from 'mongoose';


export const getUserPermissions = async (req, res) => {
  
  try {
    //const { userId, role, adminId, hospitalId } = req.user;
    const { id: userId, role, adminId, hospitalId } = req.user;

    // Admins have all permissions
    if (role === 'Admin' || role === 'admin') {
      const allPermissions = Permission.getAvailablePermissions();
      return res.status(200).json({
        success: true,
        permissions: allPermissions,
        role: 'Admin',
        message: 'Admin has full access to all features'
      });
    }

    // For receptionists, fetch their specific permissions
    if (role === 'Receptionist' || role === 'receptionist') {
      const userPermissions = await Permission.findByReceptionist(userId, hospitalId);
      
      let finalPermissions = [];
      
      if (!userPermissions) {
        // If no permissions found, create default permissions
        const defaultPermissions = await Permission.createDefaultPermissions(
          userId, 
          adminId, 
          hospitalId
        );
        finalPermissions = defaultPermissions.permissions;
      } else {
        finalPermissions = userPermissions.permissions;
      }
      
      // ALWAYS ensure 'patients' permission is included
      if (!finalPermissions.includes('patients')) {
        finalPermissions.push('patients');
      }

      
// Replace the success response with:
// res.status(200).json({
//   success: true,
 
//   receptionistInfo: {
//     id: receptionist._id,
//     name: receptionist.name,
//     email: receptionist.email,
//     status: receptionist.status
//   },
//   lastUpdated: permissions.updatedAt,
//   updatedBy: permissions.lastUpdatedBy,
//   note: 'Patient management access is always enabled for receptionists'
// });

return res.status(200).json({
  success: true,
  permissions: finalPermissions,
  role: 'Receptionist',
  hasPermissionsInDB: !!userPermissions,
  isUsingDefaults: !userPermissions,
  message: 'Receptionist permissions fetched successfully'
});


    }

    return res.status(403).json({
      success: false,
      message: 'Invalid user role'
    });

  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions',
      error: error.message
    });
  }
};



// Get permissions for a specific receptionist (Admin only)
export const getReceptionistPermissions = async (req, res) => {
  try {
    const { receptionistId } = req.params;
   // const { userId: adminId, role, hospitalId } = req.user;
   const { id: adminId, role, hospitalId } = req.user;

    // Only admins can view other users' permissions
    if (role !== 'Admin' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Validate receptionist ID
    if (!mongoose.Types.ObjectId.isValid(receptionistId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receptionist ID'
      });
    }

    // Check if receptionist exists and belongs to admin's hospital
    const receptionist = await Receptionist.findOne({
      _id: receptionistId,
      hospitalId: hospitalId,
      admin: adminId
    });

    if (!receptionist) {
      return res.status(404).json({
        success: false,
        message: 'Receptionist not found or access denied'
      });
    }

    // Get permissions
    let permissions = await Permission.findByReceptionist(receptionistId, hospitalId);

    // If no permissions exist, create default ones
    if (!permissions) {
      permissions = await Permission.createDefaultPermissions(
        receptionistId,
        adminId,
        hospitalId
      );
    }

    res.status(200).json({
      success: true,
      permissions: permissions.permissions,
      receptionistInfo: {
        id: receptionist._id,
        name: receptionist.name,
        email: receptionist.email,
        status: receptionist.status
      },
      lastUpdated: permissions.updatedAt,
      updatedBy: permissions.lastUpdatedBy
    });

  } catch (error) {
    console.error('Error in getReceptionistPermissions :', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions',
      error: error.message
    });
  }
};


export const updateReceptionistPermissions = async (req, res) => {
  //console.log("janu iam here");
  try {
    const { receptionistId } = req.params;
    const { permissions } = req.body;

    // ✅ Destructure from req.user
    //const { id: adminUserId, role, hospitalId } = req.user;
    const { id: adminUserId, role, hospitalId } = req.user;


      /*console.log("Request details:", {
      receptionistId,
      permissions,
      adminUserId,
      role,
      hospitalId
    });*/

    //console.log("hi", req.params);
    //console.log("hi1", req.body);
    //console.log("hii2", req.user);


    // Only admins can update permissions
    if (role !== 'Admin' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Validate input
    if (!mongoose.Types.ObjectId.isValid(receptionistId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receptionist ID'
      });
    }

    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Permissions must be an array'
      });
    }

    // Validate permissions
    const availablePermissions = Permission.getAvailablePermissions();
    const invalidPermissions = permissions.filter(p => !availablePermissions.includes(p));
    
    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid permissions: ${invalidPermissions.join(', ')}`,
        availablePermissions
      });
    }

    // Check if receptionist exists and belongs to admin's hospital
    const receptionist = await Receptionist.findOne({
      _id: receptionistId,
      hospitalId: hospitalId,
      admin: adminUserId
    });

    //console.log("hee", receptionist);

    if (!receptionist) {
      return res.status(404).json({
        success: false,
        message: 'Receptionist not found or access denied'
      });
    }

    // Find existing permissions or create new
    let permissionDoc = await Permission.findOne({
      receptionistId: receptionistId,
      hospitalId: hospitalId
    });

    if (permissionDoc) {
      // Update existing permissions
      permissionDoc.setPermissions(permissions, adminUserId);
      await permissionDoc.save();
    } else {
      // Create new permission document
      permissionDoc = new Permission({
        receptionistId,
        adminId: adminUserId,      // ✅ since receptionist only has admin
        hospitalId,
        permissions,
        lastUpdatedBy: adminUserId,
        notes: 'Permissions updated by admin'
      });
      await permissionDoc.save();
    }

    // Also update the receptionist model as backup
    // receptionist.permissions = permissions;
    // await receptionist.save();

    res.status(200).json({
      success: true,
      message: 'Permissions updated successfully',
      permissions: permissionDoc.permissions,
      receptionistInfo: {
        id: receptionist._id,
        name: receptionist.name,
        email: receptionist.email
      },
      updatedAt: permissionDoc.updatedAt
    });

  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating permissions',
      error: error.message
    });
  }
};

// Get all permissions for admin's hospital
export const getHospitalPermissions = async (req, res) => {
  try {
    //const { userId: adminId, role, hospitalId } = req.user;
    const { id: adminId, role, hospitalId } = req.user;

    // Only admins can view hospital permissions
    if (role !== 'Admin' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const permissions = await Permission.findByHospital(hospitalId, adminId);

    res.status(200).json({
      success: true,
      permissions: permissions,
      totalCount: permissions.length,
      hospitalId
    });

  } catch (error) {
    console.error('Error fetching hospital permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hospital permissions',
      error: error.message
    });
  }
};

// Delete permissions for a receptionist (Admin only)
export const deleteReceptionistPermissions = async (req, res) => {
  try {
    const { receptionistId } = req.params;
    //const { userId: adminId, role, hospitalId } = req.user;
    const { id: adminId, role, hospitalId } = req.user;

    // Only admins can delete permissions
    if (role !== 'Admin' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Validate receptionist ID
    if (!mongoose.Types.ObjectId.isValid(receptionistId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receptionist ID'
      });
    }

    // Check if receptionist belongs to admin's hospital
    const receptionist = await Receptionist.findOne({
      _id: receptionistId,
      hospitalId: hospitalId,
      admin: adminId
    });

    if (!receptionist) {
      return res.status(404).json({
        success: false,
        message: 'Receptionist not found or access denied'
      });
    }

    // Delete permissions
    const deleted = await Permission.findOneAndDelete({
      receptionistId: receptionistId,
      hospitalId: hospitalId
    });

    // Clear permissions in receptionist model
    receptionist.permissions = [];
    await receptionist.save();

    res.status(200).json({
      success: true,
      message: 'Permissions deleted successfully',
      deletedPermissions: deleted?.permissions || []
    });

  } catch (error) {
    console.error('Error deleting permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting permissions',
      error: error.message
    });
  }
};

// Get available permissions list
export const getAvailablePermissions = async (req, res) => {
  try {
    const availablePermissions = Permission.getAvailablePermissions();
    const defaultPermissions = Permission.getDefaultPermissions();

    res.status(200).json({
      success: true,
      availablePermissions,
      defaultPermissions,
      permissionDescriptions: {
        dashboard: 'View hospital dashboard and analytics',
        patients: 'Manage patient records and information',
        appointments: 'Schedule and manage appointments',
        staff: 'Manage hospital staff members',
        labmanagement: 'Handle laboratory tests and results',
        settings: 'Configure system settings',
        consultant: 'Doctor consultation management',
        finance: 'Financial reports and billing',
        receptionisttable: 'View receptionist records',
        share: 'Share patient referrals',
        profile: 'Manage user profile',
        pricing: 'View pricing information'
      }
    });

  } catch (error) {
    console.error('Error fetching available permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available permissions',
      error: error.message
    });
  }
};

// Create default permissions for all receptionists in hospital (Admin utility)
export const createDefaultPermissionsForHospital = async (req, res) => {
  try {
    //const { userId: adminId, role, hospitalId } = req.user;
    const { id: adminId, role, hospitalId } = req.user;

    // Only admins can perform this action
    if (role !== 'Admin' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Get all receptionists in the hospital
    const receptionists = await Receptionist.find({
      hospitalId: hospitalId,
      admin: adminId,
      status: 'Active'
    });

    const results = [];

    for (const receptionist of receptionists) {
      try {
        // Check if permissions already exist
        const existingPermissions = await Permission.findByReceptionist(receptionist._id, hospitalId);
        
        if (!existingPermissions) {
          // Create default permissions
          const newPermissions = await Permission.createDefaultPermissions(
            receptionist._id,
            adminId,
            hospitalId
          );
          
          results.push({
            receptionistId: receptionist._id,
            name: receptionist.name,
            email: receptionist.email,
            status: 'created',
            permissions: newPermissions.permissions
          });
        } else {
          results.push({
            receptionistId: receptionist._id,
            name: receptionist.name,
            email: receptionist.email,
            status: 'already_exists',
            permissions: existingPermissions.permissions
          });
        }
      } catch (error) {
        results.push({
          receptionistId: receptionist._id,
          name: receptionist.name,
          email: receptionist.email,
          status: 'error',
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Default permissions setup completed',
      results,
      totalProcessed: results.length,
      created: results.filter(r => r.status === 'created').length,
      existing: results.filter(r => r.status === 'already_exists').length,
      errors: results.filter(r => r.status === 'error').length
    });

  } catch (error) {
    console.error('Error creating default permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating default permissions',
      error: error.message
    });
  }
};