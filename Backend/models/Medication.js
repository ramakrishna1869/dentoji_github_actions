// models/Medication.js
import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  // Patient and appointment association
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    //required: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    //required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    //required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  
  // Prescription details
  diagnosis: {
    type: String,
   // required: true,
    trim: true
  },
  
  // Medication details
  medications: [{
    medicationName: {
      type: String,
     // required: true,
      trim: true
    },
    dosage: {
      type: String,
     // required: true,
      trim: true
    },
    frequency: {
      type: String,
      //required: true,
      enum: ['Once Daily', 'Twice Daily', 'Three times Daily', 'As needed'],
      default: 'Once Daily'
    },
    duration: {
      type: String,
     // required: true,
      trim: true
    },
    instruction: {
      type: String,
     // required: true,
      trim: true
    }
  }],
  
  // Additional prescription details
//   additionalNotes: {
//     type: String,
//     trim: true
//   },
  
//   // Follow-up information
//   followUpDate: {
//     type: Date
//   },
//   followUpAppointment: {
//     type: String,
//     trim: true
//   },
//   followUpTime: {
//     type: String,
//     trim: true
//   },
  
  // Payment information
  totalAmount: {
    type: Number,
    min: 0
  },
  paidAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  pendingAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Payment Pending', 'Partially Paid', 'Paid', 'Overdue'],
    default: 'Payment Pending'
  },
  
  // Treatment status
  treatmentStatus: {
    type: String,
    enum: ['Treatment in Progress', 'Completed', 'Cancelled', 'On Hold'],
    default: 'Treatment in Progress'
  },
  currentStatus: {
    type: String,
    trim: true,
    default: 'In progress'
  },
  
  // Prescription metadata
  prescriptionNumber: {
    type: String,
    //unique: true
  },
  prescribedBy: {
    type: String,
   // required: true,
    trim: true
  },
  
  // Audit fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to generate prescription number
medicationSchema.pre('save', function(next) {
  if (!this.prescriptionNumber) {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 5);
    this.prescriptionNumber = `PX-${timestamp}-${randomStr}`.toUpperCase();
  }
  this.updatedAt = Date.now();
  
  // Calculate pending amount
  if (this.totalAmount !== undefined && this.paidAmount !== undefined) {
    this.pendingAmount = this.totalAmount - this.paidAmount;
    
    // Update payment status based on amounts
    if (this.paidAmount === 0) {
      this.paymentStatus = 'Payment Pending';
    } else if (this.paidAmount < this.totalAmount) {
      this.paymentStatus = 'Partially Paid';
    } else if (this.paidAmount >= this.totalAmount) {
      this.paymentStatus = 'Paid';
    }
  }
  
  next();
});

// Index for better query performance
medicationSchema.index({ patientId: 1, createdAt: -1 });
medicationSchema.index({ hospitalId: 1, createdAt: -1 });
medicationSchema.index({ prescriptionNumber: 1 });

export default mongoose.model('Medication', medicationSchema);