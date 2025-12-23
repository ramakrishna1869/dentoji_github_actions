import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  qualification: {
    type: String,
    trim: true,
    default: ""
  },
  specialization: {
    type: String,
    trim: true,
    default: ""
  },
  phone: {
    type: String,
    trim: true,
    default: ""
  },
  primaryNumber: {
    type: String,
    trim: true,
    default: ""
  },
  location: {
    type: String,
    trim: true,
    default: ""
  },
  country: {
    type: String,
    trim: true,
    default: ""
  },
  bio: {
    type: String,
    trim: true,
    default: ""
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: false,
  },
  role: {
    type: String,
    default: "Admin",
  },
  profileImage: {
    type: String,
    trim: true,
    default: ""
  },
  // NEW: Referral code field
  referralCode: {
    type: String,
    unique: true,
    sparse: true, // Allows null values while maintaining uniqueness
    trim: true,
    uppercase: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
});

// Generate referral code before saving if not exists
adminSchema.pre('save', function(next) {
  if (!this.referralCode && this.name) {
    this.referralCode = `DENTAL_${this.name.toUpperCase().replace(/\s+/g, '_')}_${new Date().getFullYear()}`;
  }
  next();
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export default Admin;