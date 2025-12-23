// models/Permission.js
import mongoose from 'mongoose';
 
const permissionSchema = new mongoose.Schema({
  receptionistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receptionist',
    required: [true, 'Receptionist ID is required'],
    index: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Admin ID is required'],
    index: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: [true, 'Hospital ID is required'],
    index: true
  },
  permissions: [{
    type: String,
    enum: [
      'dashboard',
      'patients',
      'appointments',
      'staff',
      'labmanagement',
      'settings',
      'consultant',
      'finance',
      'receptionisttable',
      'share',
      'profile',
      'pricing'
    ],
    required: false
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
 
// Indexes for better query performance
permissionSchema.index({ receptionistId: 1, hospitalId: 1 }, { unique: true });
permissionSchema.index({ adminId: 1, hospitalId: 1 });
permissionSchema.index({ hospitalId: 1, isActive: 1 });
 
// Virtual for receptionist details
permissionSchema.virtual('receptionistDetails', {
  ref: 'Receptionist',
  localField: 'receptionistId',
  foreignField: '_id',
  justOne: true
});
 
// Virtual for admin details
permissionSchema.virtual('adminDetails', {
  ref: 'Admin',
  localField: 'adminId',
  foreignField: '_id',
  justOne: true
});
 
// Static method to get default permissions for new receptionists
permissionSchema.statics.getDefaultPermissions = function() {
  return ['patients','appointments',  'share'];
};
 
// Static method to get all available permissions
permissionSchema.statics.getAvailablePermissions = function() {
  return [
    'dashboard',
    'patients',
    'appointments',
    'staff',
    'labmanagement',
    'settings',
    'consultant',
    'finance',
    'receptionisttable',
    'share',
    'profile',
    'pricing'
  ];
};
 
// Method to add permission
permissionSchema.methods.addPermission = function(permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
  return this;
};
 
// Method to remove permission
permissionSchema.methods.removePermission = function(permission) {
  this.permissions = this.permissions.filter(p => p !== permission);
  return this;
};
 
// Method to check if has permission
permissionSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};
 
// Method to set permissions (replaces all existing)
// Method to set permissions (replaces all existing)
permissionSchema.methods.setPermissions = function(newPermissions, updatedBy) {
   // Always ensure 'patients' is included for receptionists
  const finalPermissions = [...new Set([...newPermissions])];
  // Only add patients if not already present to avoid duplicates
  if (!finalPermissions.includes('patients')) {
    finalPermissions.unshift('patients');
  }
  this.permissions = finalPermissions;
  this.lastUpdatedBy = updatedBy;
  return this;
};
 
// Static method to find permissions by receptionist
permissionSchema.statics.findByReceptionist = function(receptionistId, hospitalId = null) {
  const query = { receptionistId, isActive: true };
  if (hospitalId) {
    query.hospitalId = hospitalId;
  }
  return this.findOne(query);
};
 
// Static method to find permissions by hospital
permissionSchema.statics.findByHospital = function(hospitalId, adminId = null) {
  const query = { hospitalId, isActive: true };
  if (adminId) {
    query.adminId = adminId;
  }
  return this.find(query)
    .populate('receptionistId', 'name email status')
    .populate('lastUpdatedBy', 'name email')
    .sort({ updatedAt: -1 });
};
 
// Static method to create default permissions for new receptionist
permissionSchema.statics.createDefaultPermissions = async function(receptionistId, adminId, hospitalId) {
  try {
    const defaultPermissions = this.getDefaultPermissions();
   
    const permission = new this({
      receptionistId,
      adminId,
      hospitalId,
      permissions: defaultPermissions,
      lastUpdatedBy: adminId,
      notes: 'Default permissions assigned on registration'
    });
 
    return await permission.save();
  } catch (error) {
    console.error('Error creating default permissions:', error);
    throw error;
  }
};
 
// Pre-save middleware to validate permissions
permissionSchema.pre('save', function(next) {
  // Ensure permissions are unique
  this.permissions = [...new Set(this.permissions)];
 
  // Validate all permissions are in allowed list
  const availablePermissions = this.constructor.getAvailablePermissions();
  const invalidPermissions = this.permissions.filter(p => !availablePermissions.includes(p));
 
  if (invalidPermissions.length > 0) {
    return next(new Error(`Invalid permissions: ${invalidPermissions.join(', ')}`));
  }
 
  next();
});
 
// Pre-remove middleware to handle cascading deletes
permissionSchema.pre('remove', async function(next) {
  try {
    // Log the permission removal
    //console.log(`Removing permissions for receptionist: ${this.receptionistId}`);
    next();
  } catch (error) {
    next(error);
  }
});
 
const Permission = mongoose.model('Permission', permissionSchema);
 
export default Permission;
 