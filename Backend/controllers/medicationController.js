// controllers/medicationController.js
import mongoose from 'mongoose';
import Medication from '../models/Medication.js';
import Patient from '../models/Patient.js';
import Receptionist from '../models/Receptionist.js';

// Test export first
export const testFunction = () => {
  //console.log('Test function works');
};

// Create new medication/prescription
export const createMedication = async (req, res) => {
  try {
    //console.log('📝 Creating new medication/prescription:', req.body);
    
    const userRole = req.user.role;
    const userId = req.user.id;
    const { patientId } = req.params;

    // Validate patient ID
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid patient ID format' 
      });
    }

    // Get patient first to extract hospital and admin info
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found' 
      });
    }

    let medicationData = { ...req.body };
    medicationData.patientId = patientId;

    // Set hospital and admin IDs based on user role
    if (userRole === 'Receptionist') {
      const receptionist = await Receptionist.findById(userId);
      if (!receptionist) {
        return res.status(404).json({ 
          success: false,
          message: 'Receptionist not found' 
        });
      }
      
      // Verify receptionist belongs to same hospital as patient
      if (receptionist.hospitalId.toString() !== patient.hospitalId.toString()) {
        return res.status(403).json({ 
          success: false,
          message: 'Unauthorized: Patient not in your hospital' 
        });
      }
      
      medicationData.hospitalId = receptionist.hospitalId;
      medicationData.adminId = receptionist.admin;
      medicationData.prescribedBy = `${receptionist.firstName} ${receptionist.lastName} (Receptionist)`;
    } else if (userRole === 'Admin') {
      // Verify admin owns this patient
      if (patient.adminId.toString() !== userId) {
        return res.status(403).json({ 
          success: false,
          message: 'Unauthorized: Patient not in your practice' 
        });
      }
      
      medicationData.adminId = userId;
      medicationData.hospitalId = patient.hospitalId;
      medicationData.prescribedBy = `Doctor/Admin`;
    }

    // ✅ Set defaults for optional fields
    if (!medicationData.appointmentDate) {
      medicationData.appointmentDate = new Date();
    }

    if (!medicationData.diagnosis) {
      medicationData.diagnosis = 'General prescription';
    }

    // ✅ Ensure medications array exists
    if (!medicationData.medications || medicationData.medications.length === 0) {
      medicationData.medications = [];
    }

    // Set payment and treatment status defaults if not provided
    medicationData.totalAmount = parseFloat(medicationData.totalAmount) || 0;
    medicationData.paidAmount = parseFloat(medicationData.paidAmount) || 0;
    
    // Ensure paidAmount doesn't exceed totalAmount
    if (medicationData.paidAmount > medicationData.totalAmount) {
      return res.status(400).json({ 
        success: false,
        message: 'Paid amount cannot exceed total amount' 
      });
    }

    const medication = new Medication(medicationData);
    const savedMedication = await medication.save();

    //console.log('✅ Medication created successfully:', savedMedication._id);
    
    // Populate patient data in response
    const populatedMedication = await Medication.findById(savedMedication._id)
      .populate('patientId', 'firstName lastName patientId phoneNumber age gender');

    res.status(201).json({
      success: true,
      message: 'Medication created successfully',
      medication: populatedMedication,
      prescriptionNumber: savedMedication.prescriptionNumber
    });
  } catch (error) {
    console.error('❌ Error creating medication:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Failed to create medication',
      error: error.message 
    });
  }
};


// Get medications for a specific patient
export const getPatientMedications = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid patient ID format' 
      });
    }

    let filter = { patientId: new mongoose.Types.ObjectId(patientId) };

    // Add role-based filtering
    if (userRole === 'Receptionist') {
      const receptionist = await Receptionist.findById(userId);
      if (receptionist) {
        filter.hospitalId = receptionist.hospitalId;
      }
    } else if (userRole === 'Admin') {
      filter.adminId = new mongoose.Types.ObjectId(userId);
    }

    const medications = await Medication.find(filter)
      .populate('patientId', 'firstName lastName patientId phoneNumber age gender')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: medications.length,
      medications
    });
  } catch (error) {
    console.error('❌ Error fetching patient medications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch patient medications',
      error: error.message 
    });
  }
};

// Get all medications
export const getAllMedications = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Get all medications endpoint'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching all medications'
    });
  }
};

// Get medication by ID
export const getMedicationById = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Get medication by ID endpoint'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching medication by ID'
    });
  }
};

// Update medication
export const updateMedication = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Update medication endpoint'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating medication'
    });
  }
};

// Delete medication
export const deleteMedication = async (req, res) => {
  try {
    const { medicationId } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(medicationId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid medication ID format' 
      });
    }

    const medication = await Medication.findById(medicationId);
    
    if (!medication) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    // Authorization check
    if (userRole === 'Receptionist') {
      const receptionist = await Receptionist.findById(userId);
      if (receptionist && medication.hospitalId.toString() !== receptionist.hospitalId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to delete this medication'
        });
      }
    } else if (userRole === 'Admin') {
      if (medication.adminId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to delete this medication'
        });
      }
    }

    await Medication.findByIdAndDelete(medicationId);

    res.status(200).json({
      success: true,
      message: 'Medication deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting medication:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting medication',
      error: error.message
    });
  }
};
// Get medication statistics
export const getMedicationStats = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Get medication stats endpoint'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching medication stats'
    });
  }
};