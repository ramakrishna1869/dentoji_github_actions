// models/PatientPhoto.js
import mongoose from "mongoose";

const patientPhotoSchema = new mongoose.Schema({
  // Basic identification
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
    index: true
  },
  
  // File information
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true,
    enum: [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      'image/bmp',
      'image/tiff'
    ]
  },
  
  // Medical/Dental categorization
  category: {
    type: String,
    enum: [
      'general',
      'before-treatment',
      'during-treatment', 
      'after-treatment',
      'x-ray',
      'panoramic',
      'intraoral',
      'extraoral',
      'bite-wing',
      'periapical',
      'occlusal',
      'smile',
      'profile',
      'consultation',
      'follow-up',
      'other'
    ],
    default: 'general',
    index: true
  },
  
  // Metadata
  description: {
    type: String,
    maxlength: 500
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  
  // Upload tracking
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Update tracking
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date
  },
  
  // Soft delete
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      delete ret.filePath; // Don't expose file paths in JSON
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for performance
patientPhotoSchema.index({ patientId: 1, hospitalId: 1 });
patientPhotoSchema.index({ patientId: 1, category: 1, isActive: 1 });
patientPhotoSchema.index({ hospitalId: 1, uploadedAt: -1 });

// Virtual for file URL
patientPhotoSchema.virtual('url').get(function() {
  return `/uploads/patient-photos/${this.patientId}/${this.filename}`;
});

// Pre-save middleware
patientPhotoSchema.pre('save', function(next) {
  if (this.isNew) {
    this.uploadedAt = new Date();
  }
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

const PatientPhoto = mongoose.model("PatientPhoto", patientPhotoSchema);

export default PatientPhoto;