// services/patientService.js
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`; // Adjust to your backend URL

export const fetchPatientById = async (hospitalId, patientId) => {
  try {
    const token = localStorage.getItem('token'); // Adjust based on how you store your auth token
    
    const response = await fetch(`${API_BASE_URL}/patients/${hospitalId}/${patientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    //console.log('API Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    //console.log('Fetched patient data:', data);
    
    return data;
  } catch (error) {
   // console.error('Error fetching patient:', error);
    throw error;
  }
};
