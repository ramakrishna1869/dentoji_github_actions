
// import React, { useState } from 'react';
// import { Pill, RefreshCw, AlertCircle, Edit2, Trash2, X, Save, Plus } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';

// export default function MedicationsCard({ 
//   patientData, 
//   medications = [], 
//   loading = false, 
//   error = null, 
//   onRefresh 
// }) {

//   const navigate = useNavigate();
//   const [editingMed, setEditingMed] = useState(null);
//   const [editData, setEditData] = useState({});
//   const [isUpdating, setIsUpdating] = useState(false);
//   const [isDeleting, setIsDeleting]= useState(false);
//   const [showAll, setShowAll] = useState(false);

//   // Display only first 2 medications unless showAll is true
//   const displayMedications = showAll ? medications : medications.slice(0, 2);
//   const remainingCount = medications.length - 2;


// const handleRefresh = () => {
//   const patientId = patientData?._id || patientData?.id;
//   const hospitalIdForNav = patientData?.hospitalId || 'default-hospital';
  
//   //console.log('🔄 Patient data for navigation:', {
//     patientData,
//     patientId,
//     hospitalId: hospitalIdForNav
//   });
  
//   if (!patientId) {
//     console.error('❌ No patient ID found');
//     toast.error('Patient ID not found. Please refresh the page.');
//     return;
//   }
  
//   navigate(`/medications/${patientId}`, { 
//     state: { 
//       mode: 'fromCard',
//       hospitalId: hospitalIdForNav,
//       patientData: patientData // Pass full patient data
//     }
//   });
// };

//   // Handle edit click
//   const handleEditClick = (med) => {
//     setEditingMed(med.prescriptionId || med._id);
//     setEditData({
//       medicationName: med.medicationName || '',
//       dosage: med.dosage || '',
//       frequency: med.frequency || 'Once Daily',
//       duration: med.duration || '',
//       instruction: med.instruction || ''
//     });
//   };

//   // Handle cancel edit
//   const handleCancelEdit = () => {
//     setEditingMed(null);
//     setEditData({});
//   };

//   // Handle input change in edit mode
//   const handleInputChange = (field, value) => {
//     setEditData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   // Handle save edit
//   const handleSaveEdit = async (medId) => {
//     try {
//       setIsUpdating(true);
      
//       const token = localStorage.getItem('token');
//       if (!token) {
//          toast.error('Authentication required. Please log in again.');
//         return;
//       }

//       // Validate required fields
//       if (!editData.medicationName?.trim() || !editData.dosage?.trim() || 
//           !editData.duration?.trim() || !editData.instruction?.trim()) {
//         toast.error('Please fill in all required fields.');
//         return;
//       }

//       //console.log('📤 Updating medication:', { medId, editData });

//       // Find the prescription that contains this medication
//       const currentMed = medications.find(m => (m.prescriptionId || m._id) === medId);
//       if (!currentMed) {
//         toast.error('Medication not found.');
//         return;
//       }

//       // Get the prescription ID (this should be the medication record ID in the backend)
//       const prescriptionId = currentMed.prescriptionId || medId;

//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/medications/${prescriptionId}`,
//         {
//           method: 'POST',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             // Update the specific medication in the medications array
//             medications: medications
//               .filter(m => (m.prescriptionId || m._id) === medId)
//               .map(m => ({
//                 medicationName: editData.medicationName,
//                 dosage: editData.dosage,
//                 frequency: editData.frequency,
//                 duration: editData.duration,
//                 instruction: editData.instruction
//               }))
//               .concat(
//                 // Keep other medications from the same prescription unchanged
//                 medications
//                   .filter(m => m.prescriptionId === prescriptionId && (m.prescriptionId || m._id) !== medId)
//                   .map(m => ({
//                     medicationName: m.medicationName,
//                     dosage: m.dosage,
//                     frequency: m.frequency,
//                     duration: m.duration,
//                     instruction: m.instruction
//                   }))
//               )
//           })
//         }
//       );

//       const responseData = await response.json();
//       //console.log('📥 Update Response:', responseData);

//       if (response.ok) {
//         //console.log('✅ Medication updated successfully');
//         toast.success('Medication updated successfully!');
        
//         // Reset edit state
//         setEditingMed(null);
//         setEditData({});
        
//         // Refresh medications list
//         if (onRefresh) {
//           onRefresh();
//         }
//       } else {
//         console.error('Failed to update medication:', responseData);
//         toast.error(`Failed to update medication: ${responseData.message || 'Please try again.'}`);
//       }
//     } catch (error) {
//       console.error('Error updating medication:', error);
//       toast.error('Error updating medication. Please check your connection and try again.');
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   // Handle delete medication
//   const handleDeleteMedication = async (medId) => {
//     if (!window.confirm('Are you sure you want to delete this medication? This action cannot be undone.')) {
//       return;
//     }

//     try {
//       setIsDeleting(true);
      
//       const token = localStorage.getItem('token');
//       if (!token) {
//         toast.error('Authentication required. Please log in again.');
//         return;
//       }

//       //console.log('🗑️ Deleting medication:', { medId });

//       // Find the prescription that contains this medication
//       const currentMed = medications.find(m => (m.prescriptionId || m._id) === medId);
//       if (!currentMed) {
//         toast.error('Medication not found.');
//         return;
//       }

//       const prescriptionId = currentMed.prescriptionId || medId;

//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/medications/${prescriptionId}`,
//         {
//           method: 'DELETE',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );

//       const responseData = await response.json();
//       //console.log('📥 Delete Response:', responseData);

//       if (response.ok) {
//         //console.log('✅ Medication deleted successfully');
//         toast.success('Medication deleted successfully!');
        
//         // Refresh medications list
//         if (onRefresh) {
//           onRefresh();
//         }
//       } else {
//         console.error('Failed to delete medication:', responseData);
//         toast.error(`Failed to delete medication: ${responseData.message || 'Please try again.'}`);
//       }
//     } catch (error) {
//       console.error('Error deleting medication:', error);
//       toast.error('Error deleting medication. Please check your connection and try again.');
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow p-5">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="font-semibold flex items-center text-sm">
//           <Pill className="w-5 h-5 mr-2 text-purple-500" />
//           Current Medications
//         </h3>
        
//         {onRefresh && (
//           <button
//             onClick={handleRefresh}
//             disabled={loading}
//             className="text-gray-400 hover:text-gray-600 p-1 rounded disabled:opacity-50"
//             title="Refresh medications"
//           >
//             <Plus className={`w-5 h-5 text-purple-800 ${loading ? 'animate-spin' : ''}`} />
//           </button>
//         )}
//       </div>

//       {/* Loading State */}
//       {loading && (
//         <div className="text-center py-8 text-gray-500">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
//           <p className="text-sm">Loading medications...</p>
//         </div>
//       )}

//       {/* Error State */}
//       {error && !loading && (
//         <div className="text-center py-8 text-red-500">
//           <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
//           <p className="text-sm">Error loading medications</p>
//           <p className="text-xs text-gray-500 mt-1">{error}</p>
//           {onRefresh && (
//             <button
//               onClick={handleRefresh}
//               className="mt-2 text-xs text-purple-500 hover:text-purple-700 underline"
//             >
//               Try again
//             </button>
//           )}
//         </div>
//       )}

//       {/* Medications List */}
//       {!loading && !error && displayMedications.length > 0 && (
//         <div className="space-y-2">
//           {displayMedications.map((med, idx) => {
//             const medId = med.prescriptionId || med._id || idx;
//             const isEditing = editingMed === medId;
            
//             return (
//               <div
//                 key={medId}
//                 className="flex justify-between items-center bg-purple-50 rounded-lg p-3 min-h-20"
//               >
//                 <div className="flex-1 mr-2">
//                   {isEditing ? (
//                     // Edit Mode
//                     <div className="space-y-2">
//                       <input
//                         type="text"
//                         value={editData.medicationName}
//                         onChange={(e) => handleInputChange('medicationName', e.target.value)}
//                         placeholder="Medication Name"
//                         className="w-full text-xs font-semibold bg-white border border-gray-300 rounded px-2 py-1"
//                       />
//                       <div className="grid grid-cols-2 gap-2">
//                         <input
//                           type="text"
//                           value={editData.dosage}
//                           onChange={(e) => handleInputChange('dosage', e.target.value)}
//                           placeholder="Dosage"
//                           className="text-xs bg-white border border-gray-300 rounded px-2 py-1"
//                         />
//                         <select
//                           value={editData.frequency}
//                           onChange={(e) => handleInputChange('frequency', e.target.value)}
//                           className="text-xs bg-white border border-gray-300 rounded px-2 py-1"
//                         >
//                           <option value="Once Daily">Once Daily</option>
//                           <option value="Twice Daily">Twice Daily</option>
//                           <option value="Three times Daily">Three times Daily</option>
//                           <option value="As needed">As needed</option>
//                         </select>
//                       </div>
//                       <div className="grid grid-cols-2 gap-2">
//                         <input
//                           type="text"
//                           value={editData.duration}
//                           onChange={(e) => handleInputChange('duration', e.target.value)}
//                           placeholder="Duration"
//                           className="text-xs bg-white border border-gray-300 rounded px-2 py-1"
//                         />
//                         <input
//                           type="text"
//                           value={editData.instruction}
//                           onChange={(e) => handleInputChange('instruction', e.target.value)}
//                           placeholder="Instruction"
//                           className="text-xs bg-white border border-gray-300 rounded px-2 py-1"
//                         />
//                       </div>
//                     </div>
//                   ) : (
//                     // View Mode
//                     <div>
//                       <p className="text-xs font-semibold text-gray-800 truncate">
//                         {med.medicationName || 'Unknown Medication'}
//                       </p>
//                       <p className="text-xs text-gray-600">
//                         {med.dosage || 'Dosage not specified'} • {med.frequency || 'Frequency not specified'}
//                       </p>
//                       <p className="text-xs text-gray-500 truncate">
//                         {med.instruction || 'No special instructions'}
//                       </p>
//                       {med.duration && (
//                         <p className="text-xs text-gray-400">Duration: {med.duration}</p>
//                       )}
//                     </div>
//                   )}
//                 </div>

                

//                 <div className="flex flex-col items-end space-y-2">
//   {!isEditing && (
//     <div className="text-right">
//       <p className="text-xs text-gray-400">
//         {new Date().toLocaleDateString('en-US', { 
//           month: 'short', 
//           day: 'numeric',
//           year: 'numeric'
//         })}
//       </p>
//     </div>
//   )}
// </div>

//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Empty State */}
//       {!loading && !error && medications.length === 0 && (
//         <div className="text-center py-8 text-gray-500">
//           <Pill className="w-8 h-8 mx-auto mb-2 text-gray-300" />
//           <p className="text-sm">No medications recorded</p>
//           <p className="text-xs text-gray-400 mt-1">
//             Medications will appear here after prescriptions are created
//           </p>
//         </div>
//       )}

//       {/* View All / Show Less Button */}
//       {!loading && !error && medications.length > 0 && (
//         <div className="mt-3 space-y-2">
//           {medications.length > 2 && (
//             <button
//               onClick={() => setShowAll(!showAll)}
//               className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 text-sm font-medium transition-colors"
//             >
//               {showAll 
//                 ? `Show Less` 
//                 : `View ${remainingCount} More Medication${remainingCount > 1 ? 's' : ''}`
//               }
//             </button>
//           )}
          
//           {/* <button className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 text-sm font-medium transition-colors">
//             View All Medications ({medications.length})
//           </button> */}
//         </div>
//       )}
//     </div>
//   );
// }



//medicationscard
import React, { useState, useEffect } from 'react';
import { Pill, Plus, AlertCircle, Loader2 } from 'lucide-react';
//import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const MedicationsCard = ({ 
  patientId, 
  hospitalId = 'default-hospital', 
  apiBaseUrl = '/api',
  onNavigateToMedications 
}) => {
  const [medicationsData, setMedicationsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch medications from API
  useEffect(() => {
    const fetchMedications = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/medications/patient/${patientId}?hospitalId=${hospitalId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch medications: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setMedicationsData(result);
        } else {
          throw new Error(result.message || 'Failed to fetch medications');
        }
      } catch (err) {
       // console.error('Error fetching medications:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMedications();
  }, [patientId, hospitalId, apiBaseUrl]);

  // Get recent medications (last 2)
  const getRecentMedications = () => {
    if (!medicationsData?.medications) return [];
    
    const allMedications = [];
    medicationsData.medications.forEach(prescription => {
      if (prescription.medications && prescription.medications.length > 0) {
        prescription.medications.forEach((med, index) => {
          allMedications.push({
            id: `${prescription._id}_${index}`,
            prescriptionId: prescription._id,
            medicationName: med.medicationName || 'Unknown Medication',
            dosage: med.dosage || 'Dosage not specified',
            frequency: med.frequency || 'Frequency not specified',
            instruction: med.instruction || 'No instructions',
            duration: med.duration || '',
            createdAt: prescription.appointmentDate || prescription.createdAt
          });
        });
      }
    });
    
    return allMedications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 2);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle add new medication - navigate to medications page
  const handleAddMedication = () => {
    if (onNavigateToMedications) {
      onNavigateToMedications(patientId);
    } else {
      // Fallback: use window.location if navigate function not provided
      window.location.href = `/medications/${patientId}`;
    }
  };

  // Handle view all - navigate to medications page
  const handleViewAll = () => {
    if (onNavigateToMedications) {
      onNavigateToMedications(patientId);
    } else {
      // Fallback: use window.location if navigate function not provided
      window.location.href = `/medications/${patientId}`;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-center h-48">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading medications...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-center h-48">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">Error: {error}</span>
          </div>
        </div>
      </div>
    );
  }

  const recentMedications = getRecentMedications();
  const hasMedications = recentMedications.length > 0;
  const totalMedications = medicationsData?.medications?.reduce((total, prescription) => 
    total + (prescription.medications?.length || 0), 0) || 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-0">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-900">Current Medications</h2>
          {totalMedications > 0 && (
            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              {totalMedications} total
            </span>
          )}
        </div>
        <Plus 
          className="w-5 h-5 text-purple-500 cursor-pointer hover:text-purple-600 transition-colors" 
          onClick={handleAddMedication}
          title="Add new medication"
        />
      </div>

      {hasMedications ? (
        <>
          {/* Medications Items - Fixed Height Content Area */}
          <div className="h-48 overflow-hidden p-5 pt-6">
            <div className="space-y-4">
              {recentMedications.map((medication, index) => (
                <div key={medication.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                  {/* Medication name and date */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-gray-500 text-sm truncate pr-4" title={medication.medicationName}>
                      {medication.medicationName}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                      <span>{formatDate(medication.createdAt)}</span>
                    </div>
                  </div>
                  
                  {/* Medication details */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>{medication.dosage} • {medication.frequency}</span>
                    </div>
                    
                    <p className="text-gray-500 text-xs line-clamp-2 overflow-hidden" title={medication.instruction}>
                      {medication.instruction}
                    </p>
                    
                    {medication.duration && (
                      <div className="text-xs text-gray-400">
                        Duration: {medication.duration}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fixed View All Button */}
        <div className="p-5 pt-0 border-t border-gray-100">
            <button 
              onClick={handleViewAll}
              className="w-full bg-purple-500  hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 cursor-pointer"
            >
              View All ({totalMedications} medications)
            </button>
          </div>
        </>
      ) : (
        /* No Medications Info */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8">
            <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-500 font-medium mb-1">No Medications</h3>
            <p className="text-gray-400 text-sm">Start by adding the first medication</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationsCard;