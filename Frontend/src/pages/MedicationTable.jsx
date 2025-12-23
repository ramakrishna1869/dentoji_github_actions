import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';

const MedicationTable = () => {
  // Router hooks
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [medications, setMedications] = useState([]);
  const [originalMedications, setOriginalMedications] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [hospitalId, setHospitalId] = useState(null);

  // Get mode from location state or URL params
  const mode = location.state?.mode || 'fromCard';

  // Utility functions
  const getHospitalId = () => {
    const sources = [
      location.state?.hospitalId,
      localStorage.getItem('hospitalId'),
      sessionStorage.getItem('hospitalId'),
      'default-hospital'
    ];
    return sources.find(Boolean);
  };

  const getApiHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getStoredToken()}`
  });

  const getStoredToken = () => {
    try {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    } catch {
      return null;
    }
  };

  const handleApiError = async (response) => {
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `HTTP ${response.status}`);
    }
    return response.json();
  };

  // Generate unique ID for new medications
  const generateUniqueId = () => {
    return `medication_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // API functions
  const fetchExistingMedications = async () => {
    if (!patientId || !hospitalId) {
      //console.log('Missing patientId or hospitalId for fetching medications');
      return [];
    }

    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/medications/patient/${patientId}?hospitalId=${hospitalId}`;
      //console.log('Fetching from URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getApiHeaders()
      });

      //console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 404) {
          //console.log('No medications found (404)');
          return [];
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      //console.log('Backend response:', data);
      
      if (data?.success && data?.medications) {
        const allMedications = [];
        const prescriptions = data.medications;
        //console.log('Processing prescriptions:', prescriptions.length);
        
        prescriptions.forEach((prescription, prescIndex) => {
          if (prescription?.medications && Array.isArray(prescription.medications)) {
            prescription.medications.forEach((medication, medIndex) => {
              if (medication.medicationName && medication.medicationName.trim()) {
                allMedications.push({
                  id: `existing_${prescription._id}_${medIndex}`,
                  medicationName: medication.medicationName,
                  dosage: medication.dosage || '',
                  frequency: medication.frequency || 'Once Daily',
                  when: medication.instruction || 'After Food',
                  duration: medication.duration || '',
                  prescriptionId: prescription._id,
                  prescriptionNumber: prescription.prescriptionNumber,
                  isNew: false,
                  isExisting: true
                });
              }
            });
          }
        });
        
        //console.log('Processed medications:', allMedications);
        return allMedications;
      }
      
      return [];
    } catch (error) {
    //  console.error('Error fetching medications:', error);
      return [];
    }
  };

  const initializeMedications = async () => {
    if (!patientId || !hospitalId) return;

    try {
      setLoading(true);
      //console.log('Initializing medications for:', { patientId, hospitalId });
      
      const existingMedications = await fetchExistingMedications();
      //console.log('Fetched existing medications:', existingMedications);
      
      setMedications(existingMedications);
      setOriginalMedications([...existingMedications]);
      setError(null);
      
    } catch (error) {
     // console.error('Error initializing medications:', error);
      setError('Failed to load medications');
      setMedications([]);
      setOriginalMedications([]);
    } finally {
      setLoading(false);
    }
  };

  const getEmptyMedication = () => ({
    id: generateUniqueId(),
    medicationName: '',
    dosage: '',
    frequency: 'Once Daily',
    when: 'After Food',
    duration: '',
    isNew: true,
    isExisting: false
  });

  // Event handlers
  const saveMedications = async () => {
    if (!patientId || !hospitalId) {
      setError('Missing required information');
      toast.error('Missing required information');
      return false;
    }

    try {
      setSaving(true);
      
      // Only save NEW medications that have at least a medication name
      const newMedications = medications
        .filter(medication => {
          // Must be new AND have at least medicine name
          return medication.isNew && medication.medicationName && medication.medicationName.trim();
        })
        .map(medication => ({
          medicationName: medication.medicationName?.trim() || '',
          dosage: medication.dosage?.trim() || '',
          frequency: medication.frequency || 'Once Daily',
          duration: medication.duration?.trim() || '',
          instruction: medication.when || 'After Food'
        }));

      // If no new medications to save, just navigate without error
      if (newMedications.length === 0) {
        //console.log('No new medications to save, navigating...');
        return true; // Return true to allow navigation
      }

      //console.log('Saving NEW medications only:', newMedications);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/medications/patient/${patientId}`,
        {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify({
            hospitalId,
            appointmentDate: new Date().toISOString(),
            diagnosis: 'General prescription',
            medications: newMedications,
            prescribedBy: 'Doctor'
          })
        }
      );

      const data = await handleApiError(response);
      
      if (data.success) {
        toast.success(`${newMedications.length} new medication(s) saved successfully!`);
        return true;
      } else {
        toast.error(data.message || 'Failed to save medications');
        return false;
      }
    } catch (err) {
     // console.error('Save error:', err);
      toast.error('Failed to save medications. Please try again.');
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (mode === 'fromProforma') {
      navigate(`/treatmentencounters/${patientId}`);
    } else {
      const backHospitalId = hospitalId || location.state?.hospitalId || 'default-hospital';
      const currentPatientData = location.state?.patient || location.state?.patientData || null;
      
      navigate(backHospitalId !== 'default-hospital' 
        ? `/patientdata/${backHospitalId}/${patientId}` 
        : -1, {
        state: {
          patient: currentPatientData,
          hospitalId: backHospitalId,
          patientId: patientId,
          refresh: ['medications']
        }
      });
    }
  };

  const handleAddRow = () => {
    const newMedication = getEmptyMedication();
    setMedications(prev => [...prev, newMedication]);
    setIsEditMode(true);
  };

const handleDeleteRow = async (id) => {
  const medication = medications.find(m => m.id === id);
  
  // If it's a new medication (not saved to backend yet), just remove from state
  if (medication.isNew) {
    setMedications(prev => {
      const filtered = prev.filter(m => m.id !== id);
      //console.log('After delete:', filtered);
      toast.info('Medication row deleted');
      return filtered;
    });
    return;
  }
  
  // If it's an existing medication, call the backend to delete it
  if (medication.prescriptionId) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/medications/${medication.prescriptionId}`,
        {
          method: 'DELETE',
          headers: getApiHeaders()
        }
      );
      
      const data = await handleApiError(response);
      
      if (data.success) {
        setMedications(prev => prev.filter(m => m.id !== id));
        setOriginalMedications(prev => prev.filter(m => m.id !== id));
        toast.success('Medication deleted successfully');
      }
    } catch (error) {
     // console.error('Error deleting medication:', error);
      toast.error('Failed to delete medication');
    }
  }
};
  const handleInputChange = (id, field, value) => {
    setMedications(prev =>
      prev.map(medication => {
        if (medication.id === id) {
          return { ...medication, [field]: value };
        }
        return medication;
      })
    );
  };

  const handleSave = async () => {
    const success = await saveMedications();
    if (success) {
      setError(null);
      setIsEditMode(false);
      
      if (mode === 'fromProforma') {
        navigate(`/treatmentencounters/${patientId}`);
      } else {
        const backHospitalId = hospitalId || location.state?.hospitalId || 'default-hospital';
        navigate(backHospitalId !== 'default-hospital' 
          ? `/patientdata/${backHospitalId}/${patientId}` 
          : -1, {
          state: {
            patient: location.state?.patient,
            hospitalId: backHospitalId,
            patientId: patientId,
            refresh: ['medications']
          }
        });
      }
    }
  };
 
  const handleCancel = () => {
    setMedications([...originalMedications]);
    setIsEditMode(false);
    setError(null);
    toast.info('Changes cancelled');
    
    // Navigate back to where we came from
    if (mode === 'fromProforma') {
      navigate(`/treatmentencounters/${patientId}`);
    } else {
      const backHospitalId = hospitalId || location.state?.hospitalId || 'default-hospital';
      const currentPatientData = location.state?.patient || location.state?.patientData || null;
      
      navigate(backHospitalId !== 'default-hospital' 
        ? `/patientdata/${backHospitalId}/${patientId}` 
        : -1, {
        state: {
          patient: currentPatientData,
          hospitalId: backHospitalId,
          patientId: patientId
        }
      });
    }
  };

  // Effects
  useEffect(() => {
    setHospitalId(getHospitalId());
  }, [location]);

  useEffect(() => {
    if (patientId && hospitalId) {
      initializeMedications();
    }
  }, [patientId, hospitalId]);

  useEffect(() => {
    const refresh = location.state?.refresh;
    if (refresh === 'medications' && patientId && hospitalId) {
      initializeMedications();
    }
  }, [location.state?.refresh, patientId, hospitalId]);

  // Render helpers
  const renderTableCell = (medication, field, index) => {
    const commonClasses = "border border-gray-300 py-3 px-3 align-top";
    
    if (field === 'serialNo') {
      return (
        <td className={`${commonClasses} bg-gray-50 text-center font-medium w-16`}>
          {index + 1}
        </td>
      );
    }

    if (field === 'medicationName') {
      return (
        <td className={`${commonClasses} min-w-60`}>
          <input
            type="text"
            value={medication.medicationName}
            onChange={(e) => handleInputChange(medication.id, 'medicationName', e.target.value)}
            className="w-full py-2 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded border border-gray-300"
            placeholder="Medicine name"
            disabled={!isEditMode}
          />
        </td>
      );
    }

    if (field === 'dosage') {
      return (
        <td className={`${commonClasses} w-32`}>
          <input
            type="text"
            value={medication.dosage}
            onChange={(e) => handleInputChange(medication.id, 'dosage', e.target.value)}
            className="w-full py-2 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded border border-gray-300"
            placeholder="Dosage"
            disabled={!isEditMode}
          />
        </td>
      );
    }

    if (field === 'frequency') {
      return (
        <td className={`${commonClasses} w-40`}>
          <select
            value={medication.frequency}
            onChange={(e) => handleInputChange(medication.id, 'frequency', e.target.value)}
            className="w-full py-2 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded border border-gray-300"
            disabled={!isEditMode}
          >
            <option value="Once Daily">Once Daily</option>
            <option value="Twice Daily">Twice Daily</option>
            <option value="Three times Daily">Three times Daily</option>
            <option value="As needed">As needed</option>
          </select>
        </td>
      );
    }

    if (field === 'when') {
      return (
        <td className={`${commonClasses} w-36`}>
          <select
            value={medication.when}
            onChange={(e) => handleInputChange(medication.id, 'when', e.target.value)}
            className="w-full py-2 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded border border-gray-300"
            disabled={!isEditMode}
          >
            <option value="After Food">After Food</option>
            <option value="Before Food">Before Food</option>
            <option value="With Food">With Food</option>
          </select>
        </td>
      );
    }

    if (field === 'duration') {
      return (
        <td className={`${commonClasses} w-32`}>
          <input
            type="text"
            value={medication.duration}
            onChange={(e) => handleInputChange(medication.id, 'duration', e.target.value)}
            className="w-full py-2 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded border border-gray-300"
            placeholder="Duration"
            disabled={!isEditMode}
          />
        </td>
      );
    }

    if (field === 'actions') {
      return (
        <td className={`${commonClasses} w-20 text-center`}>
          {isEditMode && (
            <button
              onClick={() => handleDeleteRow(medication.id)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 cursor-pointer rounded transition-colors"
              title="Delete Medication"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </td>
      );
    }

    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading medications...</p>
        </div>
      </div>
    );
  }

 // Main render
return (
  <div className="min-h-screen bg-white">
    {/* Header */}
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-gray-700 cursor-pointer rounded-md hover:bg-gray-50 transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 truncate">Medications</h1>
              <span className="text-xs sm:text-sm text-gray-500 block">
                ({originalMedications.length} existing, {medications.filter(m => m.isNew).length} new)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {medications.length === 0 && !isEditMode ? (
              <button
                onClick={handleAddRow}
                className="flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Add First Medication</span>
                <span className="sm:hidden">Add Medication</span>
              </button>
            ) : (
              <>
                {isEditMode && (
                  <button
                    onClick={handleAddRow}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 border border-green-600 cursor-pointer text-green-600 rounded-md hover:bg-green-50 transition-colors text-xs sm:text-sm flex-1 sm:flex-initial"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Add Row</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                )}
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-md transition-colors cursor-pointer border text-xs sm:text-sm flex-1 sm:flex-initial ${
                    isEditMode
                      ? 'text-orange-600 border-orange-600 hover:bg-orange-50'
                      : 'text-blue-600 border-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {isEditMode ? <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  {isEditMode ? 'Exit Edit' : 'Edit'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="max-w-7xl mx-auto p-3 sm:p-4">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 sm:p-4 mb-3 sm:mb-4">
          <p className="text-red-700 text-xs sm:text-sm">{error}</p>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed mt-10">
            <thead className="bg-white border border-gray-200">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-700 w-16">S.No</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-700 w-60">Medicine</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-700 w-32">Dosage</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-700 w-40">Frequency</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-700 w-36">When</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-700 w-32">Duration</th>
                {isEditMode && (
                  <th className="px-4 py-4 text-center text-sm font-medium text-gray-700 w-20">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {medications.length === 0 ? (
                <tr>
                  <td colSpan={isEditMode ? "7" : "6"} className="px-4 py-12 text-center text-gray-500">
                    <div>
                      {isEditMode ? (
                        <>
                          <p className="mb-2 text-orange-600 font-medium">All medications have been deleted</p>
                          <p className="text-sm text-gray-400 mb-3">You can add new medications or save to confirm deletion</p>
                          <button
                            onClick={handleAddRow}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            Add New Medication
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="mb-2">No medications recorded yet</p>
                          <p className="text-sm text-gray-400">Click "Add First Medication" to get started</p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                medications.map((medication, index) => (
                  <tr key={medication.id} className="hover:bg-gray-50">
                    {renderTableCell(medication, 'serialNo', index)}
                    {renderTableCell(medication, 'medicationName')}
                    {renderTableCell(medication, 'dosage')}
                    {renderTableCell(medication, 'frequency')}
                    {renderTableCell(medication, 'when')}
                    {renderTableCell(medication, 'duration')}
                    {isEditMode && renderTableCell(medication, 'actions')}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Action Bar */}
        <div className="px-4 py-4 border-t border-gray-200 flex justify-end items-center">
          <div className="flex gap-3 items-center">
            {isEditMode && (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-2 text-gray-700 bg-white cursor-pointer border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {mode === 'fromProforma' ? 'Saving & Next...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {mode === 'fromProforma' ? 'Next' : 'Save Changes'}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 mt-4">
        {medications.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            {isEditMode ? (
              <>
                <p className="mb-2 text-orange-600 font-medium text-sm">All medications have been deleted</p>
                <p className="text-xs text-gray-400 mb-3">You can add new medications or save to confirm deletion</p>
                <button
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add New Medication
                </button>
              </>
            ) : (
              <>
                <p className="mb-2 text-sm text-gray-600">No medications recorded yet</p>
                <p className="text-xs text-gray-400">Click "Add Medication" to get started</p>
              </>
            )}
          </div>
        ) : (
          medications.map((medication, index) => (
            <div key={medication.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                    {index + 1}
                  </span>
                  {medication.isNew && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      New
                    </span>
                  )}
                </div>
                {isEditMode && (
                  <button
                    onClick={() => handleDeleteRow(medication.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {/* Medicine Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Medicine</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={medication.medicationName}
                      onChange={(e) => handleInputChange(medication.id, 'medicationName', e.target.value)}
                      placeholder="Enter medicine name"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{medication.medicationName || '-'}</p>
                  )}
                </div>

                {/* Dosage */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Dosage</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={medication.dosage}
                      onChange={(e) => handleInputChange(medication.id, 'dosage', e.target.value)}
                      placeholder="e.g., 500mg"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{medication.dosage || '-'}</p>
                  )}
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Frequency</label>
                  {isEditMode ? (
                    <select
                      value={medication.frequency}
                      onChange={(e) => handleInputChange(medication.id, 'frequency', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select frequency</option>
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="Four times daily">Four times daily</option>
                      <option value="As needed">As needed</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900">{medication.frequency || '-'}</p>
                  )}
                </div>

                {/* When */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">When</label>
                  {isEditMode ? (
                    <select
                      value={medication.when}
                      onChange={(e) => handleInputChange(medication.id, 'when', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select timing</option>
                      <option value="Before food">Before food</option>
                      <option value="After food">After food</option>
                      <option value="With food">With food</option>
                      <option value="Empty stomach">Empty stomach</option>
                      <option value="Anytime">Anytime</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900">{medication.when || '-'}</p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Duration</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={medication.duration}
                      onChange={(e) => handleInputChange(medication.id, 'duration', e.target.value)}
                      placeholder="e.g., 7 days"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{medication.duration || '-'}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Mobile Action Buttons */}
        {isEditMode && medications.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 -mx-3 flex gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 px-4 py-2.5 text-gray-700 bg-white cursor-pointer border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 cursor-pointer bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === 'fromProforma' ? 'Saving...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {mode === 'fromProforma' ? 'Next' : 'Save'}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default MedicationTable;