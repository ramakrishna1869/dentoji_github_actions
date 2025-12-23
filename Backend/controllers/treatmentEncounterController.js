// controllers/treatmentEncounterController.js
import mongoose from 'mongoose';
import TreatmentEncounter from '../models/TreatmentEncounter.js';

// Helper function to format encounter data consistently
const formatEncounterData = (encounterRecord) => {
  return {
    _id: encounterRecord._id,
    patientId: encounterRecord.patientId,
    hospitalId: encounterRecord.hospitalId,
    encounters: encounterRecord.encounters.map(encounter => ({
      _id: encounter._id,
      serialNo: encounter.serialNo,
      dateTime: encounter.dateTime,
      treatment: encounter.treatment,
      amountPaid: encounter.amountPaid,
      paymentMode: encounter.paymentMode,
      notes: encounter.notes || '',
      status: encounter.status,
      dentist: encounter.dentist || '',
      createdAt: encounter.createdAt,
      updatedAt: encounter.updatedAt
    })),
    totalEncounters: encounterRecord.totalEncounters,
    totalAmountPaid: encounterRecord.totalAmountPaid,
    lastEncounterDate: encounterRecord.lastEncounterDate,
    createdAt: encounterRecord.createdAt,
    updatedAt: encounterRecord.updatedAt
  };
};

/**
 * Get all treatment encounters for a patient
 */
export const getPatientEncounters = async (req, res) => {
  try {
    //console.log('[getPatientEncounters] Starting request for patient:', req.params.patientId);
    
    const { patientId } = req.params;
    const { hospitalId } = req.query;
    
    if (!patientId) {
      //console.log('[getPatientEncounters] No patient ID provided');
      return res.status(400).json({ 
        success: false, 
        message: 'Patient ID is required' 
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      //console.log('[getPatientEncounters] Invalid patient ID format:', patientId);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid patient ID format' 
      });
    }

    //console.log(`[getPatientEncounters] Fetching encounters for patient: ${patientId}`);

    // Try to find existing encounter record
    let encounterRecord = await TreatmentEncounter.findOne({ patientId });
    
    if (!encounterRecord) {
      //console.log(`[getPatientEncounters] No encounters found for patient: ${patientId}, returning empty`);
      return res.json({
        success: true,
        data: {
          patientId,
          hospitalId: hospitalId || 'default-hospital',
          encounters: [],
          totalEncounters: 0,
          totalAmountPaid: 0,
          lastEncounterDate: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }

    const formattedData = formatEncounterData(encounterRecord);
    //console.log(`[getPatientEncounters] Found ${formattedData.encounters.length} encounters for patient: ${patientId}`);
    
    res.json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error('[getPatientEncounters] Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch treatment encounters', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * IMPROVED: Ultra-flexible validation with better error handling
 */
const validateEncounterFlexible = (encounter, index = null) => {
  const errors = [];
  
  // Basic structure check
  if (!encounter || typeof encounter !== 'object') {
    return {
      isValid: false,
      error: `Invalid encounter data${index !== null ? ` at index ${index}` : ''}`
    };
  }

  // Date validation - only if provided, otherwise use current date
  let validDate = new Date(); // Default to current date
  if (encounter.dateTime) {
    const date = new Date(encounter.dateTime);
    if (isNaN(date.getTime())) {
      errors.push(`Invalid date format${index !== null ? ` for encounter ${index + 1}` : ''}`);
    } else {
      validDate = date;
    }
  }
  
  // Amount validation - more flexible handling
  let validAmount = 0; // Default to 0
  if (encounter.amountPaid !== undefined && 
      encounter.amountPaid !== null && 
      encounter.amountPaid !== '' &&
      encounter.amountPaid !== '0') {
    const amount = Number(encounter.amountPaid);
    if (isNaN(amount) || amount < 0) {
      errors.push(`Amount paid must be a valid non-negative number${index !== null ? ` for encounter ${index + 1}` : ''}`);
    } else {
      validAmount = amount;
    }
  }
  
  // Payment mode validation - only if provided
  let validPaymentMode = 'Cash'; // default
  if (encounter.paymentMode && typeof encounter.paymentMode === 'string') {
    const validPaymentModes = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Insurance', 'UPI', 'Cheque'];
    if (!validPaymentModes.includes(encounter.paymentMode)) {
      errors.push(`Invalid payment mode${index !== null ? ` for encounter ${index + 1}` : ''}. Must be one of: ${validPaymentModes.join(', ')}`);
    } else {
      validPaymentMode = encounter.paymentMode;
    }
  }
  
  // Status validation - only if provided
  let validStatus = 'Completed'; // default
  if (encounter.status && typeof encounter.status === 'string') {
    const validStatuses = ['Completed', 'Pending', 'Cancelled', 'In Progress'];
    if (!validStatuses.includes(encounter.status)) {
      errors.push(`Invalid status${index !== null ? ` for encounter ${index + 1}` : ''}. Must be one of: ${validStatuses.join(', ')}`);
    } else {
      validStatus = encounter.status;
    }
  }
  
  if (errors.length > 0) {
    return {
      isValid: false,
      error: errors.join('; ')
    };
  }

  // Sanitize and prepare data with better string handling
  const sanitized = {
    dateTime: validDate,
    treatment: encounter.treatment && typeof encounter.treatment === 'string' ? 
      encounter.treatment.trim().substring(0, 500) : '',
    amountPaid: validAmount,
    paymentMode: validPaymentMode,
    notes: encounter.notes && typeof encounter.notes === 'string' ? 
      encounter.notes.trim().substring(0, 1000) : '',
    status: validStatus,
    dentist: encounter.dentist && typeof encounter.dentist === 'string' ? 
      encounter.dentist.trim() : ''
  };

  // IMPROVED: Check if this encounter has ANY meaningful content
  const hasContent = 
    sanitized.treatment.length > 0 ||
    sanitized.amountPaid > 0 ||
    sanitized.notes.length > 0 ||
    sanitized.dentist.length > 0;
  
  return {
    isValid: true,
    hasContent: hasContent,
    sanitized: sanitized
  };
};

/**
 * IMPROVED: Save encounters with better handling of dynamic deletions
 */
export const savePatientEncounters = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { encounters, hospitalId } = req.body;
    
    /*console.log(`[savePatientEncounters] Request for patient: ${patientId}`, {
      encountersCount: encounters ? encounters.length : 0,
      hospitalId
    });*/
    
    if (!patientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Patient ID is required' 
      });
    }

    // Validate patientId format
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid patient ID format' 
      });
    }

    // Validate encounters array
    if (!Array.isArray(encounters)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Encounters must be an array' 
      });
    }

    // IMPROVED: Process encounters with better filtering
    const processedEncounters = [];
    const validationErrors = [];

    encounters.forEach((encounter, index) => {
      // Skip null/undefined encounters (common after deletion)
      if (!encounter || typeof encounter !== 'object') {
        //console.log(`[savePatientEncounters] Skipping invalid encounter at index ${index}`);
        return;
      }

      const validation = validateEncounterFlexible(encounter, index);
      
      if (!validation.isValid) {
        validationErrors.push(validation.error);
        return;
      }
      
      // Only include encounters with meaningful content
      if (validation.hasContent) {
        processedEncounters.push(validation.sanitized);
        //console.log(`[savePatientEncounters] Added encounter ${index} with content`);
      } else {
        //console.log(`[savePatientEncounters] Skipped empty encounter at index ${index}`);
      }
    });

    // Return validation errors only if there are actual validation failures
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors in encounters',
        errors: validationErrors
      });
    }

    //console.log(`[savePatientEncounters] Processing ${processedEncounters.length} valid encounters`);

    let encounterRecord = await TreatmentEncounter.findOne({ patientId });
    
    if (!encounterRecord) {
      //console.log(`[savePatientEncounters] Creating new encounter record for patient: ${patientId}`);
      
      encounterRecord = new TreatmentEncounter({
        patientId,
        hospitalId: hospitalId || 'default-hospital',
        encounters: processedEncounters
      });
    } else {
      //console.log(`[savePatientEncounters] Updating existing encounter record for patient: ${patientId}`);
      
      // IMPROVED: Clear existing encounters and replace with new data
      encounterRecord.encounters = [];
      
      // Add all processed encounters
      processedEncounters.forEach(encounter => {
        encounterRecord.addEncounter(encounter);
      });
      
      if (hospitalId) {
        encounterRecord.hospitalId = hospitalId;
      }
    }

    await encounterRecord.save();
    
    const formattedData = formatEncounterData(encounterRecord);
    //console.log(`[savePatientEncounters] Successfully saved ${formattedData.encounters.length} encounters for patient: ${patientId}`);
    
    res.json({
      success: true,
      message: 'Treatment encounters saved successfully',
      data: formattedData
    });

  } catch (error) {
    console.error('[savePatientEncounters] Error:', error);
    
    let errorMessage = 'Failed to save treatment encounters';
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      errorMessage = `Validation failed: ${validationErrors.join(', ')}`;
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage, 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Add a single encounter to existing record
 */
export const addEncounter = async (req, res) => {
  try {
    const { patientId } = req.params;
    const encounterData = req.body;
    
    //console.log(`[addEncounter] Adding encounter for patient: ${patientId}`);
    
    if (!patientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Patient ID is required' 
      });
    }

    const validation = validateEncounterFlexible(encounterData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // Check if encounter has meaningful content
    if (!validation.hasContent) {
      return res.status(400).json({
        success: false,
        message: 'Encounter must have at least treatment, amount, notes, or dentist information'
      });
    }

    let encounterRecord = await TreatmentEncounter.findOne({ patientId });
    
    if (!encounterRecord) {
      encounterRecord = new TreatmentEncounter({
        patientId,
        hospitalId: encounterData.hospitalId || 'default-hospital',
        encounters: []
      });
    }

    const newEncounter = encounterRecord.addEncounter(validation.sanitized);
    await encounterRecord.save();
    
    //console.log(`[addEncounter] Successfully added encounter for patient: ${patientId}`);
    
    res.json({
      success: true,
      message: 'Treatment encounter added successfully',
      encounter: {
        _id: newEncounter._id,
        serialNo: newEncounter.serialNo,
        dateTime: newEncounter.dateTime,
        treatment: newEncounter.treatment,
        amountPaid: newEncounter.amountPaid,
        paymentMode: newEncounter.paymentMode,
        notes: newEncounter.notes,
        status: newEncounter.status,
        dentist: newEncounter.dentist
      }
    });

  } catch (error) {
    console.error('[addEncounter] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add treatment encounter', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update a specific encounter
 */
export const updateEncounter = async (req, res) => {
  try {
    const { patientId, encounterId } = req.params;
    const updateData = req.body;
    
    //console.log(`[updateEncounter] Updating encounter ${encounterId} for patient: ${patientId}`);
    
    if (!patientId || !encounterId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Patient ID and Encounter ID are required' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(encounterId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid encounter ID format' 
      });
    }

    const encounterRecord = await TreatmentEncounter.findOne({ patientId });
    
    if (!encounterRecord) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient encounter record not found' 
      });
    }

    const updatedEncounter = encounterRecord.updateEncounter(encounterId, updateData);
    await encounterRecord.save();
    
    //console.log(`[updateEncounter] Successfully updated encounter ${encounterId} for patient: ${patientId}`);
    
    res.json({
      success: true,
      message: 'Treatment encounter updated successfully',
      encounter: {
        _id: updatedEncounter._id,
        serialNo: updatedEncounter.serialNo,
        dateTime: updatedEncounter.dateTime,
        treatment: updatedEncounter.treatment,
        amountPaid: updatedEncounter.amountPaid,
        paymentMode: updatedEncounter.paymentMode,
        notes: updatedEncounter.notes,
        status: updatedEncounter.status,
        dentist: updatedEncounter.dentist
      }
    });

  } catch (error) {
    console.error('[updateEncounter] Error:', error);
    
    if (error.message === 'Encounter not found') {
      return res.status(404).json({
        success: false,
        message: 'Treatment encounter not found'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update treatment encounter', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a specific encounter
 */
export const deleteEncounter = async (req, res) => {
  try {
    const { patientId, encounterId } = req.params;
    
    //console.log(`[deleteEncounter] Deleting encounter ${encounterId} for patient: ${patientId}`);
    
    if (!patientId || !encounterId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Patient ID and Encounter ID are required' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(encounterId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid encounter ID format' 
      });
    }

    const encounterRecord = await TreatmentEncounter.findOne({ patientId });
    
    if (!encounterRecord) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient encounter record not found' 
      });
    }

    encounterRecord.removeEncounter(encounterId);
    await encounterRecord.save();
    
    //console.log(`[deleteEncounter] Successfully deleted encounter ${encounterId} for patient: ${patientId}`);
    
    res.json({
      success: true,
      message: 'Treatment encounter deleted successfully'
    });

  } catch (error) {
    console.error('[deleteEncounter] Error:', error);
    
    if (error.message === 'Encounter not found') {
      return res.status(404).json({
        success: false,
        message: 'Treatment encounter not found'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete treatment encounter', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get encounter statistics for a patient
 */
export const getEncounterStatistics = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    //console.log(`[getEncounterStatistics] Getting statistics for patient: ${patientId}`);
    
    if (!patientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Patient ID is required' 
      });
    }

    const encounterRecord = await TreatmentEncounter.findOne({ patientId });
    
    if (!encounterRecord) {
      return res.json({
        success: true,
        statistics: {
          totalEncounters: 0,
          totalAmountPaid: 0,
          averageAmountPerEncounter: 0,
          lastEncounterDate: null,
          paymentModeBreakdown: {},
          statusBreakdown: {},
          monthlyBreakdown: {}
        }
      });
    }

    // Calculate detailed statistics
    const stats = {
      totalEncounters: encounterRecord.totalEncounters,
      totalAmountPaid: encounterRecord.totalAmountPaid,
      averageAmountPerEncounter: encounterRecord.totalEncounters > 0 ? 
        Math.round(encounterRecord.totalAmountPaid / encounterRecord.totalEncounters) : 0,
      lastEncounterDate: encounterRecord.lastEncounterDate,
      paymentModeBreakdown: {},
      statusBreakdown: {},
      monthlyBreakdown: {}
    };

    // Calculate breakdowns
    encounterRecord.encounters.forEach(encounter => {
      // Payment mode breakdown
      stats.paymentModeBreakdown[encounter.paymentMode] = 
        (stats.paymentModeBreakdown[encounter.paymentMode] || 0) + 1;

      // Status breakdown
      stats.statusBreakdown[encounter.status] = 
        (stats.statusBreakdown[encounter.status] || 0) + 1;

      // Monthly breakdown
      const monthYear = new Date(encounter.dateTime).toISOString().substring(0, 7); // YYYY-MM
      if (!stats.monthlyBreakdown[monthYear]) {
        stats.monthlyBreakdown[monthYear] = {
          count: 0,
          totalAmount: 0
        };
      }
      stats.monthlyBreakdown[monthYear].count++;
      stats.monthlyBreakdown[monthYear].totalAmount += encounter.amountPaid;
    });

    //console.log(`[getEncounterStatistics] Statistics calculated for patient: ${patientId}`);
    
    res.json({
      success: true,
      statistics: stats
    });

  } catch (error) {
    console.error('[getEncounterStatistics] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch encounter statistics', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get active patients count (patients with In Progress status)
 */
/**
 * Get active patients count (patients with In Progress status)
 */
export const getActivePatientsCount = async (req, res) => {
  try {
    //console.log('[getActivePatientsCount] Fetching active patients count');
    
    // Get user info from token - same as other endpoints
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userHospitalId = req.user?.hospitalId;

    //console.log('[getActivePatientsCount] User info:', { userId, userRole, userHospitalId });

    // Build hospital filter - consistent with other endpoints
    let hospitalFilter = {};
    
    if (userHospitalId) {
      hospitalFilter.hospitalId = userHospitalId;
      //console.log('[getActivePatientsCount] Filtering by hospitalId:', userHospitalId);
    }

    // Use aggregation to find patients whose LATEST encounter is "In Progress"
    const pipeline = [
      // Stage 1: Filter by hospitalId
      ...(Object.keys(hospitalFilter).length > 0 ? [{ $match: hospitalFilter }] : []),
      
      // Stage 2: Filter only documents that have encounters
      {
        $match: {
          encounters: { $exists: true, $ne: [] }
        }
      },
      
      // Stage 3: Add a field for the latest encounter
      {
        $addFields: {
          latestEncounter: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$encounters',
                  as: 'enc',
                  cond: { $ne: ['$$enc', null] }
                }
              },
              -1  // Get the last element (most recent)
            ]
          }
        }
      },
      
      // Stage 4: Match only patients whose latest encounter status is "In Progress"
      {
        $match: {
          'latestEncounter.status': 'In Progress'
        }
      },
      
      // Stage 5: Count unique patients
      {
        $count: 'activeCount'
      }
    ];

    //console.log('[getActivePatientsCount] Running aggregation pipeline');
    
    const activePatientsResult = await TreatmentEncounter.aggregate(pipeline);
    const activePatientsCount = activePatientsResult.length > 0 ? activePatientsResult[0].activeCount : 0;

    //console.log(`[getActivePatientsCount] Found ${activePatientsCount} active patients (latest encounter = "In Progress")`);
    
    res.json({
      success: true,
      count: activePatientsCount
    });

  } catch (error) {
    console.error('[getActivePatientsCount] Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch active patients count', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};