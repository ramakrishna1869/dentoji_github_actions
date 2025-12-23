//TreatmentTable
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit3, Plus, Trash2, Save, X, User } from 'lucide-react';

const TreatmentEncounters = () => {
  // Router hooks
  const { patientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [encounters, setEncounters] = useState([]);
  const [originalEncounters, setOriginalEncounters] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [hospitalId, setHospitalId] = useState(null);

  // Utility functions
  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Load user profile to get hospital ID
  const loadUserProfile = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const profileData = await response.json();
      
      // Extract user data based on response structure
      const userData = profileData.admin || profileData.receptionist || profileData.user || profileData;
      const hospital = profileData.hospital;

      // Get hospital ID from user data or hospital data
      let hospitalIdFromProfile = null;
      
      if (userData?.hospitalId) {
        hospitalIdFromProfile = userData.hospitalId;
      } else if (userData?._id) {
        hospitalIdFromProfile = userData._id;
      } else if (hospital?._id) {
        hospitalIdFromProfile = hospital._id;
      }

      return hospitalIdFromProfile;
    } catch (error) {
     // console.error('Error loading user profile:', error);
      return null;
    }
  };

  // Get hospital ID dynamically
  const getHospitalId = async () => {
    try {
      // First check if it's passed via route state
      if (location.state?.hospitalId) {
        return location.state.hospitalId;
      }
      
      // Load from user profile
      const profileHospitalId = await loadUserProfile();
      if (profileHospitalId) {
        return profileHospitalId;
      }
      
      throw new Error('Hospital ID not found');
    } catch (error) {
     // console.error('Error getting hospital ID:', error);
      throw error;
    }
  };

  const getApiHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
  });

  const handleApiError = async (response) => {
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `HTTP ${response.status}`);
    }
    return response.json();
  };

  // Generate unique ID for new encounters
  const generateUniqueId = () => {
    return `encounter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // API functions
  const loadEncounters = async () => {
    if (!patientId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/treatment-encounters/${patientId}`,
        { headers: getApiHeaders() }
      );
      
      const data = await handleApiError(response);
      
      if (data?.success && data?.data?.encounters) {
        const formattedEncounters = data.data.encounters.map(encounter => ({
          id: encounter._id || generateUniqueId(),
          dateTime: encounter.dateTime ? new Date(encounter.dateTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
          treatment: encounter.treatment || '',
          amountPaid: encounter.amountPaid || '',
          paymentMode: encounter.paymentMode || 'Cash',
          notes: encounter.notes || '',
          status: encounter.status || 'Completed',
          isNew: false
        }));
        setEncounters(formattedEncounters);
        setOriginalEncounters([...formattedEncounters]);
      } else {
        setEncounters([]);
        setOriginalEncounters([]);
      }
      setError(null);
    } catch (err) {
     // console.error('Load encounters error:', err);
      setError(err.message);
      setEncounters([]);
      setOriginalEncounters([]);
    } finally {
      setLoading(false);
    }
  };

  const saveEncounters = async () => {
    if (!patientId || !hospitalId) {
      setError('Missing required information');
      return false;
    }

    try {
      setSaving(true);
      
      // Filter out encounters that have meaningful content
      const validEncounters = encounters
        .filter(encounter => {
          const hasContent = 
            (encounter.treatment && encounter.treatment.trim()) ||
            (encounter.amountPaid && Number(encounter.amountPaid) > 0) ||
            (encounter.notes && encounter.notes.trim());
          
          return hasContent;
        })
        .map(encounter => ({
          dateTime: new Date(encounter.dateTime).toISOString(),
          treatment: encounter.treatment?.trim() || '',
          amountPaid: Number(encounter.amountPaid) || 0,
          paymentMode: encounter.paymentMode || 'Cash',
          notes: encounter.notes?.trim() || '',
          status: encounter.status || 'Completed'
        }));

      //console.log('Saving encounters:', validEncounters);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/treatment-encounters/${patientId}`,
        {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify({
            encounters: validEncounters,
            hospitalId
          })
        }
      );

      const data = await handleApiError(response);
      
      if (data.success) {
        await loadEncounters();
        if (hospitalId) {
          // Force refresh by not passing patient data in state
          navigate(`/patientdata/${hospitalId}/${patientId}`, {
            state: {
              refresh: true, // Signal to force fresh data fetch
              forceRefresh: true // Additional flag for clarity
            }
          });
        } else {
          navigate(-1);
        }
        return true;
      }
      return false;
    } catch (err) {
     // console.error('Save error:', err);
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Event handlers
  const handleBack = () => {
    if (hospitalId) {
      navigate(`/patientdata/${hospitalId}/${patientId}`);
    } else {
      navigate(-1);
    }
  };

  const handleGoToPatientDetails = () => {
    if (hospitalId) {
      navigate(`/patientdata/${hospitalId}/${patientId}`);
    } else {
      navigate(-1);
    }
  };

  const handleAddRow = () => {
    const newEncounter = {
      id: generateUniqueId(),
      dateTime: new Date().toISOString().slice(0, 16),
      treatment: '',
      amountPaid: '',
      paymentMode: 'Cash',
      notes: '',
      status: 'Completed',
      isNew: true
    };
    setEncounters(prev => [...prev, newEncounter]);
    setIsEditMode(true);
  };

  const handleDeleteRow = (id) => {
    setEncounters(prev => {
      const filtered = prev.filter(encounter => encounter.id !== id);
      //console.log('After delete:', filtered);
      return filtered;
    });
  };

  const handleInputChange = (id, field, value) => {
    setEncounters(prev =>
      prev.map(encounter =>
        encounter.id === id ? { ...encounter, [field]: value } : encounter
      )
    );
  };

  const handleSave = async () => {
    const success = await saveEncounters();
    if (success) {
      setIsEditMode(false);
      setError(null);
    }
  };

  const handleCancel = () => {
    setEncounters([...originalEncounters]);
    setIsEditMode(false);
    setError(null);
  };

  // Formatting functions
  const formatCurrency = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Effects
  useEffect(() => {
    const initializeHospitalId = async () => {
      try {
        const id = await getHospitalId();
        setHospitalId(id);
      } catch (error) {
        setError('Failed to load hospital information');
      }
    };
    
    initializeHospitalId();
  }, [location]);

  useEffect(() => {
    if (patientId && hospitalId) {
      loadEncounters();
    }
  }, [patientId, hospitalId]);

  // Render helpers
  const renderTableCell = (encounter, field, index) => {
    const commonClasses = "border border-gray-300 py-3 px-3 align-top";
    
    if (field === 'serialNo') {
      return (
        <td className={`${commonClasses} bg-gray-50 text-center font-medium w-16`}>
          {index + 1}
        </td>
      );
    }

    if (field === 'dateTime') {
      return (
        <td className={`${commonClasses} w-40`}>
          {isEditMode ? (
            <input
              type="datetime-local"
              value={encounter.dateTime}
              onChange={(e) => handleInputChange(encounter.id, 'dateTime', e.target.value)}
              className="w-full py-2 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
            />
          ) : (
            <span className="text-sm">{formatDateTime(encounter.dateTime)}</span>
          )}
        </td>
      );
    }

    if (field === 'treatment') {
      return (
        <td className={`${commonClasses} min-w-60 max-w-60`}>
          {isEditMode ? (
            <textarea
              value={encounter.treatment}
              onChange={(e) => handleInputChange(encounter.id, 'treatment', e.target.value)}
              className="w-full py-2 px-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
              placeholder="Enter treatment details"
              rows="3"
            />
          ) : (
            <div className="text-sm break-words overflow-wrap-anywhere max-w-60">
              {encounter.treatment}
            </div>
          )}
        </td>
      );
    }

    if (field === 'amountPaid') {
      return (
        <td className={`${commonClasses} w-32`}>
  {isEditMode ? (
    <div className="relative">
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
      <input
        type="number"
        value={encounter.amountPaid}
        onChange={(e) => handleInputChange(encounter.id, 'amountPaid', e.target.value)}
        className="w-full pl-6 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
        placeholder="Amount"
        min="0"
        step="0.01"
      />
    </div>
  ) : (
    <span className="text-sm">
      {encounter.amountPaid ? `₹${formatCurrency(encounter.amountPaid)}` : ''}
    </span>
  )}
</td>

      );
    }

    if (field === 'paymentMode') {
      return (
        <td className={`${commonClasses} w-36`}>
          {isEditMode ? (
            <select
              value={encounter.paymentMode}
              onChange={(e) => handleInputChange(encounter.id, 'paymentMode', e.target.value)}
              className="w-full py-2 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Insurance">Insurance</option>
              <option value="Cheque">Cheque</option>
            </select>
          ) : (
            <span className="text-sm">{encounter.paymentMode}</span>
          )}
        </td>
      );
    }

    if (field === 'status') {
      const statusColors = {
        'Completed': 'bg-green-100 text-green-800',
       // 'Pending': 'bg-yellow-100 text-yellow-800',
        'In Progress': 'bg-blue-100 text-blue-800',
        'Cancelled': 'bg-red-100 text-red-800'
      };

      return (
        <td className={`${commonClasses} w-32`}>
          {isEditMode ? (
            <select
              value={encounter.status}
              onChange={(e) => handleInputChange(encounter.id, 'status', e.target.value)}
              className="w-full py-2 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
            >
              <option value="Completed">Completed</option>
              {/* <option value="Pending">Pending</option> */}
              <option value="In Progress">In Progress</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          ) : (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[encounter.status] || 'bg-gray-100 text-gray-800'}`}>
              {encounter.status}
            </span>
          )}
        </td>
      );
    }

    if (field === 'notes') {
      return (
        <td className={`${commonClasses} min-w-60 max-w-60`}>
          {isEditMode ? (
            <textarea
              value={encounter.notes}
              onChange={(e) => handleInputChange(encounter.id, 'notes', e.target.value)}
              className="w-full py-2 px-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
              placeholder="Additional notes"
              rows="3"
            />
          ) : (
            <div className="text-sm text-gray-600 break-words overflow-wrap-anywhere max-w-60">
              {encounter.notes}
            </div>
          )}
        </td>
      );
    }

    if (field === 'actions' && isEditMode) {
      return (
        <td className={`${commonClasses} w-16 text-center`}>
          <button
            onClick={() => handleDeleteRow(encounter.id)}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 cursor-pointer rounded transition-colors"
            title="Delete Encounter"
          >
            <Trash2 className="w-4 h-4" />
          </button>
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
          <p className="text-gray-600">Loading treatment encounters...</p>
        </div>
      </div>
    );
  }

  // Error state (when no data)
  if (error && encounters.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-sm">
          <div className="text-red-600 text-lg font-medium mb-2">Error</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setError(null);
                loadEncounters();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Retry
            </button>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Go Back
            </button>
          </div>
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
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-900 truncate flex-1">Treatment Encounters</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {encounters.length === 0 && !isEditMode ? (
              <button
                onClick={handleAddRow}
                className="flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Add First Encounter</span>
                <span className="sm:hidden">Add Encounter</span>
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
          <div className="flex items-center justify-between gap-2">
            <p className="text-red-700 text-xs sm:text-sm flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 flex-shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg overflow-hidden relative">
        <div className="overflow-x-auto">
         <table className="w-full table-auto mt-10 border border-gray-200">
           <thead className="bg-white border-b border-gray-200">
      <tr>
        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">S.No</th>
        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 min-w-[150px]">Date & Time</th>
        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 min-w-[200px]">Treatment</th>
        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 min-w-[100px]">Amount</th>
        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 min-w-[120px]">Payment</th>
        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 min-w-[100px]">Status</th>
        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 min-w-[200px]">Notes</th>
        {isEditMode && (
          <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Actions</th>
        )}
      </tr>
    </thead>
            <tbody className="divide-y divide-gray-200">
              {encounters.length === 0 ? (
                <tr>
                  <td colSpan={isEditMode ? "8" : "7"} className="px-4 py-12 text-center text-gray-500">
                    <div>
                      {isEditMode ? (
                        <>
                          <p className="mb-2 text-orange-600 font-medium">All encounters have been deleted</p>
                          <p className="text-sm text-gray-400 mb-3">You can add new encounters or save to confirm deletion</p>
                          <button
                            onClick={handleAddRow}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            Add New Encounter
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="mb-2">No treatment encounters recorded yet</p>
                          <p className="text-sm text-gray-400">Click "Add First Encounter" to get started</p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                encounters.map((encounter, index) => (
                  <tr key={encounter.id} className="hover:bg-gray-50">
                    {renderTableCell(encounter, 'serialNo', index)}
                    {renderTableCell(encounter, 'dateTime')}
                    {renderTableCell(encounter, 'treatment')}
                    {renderTableCell(encounter, 'amountPaid')}
                    {renderTableCell(encounter, 'paymentMode')}
                    {renderTableCell(encounter, 'status')}
                    {renderTableCell(encounter, 'notes')}
                    {isEditMode && renderTableCell(encounter, 'actions')}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Action Bar */}
        <div className="px-4 py-4 border-t border-gray-200 flex justify-end items-center">
          <div className="flex gap-3 items-center">
            {/* Edit Mode Actions */}
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            )}
            
            {/* Patient Details Button */}
            {!isEditMode && (
              <button
                onClick={handleGoToPatientDetails}
                className="flex items-center gap-2 cursor-pointer px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                <User className="w-4 h-4" />
                Go to Patient Details
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 mt-4">
        {encounters.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            {isEditMode ? (
              <>
                <p className="mb-2 text-orange-600 font-medium text-sm">All encounters have been deleted</p>
                <p className="text-xs text-gray-400 mb-3">You can add new encounters or save to confirm deletion</p>
                <button
                  onClick={handleAddRow}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add New Encounter
                </button>
              </>
            ) : (
              <>
                <p className="mb-2 text-sm text-gray-600">No treatment encounters recorded yet</p>
                <p className="text-xs text-gray-400">Click "Add Encounter" to get started</p>
              </>
            )}
          </div>
        ) : (
          encounters.map((encounter, index) => (
            <div key={encounter.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                    {index + 1}
                  </span>
                  {encounter.isNew && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      New
                    </span>
                  )}
                </div>
                {isEditMode && (
                  <button
                    onClick={() => handleDeleteRow(encounter.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {/* Date & Time */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date & Time</label>
                  {isEditMode ? (
                    <input
                      type="datetime-local"
                      value={encounter.dateTime}
                      onChange={(e) => handleInputChange(encounter.id, 'dateTime', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{encounter.dateTime ? new Date(encounter.dateTime).toLocaleString() : '-'}</p>
                  )}
                </div>

                {/* Treatment */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Treatment</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={encounter.treatment}
                      onChange={(e) => handleInputChange(encounter.id, 'treatment', e.target.value)}
                      placeholder="Enter treatment"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{encounter.treatment || '-'}</p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Amount Paid</label>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={encounter.amountPaid}
                      onChange={(e) => handleInputChange(encounter.id, 'amountPaid', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">₹{encounter.amountPaid || '0.00'}</p>
                  )}
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Payment Mode</label>
                  {isEditMode ? (
                    <select
                      value={encounter.paymentMode}
                      onChange={(e) => handleInputChange(encounter.id, 'paymentMode', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select payment mode</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Insurance">Insurance</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900">{encounter.paymentMode || '-'}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  {isEditMode ? (
                    <select
                      value={encounter.status}
                      onChange={(e) => handleInputChange(encounter.id, 'status', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select status</option>
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      encounter.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      encounter.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      encounter.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {encounter.status || '-'}
                    </span>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                  {isEditMode ? (
                    <textarea
                      value={encounter.notes}
                      onChange={(e) => handleInputChange(encounter.id, 'notes', e.target.value)}
                      placeholder="Add notes..."
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{encounter.notes || '-'}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Mobile Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 -mx-3 flex gap-2">
          {isEditMode ? (
            <>
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={handleGoToPatientDetails}
              className="w-full flex items-center justify-center gap-2 cursor-pointer px-4 py-2.5 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              <User className="w-4 h-4" />
              Go to Patient Details
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);
};

export default TreatmentEncounters;