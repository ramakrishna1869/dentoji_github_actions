// Updated TreatmentEncounter.js model - NO required fields

import mongoose from 'mongoose';

const treatmentEncounterSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    index: true
  },
  hospitalId: {
    type: String,
    default: 'default-hospital'
  },
 encounters: [{
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  serialNo: {
    type: Number,
  },
  dateTime: {
    type: Date,
    default: Date.now
  },
  treatment: {
    type: String,
    trim: true,
    maxLength: 500,
    default: ''
  },
  // ✅ ADD THIS NEW FIELD - This is what's missing!
  expectedCost: {
    type: Number,
    min: 0,
    default: 0
  },
  // Note: Remove the duplicate amountPaid field (you have it twice in your model)
  amountPaid: {
    type: Number,
    min: 0,
    default: 0
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Insurance', 'UPI', 'Cheque'],
    default: 'Cash'
  },
  notes: {
    type: String,
    trim: true,
    maxLength: 1000,
    default: ''
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Cancelled', 'In Progress'],
    default: 'Completed'
  },
  dentist: {
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
  }
}],
  // Summary fields
  totalEncounters: {
    type: Number,
    default: 0
  },
  totalAmountPaid: {
    type: Number,
    default: 0
  },
  lastEncounterDate: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
treatmentEncounterSchema.index({ patientId: 1 });
treatmentEncounterSchema.index({ hospitalId: 1 });
treatmentEncounterSchema.index({ patientId: 1, hospitalId: 1 });
treatmentEncounterSchema.index({ 'encounters.dateTime': -1 });

// Pre-save middleware to update summary fields and serial numbers
treatmentEncounterSchema.pre('save', function(next) {
  // Filter encounters that have at least some meaningful content
  // This ensures completely empty encounters don't get saved
  this.encounters = this.encounters.filter(encounter => {
    const hasContent = 
      encounter.treatment ||
      (encounter.amountPaid && encounter.amountPaid > 0) ||
      encounter.notes ||
      encounter.dentist;
    
    return hasContent;
  });
  
  // Sort encounters by date
  this.encounters.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
  
  // Update serial numbers and ensure they exist
  this.encounters.forEach((encounter, index) => {
    encounter.serialNo = index + 1;
    encounter.updatedAt = new Date();
    
    // Ensure required fields have default values if missing
    if (!encounter._id) {
      encounter._id = new mongoose.Types.ObjectId();
    }
  });
  
  // Update summary fields
  this.totalEncounters = this.encounters.length;
  this.totalAmountPaid = this.encounters.reduce((sum, encounter) => sum + (encounter.amountPaid || 0), 0);
  
  // Update last encounter date
  if (this.encounters.length > 0) {
    const sortedByDate = [...this.encounters].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
    this.lastEncounterDate = sortedByDate[0].dateTime;
  } else {
    this.lastEncounterDate = null;
  }
  
  next();
});

// Pre-validate middleware to set serial numbers before validation
treatmentEncounterSchema.pre('validate', function(next) {
  // Ensure serial numbers are set before validation
  this.encounters.forEach((encounter, index) => {
    if (!encounter.serialNo) {
      encounter.serialNo = index + 1;
    }
  });
  next();
});

// UPDATED: Instance method to add encounter - more flexible
treatmentEncounterSchema.methods.addEncounter = function(encounterData) {
  const newEncounter = {
    serialNo: this.encounters.length + 1, // Will be corrected in pre-save
    dateTime: encounterData.dateTime || new Date(),
    treatment: encounterData.treatment || '',
    amountPaid: encounterData.amountPaid || 0,
    paymentMode: encounterData.paymentMode || 'Cash',
    notes: encounterData.notes || '',
    status: encounterData.status || 'Completed',
    dentist: encounterData.dentist || '',
    _id: new mongoose.Types.ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  this.encounters.push(newEncounter);
  return newEncounter;
};

// Instance method to update encounter
treatmentEncounterSchema.methods.updateEncounter = function(encounterId, updateData) {
  const encounter = this.encounters.id(encounterId);
  if (!encounter) {
    throw new Error('Encounter not found');
  }
  
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined && key !== 'serialNo') {
      encounter[key] = updateData[key];
    }
  });
  
  encounter.updatedAt = new Date();
  return encounter;
};

// Instance method to remove encounter
treatmentEncounterSchema.methods.removeEncounter = function(encounterId) {
  const encounter = this.encounters.id(encounterId);
  if (!encounter) {
    throw new Error('Encounter not found');
  }
  
  this.encounters.pull(encounterId);
  return true;
};

// Static method to get patient encounters
treatmentEncounterSchema.statics.getPatientEncounters = function(patientId, hospitalId = null) {
  const query = { patientId };
  if (hospitalId) {
    query.hospitalId = hospitalId;
  }
  
  return this.findOne(query);
};

const TreatmentEncounter = mongoose.model('TreatmentEncounter', treatmentEncounterSchema);

export default TreatmentEncounter;