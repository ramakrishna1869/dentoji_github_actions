// controllers/customFieldsController.js
import CustomField from '../models/CustomField.js';
import PaymentTreatment from '../models/PaymentTreatment.js';
import Patient from '../models/Patient.js';
import Medication from '../models/Medication.js';
import mongoose from 'mongoose';

// Utility function to validate ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// PATIENT CUSTOM FIELDS

// Get all custom fields for a patient
export const getPatientCustomFields = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (!isValidObjectId(patientId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid patient ID format' 
      });
    }

    // First check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found' 
      });
    }

    // Get patient custom fields
    const patientFields = await CustomField.find({
      patientId,
      section: 'patient',
      isActive: true
    }).sort({ createdAt: -1 });

    // Get payment-treatment custom fields
    const paymentTreatment = await PaymentTreatment.findOne({ patientId });
    const paymentTreatmentFields = paymentTreatment ? 
      paymentTreatment.customFields.filter(field => field.isActive) : [];

    res.status(200).json({
      success: true,
      data: {
        patientFields,
        paymentFields: paymentTreatmentFields.filter(f => f.section === 'payment'),
        treatmentFields: paymentTreatmentFields.filter(f => f.section === 'treatment')
      }
    });
  } catch (error) {
   // console.error('Error fetching patient custom fields:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching custom fields', 
      error: error.message 
    });
  }
};

// Add custom field to patient
export const addPatientCustomField = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { label, value, section = 'patient' } = req.body;
    
    // Check if user is authenticated and has adminId
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: 'User authentication required' 
      });
    }
    
    const { id: adminId } = req.user;

    if (!isValidObjectId(patientId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid patient ID format' 
      });
    }

    if (!label || label.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Label is required' 
      });
    }

    // Get patient to validate and get hospital ID
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found' 
      });
    }

    // Check for duplicate labels
    const existingField = await CustomField.findOne({
      patientId,
      label: label.trim(),
      section,
      isActive: true
    });

    if (existingField) {
      return res.status(400).json({
        success: false,
        message: 'A custom field with this label already exists'
      });
    }

    const customField = new CustomField({
      label: label.trim(),
      value: value ? value.trim() : '',
      section,
      patientId,
      hospitalId: patient.hospitalId,
      adminId
    });

    await customField.save();

    res.status(201).json({
      success: true,
      data: customField,
      message: 'Custom field added successfully'
    });
  } catch (error) {
   // console.error('Error adding patient custom field:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A custom field with this label already exists'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error adding custom field', 
      error: error.message 
    });
  }
};

// Update patient custom field
export const updatePatientCustomField = async (req, res) => {
  try {
    const { patientId, fieldId } = req.params;
    const { label, value } = req.body;

    if (!isValidObjectId(patientId) || !isValidObjectId(fieldId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid patient ID or field ID format' 
      });
    }

    // First check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found' 
      });
    }

    // If label is provided, check for duplicates (excluding current field)
    if (label && label.trim()) {
      const existingField = await CustomField.findOne({
        patientId,
        label: label.trim(),
        _id: { $ne: fieldId },
        isActive: true
      });

      if (existingField) {
        return res.status(400).json({
          success: false,
          message: 'A custom field with this label already exists'
        });
      }
    }

    const updateData = { updatedAt: Date.now() };
    if (label !== undefined) updateData.label = label.trim();
    if (value !== undefined) updateData.value = value.trim();

    const customField = await CustomField.findOneAndUpdate(
      { _id: fieldId, patientId, isActive: true },
      updateData,
      { new: true }
    );

    if (!customField) {
      return res.status(404).json({ 
        success: false,
        message: 'Custom field not found or already deleted' 
      });
    }

    res.status(200).json({
      success: true,
      data: customField,
      message: 'Custom field updated successfully'
    });
  } catch (error) {
   // console.error('Error updating patient custom field:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating custom field', 
      error: error.message 
    });
  }
};

// Delete patient custom field
export const deletePatientCustomField = async (req, res) => {
  try {
    const { patientId, fieldId } = req.params;
    //console.log("🟢 DELETE Patient Custom Field API called");
    //console.log("➡️ Received Params:", { patientId, fieldId });

    // Validate ObjectIds
    if (!isValidObjectId(patientId) || !isValidObjectId(fieldId)) {
      console.warn("⚠️ Invalid ObjectId format", { patientId, fieldId });
      return res.status(400).json({ 
        success: false,
        message: 'Invalid patient ID or field ID format' 
      });
    }

    // Check if patient exists
    //console.log("🔍 Checking if patient exists with ID:", patientId);
    const patient = await Patient.findById(patientId);
    //console.log("✅ Patient lookup result:", patient);

    if (!patient) {
      console.warn("❌ Patient not found with ID:", patientId);
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found' 
      });
    }

    // Try to find and deactivate custom field
    //console.log("🔄 Attempting to deactivate custom field:", fieldId);
    const customField = await CustomField.findOneAndUpdate(
      { _id: fieldId, patientId },
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    //console.log("🔎 CustomField update result:", customField);

    if (!customField) {
      console.warn("❌ Custom field not found for given patient & fieldId", { fieldId, patientId });
      return res.status(404).json({ 
        success: false,
        message: 'Custom field not found' 
      });
    }

    /*console.log("✅ Custom field successfully deactivated:", {
      fieldId: customField._id,
      patientId: customField.patientId,
      updatedAt: customField.updatedAt
    });*/

    res.status(200).json({
      success: true,
      message: 'Custom field deleted successfully'
    });

  } catch (error) {
    console.error("💥 Error deleting patient custom field:", error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting custom field', 
      error: error.message 
    });
  }
};

// MEDICATION CUSTOM FIELDS

// Get medication custom fields
export const getMedicationCustomFields = async (req, res) => {
  try {
    const { medicationId } = req.params;
    
    if (!isValidObjectId(medicationId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid medication ID format' 
      });
    }

    // First check if medication exists
    const medication = await Medication.findById(medicationId);
    if (!medication) {
      return res.status(404).json({ 
        success: false,
        message: 'Medication not found' 
      });
    }

    const customFields = await CustomField.find({
      medicationId,
      section: 'medication',
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: customFields
    });
  } catch (error) {
    console.error('Error fetching medication custom fields:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching custom fields', 
      error: error.message 
    });
  }
};

// Add medication custom field
export const addMedicationCustomField = async (req, res) => {
  try {
    const { medicationId } = req.params;
    const { label, value } = req.body;
    
    // Check if user is authenticated and has adminId
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: 'User authentication required' 
      });
    }
    
    const { id: adminId } = req.user;

    if (!isValidObjectId(medicationId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid medication ID format' 
      });
    }

    if (!label || label.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Label is required' 
      });
    }

    // Get medication to validate and get patient/hospital IDs
    const medication = await Medication.findById(medicationId);
    if (!medication) {
      return res.status(404).json({ 
        success: false,
        message: 'Medication not found' 
      });
    }

    // Check for duplicate labels
    const existingField = await CustomField.findOne({
      medicationId,
      label: label.trim(),
      section: 'medication',
      isActive: true
    });

    if (existingField) {
      return res.status(400).json({
        success: false,
        message: 'A custom field with this label already exists for this medication'
      });
    }

    const customField = new CustomField({
      label: label.trim(),
      value: value ? value.trim() : '',
      section: 'medication',
      patientId: medication.patientId,
      hospitalId: medication.hospitalId,
      adminId,
      medicationId
    });

    await customField.save();

    res.status(201).json({
      success: true,
      data: customField,
      message: 'Medication custom field added successfully'
    });
  } catch (error) {
    console.error('Error adding medication custom field:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A custom field with this label already exists'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error adding custom field', 
      error: error.message 
    });
  }
};

// Update medication custom field
export const updateMedicationCustomField = async (req, res) => {
  try {
    const { medicationId, fieldId } = req.params;
    const { label, value } = req.body;

    if (!isValidObjectId(medicationId) || !isValidObjectId(fieldId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid medication ID or field ID format' 
      });
    }

    // First check if medication exists
    const medication = await Medication.findById(medicationId);
    if (!medication) {
      return res.status(404).json({ 
        success: false,
        message: 'Medication not found' 
      });
    }

    // If label is provided, check for duplicates (excluding current field)
    if (label && label.trim()) {
      const existingField = await CustomField.findOne({
        medicationId,
        label: label.trim(),
        _id: { $ne: fieldId },
        isActive: true
      });

      if (existingField) {
        return res.status(400).json({
          success: false,
          message: 'A custom field with this label already exists'
        });
      }
    }

    const updateData = { updatedAt: Date.now() };
    if (label !== undefined) updateData.label = label.trim();
    if (value !== undefined) updateData.value = value.trim();

    const customField = await CustomField.findOneAndUpdate(
      { _id: fieldId, medicationId, isActive: true },
      updateData,
      { new: true }
    );

    if (!customField) {
      return res.status(404).json({ 
        success: false,
        message: 'Custom field not found or already deleted' 
      });
    }

    res.status(200).json({
      success: true,
      data: customField,
      message: 'Custom field updated successfully'
    });
  } catch (error) {
    console.error('Error updating medication custom field:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating custom field', 
      error: error.message 
    });
  }
};

// Delete medication custom field
export const deleteMedicationCustomField = async (req, res) => {
  try {
    const { medicationId, fieldId } = req.params;

    if (!isValidObjectId(medicationId) || !isValidObjectId(fieldId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid medication ID or field ID format' 
      });
    }

    // First check if medication exists
    const medication = await Medication.findById(medicationId);
    if (!medication) {
      return res.status(404).json({ 
        success: false,
        message: 'Medication not found' 
      });
    }

    const customField = await CustomField.findOneAndUpdate(
      { _id: fieldId, medicationId },
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!customField) {
      return res.status(404).json({ 
        success: false,
        message: 'Custom field not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Custom field deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting medication custom field:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting custom field', 
      error: error.message 
    });
  }
};

// PAYMENT-TREATMENT CUSTOM FIELDS

// Get payment-treatment custom fields
export const getPaymentTreatmentCustomFields = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    if (!isValidObjectId(patientId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid patient ID format' 
      });
    }

    // First check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found' 
      });
    }

    const paymentTreatment = await PaymentTreatment.findOne({ patientId });
    
    if (!paymentTreatment) {
      return res.status(200).json({
        success: true,
        data: {
          paymentFields: [],
          treatmentFields: []
        }
      });
    }

    const activeFields = paymentTreatment.customFields.filter(field => field.isActive);
    
    res.status(200).json({
      success: true,
      data: {
        paymentFields: activeFields.filter(f => f.section === 'payment'),
        treatmentFields: activeFields.filter(f => f.section === 'treatment')
      }
    });
  } catch (error) {
    console.error('Error fetching payment-treatment custom fields:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching custom fields', 
      error: error.message 
    });
  }
};

// Add payment-treatment custom field
export const addPaymentTreatmentCustomField = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { label, value, section } = req.body;
    
    // Check if user is authenticated and has adminId
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: 'User authentication required' 
      });
    }
    
    const { id: adminId } = req.user;

    if (!isValidObjectId(patientId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid patient ID format' 
      });
    }

    if (!label || label.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Label is required' 
      });
    }

    if (!['payment', 'treatment'].includes(section)) {
      return res.status(400).json({ 
        success: false,
        message: 'Section must be either "payment" or "treatment"' 
      });
    }

    // Get patient to validate and get hospital ID
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found' 
      });
    }

    const newField = {
      label: label.trim(),
      value: value ? value.trim() : '',
      section,
      isActive: true,
      createdAt: new Date()
    };

    // Find or create payment-treatment record
    let paymentTreatment = await PaymentTreatment.findOne({ patientId });
    
    if (!paymentTreatment) {
      paymentTreatment = new PaymentTreatment({
        patientId,
        hospitalId: patient.hospitalId,
        adminId,
        customFields: [newField]
      });
    } else {
      // Check for duplicate labels in the same section
      const existingField = paymentTreatment.customFields.find(
        field => field.label === label.trim() && 
                field.section === section && 
                field.isActive
      );

      if (existingField) {
        return res.status(400).json({
          success: false,
          message: `A custom field with this label already exists in the ${section} section`
        });
      }

      paymentTreatment.customFields.push(newField);
      paymentTreatment.updatedAt = Date.now();
    }

    await paymentTreatment.save();

    // Get the newly added field
    const addedField = paymentTreatment.customFields[paymentTreatment.customFields.length - 1];

    res.status(201).json({
      success: true,
      data: addedField,
      message: 'Custom field added successfully'
    });
  } catch (error) {
    console.error('Error adding payment-treatment custom field:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding custom field', 
      error: error.message 
    });
  }
};

// Update payment-treatment custom field
export const updatePaymentTreatmentCustomField = async (req, res) => {
  try {
    const { patientId, fieldId } = req.params;
    const { label, value } = req.body;

    if (!isValidObjectId(patientId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid patient ID format' 
      });
    }

    // First check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found' 
      });
    }

    const paymentTreatment = await PaymentTreatment.findOne({ patientId });
    
    if (!paymentTreatment) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment-treatment record not found' 
      });
    }

    const fieldIndex = paymentTreatment.customFields.findIndex(
      field => field._id.toString() === fieldId && field.isActive
    );

    if (fieldIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: 'Custom field not found or already deleted' 
      });
    }

    // Check for duplicate labels if label is being updated
    if (label && label.trim()) {
      const duplicateField = paymentTreatment.customFields.find(
        (field, index) => field.label === label.trim() && 
                         field.section === paymentTreatment.customFields[fieldIndex].section && 
                         field.isActive &&
                         index !== fieldIndex
      );

      if (duplicateField) {
        return res.status(400).json({
          success: false,
          message: 'A custom field with this label already exists in this section'
        });
      }
    }

    // Update the field
    if (label !== undefined) paymentTreatment.customFields[fieldIndex].label = label.trim();
    if (value !== undefined) paymentTreatment.customFields[fieldIndex].value = value.trim();
    paymentTreatment.updatedAt = Date.now();

    await paymentTreatment.save();

    res.status(200).json({
      success: true,
      data: paymentTreatment.customFields[fieldIndex],
      message: 'Custom field updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment-treatment custom field:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating custom field', 
      error: error.message 
    });
  }
};

// Delete payment-treatment custom field
export const deletePaymentTreatmentCustomField = async (req, res) => {
  try {
    const { patientId, fieldId } = req.params;

    if (!isValidObjectId(patientId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid patient ID format' 
      });
    }

    // First check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found' 
      });
    }

    const paymentTreatment = await PaymentTreatment.findOne({ patientId });
    
    if (!paymentTreatment) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment-treatment record not found' 
      });
    }

    const fieldIndex = paymentTreatment.customFields.findIndex(
      field => field._id.toString() === fieldId
    );

    if (fieldIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: 'Custom field not found' 
      });
    }

    paymentTreatment.customFields[fieldIndex].isActive = false;
    paymentTreatment.updatedAt = Date.now();

    await paymentTreatment.save();

    res.status(200).json({
      success: true,
      message: 'Custom field deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment-treatment custom field:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting custom field', 
      error: error.message 
    });
  }
};