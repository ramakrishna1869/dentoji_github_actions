import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
    trim: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  emailAddress: {
    type: String,
    trim: true,
  },
  doctor: {
    type: String,
    required: true,
    trim: true,
  },
  treatmentType: {
    type: String,
    required: true,
    trim: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  appointmentTime: {
    type: String,
    required: true,
    trim: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide a valid time in HH:MM format (e.g., 14:30)'],
  },
  duration: {
    type: String,
    default: '45 mins',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show'],
    default: 'Scheduled',
  },
  sendReminder: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'Yes',
  },
  additionalNotes: {
    type: String,
    trim: true,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
appointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Appointment', appointmentSchema);