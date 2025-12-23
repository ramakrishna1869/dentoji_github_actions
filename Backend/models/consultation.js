// import mongoose from 'mongoose';

// const paymentSchema = new mongoose.Schema({
//   status: {
//     type: String,
//     enum: ['Pending', 'Partial', 'Fully Paid', 'Overdue'],
//     default: 'Pending',
//   },
//   total: {
//     type: Number,
//     default: 0,
//     min: 0,
//   },
//   paid: {
//     type: Number,
//     default: 0,
//     min: 0,
//   },
// });

// const consultationSchema = new mongoose.Schema({
//   // Auto-generated consultation ID
//   consultationId: {
//     type: String,
//     unique: true,
//   },

//   // Patient Information (from Patient database)
//   patientId: {
//     type: String,
//     trim: true,
//   },
//   patientName: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   patientPhone: {
//     type: String,
//     trim: true,
//   },
//   patientAge: {
//     type: Number,
//     min: 0,
//     max: 150,
//   },
//   patientGender: {
//     type: String,
//     enum: ['Male', 'Female', 'Other', 'male', 'female', 'other', ''],
//     default: '',
//   },
  
//   // Reference to Patient document if exists
//   patientObjectId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Patient',
//   },

//   // Consultant Information
//   consultantDoctor: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   doctorPhone: {
//     type: String,
//     trim: true,
//   },
//   clinicName: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   treatmentSpecialty: {
//     type: String,
//     trim: true,
//   },
//   consultationType: {
//     type: String,
//     required: true,
//     enum: [
//       'General Checkup',
//       'Emergency',
//       'Follow-up',
//       'Consultation',
//       'Treatment',
//       'Surgery',
//       'Routine'
//     ],
//   },

//   // Status Information
//   status: {
//     type: String,
//     enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'High Urgency'],
//     default: 'Scheduled',
//   },

//   // Appointment Details
//   appointmentDate: {
//     type: Date,
//     required: true,
//   },
//   appointmentTime: {
//     type: String,
//     trim: true,
//   },

//   // Payment Information
//   payment: paymentSchema,

//   // Additional Information
//   referralReason: {
//     type: String,
//     trim: true,
//     maxlength: 1000,
//   },
//   additionalNotes: {
//     type: String,
//     trim: true,
//     maxlength: 1000,
//   },

//   // Context Information
//   hospitalId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Hospital',
//     required: true,
//   },
//   adminId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Admin',
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User', // Could be Admin or Receptionist
//     required: true,
//   },

//   // Custom Fields Support
//   customFields: [{
//     name: {
//       type: String,
//       trim: true,
//     },
//     value: {
//       type: mongoose.Schema.Types.Mixed, // Can store any type
//     },
//     type: {
//       type: String,
//       enum: ['text', 'number', 'email', 'date'],
//       default: 'text',
//     }
//   }],

//   // Timestamps
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Pre-save middleware to generate consultationId
// consultationSchema.pre('save', async function(next) {
//   try {
//     if (this.isNew && !this.consultationId) {
//       //console.log('Generating consultation ID...');
      
//       const ConsultationModel = this.constructor;
//       const count = await ConsultationModel.countDocuments();
      
//       let consultationId = `CONS${(count + 1).toString().padStart(4, '0')}`;
      
//       let counter = 0;
//       while (await ConsultationModel.findOne({ consultationId })) {
//         counter++;
//         consultationId = `CONS${(count + 1 + counter).toString().padStart(4, '0')}`;
//         if (counter > 100) {
//           consultationId = `CONS${Date.now().toString().slice(-8)}`;
//           break;
//         }
//       }
      
//       this.consultationId = consultationId;
//       //console.log('Generated consultation ID:', consultationId);
//     }
    
//     this.updatedAt = new Date();
//     next();
//   } catch (error) {
//     console.error('Error in pre-save middleware:', error);
//     next(error);
//   }
// });

// // Transform gender values before saving
// consultationSchema.pre('save', function(next) {
//   if (this.patientGender) {
//     const gender = this.patientGender.toLowerCase();
//     if (gender === 'male' || gender === 'm') {
//       this.patientGender = 'Male';
//     } else if (gender === 'female' || gender === 'f') {
//       this.patientGender = 'Female';
//     } else if (gender === 'other') {
//       this.patientGender = 'Other';
//     }
//   }
//   next();
// });

// // Indexes for better query performance
// consultationSchema.index({ hospitalId: 1 });
// consultationSchema.index({ patientId: 1 });
// consultationSchema.index({ consultationId: 1 });
// consultationSchema.index({ status: 1 });
// consultationSchema.index({ appointmentDate: 1 });
// consultationSchema.index({ createdAt: -1 });
// consultationSchema.index({ 'payment.status': 1 });

// // Virtual for calculating remaining payment
// consultationSchema.virtual('payment.remaining').get(function() {
//   return this.payment.total - this.payment.paid;
// });

// // Virtual for payment completion percentage
// consultationSchema.virtual('payment.completionPercentage').get(function() {
//   if (this.payment.total === 0) return 0;
//   return Math.round((this.payment.paid / this.payment.total) * 100);
// });

// // Virtual for appointment status
// consultationSchema.virtual('isUpcoming').get(function() {
//   if (!this.appointmentDate) return false;
//   const now = new Date();
//   return new Date(this.appointmentDate) > now;
// });

// // Virtual for overdue appointments
// consultationSchema.virtual('isOverdue').get(function() {
//   if (!this.appointmentDate) return false;
//   const now = new Date();
//   return new Date(this.appointmentDate) < now && this.status === 'Scheduled';
// });

// // Ensure virtuals are included in JSON output
// consultationSchema.set('toJSON', { virtuals: true });
// consultationSchema.set('toObject', { virtuals: true });

// // Static methods for common queries
// consultationSchema.statics.findByHospital = function(hospitalId) {
//   return this.find({ hospitalId })
//     .populate('patientObjectId', 'firstName lastName phoneNumber primaryNumber')
//     .sort({ createdAt: -1 });
// };

// consultationSchema.statics.findUpcoming = function(hospitalId) {
//   const today = new Date();
//   return this.find({
//     hospitalId,
//     appointmentDate: { $gte: today },
//     status: 'Scheduled'
//   }).sort({ appointmentDate: 1 });
// };

// consultationSchema.statics.findPendingPayments = function(hospitalId) {
//   return this.find({
//     hospitalId,
//     'payment.status': { $in: ['Pending', 'Partial', 'Overdue'] }
//   }).sort({ appointmentDate: 1 });
// };

// consultationSchema.statics.getStatsByHospital = function(hospitalId) {
//   return this.aggregate([
//     { $match: { hospitalId: new mongoose.Types.ObjectId(hospitalId) } },
//     {
//       $group: {
//         _id: null,
//         totalConsultations: { $sum: 1 },
//         scheduledCount: { $sum: { $cond: [{ $eq: ['$status', 'Scheduled'] }, 1, 0] } },
//         highUrgencyCount: { $sum: { $cond: [{ $eq: ['$status', 'High Urgency'] }, 1, 0] } },
//         completedCount: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
//         pendingPaymentCount: { $sum: { $cond: [{ $in: ['$payment.status', ['Pending', 'Partial', 'Overdue']] }, 1, 0] } },
//         totalRevenue: { $sum: '$payment.total' },
//         totalPaid: { $sum: '$payment.paid' },
//         pendingPayments: { $sum: { $subtract: ['$payment.total', '$payment.paid'] } }
//       }
//     }
//   ]);
// };

// export default mongoose.model('Consultation', consultationSchema);

import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Fully Paid', 'Overdue'],
    default: 'Pending',
  },
  total: {
    type: Number,
    default: 0,
    min: 0,
  },
  paid: {
    type: Number,
    default: 0,
    min: 0,
  },
  method: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque', 'Online', ''],
    default: '',
  },
  date: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
});

const consultationSchema = new mongoose.Schema({
  // Auto-generated consultation ID
  consultationId: {
    type: String,
    unique: true,
  },

  // Patient Information (from Patient database)
  patientId: {
    type: String,
    trim: true,
  },
  patientName: {
    type: String,
    required: true,
    trim: true,
  },
  patientPhone: {
    type: String,
    trim: true,
  },
  patientAge: {
    type: Number,
    min: 0,
    max: 150,
  },
  patientGender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'male', 'female', 'other', ''],
    default: '',
  },
  
  // Reference to Patient document if exists
  patientObjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
  },

  // Consultant Information
  consultantDoctor: {
    type: String,
    required: true,
    trim: true,
  },
  doctorPhone: {
    type: String,
    trim: true,
  },
  clinicName: {
    type: String,
    required: true,
    trim: true,
  },
  treatmentSpecialty: {
    type: String,
    trim: true,
  },
  consultationType: {
    type: String,
    required: true,
    enum: [
      'General Checkup',
      'Emergency',
      'Follow-up',
      'Consultation',
      'Treatment',
      'Surgery',
      'Routine'
    ],
  },

  // Status Information
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'High Urgency'],
    default: 'Scheduled',
  },

  // Appointment Details
  appointmentDate: {
    type: Date,
    required: true,
  },
  appointmentTime: {
    type: String,
    trim: true,
  },

  // Payment Information - Enhanced
  payment: {
    type: paymentSchema,
    default: () => ({
      status: 'Pending',
      total: 0,
      paid: 0,
      method: '',
      date: null,
      notes: ''
    })
  },

  // Backward compatibility fields (deprecated but maintained)
  total: {
    type: Number,
    default: 0,
  },
  paid: {
    type: Number,
    default: 0,
  },

  // Additional Information
  referralReason: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  additionalNotes: {
    type: String,
    trim: true,
    maxlength: 1000,
  },

  // Context Information
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Could be Admin or Receptionist
    required: true,
  },

  // Custom Fields Support
  customFields: [{
    name: {
      type: String,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed, // Can store any type
    },
    type: {
      type: String,
      enum: ['text', 'number', 'email', 'date'],
      default: 'text',
    }
  }],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to generate consultationId
consultationSchema.pre('save', async function(next) {
  try {
    if (this.isNew && !this.consultationId) {
      //console.log('Generating consultation ID...');
      
      const ConsultationModel = this.constructor;
      const count = await ConsultationModel.countDocuments();
      
      let consultationId = `CONS${(count + 1).toString().padStart(4, '0')}`;
      
      let counter = 0;
      while (await ConsultationModel.findOne({ consultationId })) {
        counter++;
        consultationId = `CONS${(count + 1 + counter).toString().padStart(4, '0')}`;
        if (counter > 100) {
          consultationId = `CONS${Date.now().toString().slice(-8)}`;
          break;
        }
      }
      
      this.consultationId = consultationId;
      //console.log('Generated consultation ID:', consultationId);
    }
    
    this.updatedAt = new Date();
    next();
  } catch (error) {
    console.error('Error in pre-save middleware:', error);
    next(error);
  }
});

// Pre-save middleware to handle payment status calculation and backward compatibility
consultationSchema.pre('save', function(next) {
  // Ensure payment object exists
  if (!this.payment) {
    this.payment = {
      status: 'Pending',
      total: 0,
      paid: 0,
      method: '',
      date: null,
      notes: ''
    };
  }

  // Auto-calculate payment status based on amounts
  const totalAmount = this.payment.total || 0;
  const paidAmount = this.payment.paid || 0;

  if (paidAmount === 0) {
    this.payment.status = 'Partial';
  } else if (paidAmount >= totalAmount) {
    this.payment.status = 'Paid';
  } else if (paidAmount > 0 && paidAmount < totalAmount) {
    this.payment.status = 'Pending';
  }

  // Maintain backward compatibility
  this.total = this.payment.total;
  this.paid = this.payment.paid;

  next();
});

// Transform gender values before saving
consultationSchema.pre('save', function(next) {
  if (this.patientGender) {
    const gender = this.patientGender.toLowerCase();
    if (gender === 'male' || gender === 'm') {
      this.patientGender = 'Male';
    } else if (gender === 'female' || gender === 'f') {
      this.patientGender = 'Female';
    } else if (gender === 'other') {
      this.patientGender = 'Other';
    }
  }
  next();
});

// Indexes for better query performance
consultationSchema.index({ hospitalId: 1 });
consultationSchema.index({ patientId: 1 });
consultationSchema.index({ consultationId: 1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ appointmentDate: 1 });
consultationSchema.index({ createdAt: -1 });
consultationSchema.index({ 'payment.status': 1 });

// Virtual for calculating remaining payment
consultationSchema.virtual('payment.remaining').get(function() {
  return this.payment.total - this.payment.paid;
});

// Virtual for payment completion percentage
consultationSchema.virtual('payment.completionPercentage').get(function() {
  if (this.payment.total === 0) return 0;
  return Math.round((this.payment.paid / this.payment.total) * 100);
});

// Virtual for appointment status
consultationSchema.virtual('isUpcoming').get(function() {
  if (!this.appointmentDate) return false;
  const now = new Date();
  return new Date(this.appointmentDate) > now;
});

// Virtual for overdue appointments
consultationSchema.virtual('isOverdue').get(function() {
  if (!this.appointmentDate) return false;
  const now = new Date();
  return new Date(this.appointmentDate) < now && this.status === 'Scheduled';
});

// Ensure virtuals are included in JSON output
consultationSchema.set('toJSON', { virtuals: true });
consultationSchema.set('toObject', { virtuals: true });

// Static methods for common queries
consultationSchema.statics.findByHospital = function(hospitalId) {
  return this.find({ hospitalId })
    .populate('patientObjectId', 'firstName lastName phoneNumber primaryNumber')
    .sort({ createdAt: -1 });
};

consultationSchema.statics.findUpcoming = function(hospitalId) {
  const today = new Date();
  return this.find({
    hospitalId,
    appointmentDate: { $gte: today },
    status: 'Scheduled'
  }).sort({ appointmentDate: 1 });
};

consultationSchema.statics.findPendingPayments = function(hospitalId) {
  return this.find({
    hospitalId,
    'payment.status': { $in: ['Partial', 'Pending', 'Overdue'] }
  }).sort({ appointmentDate: 1 });
};

consultationSchema.statics.getStatsByHospital = function(hospitalId) {
  return this.aggregate([
    { $match: { hospitalId: new mongoose.Types.ObjectId(hospitalId) } },
    {
      $group: {
        _id: null,
        totalConsultations: { $sum: 1 },
        scheduledCount: { $sum: { $cond: [{ $eq: ['$status', 'Scheduled'] }, 1, 0] } },
        highUrgencyCount: { $sum: { $cond: [{ $eq: ['$status', 'High Urgency'] }, 1, 0] } },
        completedCount: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
        pendingPaymentCount: { $sum: { $cond: [{ $in: ['$payment.status', ['Partial', 'Pending', 'Overdue']] }, 1, 0] } },
        totalRevenue: { $sum: '$payment.total' },
        totalPaid: { $sum: '$payment.paid' },
        pendingPayments: { $sum: { $subtract: ['$payment.total', '$payment.paid'] } }
      }
    }
  ]);
};

export default mongoose.model('Consultation', consultationSchema);