import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pending', 'Partial', 'Fully Paid', 'Overdue'],
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
});

const labRecordSchema = new mongoose.Schema({
  // Auto-generated lab record ID - REMOVED required: true
  labRecordId: {
    type: String,
    unique: true,
    // Do NOT set required: true since we generate this in pre-save
  },

  // Patient Information
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
    enum: ['Male', 'Female', 'Other', 'male', 'female', 'other', ''], // Added lowercase options
    default: '',
  },
  
  // Reference to Patient document if exists
  patientObjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
  },

  // Lab Information
  labName: {
    type: String,
    required: true,
    trim: true,
  },
  technician: {
    type: String,
    trim: true,
  },

  // Crown Details
  crownType: {
    type: String,
    required: true,
    enum: [
      'Zirconia Crown',
      'Porcelain Crown', 
      'Metal Crown',
      'Composite Crown',
      'Ceramic Crown',
      'PFM Crown'
    ],
  },
  material: {
    type: String,
    trim: true,
  },
  tooth: {
    type: String,
    required: true,
    trim: true,
  },
  tag: {
    type: String,
    trim: true,
  },

  // Status and Timeline
  status: {
    type: String,
    enum: ['Sent', 'In Progress', 'Ready', 'Received', 'Completed', 'Cancelled'],
    default: 'Sent',
  },
  sentDate: {
    type: Date,
  },
  receivedDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
  completedDate: {
    type: Date,
  },

  // Payment Information
  payment: paymentSchema,

  // Additional Information
  notes: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  billUploaded: {
    type: Boolean,
    default: false,
  },
  billUrl: {
    type: String, // For storing file path/URL if bill is uploaded
  },
traysDetails: {
  type: String,
  enum: ['Yes', 'No', ''],
  default: '',
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

// Pre-save middleware to generate labRecordId
labRecordSchema.pre('save', async function(next) {
  try {
    // Only generate ID if this is a new document and doesn't have an ID yet
    if (this.isNew && !this.labRecordId) {
      //console.log('Generating lab record ID...');
      
      // Get count of existing records
      const LabRecordModel = this.constructor;
      const count = await LabRecordModel.countDocuments();
      
      // Generate ID with padding
      let labRecordId = `LR${(count + 1).toString().padStart(4, '0')}`;
      
      // Check for uniqueness and increment if needed
      let counter = 0;
      while (await LabRecordModel.findOne({ labRecordId })) {
        counter++;
        labRecordId = `LR${(count + 1 + counter).toString().padStart(4, '0')}`;
        if (counter > 100) { // Safety check
          labRecordId = `LR${Date.now().toString().slice(-8)}`;
          break;
        }
      }
      
      this.labRecordId = labRecordId;
      //console.log('Generated lab record ID:', labRecordId);
    }
    
    // Update timestamp
    this.updatedAt = new Date();
    next();
  } catch (error) {
    console.error('Error in pre-save middleware:', error);
    next(error);
  }
});

// Pre-save middleware to automatically set completedDate when status is 'Completed'
labRecordSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'Completed' && !this.completedDate) {
    this.completedDate = new Date();
  }
  next();
});

// Transform gender values before saving
labRecordSchema.pre('save', function(next) {
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
labRecordSchema.index({ hospitalId: 1 });
labRecordSchema.index({ patientId: 1 });
labRecordSchema.index({ labRecordId: 1 });
labRecordSchema.index({ status: 1 });
labRecordSchema.index({ dueDate: 1 });
labRecordSchema.index({ createdAt: -1 });
labRecordSchema.index({ 'payment.status': 1 });

// Virtual for calculating remaining payment
labRecordSchema.virtual('payment.remaining').get(function() {
  return this.payment.total - this.payment.paid;
});

// Virtual for payment completion percentage
labRecordSchema.virtual('payment.completionPercentage').get(function() {
  if (this.payment.total === 0) return 0;
  return Math.round((this.payment.paid / this.payment.total) * 100);
});

// Virtual for days until due date
labRecordSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
labRecordSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  const now = new Date();
  return new Date(this.dueDate) < now && this.status !== 'Completed';
});

// Ensure virtuals are included in JSON output
labRecordSchema.set('toJSON', { virtuals: true });
labRecordSchema.set('toObject', { virtuals: true });

// Static methods for common queries
labRecordSchema.statics.findByHospital = function(hospitalId) {
  return this.find({ hospitalId })
    .populate('patientObjectId', 'firstName lastName phoneNumber primaryNumber')
    .sort({ createdAt: -1 });
};

labRecordSchema.statics.findOverdue = function(hospitalId) {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  return this.find({
    hospitalId,
    dueDate: { $lt: today },
    status: { $nin: ['Completed', 'Cancelled'] }
  }).sort({ dueDate: 1 });
};

labRecordSchema.statics.findPendingPayments = function(hospitalId) {
  return this.find({
    hospitalId,
    'payment.status': { $in: ['Pending', 'Partial', 'Overdue'] }
  }).sort({ dueDate: 1 });
};

labRecordSchema.statics.getStatsByHospital = function(hospitalId) {
  return this.aggregate([
    { $match: { hospitalId: new mongoose.Types.ObjectId(hospitalId) } },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        sentCount: { $sum: { $cond: [{ $eq: ['$status', 'Sent'] }, 1, 0] } },
        inProgressCount: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
        readyCount: { $sum: { $cond: [{ $eq: ['$status', 'Ready'] }, 1, 0] } },
        receivedCount: { $sum: { $cond: [{ $eq: ['$status', 'Received'] }, 1, 0] } },
        completedCount: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
        totalRevenue: { $sum: '$payment.total' },
        totalPaid: { $sum: '$payment.paid' },
        pendingPayments: { $sum: { $subtract: ['$payment.total', '$payment.paid'] } }
      }
    }
  ]);
};

export default mongoose.model('LabRecord', labRecordSchema);
