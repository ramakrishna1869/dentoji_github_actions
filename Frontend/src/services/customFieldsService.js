// services/customFieldsService.js
import axios from 'axios';

// Using your existing environment variable pattern
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/custom-fields`;

// Helper function to get auth headers (matching your existing pattern)
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Patient Custom Fields
export const patientCustomFields = {
  // Get all custom fields for a patient
  getAll: async (patientId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/patient/${patientId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
    //  console.error('Error fetching patient custom fields:', error);
      throw error.response?.data || error;
    }
  },

  // Add custom field to patient
  create: async (patientId, fieldData) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/patient/${patientId}`,
        fieldData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
    //  console.error('Error creating patient custom field:', error);
      throw error.response?.data || error;
    }
  },

  // Update custom field value
  update: async (patientId, fieldId, value) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/patient/${patientId}/${fieldId}`,
        { value },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
     // console.error('Error updating patient custom field:', error);
      throw error.response?.data || error;
    }
  },

  // Delete custom field from patient
  delete: async (patientId, fieldId) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/patient/${patientId}/${fieldId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
     // console.error('Error deleting patient custom field:', error);
      throw error.response?.data || error;
    }
  }
};

// Medication Custom Fields
export const medicationCustomFields = {
  // Get all custom fields for a medication
  getAll: async (medicationId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/medication/${medicationId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
     // console.error('Error fetching medication custom fields:', error);
      throw error.response?.data || error;
    }
  },

  // Add custom field to medication
  create: async (medicationId, fieldData) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/medication/${medicationId}`,
        fieldData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
     // console.error('Error creating medication custom field:', error);
      throw error.response?.data || error;
    }
  },

  // Update medication custom field value
  update: async (medicationId, fieldId, value) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/medication/${medicationId}/${fieldId}`,
        { value },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
     // console.error('Error updating medication custom field:', error);
      throw error.response?.data || error;
    }
  },

  // Delete custom field from medication
  delete: async (medicationId, fieldId) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/medication/${medicationId}/${fieldId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
     // console.error('Error deleting medication custom field:', error);
      throw error.response?.data || error;
    }
  }
};

// Payment-Treatment Custom Fields
export const paymentTreatmentCustomFields = {
  // Get all custom fields for payment-treatment
  getAll: async (patientId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/payment-treatment/${patientId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
    //  console.error('Error fetching payment-treatment custom fields:', error);
      throw error.response?.data || error;
    }
  },

  // Add custom field to payment-treatment
  create: async (patientId, fieldData) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/payment-treatment/${patientId}`,
        fieldData,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
     // console.error('Error creating payment-treatment custom field:', error);
      throw error.response?.data || error;
    }
  },

  // Update payment-treatment custom field value
  update: async (patientId, fieldId, value) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/payment-treatment/${patientId}/${fieldId}`,
        { value },
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
     // console.error('Error updating payment-treatment custom field:', error);
      throw error.response?.data || error;
    }
  },

  // Delete custom field from payment-treatment
  delete: async (patientId, fieldId) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/payment-treatment/${patientId}/${fieldId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
     // console.error('Error deleting payment-treatment custom field:', error);
      throw error.response?.data || error;
    }
  }
};

// Utility functions
export const customFieldsUtils = {
  // Group fields by section
  groupBySection: (fields) => {
    return fields.reduce((acc, field) => {
      if (!acc[field.section]) {
        acc[field.section] = [];
      }
      acc[field.section].push(field);
      return acc;
    }, {});
  },

  // Validate field data
  validateFieldData: (fieldData) => {
    const errors = {};
    
    if (!fieldData.label || fieldData.label.trim().length === 0) {
      errors.label = 'Label is required';
    }
    
    if (fieldData.label && fieldData.label.trim().length > 50) {
      errors.label = 'Label must be less than 50 characters';
    }
    
    if (fieldData.description && fieldData.description.length > 200) {
      errors.description = 'Description must be less than 200 characters';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

// Default export
export default {
  patientCustomFields,
  medicationCustomFields,
  paymentTreatmentCustomFields,
  customFieldsUtils
};