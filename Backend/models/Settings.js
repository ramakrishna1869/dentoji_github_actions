// models/Settings.js
import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userModel'
  },
  userModel: {
    type: String,
    required: true,
    enum: ['Admin', 'Receptionist']
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  security: {
    twoFactorAuth: { type: Boolean, default: false },
    loginAttempts: { type: Number, default: 5, min: 3, max: 10 },
    sessionTimeout: { type: Number, default: 60, min: 30, max: 480 } // in minutes
  },
  notifications: {
    emailNotif: { type: Boolean, default: true },
    smsNotif: { type: Boolean, default: false },
    pushNotif: { type: Boolean, default: true },
    appointmentReminders: { type: Boolean, default: true },
    patientUpdates: { type: Boolean, default: true },
    systemAlerts: { type: Boolean, default: true }
  },
  backup: {
    autoBackup: { type: Boolean, default: true },
    backupFrequency: { 
      type: String, 
      enum: ['Hourly', 'Daily', 'Weekly', 'Monthly'], 
      default: 'Daily' 
    },
    storageLocation: { 
      type: String, 
      enum: ['Cloud', 'Local', 'Both'], 
      default: 'Cloud' 
    },
    lastBackupDate: { type: String, default: '' }
  },
  system: {
    autoUpdates: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    timezone: { 
      type: String, 
      enum: ['Asia/Kolkata', 'America/New_York', 'Europe/London', 'Asia/Tokyo'], 
      default: 'Asia/Kolkata' 
    },
    language: { 
      type: String, 
      enum: ['English', 'Hindi', 'Telugu', 'Tamil'], 
      default: 'English' 
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
settingsSchema.index({ userId: 1, userModel: 1 }, { unique: true });

export default mongoose.model("Settings", settingsSchema);