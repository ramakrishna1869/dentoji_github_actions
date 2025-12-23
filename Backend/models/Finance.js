// models/Finance.js
import mongoose from 'mongoose';

const financeSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    index: true
  },
  hospitalId: {
    type: String,
    default: 'default-hospital',
    index: true
  },
  // Financial Summary
  totalRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCompletedEncounters: {
    type: Number,
    default: 0,
    min: 0
  },
  // Payment mode breakdown
  paymentBreakdown: {
    cash: { type: Number, default: 0 },
    creditCard: { type: Number, default: 0 },
    debitCard: { type: Number, default: 0 },
    bankTransfer: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    upi: { type: Number, default: 0 },
    cheque: { type: Number, default: 0 }
  },
  // Monthly revenue tracking
  monthlyRevenue: [{
    month: String, // Format: YYYY-MM
    revenue: { type: Number, default: 0 },
    encounters: { type: Number, default: 0 }
  }],
  // Last updated info
  lastTransactionDate: {
    type: Date,
    default: null
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
financeSchema.index({ patientId: 1, hospitalId: 1 });
financeSchema.index({ hospitalId: 1, createdAt: -1 });
financeSchema.index({ lastTransactionDate: -1 });

// Static method to sync finance data from treatment encounters
financeSchema.statics.syncFromTreatmentEncounters = async function(patientId, encounterData) {
  try {
    const { encounters, hospitalId } = encounterData;
    
    // Filter only completed encounters
    const completedEncounters = encounters.filter(enc => enc.status === 'Completed');
    
    if (completedEncounters.length === 0) {
      // If no completed encounters, return or create empty finance record
      let financeRecord = await this.findOne({ patientId });
      if (!financeRecord) {
        financeRecord = new this({
          patientId,
          hospitalId: hospitalId || 'default-hospital',
          totalRevenue: 0,
          totalCompletedEncounters: 0
        });
        await financeRecord.save();
      }
      return financeRecord;
    }
    
    // Calculate totals
    let totalRevenue = 0;
    const paymentBreakdown = {
      cash: 0,
      creditCard: 0,
      debitCard: 0,
      bankTransfer: 0,
      insurance: 0,
      upi: 0,
      cheque: 0
    };
    const monthlyMap = {};
    let lastTransactionDate = null;
    
    completedEncounters.forEach(encounter => {
      const amount = encounter.amountPaid || 0;
      totalRevenue += amount;
      
      // Payment mode breakdown
      const mode = encounter.paymentMode || 'Cash';
      const modeKey = mode.replace(/\s+/g, '').charAt(0).toLowerCase() + 
                      mode.replace(/\s+/g, '').slice(1);
      if (paymentBreakdown.hasOwnProperty(modeKey)) {
        paymentBreakdown[modeKey] += amount;
      } else {
        paymentBreakdown.cash += amount; // Default to cash if unknown
      }
      
      // Monthly breakdown
      const encounterDate = new Date(encounter.dateTime);
      const monthKey = encounterDate.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { revenue: 0, encounters: 0 };
      }
      monthlyMap[monthKey].revenue += amount;
      monthlyMap[monthKey].encounters += 1;
      
      // Track last transaction date
      if (!lastTransactionDate || encounterDate > lastTransactionDate) {
        lastTransactionDate = encounterDate;
      }
    });
    
    // Convert monthly map to array
    const monthlyRevenue = Object.keys(monthlyMap)
      .sort()
      .map(month => ({
        month,
        revenue: monthlyMap[month].revenue,
        encounters: monthlyMap[month].encounters
      }));
    
    // Update or create finance record
    let financeRecord = await this.findOne({ patientId });
    
    if (!financeRecord) {
      financeRecord = new this({
        patientId,
        hospitalId: hospitalId || 'default-hospital'
      });
    }
    
    financeRecord.totalRevenue = totalRevenue;
    financeRecord.totalCompletedEncounters = completedEncounters.length;
    financeRecord.paymentBreakdown = paymentBreakdown;
    financeRecord.monthlyRevenue = monthlyRevenue;
    financeRecord.lastTransactionDate = lastTransactionDate;
    financeRecord.lastUpdated = new Date();
    
    await financeRecord.save();
    return financeRecord;
    
  } catch (error) {
    console.error('[Finance.syncFromTreatmentEncounters] Error:', error);
    throw error;
  }
};

// Static method to get financial summary for a hospital
financeSchema.statics.getHospitalSummary = async function(hospitalId, startDate = null, endDate = null) {
  try {
    const matchStage = { hospitalId };
    
    if (startDate || endDate) {
      matchStage.lastTransactionDate = {};
      if (startDate) matchStage.lastTransactionDate.$gte = new Date(startDate);
      if (endDate) matchStage.lastTransactionDate.$lte = new Date(endDate);
    }
    
    const summary = await this.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalRevenue' },
          totalPatients: { $sum: 1 },
          totalEncounters: { $sum: '$totalCompletedEncounters' },
          avgRevenuePerPatient: { $avg: '$totalRevenue' }
        }
      }
    ]);
    
    return summary.length > 0 ? summary[0] : {
      totalRevenue: 0,
      totalPatients: 0,
      totalEncounters: 0,
      avgRevenuePerPatient: 0
    };
    
  } catch (error) {
    console.error('[Finance.getHospitalSummary] Error:', error);
    throw error;
  }
};

const Finance = mongoose.model('Finance', financeSchema);

export default Finance;