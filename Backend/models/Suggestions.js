// models/Suggestions.js
import mongoose from 'mongoose';

const suggestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  // References
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  receptionistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receptionist',
    required: false, // Optional, only if created by receptionist
  },
  // Additional fields
  createdBy: {
    type: String,
    required: true,
    enum: ['Admin', 'Receptionist', 'Doctor'], // Who created the suggestion
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // Optional fields for future enhancement
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Cancelled'],
    default: 'Active',
  },
  tags: [{
    type: String,
    trim: true,
  }],
});

// Add indexes for better query performance
suggestionSchema.index({ patientId: 1, hospitalId: 1 });
suggestionSchema.index({ hospitalId: 1, createdAt: -1 });
suggestionSchema.index({ adminId: 1, createdAt: -1 });

// Update the updatedAt field before saving
suggestionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Suggestion', suggestionSchema);