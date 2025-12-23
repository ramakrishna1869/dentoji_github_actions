


import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, FileText, Printer, Loader2 } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
// import { fetchPatientById } from '../services/patientService';

import PatientInfoCard from '../components/PatientData/PersonalInfoCard';
import MedicalHistoryCard from '../components/PatientData/MedicalHistoryCard';
import PaymentHistoryCard from '../components/PatientData/PaymentHistoryCard';
import AppointmentsCard from '../components/PatientData/AppointmentsCard';
import MedicationsCard from '../components/PatientData/MedicationsCard';
import UploadPhotosCard from '../components/PatientData/UploadPhotosCard';
import PatientInfoHeaderCard from '../components/PatientData/PatientInfoHeaderCard';
import DoctorSuggestionsCard from '../components/PatientData/DoctorSuggestionsCard';
import DentalChart from '../components/PatientData/Teethset';
import Patientinformation from '../components/PatientRecord/PatientInformation';

import {
  dentalPhotos
} from '../data/PatientDatadummy';
import TreatmentProgressCard from '@/components/PatientData/TreatmentProgressCard';
 
export default function PatientDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { hospitalId, patientId } = useParams();
  
  // Add ref for printing
  const patientInfoRef = useRef();
 
  const [patientData, setPatientData] = useState(null);
  const [patientMedications, setPatientMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [medicationsLoading, setMedicationsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [medicationsError, setMedicationsError] = useState(null);
  const [existingSuggestions, setExistingSuggestions] = useState([]);
  const [printTrigger, setPrintTrigger] = useState(0);
  
  // Add new state for print loading
  const [isPrintLoading, setIsPrintLoading] = useState(false);
  const [isBasicPlan, setIsBasicPlan] = useState(false);
 
  // Try to get patient data from location state first
  const patientFromState = location.state?.patient;

  // Navigation handler for medications
  const handleNavigateToMedications = (patientId) => {
    navigate(`/medications/${patientId}`, {
      state: {
        mode: 'fromCard',
        hospitalId: hospitalId,
        patientId: patientId,
        patient: patientData || patientFromState // Pass current patient data
      }
    });
  };

  // Print handler - force component refresh before printing
  const handlePrint = async () => {
    try {
      // Start loading animation
      setIsPrintLoading(true);
      
      // Force re-render of the PatientInformation component to load fresh data
      setPrintTrigger(prev => prev + 1);
      
      // Wait for component to re-render and load data
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const printContent = patientInfoRef.current;
      
      if (!printContent) {
        alert('Print content not ready. Please try again.');
        setIsPrintLoading(false);
        return;
      }

      // Get all styles from the current document
      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join('');
          } catch (e) {
            return '';
          }
        })
        .join('');

      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      // Stop loading animation as soon as window opens
      setIsPrintLoading(false);
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Patient Information</title>
            <meta charset="utf-8">
            <style>
              ${styles}
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: Arial, sans-serif;
                color: #000 !important;
                background: #fff !important;
              }
              * {
                color: #000 !important;
                background: transparent !important;
              }
              @page { 
                size: A4; 
                margin: 20mm; 
              }
              @media print {
                body { 
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Wait for content and images to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      printWindow.focus();
      printWindow.print();
      
      // Close window after printing
      setTimeout(() => {
        printWindow.close();
      }, 1000);
      
    } catch (error) {
     // console.error('Print failed:', error);
      alert('Print failed. Please try again.');
      setIsPrintLoading(false);
    }
  };

  // Fetch subscription status to determine plan type (Basic users can't print)
  useEffect(() => {
    let cancelled = false;

    const fetchSubscriptionStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          if (!cancelled) setIsBasicPlan(false);
          return;
        }

        const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payments/subscription-status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!resp.ok) {
          if (!cancelled) setIsBasicPlan(false);
          return;
        }

        const data = await resp.json();
        const payload = data?.data || data;
        const planType = payload?.subscription?.planType || '';
        const basic = typeof planType === 'string' && planType.toLowerCase().includes('basic');
        if (!cancelled) setIsBasicPlan(basic);
      } catch (err) {
        console.warn('Failed to fetch subscription status for print rule:', err);
        if (!cancelled) setIsBasicPlan(false);
      }
    };

    fetchSubscriptionStatus();

    return () => { cancelled = true; };
  }, []);
 
  // Function to fetch patient medications from backend
  const fetchPatientMedications = async () => {
    try {
      setMedicationsLoading(true);
      setMedicationsError(null);
     
      const token = localStorage.getItem('token');
     
      if (!token || !patientId) {
        setMedicationsError('Authentication token or patient ID not found');
        return;
      }
 
      //console.log('🔍 Fetching medications for patient:', { patientId });
 
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/medications/patient/${patientId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
 
      if (response.ok) {
        const data = await response.json();
        //console.log('✅ Fetched patient medications:', data);
       
        // Extract medications from all prescription records
        const allMedications = [];
        if (data.medications && data.medications.length > 0) {
          data.medications.forEach(prescription => {
            if (prescription.medications && prescription.medications.length > 0) {
              prescription.medications.forEach(med => {
                allMedications.push({
                  ...med,
                  prescriptionId: prescription._id,
                  prescriptionNumber: prescription.prescriptionNumber,
                  appointmentDate: prescription.appointmentDate,
                  diagnosis: prescription.diagnosis,
                  treatmentStatus: prescription.treatmentStatus,
                  status: prescription.treatmentStatus === 'Completed' ? 'Completed' : 'Active'
                });
              });
            }
          });
        }
       
        setPatientMedications(allMedications);
      } else if (response.status === 404) {
        //console.log('No medications found for this patient');
        setPatientMedications([]);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch medications');
      }
    } catch (error) {
     // console.error('Error fetching patient medications:', error);
      setMedicationsError(error.message);
      setPatientMedications([]);
    } finally {
      setMedicationsLoading(false);
    }
  };
 
  // Function to fetch existing suggestions from backend
  const fetchExistingSuggestions = async () => {
    try {
      const token = localStorage.getItem('token');
     
      if (!token || !hospitalId || !patientId) {
        return;
      }
 
      //console.log('🔍 Fetching existing suggestions for patient:', { hospitalId, patientId });
 
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/suggestions/hospital/${hospitalId}/patient/${patientId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
 
      if (response.ok) {
        const data = await response.json();
        //console.log('✅ Fetched existing suggestions:', data.suggestions);
       
        // Transform backend suggestions to match frontend format
        const formattedSuggestions = data.suggestions.map(suggestion => ({
          id: suggestion._id,
          title: suggestion.title,
          description: suggestion.description,
          createdAt: suggestion.createdAt
        }));
       
        setExistingSuggestions(formattedSuggestions);
      } else {
        //console.log('No existing suggestions found or error fetching suggestions');
        setExistingSuggestions([]);
      }
    } catch (error) {
     // console.error('Error fetching existing suggestions:', error);
      setExistingSuggestions([]);
    }
  };

  // Fetch patient data directly from API (no service file needed)
  const fetchPatientById = async (hospitalId, patientId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      //console.log('Fetching patient:', { hospitalId, patientId });
      
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/patients/${hospitalId}/${patientId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const data = await response.json();
      //console.log('Patient data received from API:', data);
      
      // Handle different response formats
      return data.patient || data.data || data;
    } catch (error) {
     // console.error('Error in fetchPatientById:', error);
      throw error;
    }
  };
  // Main patient data fetching effect - improved from version 2
// Main patient data fetching effect - FIXED VERSION
useEffect(() => {
  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      //console.log('=== PatientDetailsPage Debug Info ===');
      //console.log('URL Parameters:', { hospitalId, patientId });
      //console.log('Location state:', location.state);
      //console.log('forceRefresh:', location.state?.forceRefresh);
      //console.log('=====================================');
      
      const refresh = location.state?.refresh;
      const forceRefresh = location.state?.forceRefresh;
      
      // If forceRefresh is true, skip cached data and fetch fresh from API
      if (forceRefresh && hospitalId && patientId) {
        //console.log('🔄 Force refreshing patient data from API');
        localStorage.setItem('currentHospitalId', hospitalId);
        const data = await fetchPatientById(hospitalId, patientId);
        //console.log('✅ Force fetched patient data:', data);
        setPatientData(data);
        setLoading(false);
        return;
      }
      
      // Priority 1: Use patient data from navigation state if available
      if (patientFromState && !forceRefresh) {
        let actualPatientData = null;
        if (patientFromState.data && patientFromState.success) {
          actualPatientData = patientFromState.data;
          //console.log('✅ Extracted patient data from API response wrapper:', actualPatientData);
        } else if (patientFromState._id) {
          actualPatientData = patientFromState;
          //console.log('✅ Using direct patient data:', actualPatientData);
        }
        
        if (actualPatientData && actualPatientData._id) {
          //console.log('✅ Setting patient data:', actualPatientData);
          setPatientData(actualPatientData);
          
          if (hospitalId) {
            localStorage.setItem('currentHospitalId', hospitalId);
          }
          
          setLoading(false);
          return;
        }
      }
      
      // Priority 2: If we already have patient data and only need specific refresh, keep existing data
      if (patientData && refresh && !forceRefresh && (refresh === 'medications' || Array.isArray(refresh))) {
        setLoading(false);
        return;
      }

      // Priority 3: Fetch from API if we don't have complete data from state
      if (hospitalId && patientId && !patientData) {
        //console.log('🔄 Fetching patient data from API for:', { hospitalId, patientId });
        localStorage.setItem('currentHospitalId', hospitalId);
        const data = await fetchPatientById(hospitalId, patientId);
        //console.log('✅ Fetched patient data from API:', data);
        setPatientData(data);
      } else if (!hospitalId || !patientId) {
       // console.error('❌ Missing required parameters:', { hospitalId, patientId });
        throw new Error('Hospital ID and Patient ID are required');
      }
    } catch (err) {
     // console.error('❌ Error in fetchPatientData:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchPatientData();
}, [hospitalId, patientId, location.state?.refresh, location.state?.forceRefresh]);
  // Add this additional useEffect for debugging state changes
  // useEffect(() => {
  //   console.log('🔍 PatientDetailsPage state updated:', {
  //     patientData: patientData ? {
  //       id: patientData._id,
  //       name: patientData.patientName || patientData.firstName + ' ' + patientData.lastName,
  //       hasCompleteData: !!(patientData._id && (patientData.patientName || patientData.firstName))
  //     } : null,
  //     loading,
  //     error
  //   }
  
  // );
  // }, [patientData, loading, error]);

  // Fetch medications and suggestions with improved logic from version 2
  useEffect(() => {
    const refresh = location.state?.refresh;
    
    // Only fetch medications if we don't have them OR if specifically requested to refresh
    if (patientId && (refresh === 'medications' || (Array.isArray(refresh) && refresh.includes('medications')) || !patientMedications.length)) {
      fetchPatientMedications();
    }
   
    // Only fetch suggestions if we don't have them OR if specifically requested to refresh  
    if (hospitalId && patientId && (refresh === 'suggestions' || (Array.isArray(refresh) && refresh.includes('suggestions')) || !existingSuggestions.length)) {
      fetchExistingSuggestions();
    }
  }, [hospitalId, patientId, location.state?.refresh]);

  // Function to handle Patient Record button click - now prints with patient state data
  const handlePatientRecordClick = () => {
    // Ensure we have patient data before printing
    const currentPatientData = patientData || patientFromState;
    
    if (!currentPatientData) {
      alert('Patient data not loaded. Please wait and try again.');
      return;
    }
    // If user is on Basic plan, redirect to pricing to upgrade
    if (isBasicPlan) {
      navigate('/pricing');
      return;
    }

    if (isPrintLoading) {
      return; // Prevent multiple clicks while loading
    }

    // You can access the patient state data here
    //console.log('Patient state data:', {
    //  patient: currentPatientData
    //});

    handlePrint();
  };
 
  // Handle updating patient header info
  const handlePatientUpdate = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/patients/${hospitalId}/${patientId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedData)
        }
      );
 
      if (response.ok) {
        const data = await response.json();
        setPatientData(data.patient);
      }
    } catch (error) {
     // console.error('Error updating patient:', error);
    }
  };
 
  // Handle creating new suggestions
  const handleSuggestionsUpdate = async (suggestionsData) => {
    try {
      const token = localStorage.getItem('token');
     
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }
     
      // Format suggestions for the API
      const formattedSuggestions = suggestionsData.doctorSuggestions.map(suggestion => ({
        title: suggestion.title,
        description: suggestion.description
      }));
 
      //console.log('📤 Sending suggestions to API:', formattedSuggestions);
 
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/suggestions/hospital/${hospitalId}/patient/${patientId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            suggestions: formattedSuggestions
          })
        }
      );
 
      const responseData = await response.json();
      //console.log('📥 API Response:', responseData);
 
      if (response.ok) {
        //console.log('✅ Suggestions saved to database successfully:', responseData);
        alert('Suggestions saved successfully!');
       
        // Refresh the existing suggestions from backend
        await fetchExistingSuggestions();
       
      } else {
       // console.error('Failed to save suggestions:', responseData);
        alert(`Failed to save suggestions: ${responseData.message || 'Please try again.'}`);
      }
    } catch (error) {
    //  console.error('Error saving suggestions:', error);
      alert('Error saving suggestions. Please check your connection and try again.');
    }
  };
 
  // Handle editing a suggestion
  const handleSuggestionEdit = async (suggestionId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
     
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }
 
      //console.log('📤 Updating suggestion:', { suggestionId, updatedData });
 
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/suggestions/${suggestionId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedData)
        }
      );
 
      const responseData = await response.json();
      //console.log('📥 Update Response:', responseData);
 
      if (response.ok) {
        //console.log('✅ Suggestion updated successfully:', responseData);
        alert('Suggestion updated successfully!');
       
        // Update the local state immediately
        setExistingSuggestions(prev =>
          prev.map(suggestion =>
            suggestion.id === suggestionId
              ? {
                  ...suggestion,
                  title: updatedData.title,
                  description: updatedData.description,
                  updatedAt: new Date().toISOString()
                }
              : suggestion
          )
        );
       
      } else {
      //  console.error('Failed to update suggestion:', responseData);
        alert(`Failed to update suggestion: ${responseData.message || 'Please try again.'}`);
        throw new Error(responseData.message || 'Failed to update suggestion');
      }
    } catch (error) {
    //  console.error('Error updating suggestion:', error);
      throw error; // Re-throw to handle in the component
    }
  };
 
  // Handle deleting a suggestion
  const handleSuggestionDelete = async (suggestionId) => {
    try {
      const token = localStorage.getItem('token');
     
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }
 
      //console.log('🗑️ Deleting suggestion:', { suggestionId });
 
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/suggestions/${suggestionId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
 
      const responseData = await response.json();
      //console.log('📥 Delete Response:', responseData);
 
      if (response.ok) {
        //console.log('✅ Suggestion deleted successfully:', responseData);
        alert('Suggestion deleted successfully!');
       
        // Update the local state immediately
        setExistingSuggestions(prev =>
          prev.filter(suggestion => suggestion.id !== suggestionId)
        );
       
      } else {
       // console.error('Failed to delete suggestion:', responseData);
        alert(`Failed to delete suggestion: ${responseData.message || 'Please try again.'}`);
        throw new Error(responseData.message || 'Failed to delete suggestion');
      }
    } catch (error) {
    //  console.error('Error deleting suggestion:', error);
      throw error; // Re-throw to handle in the component
    }
  };
 
  // Function to refresh medications after creating a new prescription
  const handleMedicationsRefresh = () => {
    fetchPatientMedications();
  };
 
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }
 
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 font-medium">Error loading patient data</p>
            <p className="text-red-500 text-sm mt-2">{error}</p>
            <button
              onClick={() => navigate('/patients')}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer"
            >
              Back to Patients
            </button>
          </div>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
<div className="no-print">
  <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 sm:py-4 gap-3 sm:gap-4">
      {/* Left: Print Button + Title + Subtitle stacked */}
      <div className="flex-1 min-w-0">
        <button
          className="flex items-center text-gray-800 hover:text-gray-900 font-medium cursor-pointer text-sm sm:text-base"
          onClick={() => navigate('/patients')}
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
          <span className="truncate">Patient Details</span>
        </button>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 ml-6 sm:ml-7">
          Complete patient information and medical history
        </p>
      </div>

      {/* Right: Buttons */}
      <div className="flex space-x-2 sm:space-x-3 w-full sm:w-auto">
        <button
          className={`px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center transition-colors text-sm sm:text-base flex-1 sm:flex-initial ${
            (isPrintLoading || isBasicPlan)
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
          }`}
          onClick={handlePatientRecordClick}
          disabled={isPrintLoading}
          title={isBasicPlan ? 'Printing disabled on Basic Plan. Click to upgrade.' : ''}
        >
          {isPrintLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin flex-shrink-0" />
              <span className="truncate">Preparing...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Print Record</span>
            </>
          )}
        </button>
      </div>
    </div>
  </div>
</div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Patient Header Card - Hide from print */}
        <div className="no-print">
          {patientData ? (
            <PatientInfoHeaderCard
              patientData={patientData}
              onUpdate={handlePatientUpdate}
            />
          ) : (
            <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
              No patient data available.
            </div>
          )}
        </div>
 
        {/* Below: Top 3 cards in one row - Hide from print */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 no-print">
          {patientData ? (
            <PatientInfoCard patientData={patientData} />
          ) : (
            <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
              No patient data available.
            </div>
          )}
          <MedicalHistoryCard patientData={patientData} />
          <PaymentHistoryCard patientData={patientData} />
        </div>
 
        {/* Below: Remaining cards in two columns - Hide from print */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
          <AppointmentsCard patientData={patientData} />
          <MedicationsCard
            patientData={{...patientData}}
            medications={patientMedications}
            loading={medicationsLoading}
            error={medicationsError}
            onRefresh={handleMedicationsRefresh}
            patientId={patientId}
            hospitalId={hospitalId}
            apiBaseUrl={import.meta.env.VITE_BACKEND_URL + '/api'}
            onNavigateToMedications={handleNavigateToMedications}
          />
        </div>
 
        {/* Doctor Suggestions Card - Hide from print */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
          <DoctorSuggestionsCard
            patientData={{ ...patientData, doctorSuggestions: existingSuggestions }}
            onUpdate={handleSuggestionsUpdate}
            onEdit={handleSuggestionEdit}
            onDelete={handleSuggestionDelete}
          />
          <TreatmentProgressCard 
            patientId={patientId}
            hospitalId={hospitalId}
            apiBaseUrl={import.meta.env.VITE_BACKEND_URL + '/api'}
            onNavigateToEncounters={(patientId) => navigate(`/treatmentencounters/${patientId}`)}
          />
        </div>
 
        <div className="no-print">
          <DentalChart patientId={patientId} />
        </div>
 
        {/* Upload Photos Card - Hide from print */}
        <div className="no-print">
          <UploadPhotosCard dentalPhotos={dentalPhotos} />
        </div>

        {/* Hidden Print Container - Force refresh with printTrigger */}
        <div 
          key={`patient-info-${printTrigger}`} // This forces component re-mount when printTrigger changes
          style={{
            position: 'absolute',
            top: '-10000px',
            left: '-10000px', 
            width: '210mm',
            minHeight: '297mm',
            backgroundColor: 'white',
            zIndex: -1,
            opacity: 0,
            pointerEvents: 'none'
          }}
        >
          <div ref={patientInfoRef}>
            <Patientinformation 
              patient={patientData || patientFromState}
              patientData={patientData || patientFromState}
              medications={patientMedications}
              suggestions={existingSuggestions}
              hospitalId={hospitalId}
              patientId={patientId}
              printTrigger={printTrigger} // Pass trigger to force data refresh
              state={{
                patient: patientData || patientFromState
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}