// controllers/financeController.js
import Finance from '../models/Finance.js';

import mongoose from 'mongoose';
import TreatmentEncounter from '../models/TreatmentEncounter.js';
import Patient from '../models/Patient.js';
import LabRecord from '../models/labrecord.js';
import Consultation from '../models/consultation.js';




 // Get total completed treatment revenue for hospital

export const getCompletedTreatmentRevenue = async (req, res) => {
  try {
    const { hospitalId } = req.query;
    
    console.log('[getCompletedTreatmentRevenue] Request for hospital:', hospitalId);
    
    // Get user info from token
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userHospitalId = req.user?.hospitalId || hospitalId;

    console.log('[getCompletedTreatmentRevenue] User info:', { userId, userRole, userHospitalId });

    if (!userHospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Hospital ID is required'
      });
    }

    // Aggregate completed treatment encounters directly
    const result = await TreatmentEncounter.aggregate([
      // Match by hospital
      { $match: { hospitalId: userHospitalId } },
      
      // Unwind encounters array
      { $unwind: '$encounters' },
      
      // Filter only completed encounters
      { 
        $match: { 
          'encounters.status': 'Completed'
        } 
      },
      
      // Group and sum amounts
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$encounters.amountPaid' },
          totalEncounters: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;
    const totalEncounters = result.length > 0 ? result[0].totalEncounters : 0;

    console.log('[getCompletedTreatmentRevenue] Results:', { 
      totalRevenue, 
      totalEncounters 
    });

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalEncounters,
        hospitalId: userHospitalId
      }
    });

  } catch (error) {
    console.error('[getCompletedTreatmentRevenue] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch completed treatment revenue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add this to your financeController.js

/**
 * Get total OP fee revenue for hospital
 */
/* Get total paid revenue for hospital
 */
export const getTotalPaidRevenue = async (req, res) => {
  try {
    const { hospitalId } = req.query;
    
    console.log('[getTotalPaidRevenue] Request for hospital:', hospitalId);
    
    // Get user info from token
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userHospitalId = req.user?.hospitalId || hospitalId;

    console.log('[getTotalPaidRevenue] User info:', { userId, userRole, userHospitalId });

    if (!userHospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Hospital ID is required'
      });
    }

    // Aggregate total paid from all patients in the hospital
    const result = await Patient.aggregate([
      // Match by hospital
      { 
        $match: { 
          hospitalId: new mongoose.Types.ObjectId(userHospitalId),
          deletedAt: { $exists: false } // Exclude soft-deleted patients
        } 
      },
      
      // Convert totalPaid string to number and sum
      {
        $group: {
          _id: null,
          totalPaidRevenue: { 
            $sum: { 
              $toDouble: { 
                $ifNull: ['$totalPaid', '0'] 
              } 
            } 
          },
          totalPatients: { $sum: 1 }
        }
      }
    ]);

    const totalPaidRevenue = result.length > 0 ? result[0].totalPaidRevenue : 0;
    const totalPatients = result.length > 0 ? result[0].totalPatients : 0;

    console.log('[getTotalPaidRevenue] Results:', { 
      totalPaidRevenue, 
      totalPatients 
    });

    res.json({
      success: true,
      data: {
        totalPaidRevenue,
        totalPatients,
        hospitalId: userHospitalId
      }
    });

  } catch (error) {
    console.error('[getTotalPaidRevenue] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch total paid revenue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

};


/**
 * Get total lab expenses with fully paid status
 */
export const getLabExpenses = async (req, res) => {
  try {
    const { hospitalId } = req.query;
    
    console.log('[getLabExpenses] Request for hospital:', hospitalId);
    
    // Get user info from token
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userHospitalId = req.user?.hospitalId || hospitalId;

    console.log('[getLabExpenses] User info:', { userId, userRole, userHospitalId });

    if (!userHospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Hospital ID is required'
      });
    }

    // Import LabRecord model at the top of your file if not already imported
    // import LabRecord from '../models/LabRecord.js';

    // Aggregate lab records with "Fully Paid" status
    const result = await LabRecord.aggregate([
      // Match by hospital
      { 
        $match: { 
          hospitalId: new mongoose.Types.ObjectId(userHospitalId),
          'payment.status': 'Fully Paid'
        } 
      },
      
      // Group and sum payment totals
      {
        $group: {
          _id: null,
          totalLabExpenses: { $sum: '$payment.paid' },
          totalRecords: { $sum: 1 }
        }
      }
    ]);

    const totalLabExpenses = result.length > 0 ? result[0].totalLabExpenses : 0;
    const totalRecords = result.length > 0 ? result[0].totalRecords : 0;

    console.log('[getLabExpenses] Results:', { 
      totalLabExpenses, 
      totalRecords 
    });

    res.json({
      success: true,
      data: {
        totalLabExpenses,
        totalRecords,
        hospitalId: userHospitalId
      }
    });

  } catch (error) {
    console.error('[getLabExpenses] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab expenses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


/**
 * Get total consultation expenses with paid status
 */
export const getConsultationExpenses = async (req, res) => {
  try {
    const { hospitalId } = req.query;
    
    console.log('[getConsultationExpenses] Request for hospital:', hospitalId);
    
    // Get user info from token
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userHospitalId = req.user?.hospitalId || hospitalId;

    console.log('[getConsultationExpenses] User info:', { userId, userRole, userHospitalId });

    if (!userHospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Hospital ID is required'
      });
    }

    // Import Consultation model at the top of your file if not already imported
    // import Consultation from '../models/Consultation.js';

    // Aggregate consultation records with "Paid" status
    const result = await Consultation.aggregate([
      // Match by hospital
      { 
        $match: { 
          hospitalId: new mongoose.Types.ObjectId(userHospitalId),
          'payment.status': 'Paid'
        } 
      },
      
      // Group and sum payment paid amounts
      {
        $group: {
          _id: null,
          totalConsultationExpenses: { $sum: '$payment.paid' },
          totalRecords: { $sum: 1 }
        }
      }
    ]);

    const totalConsultationExpenses = result.length > 0 ? result[0].totalConsultationExpenses : 0;
    const totalRecords = result.length > 0 ? result[0].totalRecords : 0;

    console.log('[getConsultationExpenses] Results:', { 
      totalConsultationExpenses, 
      totalRecords 
    });

    res.json({
      success: true,
      data: {
        totalConsultationExpenses,
        totalRecords,
        hospitalId: userHospitalId
      }
    });

  } catch (error) {
    console.error('[getConsultationExpenses] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consultation expenses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};




export const getPatientPendingAmountsCombined = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;

    console.log('[getPatientPendingAmountsCombined] Fetching for hospital:', hospitalId);
    console.log('[getPatientPendingAmountsCombined] Hospital ID type:', typeof hospitalId, hospitalId);

    const patients = await Patient.find({ 
      hospitalId,
      deletedAt: { $exists: false }
    }).select('_id patientId firstName lastName primaryNumber phoneNumber totalPaid opFee');

    console.log('[getPatientPendingAmountsCombined] Found patients:', patients.length);

    const financeData = await Promise.all(
      patients.map(async (patient) => {
        // Calculate pending OP from patient's opFee and totalPaid
        let pendingOP = 0;
        const opFee = parseFloat(patient.opFee) || 0;
        const totalPaid = parseFloat(patient.totalPaid) || 0;
        
        if (opFee > 0) {
          pendingOP = Math.max(0, opFee - totalPaid);
        }

        // Convert hospitalId to string for the query
        const hospitalIdString = hospitalId.toString();
        
        console.log(`\n[Patient ${patient.patientId}] Query Debug:`, {
          patientId: patient.patientId,
          patientObjectId: patient._id.toString(),
          hospitalId: hospitalIdString
        });
        
        // ✅ FIX: Query using patient's ObjectId instead of patientId
        const treatmentDoc = await TreatmentEncounter.findOne({
          patientId: patient._id.toString(),  // Use ObjectId string
          hospitalId: hospitalIdString
        });

        let pendingTreatmentEncounter = 0;
        
        if (treatmentDoc && treatmentDoc.encounters) {
          console.log(`[Patient ${patient.patientId} - ${patient.firstName}] ✅ Found ${treatmentDoc.encounters.length} encounters`);
          
          treatmentDoc.encounters.forEach((encounter, index) => {
            // Skip cancelled or deleted encounters
            if (encounter.status === 'Cancelled' || encounter.status === 'Deleted') {
              console.log(`  ↪ Encounter ${index + 1}: SKIPPED (status: ${encounter.status})`);
              return;
            }

            // ✅ For "In Progress" status, use amountPaid as the pending amount
            if (encounter.status === 'In Progress') {
              const amountPaid = parseFloat(encounter.amountPaid) || 0;
              
              if (amountPaid > 0) {
                console.log(`  ↪ Encounter ${index + 1}: "${encounter.treatment}"`, {
                  status: 'In Progress',
                  amountPaid: amountPaid
                });
                console.log(`    ✅ IN PROGRESS - Adding: ₹${amountPaid}`);
                pendingTreatmentEncounter += amountPaid;
              } else {
                console.log(`  ↪ Encounter ${index + 1}: "${encounter.treatment}" - In Progress but amountPaid is 0`);
              }
            }
            // For "Pending" status, use expectedCost - amountPaid logic
            else if (encounter.status === 'Pending') {
              const expectedCost = parseFloat(
                encounter.expectedCost || 
                encounter.cost || 
                encounter.amount || 
                0
              );
              const amountPaid = parseFloat(encounter.amountPaid) || 0;
              
              if (expectedCost > 0) {
                const pending = expectedCost - amountPaid;
                if (pending > 0) {
                  console.log(`  ↪ Encounter ${index + 1}: "${encounter.treatment}"`, {
                    status: 'Pending',
                    expectedCost,
                    amountPaid,
                    pending
                  });
                  console.log(`    ✅ PENDING - Adding: ₹${pending}`);
                  pendingTreatmentEncounter += pending;
                }
              }
            } else {
              console.log(`  ↪ Encounter ${index + 1}: "${encounter.treatment}" - Status "${encounter.status}" (not counted)`);
            }
          });
          
          console.log(`  💰 Total pending treatment for ${patient.firstName}: ₹${pendingTreatmentEncounter}`);
        } else {
          console.log(`[Patient ${patient.patientId}] ❌ No treatment encounters found`);
        }
        
        // Calculate pending Lab amounts
        const labRecords = await LabRecord.find({
          patientObjectId: patient._id,
          hospitalId,
          'payment.status': { $in: ['Pending', 'Partial', 'Overdue'] }
        });

        const pendingLab = labRecords.reduce((sum, record) => {
          return sum + (record.payment.total - record.payment.paid);
        }, 0);

        // Calculate pending Consultation amounts
        const consultations = await Consultation.find({
          patientObjectId: patient._id,
          hospitalId,
          'payment.status': { $in: ['Pending', 'Partial', 'Overdue'] }
        });

        const pendingConsultation = consultations.reduce((sum, record) => {
          return sum + (record.payment.total - record.payment.paid);
        }, 0);

        // Total includes all pending amounts
        const total = pendingOP + pendingTreatmentEncounter + pendingLab + pendingConsultation;

        if (total > 0) {
          return {
            name: `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
            patientId: patient.patientId,
            phone: patient.primaryNumber || patient.phoneNumber || '-',
            pendingOP,
            pendingTreatmentEncounter,
            pendingLab,
            pendingConsultation,
            total,
            patientObjectId: patient._id
          };
        }
        return null;
      })
    );

    const filteredData = financeData.filter(item => item !== null);
    filteredData.sort((a, b) => b.total - a.total);

    console.log('\n[getPatientPendingAmountsCombined] ====== FINAL SUMMARY ======');
    console.log(`  ✅ Patients with pending: ${filteredData.length}`);
    console.log(`  💰 Total pending: ₹${filteredData.reduce((sum, p) => sum + p.total, 0)}`);
    console.log('========================================\n');

    res.status(200).json({
      success: true,
      count: filteredData.length,
      data: filteredData
    });

  } catch (error) {
    console.error('[getPatientPendingAmountsCombined] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient pending amounts',
      error: error.message
    });
  }
};

 // Get detailed breakdown of pending amounts for a specific patient
 
export const getPatientPendingDetails = async (req, res) => {
  try {
    const { patientId } = req.params;
    const hospitalId = req.user.hospitalId;

    console.log('[getPatientPendingDetails] Fetching for patient:', patientId, 'hospital:', hospitalId);

    // Find the patient
    const patient = await Patient.findOne({ 
      patientId, 
      hospitalId,
      deletedAt: { $exists: false }
    });

    if (!patient) {
      console.log('[getPatientPendingDetails] Patient not found');
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    console.log('[getPatientPendingDetails] Found patient:', patient.firstName, patient.lastName);

    const hospitalIdString = hospitalId.toString();

    // ✅ Fetch Treatment Encounters
    const treatmentDoc = await TreatmentEncounter.findOne({
      patientId: patient._id.toString(),
      hospitalId: hospitalIdString
    });

    const treatmentEncounters = [];
    let totalTreatmentPending = 0;

    if (treatmentDoc && treatmentDoc.encounters) {
      console.log('[getPatientPendingDetails] Found treatment encounters:', treatmentDoc.encounters.length);
      
      treatmentDoc.encounters.forEach(encounter => {
        // Skip cancelled or deleted
        if (encounter.status === 'Cancelled' || encounter.status === 'Deleted') {
          return;
        }

        let pendingAmount = 0;
        
        if (encounter.status === 'In Progress') {
          pendingAmount = parseFloat(encounter.amountPaid) || 0;
        } else if (encounter.status === 'Pending') {
          const expectedCost = parseFloat(encounter.amountPaid || encounter.cost || encounter.amount || 0);
          const amountPaid = parseFloat(encounter.amountPaid) || 0;
          pendingAmount = Math.max(0, expectedCost - amountPaid);
        }

        if (pendingAmount > 0) {
          treatmentEncounters.push({
            _id: encounter._id,
            dateTime: encounter.dateTime,
            treatment: encounter.treatment,
            dentist: encounter.dentist || '-',
            expectedCost: parseFloat(encounter.amountPaid || 0),
            amountPaid:0,
            paymentMode: encounter.paymentMode,
            status: encounter.status,
            notes: encounter.notes,
            pendingAmount
          });
          totalTreatmentPending += pendingAmount;
        }
      });
      
      console.log('[getPatientPendingDetails] Treatment encounters with pending:', treatmentEncounters.length);
    } else {
      console.log('[getPatientPendingDetails] No treatment encounters found');
    }

    // Get detailed Lab records
    const labRecords = await LabRecord.find({
      patientObjectId: patient._id,
      hospitalId,
      'payment.status': { $in: ['Pending', 'Partial', 'Overdue'] }
    });

    console.log('[getPatientPendingDetails] Found lab records:', labRecords.length);

    const formattedLabRecords = labRecords.map(record => ({
      id: record._id,
      dueDate: record.dueDate,
      crownType: record.crownType,
      labName: record.labName,
      tooth: record.tooth,
      total: record.payment.total,
      paid: record.payment.paid,
      pending: record.payment.total - record.payment.paid,
      status: record.payment.status
    }));

    const totalLabPending = formattedLabRecords.reduce((sum, record) => sum + record.pending, 0);

    // Get detailed Consultation records
    const consultations = await Consultation.find({
      patientObjectId: patient._id,
      hospitalId,
      'payment.status': { $in: ['Pending', 'Partial', 'Overdue'] }
    });

    console.log('[getPatientPendingDetails] Found consultations:', consultations.length);

    const formattedConsultations = consultations.map(consultation => ({
      id: consultation._id,
      appointmentDate: consultation.appointmentDate,
      type: consultation.consultationType || consultation.type,
      doctor: consultation.consultantDoctor || consultation.doctor,
      total: consultation.payment.total,
      paid: consultation.payment.paid,
      pending: consultation.payment.total - consultation.payment.paid,
      status: consultation.payment.status
    }));

    const totalConsultationPending = formattedConsultations.reduce((sum, record) => sum + record.pending, 0);

    // Calculate OP pending
    const opFee = parseFloat(patient.opFee) || 0;
    const totalPaid = parseFloat(patient.totalPaid) || 0;
    const totalOPPending = opFee > 0 ? Math.max(0, opFee - totalPaid) : 0;

    // Grand total
    const grandTotal = totalTreatmentPending + totalLabPending + totalOPPending + totalConsultationPending;

    console.log('[getPatientPendingDetails] Summary:', {
      treatment: totalTreatmentPending,
      lab: totalLabPending,
      op: totalOPPending,
      consultation: totalConsultationPending,
      total: grandTotal
    });

    const responseData = {
      patient: {
        id: patient._id,
        patientId: patient.patientId,
        name: `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
        phone: patient.primaryNumber || patient.phoneNumber,
        registrationDate: patient.createdAt
      },
      treatmentEncounters,
      labRecords: formattedLabRecords,
      consultations: formattedConsultations,
      opPaid: totalPaid, // Amount already paid towards OP
      summary: {
        totalTreatmentPending,
        totalLabPending,
        totalOPPending,
        totalConsultationPending,
        grandTotal
      }
    };

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('[getPatientPendingDetails] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient details',
      error: error.message
    });
  }
};
// Express route setup example:

export const getPatientFinance = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    console.log('[getPatientFinance] Request for patient:', patientId);
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID format'
      });
    }

    // Get finance record
    let financeRecord = await Finance.findOne({ patientId });
    
    // If no finance record exists, sync from treatment encounters
    if (!financeRecord) {
      console.log('[getPatientFinance] No finance record found, syncing from encounters');
      
      const encounterRecord = await TreatmentEncounter.findOne({ patientId });
      
      if (!encounterRecord) {
        console.log('[getPatientFinance] No encounters found, returning empty finance data');
        return res.json({
          success: true,
          data: {
            patientId,
            hospitalId: 'default-hospital',
            totalRevenue: 0,
            totalCompletedEncounters: 0,
            paymentBreakdown: {
              cash: 0,
              creditCard: 0,
              debitCard: 0,
              bankTransfer: 0,
              insurance: 0,
              upi: 0,
              cheque: 0
            },
            monthlyRevenue: [],
            lastTransactionDate: null,
            lastUpdated: new Date()
          }
        });
      }
      
      // Sync finance data from encounters
      financeRecord = await Finance.syncFromTreatmentEncounters(patientId, {
        encounters: encounterRecord.encounters,
        hospitalId: encounterRecord.hospitalId
      });
      
      console.log('[getPatientFinance] Finance data synced successfully');
    }

    console.log('[getPatientFinance] Returning finance data:', {
      totalRevenue: financeRecord.totalRevenue,
      encounters: financeRecord.totalCompletedEncounters
    });

    res.json({
      success: true,
      data: {
        _id: financeRecord._id,
        patientId: financeRecord.patientId,
        hospitalId: financeRecord.hospitalId,
        totalRevenue: financeRecord.totalRevenue,
        totalCompletedEncounters: financeRecord.totalCompletedEncounters,
        paymentBreakdown: financeRecord.paymentBreakdown,
        monthlyRevenue: financeRecord.monthlyRevenue,
        lastTransactionDate: financeRecord.lastTransactionDate,
        lastUpdated: financeRecord.lastUpdated,
        createdAt: financeRecord.createdAt,
        updatedAt: financeRecord.updatedAt
      }
    });

  } catch (error) {
    console.error('[getPatientFinance] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient finance data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Sync finance data for a specific patient from treatment encounters
 */
export const syncPatientFinance = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    console.log('[syncPatientFinance] Syncing finance for patient:', patientId);
    
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID format'
      });
    }

    // Get treatment encounters
    const encounterRecord = await TreatmentEncounter.findOne({ patientId });
    
    if (!encounterRecord) {
      console.log('[syncPatientFinance] No treatment encounters found for patient:', patientId);
      return res.status(404).json({
        success: false,
        message: 'No treatment encounters found for this patient'
      });
    }

    console.log('[syncPatientFinance] Found encounters:', encounterRecord.encounters.length);

    // Sync finance data
    const financeRecord = await Finance.syncFromTreatmentEncounters(patientId, {
      encounters: encounterRecord.encounters,
      hospitalId: encounterRecord.hospitalId
    });

    console.log('[syncPatientFinance] Finance data synced successfully:', {
      totalRevenue: financeRecord.totalRevenue,
      encounters: financeRecord.totalCompletedEncounters
    });

    res.json({
      success: true,
      message: 'Finance data synced successfully',
      data: {
        patientId: financeRecord.patientId,
        totalRevenue: financeRecord.totalRevenue,
        totalCompletedEncounters: financeRecord.totalCompletedEncounters,
        paymentBreakdown: financeRecord.paymentBreakdown,
        lastUpdated: financeRecord.lastUpdated
      }
    });

  } catch (error) {
    console.error('[syncPatientFinance] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync finance data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get hospital-wide financial summary
 */
export const getHospitalFinanceSummary = async (req, res) => {
  try {
    const { hospitalId } = req.query;
    const { startDate, endDate } = req.query;
    
    console.log('[getHospitalFinanceSummary] Request for hospital:', hospitalId);
    
    // Get user info from token
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userHospitalId = req.user?.hospitalId || hospitalId;

    console.log('[getHospitalFinanceSummary] User info:', { userId, userRole, userHospitalId });

    if (!userHospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Hospital ID is required'
      });
    }

    // Get summary from Finance model
    const summary = await Finance.getHospitalSummary(userHospitalId, startDate, endDate);
    
    console.log('[getHospitalFinanceSummary] Summary data:', summary);
    
    // Get payment breakdown across all patients
    const paymentBreakdown = await Finance.aggregate([
      { $match: { hospitalId: userHospitalId } },
      {
        $group: {
          _id: null,
          cash: { $sum: '$paymentBreakdown.cash' },
          creditCard: { $sum: '$paymentBreakdown.creditCard' },
          debitCard: { $sum: '$paymentBreakdown.debitCard' },
          bankTransfer: { $sum: '$paymentBreakdown.bankTransfer' },
          insurance: { $sum: '$paymentBreakdown.insurance' },
          upi: { $sum: '$paymentBreakdown.upi' },
          cheque: { $sum: '$paymentBreakdown.cheque' }
        }
      }
    ]);

    // Get monthly trends
    const monthlyTrends = await Finance.aggregate([
      { $match: { hospitalId: userHospitalId } },
      { $unwind: '$monthlyRevenue' },
      {
        $group: {
          _id: '$monthlyRevenue.month',
          totalRevenue: { $sum: '$monthlyRevenue.revenue' },
          totalEncounters: { $sum: '$monthlyRevenue.encounters' }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          month: '$_id',
          revenue: '$totalRevenue',
          encounters: '$totalEncounters'
        }
      }
    ]);

    console.log('[getHospitalFinanceSummary] Monthly trends count:', monthlyTrends.length);

    res.json({
      success: true,
      data: {
        hospitalId: userHospitalId,
        summary: {
          totalRevenue: summary.totalRevenue || 0,
          totalPatients: summary.totalPatients || 0,
          totalEncounters: summary.totalEncounters || 0,
          avgRevenuePerPatient: Math.round(summary.avgRevenuePerPatient || 0)
        },
        paymentBreakdown: paymentBreakdown.length > 0 ? {
          cash: paymentBreakdown[0].cash,
          creditCard: paymentBreakdown[0].creditCard,
          debitCard: paymentBreakdown[0].debitCard,
          bankTransfer: paymentBreakdown[0].bankTransfer,
          insurance: paymentBreakdown[0].insurance,
          upi: paymentBreakdown[0].upi,
          cheque: paymentBreakdown[0].cheque
        } : {
          cash: 0, creditCard: 0, debitCard: 0, bankTransfer: 0,
          insurance: 0, upi: 0, cheque: 0
        },
        monthlyTrends: monthlyTrends,
        filters: {
          startDate: startDate || null,
          endDate: endDate || null
        }
      }
    });

  } catch (error) {
    console.error('[getHospitalFinanceSummary] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hospital finance summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get top revenue-generating patients
 */
export const getTopRevenuePatients = async (req, res) => {
  try {
    const { hospitalId, limit = 10 } = req.query;
    
    console.log('[getTopRevenuePatients] Request for hospital:', hospitalId, 'limit:', limit);
    
    // Get user info from token
    const userHospitalId = req.user?.hospitalId || hospitalId;

    if (!userHospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Hospital ID is required'
      });
    }

    const topPatients = await Finance.aggregate([
      { $match: { hospitalId: userHospitalId } },
      {
        $project: {
          patientId: 1,
          totalRevenue: 1,
          totalCompletedEncounters: 1,
          lastTransactionDate: 1,
          avgRevenuePerEncounter: {
            $cond: {
              if: { $gt: ['$totalCompletedEncounters', 0] },
              then: { $divide: ['$totalRevenue', '$totalCompletedEncounters'] },
              else: 0
            }
          }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) }
    ]);

    console.log('[getTopRevenuePatients] Found top patients:', topPatients.length);

    res.json({
      success: true,
      data: topPatients
    });

  } catch (error) {
    console.error('[getTopRevenuePatients] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top revenue patients',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get revenue by date range
 */
export const getRevenueByDateRange = async (req, res) => {
  try {
    const { hospitalId, startDate, endDate } = req.query;
    
    console.log('[getRevenueByDateRange] Request:', { hospitalId, startDate, endDate });
    
    // Get user info from token
    const userHospitalId = req.user?.hospitalId || hospitalId;

    if (!userHospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Hospital ID is required'
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const matchCondition = {
      hospitalId: userHospitalId,
      lastTransactionDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const result = await Finance.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalRevenue' },
          totalPatients: { $sum: 1 },
          totalEncounters: { $sum: '$totalCompletedEncounters' }
        }
      }
    ]);

    // Also get payment breakdown for this period
    const paymentBreakdown = await Finance.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          cash: { $sum: '$paymentBreakdown.cash' },
          creditCard: { $sum: '$paymentBreakdown.creditCard' },
          debitCard: { $sum: '$paymentBreakdown.debitCard' },
          bankTransfer: { $sum: '$paymentBreakdown.bankTransfer' },
          insurance: { $sum: '$paymentBreakdown.insurance' },
          upi: { $sum: '$paymentBreakdown.upi' },
          cheque: { $sum: '$paymentBreakdown.cheque' }
        }
      }
    ]);

    console.log('[getRevenueByDateRange] Results:', result.length > 0 ? result[0] : 'No data');

    res.json({
      success: true,
      data: {
        summary: result.length > 0 ? {
          totalRevenue: result[0].totalRevenue,
          totalPatients: result[0].totalPatients,
          totalEncounters: result[0].totalEncounters,
          avgRevenuePerPatient: result[0].totalPatients > 0 ? 
            Math.round(result[0].totalRevenue / result[0].totalPatients) : 0
        } : {
          totalRevenue: 0,
          totalPatients: 0,
          totalEncounters: 0,
          avgRevenuePerPatient: 0
        },
        paymentBreakdown: paymentBreakdown.length > 0 ? {
          cash: paymentBreakdown[0].cash,
          creditCard: paymentBreakdown[0].creditCard,
          debitCard: paymentBreakdown[0].debitCard,
          bankTransfer: paymentBreakdown[0].bankTransfer,
          insurance: paymentBreakdown[0].insurance,
          upi: paymentBreakdown[0].upi,
          cheque: paymentBreakdown[0].cheque
        } : {
          cash: 0, creditCard: 0, debitCard: 0, bankTransfer: 0,
          insurance: 0, upi: 0, cheque: 0
        },
        dateRange: {
          startDate,
          endDate
        }
      }
    });

  } catch (error) {
    console.error('[getRevenueByDateRange] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue by date range',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Bulk sync all patients' finance data
 */
export const bulkSyncFinance = async (req, res) => {
  try {
    const { hospitalId } = req.query;
    
    console.log('[bulkSyncFinance] Starting bulk sync for hospital:', hospitalId);
    
    // Get user info from token
    const userHospitalId = req.user?.hospitalId || hospitalId;

    if (!userHospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Hospital ID is required'
      });
    }

    // Get all treatment encounters for the hospital
    const encounterRecords = await TreatmentEncounter.find({ 
      hospitalId: userHospitalId 
    });

    console.log('[bulkSyncFinance] Found encounter records:', encounterRecords.length);

    let syncedCount = 0;
    let errorCount = 0;
    const errors = [];

    // Sync each patient's finance data
    for (const encounterRecord of encounterRecords) {
      try {
        await Finance.syncFromTreatmentEncounters(encounterRecord.patientId, {
          encounters: encounterRecord.encounters,
          hospitalId: encounterRecord.hospitalId
        });
        syncedCount++;
        console.log(`[bulkSyncFinance] Synced patient ${encounterRecord.patientId}`);
      } catch (error) {
        console.error(`[bulkSyncFinance] Error syncing patient ${encounterRecord.patientId}:`, error);
        errorCount++;
        errors.push({
          patientId: encounterRecord.patientId,
          error: error.message
        });
      }
    }

    console.log('[bulkSyncFinance] Bulk sync completed:', { 
      total: encounterRecords.length, 
      synced: syncedCount, 
      errors: errorCount 
    });

    res.json({
      success: true,
      message: 'Bulk finance sync completed',
      data: {
        totalPatients: encounterRecords.length,
        synced: syncedCount,
        errors: errorCount,
        errorDetails: process.env.NODE_ENV === 'development' ? errors : undefined
      }
    });

  } catch (error) {
    console.error('[bulkSyncFinance] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk sync',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get payment mode statistics
 */
export const getPaymentModeStatistics = async (req, res) => {
  try {
    const { hospitalId } = req.query;
    
    console.log('[getPaymentModeStatistics] Request for hospital:', hospitalId);
    
    // Get user info from token
    const userHospitalId = req.user?.hospitalId || hospitalId;

    if (!userHospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Hospital ID is required'
      });
    }

    const paymentStats = await Finance.aggregate([
      { $match: { hospitalId: userHospitalId } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalRevenue' },
          cash: { $sum: '$paymentBreakdown.cash' },
          creditCard: { $sum: '$paymentBreakdown.creditCard' },
          debitCard: { $sum: '$paymentBreakdown.debitCard' },
          bankTransfer: { $sum: '$paymentBreakdown.bankTransfer' },
          insurance: { $sum: '$paymentBreakdown.insurance' },
          upi: { $sum: '$paymentBreakdown.upi' },
          cheque: { $sum: '$paymentBreakdown.cheque' }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          breakdown: {
            cash: { amount: '$cash', percentage: { $multiply: [{ $divide: ['$cash', '$totalRevenue'] }, 100] } },
            creditCard: { amount: '$creditCard', percentage: { $multiply: [{ $divide: ['$creditCard', '$totalRevenue'] }, 100] } },
            debitCard: { amount: '$debitCard', percentage: { $multiply: [{ $divide: ['$debitCard', '$totalRevenue'] }, 100] } },
            bankTransfer: { amount: '$bankTransfer', percentage: { $multiply: [{ $divide: ['$bankTransfer', '$totalRevenue'] }, 100] } },
            insurance: { amount: '$insurance', percentage: { $multiply: [{ $divide: ['$insurance', '$totalRevenue'] }, 100] } },
            upi: { amount: '$upi', percentage: { $multiply: [{ $divide: ['$upi', '$totalRevenue'] }, 100] } },
            cheque: { amount: '$cheque', percentage: { $multiply: [{ $divide: ['$cheque', '$totalRevenue'] }, 100] } }
          }
        }
      }
    ]);

    console.log('[getPaymentModeStatistics] Payment stats calculated');

    res.json({
      success: true,
      data: paymentStats.length > 0 ? paymentStats[0] : {
        totalRevenue: 0,
        breakdown: {
          cash: { amount: 0, percentage: 0 },
          creditCard: { amount: 0, percentage: 0 },
          debitCard: { amount: 0, percentage: 0 },
          bankTransfer: { amount: 0, percentage: 0 },
          insurance: { amount: 0, percentage: 0 },
          upi: { amount: 0, percentage: 0 },
          cheque: { amount: 0, percentage: 0 }
        }
      }
    });

  } catch (error) {
    console.error('[getPaymentModeStatistics] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment mode statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get daily revenue for a specific date range
 */
export const getDailyRevenue = async (req, res) => {
  try {
    const { hospitalId, startDate, endDate } = req.query;
    
    console.log('[getDailyRevenue] Request:', { hospitalId, startDate, endDate });
    
    // Get user info from token
    const userHospitalId = req.user?.hospitalId || hospitalId;

    if (!userHospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Hospital ID is required'
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    // Get all treatment encounters in date range
    const encounters = await TreatmentEncounter.aggregate([
      { $match: { hospitalId: userHospitalId } },
      { $unwind: '$encounters' },
      {
        $match: {
          'encounters.status': 'Completed',
          'encounters.dateTime': {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$encounters.dateTime' }
          },
          revenue: { $sum: '$encounters.amountPaid' },
          encounters: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: 1,
          encounters: 1
        }
      }
    ]);

    console.log('[getDailyRevenue] Daily revenue records:', encounters.length);

    res.json({
      success: true,
      data: {
        dailyRevenue: encounters,
        totalRevenue: encounters.reduce((sum, day) => sum + day.revenue, 0),
        totalEncounters: encounters.reduce((sum, day) => sum + day.encounters, 0),
        dateRange: {
          startDate,
          endDate
        }
      }
    });

  } catch (error) {
    console.error('[getDailyRevenue] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily revenue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};