

 
//receptionist model
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
 
const receptionistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false, // Don't include password in queries by default
    minlength: [3, 'Password must be at least 3 characters long'] // Reduced from 6 to handle existing data
  },
  tempPassword: {
    type: String,
    select: false, // Don't include temp password in queries by default
    default: null
  },
  phone: {
    type: String,
    trim: true,
    default: null,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  // FIXED: Changed from 'Receptionist' enum to proper role values
  role: {
    type: String,
    default: 'receptionist', // Changed to lowercase
    enum: ['receptionist', 'Receptionist'] // Allow both cases for flexibility
  },
  position: {
    type: String,
    enum: {
      values: [
        'Receptionist', 
        'Senior Receptionist', 
        'Head Receptionist'
      ],
      message: '{VALUE} is not a valid position'
    },
    default: 'Receptionist' // ✅ IMPORTANT: Set default
  },
  
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave', 'Suspended'],
    default: 'Active'
  },
  // FIXED: Updated permissions enum to include existing values from your controller
  // permissions: [{
  //   type: String,
  //   enum: [
  //     // Original permissions
  //     'view_patients',
  //     'add_patients',
  //     'edit_patients',
  //     'delete_patients',
  //     'view_appointments',
  //     'manage_appointments',
  //     'view_billing',
  //     'process_payments',
  //     'generate_reports',
  //     // ADDED: Common variations that might exist in your data
  //     'patients',
  //     'appointments',
  //     'billing',
  //     'reports',
  //     // ADDED: From your controller's default permissions
  //     'share',
  //     'labmanagement',
  //     'consultant',
  //     'whatsapp'
  //   ]
 // }],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Admin reference is required']
  },
 
 
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: [true, 'Hospital ID is required']
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0,
    max: 10
  },
  lockUntil: {
    type: Date,
    default: null
  },
  passwordResetAt: {
    type: Date,
    default: null
  },
  profileImage: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' }
  },
  emergencyContact: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    relationship: { type: String, trim: true }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  // Additional fields for better compatibility
  qualification: {
    type: String,
    trim: true,
    default: ''
  },
  specialization: {
    type: String,
    trim: true,
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  primaryNumber: {
    type: String,
    trim: true,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.tempPassword;
      return ret;
    }
  },
  toObject: { virtuals: true }
});
 
// Indexes for better query performance
receptionistSchema.index({ email: 1 });
receptionistSchema.index({ admin: 1 });
//receptionistSchema.index({ adminId: 1 }); // ADDED: Index for adminId
receptionistSchema.index({ hospitalId: 1 });
receptionistSchema.index({ status: 1 });
receptionistSchema.index({ email:1, hospitalId: 1 });
 
// Virtual for checking if account is locked
receptionistSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});
 
// Virtual for full name (if needed for display)
receptionistSchema.virtual('fullName').get(function() {
  return this.name;
});
 
// REMOVED PRE-SAVE MIDDLEWARE - We'll handle password hashing manually
// This prevents automatic hashing during queries and updates
 
// Method to compare password - IMPROVED VERSION
receptionistSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    if (!this.password) {
      //console.log('No password set for this account');
      return false;
    }
   
    // If password is not hashed (plain text), do direct comparison
    if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
      //console.log('Plain text password comparison');
      return this.password === candidatePassword;
    }
   
    // Use bcrypt to compare hashed password
    //console.log('Bcrypt password comparison');
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
};
 
// Method to hash password
receptionistSchema.methods.hashPassword = async function(password) {
  try {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
};
 
// Method to increment login attempts
receptionistSchema.methods.incLoginAttempts = async function() {
  try {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
      return this.updateOne({
        $set: {
          loginAttempts: 1
        },
        $unset: {
          lockUntil: 1
        }
      });
    }
   
    const updates = { $inc: { loginAttempts: 1 } };
   
    // If we have reached max attempts and it's not locked yet, lock it
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
      updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 }; // Lock for 15 minutes
    }
   
    return this.updateOne(updates);
  } catch (error) {
    console.error('Error incrementing login attempts:', error);
    throw error;
  }
};
 
// Method to reset login attempts
receptionistSchema.methods.resetLoginAttempts = async function() {
  try {
    return this.updateOne({
      $unset: {
        loginAttempts: 1,
        lockUntil: 1
      }
    });
  } catch (error) {
    console.error('Error resetting login attempts:', error);
    throw error;
  }
};
 
// Method to check if user has specific permission
receptionistSchema.methods.hasPermission = function(permission) {
  return this.permissions && this.permissions.includes(permission);
};
 
// Method to add permission
receptionistSchema.methods.addPermission = function(permission) {
  if (!this.permissions) {
    this.permissions = [];
  }
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
  return this.save();
};
 
// Method to remove permission
receptionistSchema.methods.removePermission = function(permission) {
  if (this.permissions) {
    this.permissions = this.permissions.filter(p => p !== permission);
  }
  return this.save();
};
 
// Static method to find by email
receptionistSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};
 
// Static method to find active receptionists
receptionistSchema.statics.findActive = function(hospitalId) {
  return this.find({
    hospitalId,
    status: 'Active'
  }).populate('admin', 'name email');
};
 
// UPDATED: Static method to find by hospital with admin filtering
receptionistSchema.statics.findByHospital = function(hospitalId, adminId) {
  const query = { hospitalId };
 
  if (adminId) {
    query.$or = [{ admin: adminId }, { adminId: adminId }];
  }
 
  return this.find(query)
    .populate('admin', 'name email')
    .populate('hospitalId', 'name location')
    .sort({ createdAt: -1 });
};
 
// ✅ CRITICAL FIX: Prevent model overwrite error
const Receptionist = mongoose.models.Receptionist || mongoose.model('Receptionist', receptionistSchema);
 
export default Receptionist;


 