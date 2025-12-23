//view proforma modal
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Save, RefreshCw, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import PhotoManagement from './PhotoManagement';

const ProformaModal = ({
    show,
    proformaData,
    onInputChange,
    onClose,
    onNext,
    // Photo management props
    photos,
    uploading,
    selectedCategory,
    setSelectedCategory,
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    onFileSelect,
    onRemovePhoto,
    onViewPhoto,
    onEditPhoto,
    getPatientId,
    getHospitalId,
    // Patient data for auto-fill
    patientData
}) => {
    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [loadingProforma, setLoadingProforma] = useState(false);
    const [existingProformaData, setExistingProformaData] = useState(null);
    const [autoFillError, setAutoFillError] = useState(null);
    const [hasAutoFilled, setHasAutoFilled] = useState(false);

    // Additional patient loading state
    const [loadingPatientData, setLoadingPatientData] = useState(false);
    const [currentPatientData, setCurrentPatientData] = useState(null);



// Keyboard shortcuts for debugging
useEffect(() => {
    if (!show) return;
    
    const handleKeyPress = (event) => {
        // Ctrl+D to debug data
        if (event.ctrlKey && event.key === 'd') {
            event.preventDefault();
            //console.log('=== DEBUG INFO ===');
            //console.log('Patient ID:', getPatientId());
            //console.log('Hospital ID:', getHospitalId());
            //console.log('Current Patient Data:', currentPatientData);
            //console.log('Proforma Data:', proformaData);
            //console.log('==================');
        }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
}, [show, currentPatientData, proformaData]);


// Expose refresh function to global scope when modal is shown
useEffect(() => {
    if (show) {
        window.refreshPatientData = refetchPatientData;
        return () => {
            // Cleanup when modal closes
            if (window.refreshPatientData === refetchPatientData) {
                delete window.refreshPatientData;
            }
        };
    }
}, [show]);

useEffect(() => {
    if (show && getPatientId()) {
        //console.log('[ProformaModal] Modal opened - loading Patient Collection data first');
        setCurrentPatientData(null);
        setHasAutoFilled(false);
        setAutoFillError(null);
        
        // Sequential loading: Patient data FIRST, then proforma data
        const loadDataInOrder = async () => {
            try {
                // 1. ALWAYS fetch Patient Collection data first
                await fetchPatientData();
                //console.log('[ProformaModal] Patient Collection data loaded');
                
                // 2. Then fetch only Chief Complaint from DentalChart
                await fetchExistingProformaData();
                //console.log('[ProformaModal] DentalChart proforma data loaded (Chief Complaint only)');
                
                //console.log('[ProformaModal] Data loading completed - Patient Collection takes priority');
            } catch (error) {
              //  console.error('[ProformaModal] Error loading data:', error);
                setAutoFillError('Failed to load patient data');
            }
        };
        
        loadDataInOrder();
    }
}, [show]);// Keep dependencies simple to avoid stale closures// Simplified dependencies to avoid stale closures

// useEffect(() => {

//     const activePatientData = patientData || currentPatientData;

//     if (activePatientData && show && !loadingPatientData && !loadingProforma) {
//         //console.log('[ProformaModal] Patient data available - checking if override needed');
        
//         // Always force patient collection data to override dentalchart data
//         const patientFullName = activePatientData.firstName && activePatientData.lastName 
//             ? `${activePatientData.firstName} ${activePatientData.lastName}`.trim()
//             : activePatientData.fullName || '';
            
//         // Check if current proforma data differs from patient collection
//         const needsOverride = 
//             (patientFullName && patientFullName !== proformaData.fullName) ||
//             (activePatientData.age && activePatientData.age.toString() !== proformaData.age) ||
//             (activePatientData.gender && activePatientData.gender !== proformaData.gender) ||
//             (activePatientData.medicalHistory && activePatientData.medicalHistory !== proformaData.medicalHistory);
        
//         if (needsOverride || !hasAutoFilled) {
//             //console.log('[ProformaModal] Override needed - forcing patient collection data');
//             setTimeout(() => {
//                 forcePatientDataOverride();
//             }, 100);
//         }
//     }
// }, [patientData, currentPatientData, show, loadingPatientData, loadingProforma, proformaData]);

// Reset state when modal closes


useEffect(() => {
    if (!show) {
        setCurrentPatientData(null);
        setHasAutoFilled(false);
        setAutoFillError(null);
        setSaveError(null);
        setSaveSuccess(false);
        setExistingProformaData(null);
    }
}, [show]);


// Auto-fill when patient data becomes available - SIMPLIFIED
useEffect(() => {
    const activePatientData = currentPatientData; // Only use fetched data, not props
    
    if (activePatientData && show && !loadingPatientData && !loadingProforma && !hasAutoFilled) {
        //console.log('[ProformaModal] Auto-filling from Patient Collection only:', activePatientData);
        
        // FORCE override with Patient Collection data
        autoFillFromPatientData(activePatientData);
    }
}, [currentPatientData, show, loadingPatientData, loadingProforma, hasAutoFilled]);

    // API helper functions
    const getAuthHeaders = () => {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Add authentication token if available
        const token = localStorage.getItem('authToken') ||
            sessionStorage.getItem('authToken') ||
            localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    };


    

    const handleApiResponse = async (response, operation = 'operation') => {
        if (!response.ok) {
            let errorMessage = `${operation} failed: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
              //  console.error(`[ProformaModal] API Error:`, errorData);
            } catch (parseError) {
                console.warn('Could not parse error response');
            }
            throw new Error(errorMessage);
        }

        try {
            return await response.json();
        } catch (parseError) {
          //  console.error('Failed to parse JSON response:', parseError);
            throw new Error('Invalid response from server. Please try again.');
        }
    };

    // Fetch patient data directly if not provided via props


// Replace this section in fetchPatientData:
const fetchPatientData = async () => {
    const patientId = getPatientId();
    const hospitalId = getHospitalId();
    
    //console.log('[ProformaModal] Fetching patient data - Patient ID:', patientId);
    //console.log('[ProformaModal] Fetching patient data - Hospital ID:', hospitalId);
    
    if (!patientId) {
        setAutoFillError('Patient ID is required');
        return;
    }

    if (!hospitalId) {
        setAutoFillError('Hospital ID is required'); 
        return;
    }

    try {
        setLoadingPatientData(true);
        setAutoFillError(null);

        // EXACT ROUTE FROM YOUR patientRoutes.js
        const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/patients/${hospitalId}/${patientId}`;
        //console.log('[ProformaModal] Calling EXACT route:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || localStorage.getItem('token')}`,
            }
        });

        //console.log('[ProformaModal] Response status:', response.status);

        if (response.ok) {
            const responseData = await response.json();
            //console.log('[ProformaModal] SUCCESS - Raw response:', responseData);

            // Your getPatientById returns: { success: true, data: patientObject }
            let patientData = null;
            if (responseData.success && responseData.data) {
                patientData = responseData.data;
            } else if (responseData.data) {
                patientData = responseData.data;
            } else {
                patientData = responseData;
            }

            if (patientData) {
                /*console.log('[ProformaModal] Patient found:', {
                    id: patientData._id,
                    firstName: patientData.firstName,
                    lastName: patientData.lastName,
                    age: patientData.age,
                    gender: patientData.gender
                });*/
                
                setCurrentPatientData(patientData);
                setAutoFillError(null);
            } else {
                setAutoFillError('Invalid response structure');
            }
        } else {
            const errorText = await response.text();
           // console.error('[ProformaModal] API Error:', response.status, errorText);
            setAutoFillError(`API Error: ${response.status} - ${errorText}`);
        }
    } catch (error) {
      //  console.error('[ProformaModal] Fetch error:', error);
        setAutoFillError(`Network error: ${error.message}`);
    } finally {
        setLoadingPatientData(false);
    }
};

// Debug network issues
const debugNetworkIssue = async () => {
  //console.log('=== NETWORK DEBUG ===');
  //console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL);
  //console.log('Patient ID:', getPatientId());
  //console.log('Hospital ID:', getHospitalId());
  
  // Test basic connectivity
  try {
    const testResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/patients/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    //console.log('Basic connectivity test:', testResponse.status);
  } catch (testError) {
   // console.error('Basic connectivity failed:', testError);
  }
  
  //console.log('==================');
};

// Call this function in your fetchPatientData before the main request

// Add this new function after fetchPatientData
const refetchPatientData = async () => {
    setCurrentPatientData(null); // Clear cached data
    await fetchPatientData(); // Refetch fresh data
};

    // Fetch existing proforma data from backend
const fetchExistingProformaData = async () => {
    const patientId = getPatientId();
    if (!patientId) return;

    try {
        setLoadingProforma(true);

        const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/dentalchart/${patientId}/proforma`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || localStorage.getItem('token')}`
                }
            }
        );

        if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.data) {
                setExistingProformaData(data.data);
                
                // ONLY auto-fill Chief Complaint from dental chart
                if (data.data.chiefComplaint && (!proformaData.chiefComplaint || proformaData.chiefComplaint.trim() === '')) {
                    onInputChange('chiefComplaint', data.data.chiefComplaint);
                    //console.log('[ProformaModal] Auto-filled Chief Complaint from DentalChart:', data.data.chiefComplaint);
                }
                
                // DO NOT AUTO-FILL: Clinical Features, Investigation Comment, Diagnosis
                // These should remain empty for user input
                //console.log('[ProformaModal] Only Chief Complaint loaded from DentalChart');
            }
        }
    } catch (error) {
       // console.error('[ProformaModal] Error fetching proforma data:', error);
    } finally {
        setLoadingProforma(false);
    }
};
    // Auto-fill proforma fields from patient data
   // Auto-fill proforma fields from patient data
const autoFillFromPatientData = (activePatientData) => {
    if (!activePatientData) return;

    //console.log('[ProformaModal] Auto-filling ONLY from Patient Collection:', activePatientData);

    let hasFilledAnyField = false;

    // FORCE OVERRIDE: Always use Patient Collection data for basic fields
    // Full Name - ALWAYS from Patient Collection
    let fullName = '';
    if (activePatientData.firstName || activePatientData.lastName) {
        fullName = `${activePatientData.firstName || ''} ${activePatientData.lastName || ''}`.trim();
    } else if (activePatientData.fullName) {
        fullName = activePatientData.fullName.trim();
    }
    
    if (fullName) {
        onInputChange('fullName', fullName);
        hasFilledAnyField = true;
        //console.log('[ProformaModal] FORCE Auto-filled fullName from Patient:', fullName);
    }

    // Age - ALWAYS from Patient Collection
    if (activePatientData.age !== undefined && activePatientData.age !== null && activePatientData.age !== '') {
        const ageString = activePatientData.age.toString().trim();
        if (ageString !== '0') {
            onInputChange('age', ageString);
            hasFilledAnyField = true;
            //console.log('[ProformaModal] FORCE Auto-filled age from Patient:', ageString);
        }
    }

    // Gender - ALWAYS from Patient Collection
    if (activePatientData.gender) {
        let normalizedGender = activePatientData.gender.toString().toLowerCase().trim();
        
        const genderMapping = {
            'm': 'Male',
            'male': 'Male',
            'f': 'Female', 
            'female': 'Female',
            'o': 'Other',
            'other': 'Other'
        };
        
        const mappedGender = genderMapping[normalizedGender] || 
                           (activePatientData.gender.charAt(0).toUpperCase() + 
                            activePatientData.gender.slice(1).toLowerCase());
        
        if (['Male', 'Female', 'Other'].includes(mappedGender)) {
            onInputChange('gender', mappedGender);
            hasFilledAnyField = true;
            //console.log('[ProformaModal] FORCE Auto-filled gender from Patient:', mappedGender);
        }
    }

    // Medical History - ALWAYS from Patient Collection
    if (activePatientData.medicalHistory && activePatientData.medicalHistory.toString().trim() !== '') {
        onInputChange('medicalHistory', activePatientData.medicalHistory.toString().trim());
        hasFilledAnyField = true;
        //console.log('[ProformaModal] FORCE Auto-filled medicalHistory from Patient:', activePatientData.medicalHistory);
    }

    // DO NOT AUTO-FILL: Clinical Features, Investigation Comment, Diagnosis
    // These should remain empty for user input

    if (hasFilledAnyField) {
        setHasAutoFilled(true);
        //console.log('[ProformaModal] Patient Collection auto-fill completed successfully');
    }
};
// Force override proforma with patient collection data
const forcePatientDataOverride = () => {
    const activePatientData = patientData || currentPatientData;
    
    if (!activePatientData) {
        console.warn('[ProformaModal] No patient data available for override');
        return;
    }
    
    //console.log('[ProformaModal] Force overriding proforma with patient collection data:', activePatientData);
    
    // Build full name from patient collection
    const fullNameFromPatient = activePatientData.firstName && activePatientData.lastName 
        ? `${activePatientData.firstName} ${activePatientData.lastName}`.trim()
        : activePatientData.fullName || '';
    
    // Age from patient collection 
    const ageFromPatient = activePatientData.age ? activePatientData.age.toString() : '';
    
    // Gender from patient collection
    const genderFromPatient = activePatientData.gender || '';
    
    // Medical history from patient collection
    const medicalHistoryFromPatient = activePatientData.medicalHistory || '';
    
    /*console.log('[ProformaModal] Overriding with patient data:', {
        fullName: fullNameFromPatient,
        age: ageFromPatient, 
        gender: genderFromPatient,
        medicalHistory: medicalHistoryFromPatient
    });*/
    
    // Force update the form fields with patient collection data
    if (fullNameFromPatient && fullNameFromPatient !== proformaData.fullName) {
        onInputChange('fullName', fullNameFromPatient);
    }
    
    if (ageFromPatient && ageFromPatient !== proformaData.age) {
        onInputChange('age', ageFromPatient);
    }
    
    if (genderFromPatient && genderFromPatient !== proformaData.gender) {
        // Normalize gender values to match dropdown options
        const normalizedGender = genderFromPatient.toLowerCase() === 'male' ? 'Male' :
                                 genderFromPatient.toLowerCase() === 'female' ? 'Female' :
                                 genderFromPatient.toLowerCase() === 'other' ? 'Other' : 
                                 genderFromPatient;
        
        if (['Male', 'Female', 'Other'].includes(normalizedGender)) {
            onInputChange('gender', normalizedGender);
        }
    }
    
    if (medicalHistoryFromPatient && medicalHistoryFromPatient !== proformaData.medicalHistory) {
        onInputChange('medicalHistory', medicalHistoryFromPatient);
    }
    
    setHasAutoFilled(true);
    //console.log('[ProformaModal] Patient collection data override completed');
};




// Force refresh patient data and re-auto-fill
const forceRefreshAndAutoFill = async () => {
    //console.log('[ProformaModal] Force refresh triggered');
    
    // Clear all cached data
    setCurrentPatientData(null);
    setHasAutoFilled(false);
    setAutoFillError(null);
    
    try {
        // Fetch fresh data
        await fetchPatientData();
        
        // Wait a moment for state to update, then auto-fill
        setTimeout(() => {
            const freshPatientData = currentPatientData;
            if (freshPatientData) {
                //console.log('[ProformaModal] Auto-filling with fresh data:', freshPatientData);
                autoFillFromPatientData(freshPatientData);
            }
        }, 100);
    } catch (error) {
      //  console.error('[ProformaModal] Force refresh failed:', error);
        setAutoFillError('Failed to refresh patient data');
    }
};


    // Manual auto-fill button handler
    const handleAutoFillFromPatient = () => {
        const activePatientData = patientData || currentPatientData;
        if (activePatientData) {
            setHasAutoFilled(false);
            autoFillFromPatientData(activePatientData);
        }
    };

    // CRITICAL FIX: Enhanced save function with detailed logging for investigationComment
    const saveProformaData = async () => {
        const patientId = getPatientId();
        if (!patientId) {
            setSaveError('Patient ID is required');
            return false;
        }

        try {
            setSaving(true);
            setSaveError(null);
            setSaveSuccess(false);

            //console.log(`[ProformaModal] Saving proforma for patient: ${patientId}`);
            //console.log(`[ProformaModal] Current proformaData object:`, proformaData);
            //console.log(`[ProformaModal] Investigation comment from proformaData:`, proformaData.investigationComment);
            //console.log(`[ProformaModal] Investigation comment type:`, typeof proformaData.investigationComment);
            //console.log(`[ProformaModal] Investigation comment length:`, (proformaData.investigationComment || '').length);

            // CRITICAL: Prepare proforma data with explicit handling of investigationComment
            const sanitizedProformaData = {
                fullName: (proformaData.fullName || '').toString().trim(),
                age: (proformaData.age || '').toString().trim(),
                medicalHistory: (proformaData.medicalHistory || '').toString().trim(),
                chiefComplaint: (proformaData.chiefComplaint || '').toString().trim(),
                clinicalFeatures: (proformaData.clinicalFeatures || '').toString().trim(),
                // CRITICAL FIX: Explicit handling with detailed logging
                investigationComment: (proformaData.investigationComment || '').toString().trim(),
                diagnosis: (proformaData.diagnosis || '').toString().trim()
            };

            // Log sanitized data
            //console.log(`[ProformaModal] Sanitized proforma data:`, sanitizedProformaData);
            //console.log(`[ProformaModal] Sanitized investigation comment:`, sanitizedProformaData.investigationComment);
            //console.log(`[ProformaModal] Sanitized investigation comment length:`, sanitizedProformaData.investigationComment.length);

            // Only include gender if it has a valid value
            const genderValue = (proformaData.gender || '').toString().trim();
            if (genderValue && ['Male', 'Female', 'Other'].includes(genderValue)) {
                sanitizedProformaData.gender = genderValue;
            }

            const requestBody = {
                proformaData: sanitizedProformaData,
                hospitalId: getHospitalId()
            };

            //console.log(`[ProformaModal] Request body to be sent:`, JSON.stringify(requestBody, null, 2));
            //console.log(`[ProformaModal] Request body investigation comment:`, requestBody.proformaData.investigationComment);

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/dentalchart/${patientId}/proforma`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(requestBody)
                }
            );

            const data = await handleApiResponse(response, 'Save proforma');

            if (data.success) {
                //console.log('[ProformaModal] Proforma saved successfully:', data);
                //console.log('[ProformaModal] Returned investigation comment:', data.data?.investigationComment);
                setSaveSuccess(true);

                // Update existing proforma data
                setExistingProformaData(data.data);

                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSaveSuccess(false);
                }, 3000);

                return true;
            } else {
                throw new Error(data.message || 'Failed to save proforma');
            }
        } catch (error) {
          //  console.error('[ProformaModal] Error saving proforma:', error);
            if (error.message.includes('403') || error.message.includes('Authorization')) {
                setSaveError('Authentication required. Please log in again.');
            } else {
                setSaveError(error.message || 'Failed to save proforma. Please try again.');
            }
            return false;
        } finally {
            setSaving(false);
        }
    };

    // Handle manual save
    const handleSave = async () => {
        const saved = await saveProformaData();
        return saved;
    };

    // Handle next with auto-save and navigation
    const handleNext = async () => {
  const saved = await saveProformaData();
  if (saved) {
    //console.log('[ProformaModal] Proforma saved successfully, navigating to medication table...');
    onClose();
    navigate(`/medications/${getPatientId()}`, { 
      state: { 
        mode: 'fromProforma',
        hospitalId: getHospitalId() 
      }
    });
  }
};


    // Clear error message
    const clearError = () => {
        setSaveError(null);
        setAutoFillError(null);
    };

    



    // Retry fetching patient data
const retryFetchPatientData = async () => {
    setAutoFillError(null);
    setCurrentPatientData(null);
    await fetchPatientData();
};

    // Validate required fields - no fields are required now
    const isFormValid = () => {
        return true;
    };

    // CRITICAL FIX: Enhanced input change handler with logging
   // CRITICAL FIX: Enhanced input change handler with better logging and no restrictions
const handleInputChange = (fieldName, value) => {
    //console.log(`[ProformaModal] Input change - Field: ${fieldName}, Value:`, value);
    //console.log(`[ProformaModal] Input change - Value type:`, typeof value);
    //console.log(`[ProformaModal] Input change - Value length:`, (value || '').length);
    
    // Ensure we're not accidentally restricting input
    const cleanValue = typeof value === 'string' ? value : String(value || '');
    
    // Call the parent's onInputChange function with clean value
    onInputChange(fieldName, cleanValue);
};

    if (!show) return null;

    const activePatientData = patientData || currentPatientData;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-500">
                        Proforma - {proformaData.fullName || activePatientData?.firstName || 'Patient'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Loading States */}
                    {(loadingProforma || loadingPatientData) && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <RefreshCw size={16} className="animate-spin text-blue-600" />
                                <p className="text-blue-600 text-sm">
                                    {loadingProforma && 'Loading existing proforma data...'}
                                    {loadingPatientData && 'Loading patient information...'}
                                </p>
                            </div>
                        </div>
                    )}

       
    
{!activePatientData && !loadingPatientData && show && (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <AlertCircle size={16} className="text-yellow-600" />
                <div>
                    <p className="text-yellow-700 text-sm font-medium">Patient data not found</p>
                    <p className="text-yellow-600 text-xs">
                        Please enter patient details manually or click retry.
                    </p>
                </div>
            </div>
            <button
                onClick={retryFetchPatientData}
                className="text-yellow-700 hover:text-yellow-800 text-sm font-medium px-2 py-1 rounded bg-yellow-100 hover:bg-yellow-200 transition-colors cursor-pointer"
                disabled={loadingPatientData}
            >
                {loadingPatientData ? 'Loading...' : 'Retry'}
            </button>
        </div>
    </div>
)}

                    {/* Error Messages */}
                    {autoFillError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-red-700 text-sm">{autoFillError}</p>
                                <button
                                    onClick={clearError}
                                    className="text-red-700 hover:text-red-800 text-sm font-medium cursor-pointer"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {saveSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2">
                                <CheckCircle size={16} className="text-green-600" />
                                <p className="text-green-600 text-sm">Proforma saved successfully!</p>
                            </div>
                        </div>
                    )}

                    {/* Save Error */}
                    {saveError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-red-600 text-sm">{saveError}</p>
                                <button
                                    onClick={clearError}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium cursor-pointer"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Debug Information for Investigation Comment */}
                    {/* {process.env.NODE_ENV === 'development' && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Debug Info - Investigation Comment:</h4>
                            <div className="text-xs text-gray-600 space-y-1">
                                <p>Value: "{proformaData.investigationComment || 'undefined'}"</p>
                                <p>Type: {typeof proformaData.investigationComment}</p>
                                <p>Length: {(proformaData.investigationComment || '').length}</p>
                                <p>Is Empty: {(!proformaData.investigationComment || proformaData.investigationComment.trim() === '') ? 'Yes' : 'No'}</p>
                            </div>
                        </div>
                    )} */}

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={proformaData.fullName || ''}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 text-gray-500"
                                placeholder="Enter patient's full name"
                                disabled 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Age
                                </label>
                                <input
                                    type="text"
                                    value={proformaData.age || ''}
                                    onChange={(e) => handleInputChange('age', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500"
                                    placeholder="Age"
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Gender
                                </label>
                                <select
                                    value={proformaData.gender || ''}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 text-gray-500"
                                    disabled
                                    readOnly={true} // Make it read-only
                                >

                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                    
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Medical History
                            </label>
                            <textarea
                                value={proformaData.medicalHistory || ''}
                                onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
                                placeholder="Enter relevant medical history, allergies, medications..."
                                disabled={loadingProforma || loadingPatientData}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chief Complaint</label>
                            <textarea
                                value={proformaData.chiefComplaint || ''}
                                onChange={(e) => handleInputChange('chiefComplaint', e.target.value)}
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
                                placeholder="Patient's main complaint and symptoms..."
                                disabled={loadingProforma || loadingPatientData}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Features</label>
                            <textarea
                                value={proformaData.clinicalFeatures || ''}
                                onChange={(e) => handleInputChange('clinicalFeatures', e.target.value)}
                                rows="4"
                                placeholder="Enter clinical observations and findings..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
                                disabled={loadingProforma || loadingPatientData}
                            />
                        </div>
                    </div>

                    <div className="border border-gray-200 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Investigation</h3>
                        <PhotoManagement
                            photos={photos}
                            uploading={uploading}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            filterCategory={filterCategory}
                            setFilterCategory={setFilterCategory}
                            onFileSelect={onFileSelect}
                            onRemovePhoto={onRemovePhoto}
                            onViewPhoto={onViewPhoto}
                            onEditPhoto={onEditPhoto}
                            getPatientId={getPatientId}
                            getHospitalId={getHospitalId}
                        />

                        {/* CRITICAL FIX: Investigation Comment textarea with enhanced handling */}
                        <div className="mt-4">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Investigation Comment
                                {/* {process.env.NODE_ENV === 'development' && (
                                    <span className="text-xs text-gray-500 ml-2">
                                        (Length: {(proformaData.investigationComment || '').length})
                                    </span>
                                )} */}
                            </label>
                            <textarea
                                value={proformaData.investigationComment || ''}
                                onChange={(e) => {
                                    //console.log('[ProformaModal] Investigation comment textarea onChange:', e.target.value);
                                    handleInputChange('investigationComment', e.target.value);
                                }}
                                rows="4"
                                placeholder="Enter investigation details and comments..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
                                disabled={loadingProforma || loadingPatientData}
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnosis</h3>
                        <textarea
                            value={proformaData.diagnosis || ''}
                            onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                            rows="6"
                            placeholder="Enter diagnosis details, treatment plan, and recommendations..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
                            disabled={loadingProforma || loadingPatientData}
                        />
                    </div>
                </div>

               <div className="flex justify-end px-6 py-4 border-t border-gray-200">
    <div className="flex space-x-3">
        <button
            onClick={onClose}
            disabled={saving || loadingProforma || loadingPatientData}
            className={`px-6 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium cursor-pointer flex items-center space-x-2 ${saving || loadingProforma || loadingPatientData ? 'opacity-50 cursor-not-allowed' : ''
                }`}
        >
            <span>Close</span>
        </button>

        <button
            onClick={handleNext}
            disabled={saving || loadingProforma || loadingPatientData || !isFormValid()}
            className={`px-6 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0284C7] transition-colors font-medium cursor-pointer ${saving || loadingProforma || loadingPatientData || !isFormValid() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
        >
            {saving ? 'Saving...' : 'Next'}
        </button>
    </div>
</div>
            </div>
        </div>
    );
};

export default ProformaModal;





// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { X, Save, RefreshCw, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
// import PhotoManagement from './PhotoManagement';

// const ProformaModal = ({
//     show,
//     proformaData,
//     onInputChange,
//     onClose,
//     onNext,
//     photos,
//     uploading,
//     selectedCategory,
//     setSelectedCategory,
//     viewMode,
//     setViewMode,
//     searchTerm,
//     setSearchTerm,
//     filterCategory,
//     setFilterCategory,
//     onFileSelect,
//     onRemovePhoto,
//     onViewPhoto,
//     onEditPhoto,
//     getPatientId,
//     getHospitalId,
//     patientData // Use this prop directly instead of fetching
// }) => {
//     const navigate = useNavigate();

//     // Simplified state - no complex data fetching
//     const [saving, setSaving] = useState(false);
//     const [saveError, setSaveError] = useState(null);
//     const [saveSuccess, setSaveSuccess] = useState(false);
//     const [hasAutoFilled, setHasAutoFilled] = useState(false);

//     // Simple auto-fill on modal open
//     useEffect(() => {
//         if (show && patientData && !hasAutoFilled) {
//             //console.log('[ProformaModal] Auto-filling with patient data:', patientData);
            
//             // Build full name
//             const fullName = patientData.firstName && patientData.lastName 
//                 ? `${patientData.firstName} ${patientData.lastName}`.trim()
//                 : patientData.fullName || patientData.name || '';
            
//             // Auto-fill only empty fields
//             if (fullName && !proformaData.fullName?.trim()) {
//                 onInputChange('fullName', fullName);
//             }
            
//             if (patientData.age && !proformaData.age?.trim()) {
//                 onInputChange('age', patientData.age.toString());
//             }
            
//             if (patientData.gender && !proformaData.gender?.trim()) {
//                 const gender = patientData.gender.toLowerCase();
//                 const normalizedGender = gender === 'male' ? 'Male' : 
//                                        gender === 'female' ? 'Female' : 'Other';
//                 onInputChange('gender', normalizedGender);
//             }
            
//             if (patientData.medicalHistory && !proformaData.medicalHistory?.trim()) {
//                 onInputChange('medicalHistory', patientData.medicalHistory);
//             }
            
//             setHasAutoFilled(true);
//         }
//     }, [show, patientData, hasAutoFilled, proformaData, onInputChange]);

//     // Reset on close
//     useEffect(() => {
//         if (!show) {
//             setHasAutoFilled(false);
//             setSaveError(null);
//             setSaveSuccess(false);
//         }
//     }, [show]);

//     // API helper
//     const getAuthHeaders = () => ({
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || localStorage.getItem('token')}`
//     });

//     // Simplified save function
//     const saveProformaData = async () => {
//         const patientId = getPatientId();
//         if (!patientId) {
//             setSaveError('Patient ID is required');
//             return false;
//         }

//         try {
//             setSaving(true);
//             setSaveError(null);

//             //console.log('[ProformaModal] Saving proforma for patient:', patientId);
//             //console.log('[ProformaModal] Data to save:', proformaData);

//             const sanitizedData = {
//                 fullName: (proformaData.fullName || '').trim(),
//                 age: (proformaData.age || '').trim(),
//                 medicalHistory: (proformaData.medicalHistory || '').trim(),
//                 chiefComplaint: (proformaData.chiefComplaint || '').trim(),
//                 clinicalFeatures: (proformaData.clinicalFeatures || '').trim(),
//                 investigationComment: (proformaData.investigationComment || '').trim(),
//                 diagnosis: (proformaData.diagnosis || '').trim()
//             };

//             // Only include gender if valid
//             if (proformaData.gender && ['Male', 'Female', 'Other'].includes(proformaData.gender)) {
//                 sanitizedData.gender = proformaData.gender;
//             }

//             const requestBody = {
//                 proformaData: sanitizedData,
//                 hospitalId: getHospitalId()
//             };

//             const response = await fetch(
//                 `${import.meta.env.VITE_BACKEND_URL}/api/dentalchart/${patientId}/proforma`,
//                 {
//                     method: 'POST',
//                     headers: getAuthHeaders(),
//                     body: JSON.stringify(requestBody)
//                 }
//             );

//             if (!response.ok) {
//                 const errorText = await response.text();
//                 throw new Error(`Save failed: ${response.status} - ${errorText}`);
//             }

//             const data = await response.json();
            
//             if (data.success) {
//                 //console.log('[ProformaModal] Save successful:', data);
//                 setSaveSuccess(true);
//                 setTimeout(() => setSaveSuccess(false), 3000);
//                 return true;
//             } else {
//                 throw new Error(data.message || 'Save failed');
//             }
//         } catch (error) {
//             console.error('[ProformaModal] Save error:', error);
//             setSaveError(error.message || 'Failed to save proforma');
//             return false;
//         } finally {
//             setSaving(false);
//         }
//     };

//     const handleNext = async () => {
//         const saved = await saveProformaData();
//         if (saved) {
//             //console.log('[ProformaModal] Navigating to treatment encounters');
//             onClose();
//             navigate(`/treatmentencounters/${getPatientId()}`);
//             if (onNext) onNext();
//         }
//     };

//     if (!show) return null;

//     return (
//         <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col">
//                 <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
//                     <h2 className="text-xl font-bold text-gray-500">
//                         Proforma - {proformaData.fullName || patientData?.firstName || 'Patient'}
//                     </h2>
//                     <button
//                         onClick={onClose}
//                         className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
//                     >
//                         <X size={24} />
//                     </button>
//                 </div>

//                 <div className="p-6 overflow-y-auto flex-1 space-y-6">
//                     {/* Success Message */}
//                     {saveSuccess && (
//                         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                             <div className="flex items-center space-x-2">
//                                 <CheckCircle size={16} className="text-green-600" />
//                                 <p className="text-green-600 text-sm">Proforma saved successfully!</p>
//                             </div>
//                         </div>
//                     )}

//                     {/* Error Message */}
//                     {saveError && (
//                         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                             <div className="flex items-center justify-between">
//                                 <p className="text-red-600 text-sm">{saveError}</p>
//                                 <button
//                                     onClick={() => setSaveError(null)}
//                                     className="text-red-600 hover:text-red-800 text-sm font-medium"
//                                 >
//                                     Dismiss
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {/* Patient Info Notice */}
//                     {patientData && (
//                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                             <div className="flex items-center space-x-2">
//                                 <UserCheck size={16} className="text-blue-600" />
//                                 <p className="text-blue-600 text-sm">
//                                     Auto-filled from patient: {patientData.firstName} {patientData.lastName}
//                                 </p>
//                             </div>
//                         </div>
//                     )}

//                     {/* Form Fields */}
//                     <div className="space-y-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Full Name
//                             </label>
//                             <input
//                                 type="text"
//                                 value={proformaData.fullName || ''}
//                                 onChange={(e) => onInputChange('fullName', e.target.value)}
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Enter patient's full name"
//                             />
//                         </div>

//                         <div className="grid grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Age
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={proformaData.age || ''}
//                                     onChange={(e) => onInputChange('age', e.target.value)}
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="Age"
//                                 />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Gender
//                                 </label>
//                                 <select
//                                     value={proformaData.gender || ''}
//                                     onChange={(e) => onInputChange('gender', e.target.value)}
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 >
//                                     <option value="">Select Gender</option>
//                                     <option value="Male">Male</option>
//                                     <option value="Female">Female</option>
//                                     <option value="Other">Other</option>
//                                 </select>
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Medical History
//                             </label>
//                             <textarea
//                                 value={proformaData.medicalHistory || ''}
//                                 onChange={(e) => onInputChange('medicalHistory', e.target.value)}
//                                 rows="3"
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                                 placeholder="Enter relevant medical history, allergies, medications..."
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Chief Complaint
//                             </label>
//                             <textarea
//                                 value={proformaData.chiefComplaint || ''}
//                                 onChange={(e) => onInputChange('chiefComplaint', e.target.value)}
//                                 rows="3"
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                                 placeholder="Patient's main complaint and symptoms..."
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Clinical Features
//                             </label>
//                             <textarea
//                                 value={proformaData.clinicalFeatures || ''}
//                                 onChange={(e) => onInputChange('clinicalFeatures', e.target.value)}
//                                 rows="4"
//                                 placeholder="Enter clinical observations and findings..."
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                             />
//                         </div>
//                     </div>

//                     {/* Investigation Section */}
//                     <div className="border border-gray-200 p-4 rounded-lg">
//                         <h3 className="text-lg font-semibold text-gray-900 mb-4">Investigation</h3>
//                         <PhotoManagement
//                             photos={photos}
//                             uploading={uploading}
//                             selectedCategory={selectedCategory}
//                             setSelectedCategory={setSelectedCategory}
//                             viewMode={viewMode}
//                             setViewMode={setViewMode}
//                             searchTerm={searchTerm}
//                             setSearchTerm={setSearchTerm}
//                             filterCategory={filterCategory}
//                             setFilterCategory={setFilterCategory}
//                             onFileSelect={onFileSelect}
//                             onRemovePhoto={onRemovePhoto}
//                             onViewPhoto={onViewPhoto}
//                             onEditPhoto={onEditPhoto}
//                             getPatientId={getPatientId}
//                             getHospitalId={getHospitalId}
//                         />

//                         <div className="mt-4">
//                             <label className="block text-sm font-semibold text-gray-900 mb-2">
//                                 Investigation Comment
//                             </label>
//                             <textarea
//                                 value={proformaData.investigationComment || ''}
//                                 onChange={(e) => onInputChange('investigationComment', e.target.value)}
//                                 rows="4"
//                                 placeholder="Enter investigation details and comments..."
//                                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                             />
//                         </div>
//                     </div>

//                     {/* Diagnosis Section */}
//                     <div className="border-t border-gray-200 pt-6">
//                         <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnosis</h3>
//                         <textarea
//                             value={proformaData.diagnosis || ''}
//                             onChange={(e) => onInputChange('diagnosis', e.target.value)}
//                             rows="6"
//                             placeholder="Enter diagnosis details, treatment plan, and recommendations..."
//                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                         />
//                     </div>
//                 </div>

//                 {/* Footer */}
//                 <div className="flex justify-between px-6 py-4 border-t border-gray-200">
//                     <button
//                         onClick={onClose}
//                         className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium cursor-pointer"
//                     >
//                         Cancel
//                     </button>

//                     <div className="flex space-x-3">
//                         <button
//                             onClick={onClose}
//                             disabled={saving}
//                             className={`px-6 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium cursor-pointer flex items-center space-x-2 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
//                         >
//                             <span>Close</span>
//                         </button>

//                         <button
//                             onClick={handleNext}
//                             disabled={saving}
//                             className={`px-6 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-[#0284C7] transition-colors font-medium cursor-pointer ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
//                         >
//                             {saving ? 'Saving...' : 'Next'}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ProformaModal;