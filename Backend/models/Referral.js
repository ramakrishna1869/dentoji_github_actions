// models/Referral.js
import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true
  },
  referredDoctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null,
    index: true
  },
  referredDoctorEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  referredDoctorName: {
    type: String,
    default: null
  },
  referredDoctorPhone: {
    type: String,
    default: null
  },
  referralCode: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Registered', 'Accepted'],
    default: 'Pending'
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null
  },
  planType: {
    type: String,
    enum: ['Basic Plan', 'Monthly Plan', 'Yearly Plan', null],
    default: null
  },
  referralAmount: {
    type: Number,
    default: 0,
    comment: 'Amount in paise'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date,
    default: null
  },
  dateSent: {
    type: Date,
    default: Date.now
  },
  registeredAt: {
    type: Date,
    default: null
  },
  acceptedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
referralSchema.index({ referrerId: 1, status: 1 });
referralSchema.index({ referredDoctorEmail: 1 });
referralSchema.index({ referralCode: 1 });

// Calculate referral amount based on plan type
referralSchema.methods.calculateReferralAmount = function(planType) {
  switch(planType) {
    case 'Yearly Plan':
      return 50000; // ₹500 in paise
    case 'Monthly Plan':
      return 20000; // ₹200 in paise
    case 'Free Trial':
    default:
      return 0; // No amount for basic/free trial
  }
};

// Update referral status when doctor registers
referralSchema.methods.markAsRegistered = async function(doctorId, doctorName) {
  this.status = 'Registered';
  this.referredDoctorId = doctorId;
  this.referredDoctorName = doctorName;
  this.registeredAt = new Date();
  await this.save();
};

// Update referral status when subscription is purchased
referralSchema.methods.markAsAccepted = async function(subscriptionId, planType) {
  this.status = 'Accepted';
  this.subscriptionId = subscriptionId;
  this.planType = planType;
  this.referralAmount = this.calculateReferralAmount(planType);
  this.acceptedAt = new Date();
  await this.save();
};

const Referral = mongoose.model('Referral', referralSchema);

export default Referral;