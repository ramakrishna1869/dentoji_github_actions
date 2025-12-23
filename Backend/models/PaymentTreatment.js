// models/PaymentTreatment.js
import mongoose from 'mongoose';

const paymentTreatmentSchema = new mongoose.Schema({
  // References
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },

  // Custom fields for payment and treatment sections
  customFields: [{
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200
    },
    value: {
      type: String,
      trim: true,
      default: ''
    },
    section: {
      type: String,
      required: true,
      enum: ['payment', 'treatment']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
paymentTreatmentSchema.index({ patientId: 1 });
paymentTreatmentSchema.index({ hospitalId: 1 });

// Pre-save middleware
paymentTreatmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('PaymentTreatment', paymentTreatmentSchema);