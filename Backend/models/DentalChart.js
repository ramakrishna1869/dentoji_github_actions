// models/DentalChart.js - Updated Schema with Investigation Comment
import mongoose from 'mongoose';

const dentalChartSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    index: true
  },
  hospitalId: {
    type: String,
    default: 'default-hospital'
  },
  isAdult: {
    type: Boolean,
    default: true
  },
  toothIssues: {
    type: Map,
    of: [String],
    default: new Map()
  },
  notes: {
    type: Map,
    of: String,
    default: new Map()
  },
  comments: [{
    id: Number,
    x: Number,
    y: Number,
    messages: [{
      msgId: Number,
      text: String,
      time: String
    }]
  }],
  photos: [{
    _id: String,
    filename: String,
    originalName: String,
    category: String,
    description: String,
    uploadDate: Date,
    url: String
  }],
  // UPDATED: Proforma data with investigation comment
  proformaData: {
    fullName: {
      type: String,
      trim: true
    },
    age: {
      type: String,
      trim: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'male', 'female', 'other'],
      trim: true
    },
    medicalHistory: {
      type: String,
      trim: true
    },
    chiefComplaint: {
      type: String,
      trim: true
    },
    clinicalFeatures: {
      type: String,
      trim: true
    },
    // NEW: Investigation comment field
    investigationComment: {
      type: String,
      trim: true
    },
    diagnosis: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
});

// Add indexes for better performance
dentalChartSchema.index({ patientId: 1 });
dentalChartSchema.index({ hospitalId: 1 });
dentalChartSchema.index({ patientId: 1, hospitalId: 1 });

const DentalChart = mongoose.model('DentalChart', dentalChartSchema);

export default DentalChart;