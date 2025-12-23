// models/Patient.js
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  appointmentDate: {
    type: Date,
  },
  appointmentTime: {
    type: String,
    trim: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format (e.g., 14:30)'],
  },
  treatment: {
    type: String,
    trim: true,
  },
  doctor: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Pending', 'Rescheduled'],
    default: 'Scheduled'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastSyncedAt: {
    type: Date
  },
  syncVersion: {
    type: Number,
    default: 1
  }
}, { 
  _id: true,
  timestamps: false // We're handling timestamps manually
});

// Pre-save hook for appointmentSchema to update updatedAt
appointmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// ✅ UPDATED: Patient Schema - Removed dateOfBirth, Age is now direct input
const patientSchema = new mongoose.Schema({
  patientId: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  
  // ✅ Age is now a direct input field (not calculated from DOB)
  age: { 
    type: Number,
    min: [0, 'Age cannot be negative'],
    max: [150, 'Age must be realistic']
  },
  
  gender: { type: String },
  bloodType: { type: String },
  deletedAt: { type: Date },
  patientType: { type: String },
  memberSince: { type: Date },
  lastVisit: { type: Date },
  primaryNumber: { type: String },
  emailAddress: { type: String },
  address: { type: String },
  city: { type: String },
  phoneNumber: { type: String },
  stateProvince: { type: String },
  zipPostalCode: { type: String },
  emergencyContactName: { type: String },
  relationship: { type: String },
  emergencyContactNumber: { type: String },
  emergencyContactEmail: { type: String },
  primaryDentalIssue: { type: String },
  currentSymptoms: { type: String },
  allergies: { type: String },
  medicalHistory: { type: String },
  currentMedications: { type: String },
  
  // Medical conditions
  diabetes: { type: Boolean, default: false },
  hypertension: { type: Boolean, default: false },
  cardiacHeartProblems: { type: Boolean, default: false },
  disordersOthersSpecify: { type: Boolean, default: false },
  disordersOthers: { type: String, default: '' },
  
  // Habits
  smoking: { type: Boolean, default: false },
  drinking: { type: Boolean, default: false },
  gutkaChewing: { type: Boolean, default: false },
  
  // Payment information
  totalPaid: { type: String, default: '0' },
  opFee: { type: String, default: '0' },
  lastPayment: { type: String, default: '' },
  paymentMethod: { type: String },
  
  // Custom fields
  customFields: [{
    label: { type: String },
    value: { type: String, default: '' },
    type: { type: String, default: 'text' },
    section: {
      type: String,
      enum: ['personal', 'contact', 'emergency', 'medical', 'payment', 'appointment'],
    }
  }],
  
  // Media
  avatar: { type: String },
  appointments: [appointmentSchema],
  dentalPhotos: [{ type: String }],
  
  // Photo tracking
  photoCount: { type: Number, default: 0 },
  lastPhotoUpload: { type: Date },
  photoCategorySummary: {
    general: { type: Number, default: 0 },
    beforeTreatment: { type: Number, default: 0 },
    duringTreatment: { type: Number, default: 0 },
    afterTreatment: { type: Number, default: 0 },
    xray: { type: Number, default: 0 },
    intraoral: { type: Number, default: 0 },
    extraoral: { type: Number, default: 0 },
    smile: { type: Number, default: 0 },
    consultation: { type: Number, default: 0 }
  },
  
  // References
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
patientSchema.index({ hospitalId: 1 });
patientSchema.index({ hospitalId: 1, firstName: 1, lastName: 1 });
patientSchema.index({ hospitalId: 1, primaryNumber: 1 });
patientSchema.index({ patientId: 1 });

// Virtual for full name
patientSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Virtual to check if patient has photos
patientSchema.virtual('hasPhotos').get(function() {
  return this.photoCount > 0 || (this.dentalPhotos && this.dentalPhotos.length > 0);
});

// Method to update photo category summary
patientSchema.methods.updatePhotoCategorySummary = async function() {
  const PatientPhoto = mongoose.model('PatientPhoto');
  try {
    const categorySummary = await PatientPhoto.aggregate([
      { $match: { patientId: this._id, hospitalId: this.hospitalId, isActive: true }},
      { $group: { _id: "$category", count: { $sum: 1 }}}
    ]);

    // Reset all categories to 0
    this.photoCategorySummary = {
      general: 0, 
      beforeTreatment: 0, 
      duringTreatment: 0, 
      afterTreatment: 0,
      xray: 0, 
      intraoral: 0, 
      extraoral: 0, 
      smile: 0, 
      consultation: 0
    };

    // Map category names
    const categoryMapping = {
      'general': 'general', 
      'before-treatment': 'beforeTreatment',
      'during-treatment': 'duringTreatment', 
      'after-treatment': 'afterTreatment',
      'x-ray': 'xray', 
      'intraoral': 'intraoral', 
      'extraoral': 'extraoral',
      'smile': 'smile', 
      'consultation': 'consultation'
    };

    // Update counts from aggregation
    categorySummary.forEach(item => {
      if (categoryMapping[item._id]) {
        this.photoCategorySummary[categoryMapping[item._id]] = item.count;
      }
    });

    await this.save();
  } catch (error) {
    console.error('Error updating photo category summary:', error);
  }
};

// ✅ REMOVED: Pre-save hook that calculated age from dateOfBirth
// Age is now manually entered by users and not auto-calculated

// ✅ OPTIONAL: Validation hook to ensure age is provided
patientSchema.pre('save', function(next) {
  // You can add custom validation here if needed
  // For example, ensuring age is a reasonable number
  if (this.age && (this.age < 0 || this.age > 150)) {
    return next(new Error('Age must be between 0 and 150'));
  }
  next();
});

export default mongoose.model('Patient', patientSchema);