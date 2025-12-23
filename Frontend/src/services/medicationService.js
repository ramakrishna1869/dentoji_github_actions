// services/medicationService.js
import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// Get authentication headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Create new medication/prescription
export const createMedication = async (patientId, medicationData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/medications/patient/${patientId}`,
      medicationData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
  //  console.error('Error creating medication:', error);
    throw error.response?.data || error;
  }
};

// Get all medications for a specific patient
export const getPatientMedications = async (patientId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/medications/patient/${patientId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
  //  console.error('Error fetching patient medications:', error);
    throw error.response?.data || error;
  }
};

// Get all medications with pagination
export const getAllMedications = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await axios.get(
      `${API_BASE_URL}/medications${queryString ? `?${queryString}` : ''}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
   // console.error('Error fetching medications:', error);
    throw error.response?.data || error;
  }
};

// Get medication by ID
export const getMedicationById = async (medicationId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/medications/${medicationId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
   // console.error('Error fetching medication:', error);
    throw error.response?.data || error;
  }
};

// Update medication
export const updateMedication = async (medicationId, updateData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/medications/${medicationId}`,
      updateData,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
   // console.error('Error updating medication:', error);
    throw error.response?.data || error;
  }
};

// Delete medication
export const deleteMedication = async (medicationId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/medications/${medicationId}`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
  //  console.error('Error deleting medication:', error);
    throw error.response?.data || error;
  }
};

// Get medication statistics
export const getMedicationStats = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/medications/stats`,
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
   // console.error('Error fetching medication stats:', error);
    throw error.response?.data || error;
  }
};
