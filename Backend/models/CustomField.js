// models/CustomField.js
import mongoose from 'mongoose';

const customFieldSchema = new mongoose.Schema({
  // Field identification
  label: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  value: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ''
  },
  
  // Section identification
  section: {
    type: String,
    required: true,
    enum: ['patient', 'medication', 'payment', 'treatment']
  },
  
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
  
  // Optional medication reference (for medication-specific fields)
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication'
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
customFieldSchema.index({ patientId: 1, section: 1 });
customFieldSchema.index({ hospitalId: 1, section: 1 });
customFieldSchema.index({ medicationId: 1 });

// Compound unique index to prevent duplicate labels per patient/section
customFieldSchema.index(
  { patientId: 1, section: 1, label: 1, isActive: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { isActive: true }
  }
);

// Pre-save middleware
customFieldSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('CustomField', customFieldSchema);