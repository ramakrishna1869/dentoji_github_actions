// models/Payment.js - UPDATED WITHOUT FREE TRIAL
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Razorpay details
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  signature: {
    type: String,
    required: true
  },
  
  // Payment details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  
  // Plan details
  planType: {
    type: String,
    required: true,
    enum: ['Basic Plan', 'Monthly Plan', 'Yearly Plan']
  },
  planDuration: {
    type: Number, // in days
    required: true
  },
  planStartDate: {
    type: Date,
    default: Date.now
  },
  planEndDate: {
    type: Date,
    required: true
  },
  
  // User details
  userDetails: {
    name: String,
    email: {
      type: String,
      required: true
    },
    phone: String,
    location: String,
    specialization: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Payment method details
  paymentMethod: String,
  
  // Additional metadata
  receipt: String,
  notes: {
    type: Map,
    of: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Refund details (if applicable)
  refundDetails: {
    refundId: String,
    refundAmount: Number,
    refundDate: Date,
    refundReason: String
  },
  
  // Subscription details
  isActive: {
    type: Boolean,
    default: true
  },
  autoRenew: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ 'userDetails.email': 1 });
paymentSchema.index({ 'userDetails.userId': 1 });
paymentSchema.index({ planType: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// Calculate plan end date before saving
paymentSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set plan duration based on plan type
    switch (this.planType) {
      case 'Basic Plan':
        this.planDuration = 30;
        break;
      case 'Monthly Plan':
        this.planDuration = 30;
        break;
      case 'Yearly Plan':
        this.planDuration = 365;
        break;
      default:
        this.planDuration = 30;
    }
    
    // Calculate end date
    this.planEndDate = new Date(this.planStartDate.getTime() + (this.planDuration * 24 * 60 * 60 * 1000));
  }
  next();
});

export default mongoose.model('Payment', paymentSchema);