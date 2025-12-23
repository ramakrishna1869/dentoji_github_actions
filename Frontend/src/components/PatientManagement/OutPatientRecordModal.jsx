// import React, { useState, useEffect,useRef } from 'react';
// import { X, Share2, Download, RefreshCw, AlertCircle } from 'lucide-react';
// import html2canvas from 'html2canvas';
// import { jsPDF } from 'jspdf';

// const OutPatientRecordModal = ({ isOpen, onClose, patientId, hospitalId, debug }) => {
//   const [patientData, setPatientData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const printContentRef = useRef(null);

//   // DEBUG: Add detailed logging right at the start
//   //console.log('🔍 OutPatientRecordModal Props Debug:', {
//     patientId: {
//       raw: patientId,
//       type: typeof patientId,
//       isUndefined: patientId === undefined,
//       isNull: patientId === null,
//       isEmpty: patientId === '',
//       stringValue: patientId?.toString()
//     },
//     hospitalId: {
//       raw: hospitalId,
//       type: typeof hospitalId,
//       isValid: hospitalId && typeof hospitalId === 'string' && hospitalId.trim() !== ''
//     },
//     debug: debug
//   });

//   // FIXED: Move ID normalization to the top
//   // FIXED: Better ID normalization handling all cases
// const normalizedPatientId = (() => {
//   if (!patientId) return '';
//   if (typeof patientId === 'string') return patientId.trim();
//   if (typeof patientId === 'object' && patientId._id) return patientId._id.toString();
//   return patientId.toString();
// })();

//   // FIXED: Check if props are valid (handle both string and ObjectId formats)
//  // FIXED: More robust ID validation
// const hasValidIds = normalizedPatientId && 
//                     normalizedPatientId.trim() !== '' && 
//                     hospitalId && 
//                     typeof hospitalId === 'string' && 
//                     hospitalId.trim() !== '';

//   // Add debug logging for useEffect
//   useEffect(() => {
//     //console.log('🎭 OutPatientRecordModal useEffect triggered:', {
//       isOpen,
//       patientId: {
//         value: patientId,
//         type: typeof patientId,
//         stringValue: patientId?.toString(),
//         normalized: normalizedPatientId,
//         isValid: patientId && patientId.toString().trim() !== ''
//       },
//       hospitalId: {
//         value: hospitalId,
//         type: typeof hospitalId,
//         isValid: hospitalId && typeof hospitalId === 'string' && hospitalId.trim() !== ''
//       },
//       hasValidIds,
//       debug
//     });
//   }, [isOpen, patientId, hospitalId, debug, normalizedPatientId]);

//   // Format date from ISO string to DD-MM-YYYY
//   const formatDate = (isoString) => {
//     if (!isoString) return '';
//     const date = new Date(isoString);
//     const day = date.getDate().toString().padStart(2, '0');
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}-${month}-${year}`;
//   };

//   // Capitalize first letter
//   const capitalizeFirst = (str) => {
//     if (!str) return '';
//     return str.charAt(0).toUpperCase() + str.slice(1);
//   };

//   // FIXED: Fetch patient data from API
//   const fetchPatientData = async () => {
//     //console.log('📡 fetchPatientData called with:', {
//       patientId,
//       normalizedPatientId,
//       hospitalId,
//       hasValidIds
//     });

//     // Better ID validation
//     if (!patientId || !hospitalId) {
//       const errorMsg = `Missing required IDs: patientId="${patientId}", hospitalId="${hospitalId}"`;
//       console.error('❌', errorMsg);
//       setError(errorMsg);
//       return;
//     }

//     // Check if IDs are valid
//     if (!hasValidIds) {
//       const errorMsg = `Invalid IDs: patientId valid=${!!normalizedPatientId?.trim()}, hospitalId valid=${!!(hospitalId && typeof hospitalId === 'string' && hospitalId.trim() !== '')}`;
//       console.error('❌', errorMsg);
//       setError(errorMsg);
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         throw new Error('No authentication token found');
//       }

//       // FIXED: Use normalizedPatientId correctly
//       const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/patients/${hospitalId.trim()}/${normalizedPatientId.trim()}`;
//       //console.log('📡 Fetching patient data from:', apiUrl);

//       const response = await fetch(apiUrl, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       //console.log('📡 API Response status:', response.status);

//       if (!response.ok) {
//         let errorMessage;
//         switch (response.status) {
//           case 401:
//             errorMessage = 'Unauthorized access - please check authentication';
//             break;
//           case 404:
//             errorMessage = `Patient not found with ID: ${normalizedPatientId}`;
//             break;
//           case 500:
//             errorMessage = 'Server error, please try again';
//             break;
//           default:
//             errorMessage = `HTTP error! status: ${response.status}`;
//         }
//         throw new Error(errorMessage);
//       }

//       const data = await response.json();
//       //console.log('✅ Patient data fetched successfully:', data);
//       setPatientData(data);
//     } catch (err) {
//       console.error('❌ Error fetching patient data:', err);
//       if (err.name === 'TypeError' || err.message.includes('fetch')) {
//         setError('Network error, check connection');
//       } else {
//         setError(err.message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Retry function
//   const handleRetry = () => {
//     //console.log('🔄 Retrying fetch...');
//     fetchPatientData();
//   };

//   // Handle share functionality
//   const handleShare = () => {
//     //console.log('Share functionality');
//     // TODO: Implement share logic
//   };

//   // Handle download functionality  
//  // Handle download functionality  




// // Add print styles
// const printStyles = `
//   @media print {
//     body * {
//       visibility: hidden;
//     }
//     .print-content, .print-content * {
//       visibility: visible;
//     }
//     .print-content {
//       position: absolute;
//       left: 0;
//       top: 0;
//       width: 100%;
//     }
//     .no-print {
//       display: none !important;
//     }
//   }
// `;


// const handleDownload = async () => {
//   //console.log('Download function called');
  
//   if (!printContentRef.current) {
//     console.error('printContentRef is null');
//     return;
//   }
  
//   if (!displayData?.patientName) {
//     console.error('Patient name not available');
//     return;
//   }

//   try {
//     //console.log('Starting PDF generation...');
//     const element = printContentRef.current;
    
//     const canvas = await html2canvas(element, {
//       scale: 1.5,
//       useCORS: true,
//       allowTaint: true,
//       backgroundColor: '#ffffff',
//       width: element.scrollWidth,
//       height: element.scrollHeight,
//       scrollX: 0,
//       scrollY: 0
//     });

//     //console.log('Canvas created successfully');
    
//     const imgData = canvas.toDataURL('image/png');
//     const pdf = new jsPDF('p', 'mm', 'a4');
    
//     const imgWidth = 190; // Reduced width for margins
//     const imgHeight = (canvas.height * imgWidth) / canvas.width;
//     const maxHeight = 270; // Max height for single page with margins
    
//     // Scale down if content is too tall for one page
//     let finalWidth = imgWidth;
//     let finalHeight = imgHeight;
    
//     if (imgHeight > maxHeight) {
//       finalHeight = maxHeight;
//       finalWidth = (canvas.width * maxHeight) / canvas.height;
//     }
    
//     // Center the content
//     const xOffset = (210 - finalWidth) / 2;
//     const yOffset = 10;
    
//     pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
    
//     const patientName = displayData.patientName.replace(/[^a-zA-Z0-9\s]/g, '');
//     const filename = `${patientName.replace(/\s+/g, '_')}_Receipt.pdf`;
    
//     //console.log('Saving PDF with filename:', filename);
//     pdf.save(filename);
    
//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     // Fallback to window.print() if PDF generation fails
//     window.print();
//   }
// };
//   // Clear data when modal closes
//   const handleClose = () => {
//     setPatientData(null);
//     setError(null);
//     onClose();
//   };

//   // Fetch data when modal opens
//   useEffect(() => {
//     //console.log('🔄 Main useEffect triggered:', { isOpen, patientId, hospitalId, hasValidIds });
//     if (isOpen && hasValidIds) {
//       fetchPatientData();
//     }
//   }, [isOpen, patientId, hospitalId, hasValidIds]);

//   if (!isOpen) return null;

//   //console.log('🎭 OutPatientRecordModal render state:', { 
//     hasValidIds, 
//     loading, 
//     error, 
//     patientData: !!patientData 
//   });

//   // Add print styles
// useEffect(() => {
//   const styleElement = document.createElement('style');
//   styleElement.textContent = printStyles;
//   document.head.appendChild(styleElement);
  
//   return () => {
//     document.head.removeChild(styleElement);
//   };
// }, []);

//   // Loading state
//   if (loading) {
//     return (
//      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{zIndex: 9999}}>
//   <div className="bg-white rounded-lg shadow-xl w-[600px] border border-gray-200" autoComplete="off">
//           <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
//             <h2 className="text-sm font-semibold text-gray-900">Out Patient Record</h2>
//             <button
//               onClick={handleClose}
//               className="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
//             >
//               <X size={16} />
//             </button>
//           </div>
//           <div className="px-6 py-8 flex flex-col items-center justify-center space-y-4">
//             <RefreshCw className="animate-spin text-blue-500" size={32} />
//             <p className="text-sm text-gray-600">Loading patient data...</p>
//             <p className="text-xs text-gray-400">Patient ID: {normalizedPatientId}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-lg shadow-xl w-[600px] border border-gray-200">
//           <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
//             <h2 className="text-sm font-semibold text-gray-900">Out Patient Record</h2>
//             <button
//               onClick={handleClose}
//               className="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
//             >
//               <X size={16} />
//             </button>
//           </div>
//           <div className="px-6 py-8 flex flex-col items-center justify-center space-y-4">
//             <AlertCircle className="text-red-500" size={32} />
//             <p className="text-sm text-gray-600 text-center">{error}</p>
//             {debug && (
//               <div className="text-xs text-gray-400 max-w-md text-center">
//                 <details>
//                   <summary className="cursor-pointer">Debug Info</summary>
//                   <pre className="mt-2 text-left text-xs overflow-auto max-h-32">
//                     {JSON.stringify(debug, null, 2)}
//                   </pre>
//                 </details>
//               </div>
//             )}
//             <button
//               onClick={handleRetry}
//               className="flex items-center px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors cursor-pointer"
//             >
//               <RefreshCw size={14} className="mr-2" />
//               Retry
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Missing required props or invalid props
//   if (!hasValidIds) {
//     return (
//       <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//         <div className="bg-white rounded-lg shadow-xl w-[600px] border border-gray-200">
//           <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
//             <h2 className="text-sm font-semibold text-gray-900">Out Patient Record</h2>
//             <button
//               onClick={handleClose}
//               className="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
//             >
//               <X size={16} />
//             </button>
//           </div>
//           <div className="px-6 py-8 flex flex-col items-center justify-center space-y-4">
//             <AlertCircle className="text-yellow-500" size={32} />
//             <p className="text-sm text-gray-600 text-center">
//               Patient ID and Hospital ID are required to load data
//             </p>
//             <div className="text-xs text-gray-500 text-center mt-2 max-w-md">
//               <div>PatientId: "{patientId}" (type: {typeof patientId})</div>
//               <div>Normalized: "{normalizedPatientId}" (valid: {!!normalizedPatientId?.trim()})</div>
//               <div>HospitalId: "{hospitalId}" (type: {typeof hospitalId})</div>
//               {debug && (
//                 <details className="mt-2">
//                   <summary className="cursor-pointer">Debug Info</summary>
//                   <pre className="mt-2 text-left text-xs overflow-auto max-h-32">
//                     {JSON.stringify(debug, null, 2)}
//                   </pre>
//                 </details>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Rest of your component remains the same...
//   const displayData = patientData ? {
//     patientId: patientData.patientId || '',
//     patientName: `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim(),
//     age: patientData.age || '',
//     gender: capitalizeFirst(patientData.gender) || '',
//     bloodType: patientData.bloodType || '',
//     phoneNumber: patientData.primaryNumber || '',
//     address: [patientData.address, patientData.city, patientData.stateProvince]
//       .filter(Boolean)
//       .join(', '),
//     primaryDentalIssue: patientData.primaryDentalIssue || '',
//     symptoms: patientData.currentSymptoms || '',
//     bloodPressure: patientData.allergies || '', 
//     medicalHistory: patientData.medicalHistory || '',
//     opFee: patientData.opFee ? `₹${patientData.opFee}` : '',
//     appointmentDate: patientData.appointments && patientData.appointments.length > 0 
//       ? formatDate(patientData.appointments[0].appointmentDate)
//       : 'No appointment scheduled',
//     appointmentTime: patientData.appointments && patientData.appointments.length > 0 
//       ? patientData.appointments[0].appointmentTime || 'No appointment scheduled'
//       : 'No appointment scheduled'
//   } : null;

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl w-[600px] border border-gray-200">
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
//           <h2 className="text-sm font-semibold text-gray-900">Out Patient Record</h2>
//           <button
//             onClick={handleClose}
//             className="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
//           >
//             <X size={16} />
//           </button>
//         </div>

//         {/* Content */}
//         {/* Content */}
//         <div ref={printContentRef} className="px-6 py-4 space-y-4 print-content">
//           {/* Patient Information Section */}
//           <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//             <h3 className="text-xs font-semibold text-gray-900 mb-3">Patient Information</h3>
//             <div className="text-xs space-y-1">
//               <div>
//                 <span className="font-medium text-gray-700">Patient ID:</span> 
//                 <span className="text-gray-900"> {displayData?.patientId}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-700">Patient Name:</span> 
//                 <span className="text-gray-900"> {displayData?.patientName}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-700">Age:</span> 
//                 <span className="text-gray-900"> {displayData?.age}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-700">Gender:</span> 
//                 <span className="text-gray-900"> {displayData?.gender}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-700">Blood Type:</span> 
//                 <span className="text-gray-900"> {displayData?.bloodType}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-700">Phone Number:</span> 
//                 <span className="text-gray-900"> {displayData?.phoneNumber}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-700">Address:</span> 
//                 <span className="text-gray-900"> {displayData?.address}</span>
//               </div>
//             </div>
//           </div>

//           {/* Medical Information Section */}
//           <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//             <h3 className="text-xs font-semibold text-gray-900 mb-3">Medical Information</h3>
//             <div className="text-xs space-y-1">
//               <div>
//                 <span className="font-medium text-gray-700">Primary Dental Issue:</span> 
//                 <span className="text-gray-900"> {displayData?.primaryDentalIssue}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-700">Symptoms:</span> 
//                 <span className="text-gray-900"> {displayData?.symptoms}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-700">Blood Pressure(B.P):</span> 
//                 <span className="text-gray-900"> {displayData?.bloodPressure}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-700">Medical History:</span> 
//                 <span className="text-gray-900"> {displayData?.medicalHistory}</span>
//               </div>
//             </div>
//           </div>

//           {/* Payment and Appointment Details Section */}
//           <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
//             <h3 className="text-xs font-semibold text-gray-900 mb-3">Payment & Appointment Details</h3>
//             <div className="text-xs space-y-1">
//               <div>
//                 <span className="font-medium text-gray-700">OP Fee:</span> 
//                 <span className="text-gray-900"> {displayData?.opFee}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-700">Appointment Date:</span> 
//                 <span className="text-gray-900"> {displayData?.appointmentDate}</span>
//               </div>
//               <div>
//                 <span className="font-medium text-gray-700">Appointment Time:</span> 
//                 <span className="text-gray-900"> {displayData?.appointmentTime}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer Actions */}
//         <div className="px-6 py-2 bg-white border-t border-gray-200 flex justify-end space-x-2 no-print">
//           <button
//             onClick={handleShare}
//             className="flex items-center px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer"
//           >
//             <Share2 size={12} className="mr-1" />
//             Share
//           </button>
//           <button
//             onClick={handleDownload}
//             className="flex items-center px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer"
//           >
//             <Download size={12} className="mr-1" />
//             Download Receipt
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OutPatientRecordModal;





import React, { useState, useEffect, useRef } from 'react';
import { X, Share2, Download, RefreshCw, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const OutPatientRecordModal = ({ isOpen, onClose, patientId, hospitalId, debug }) => {
  const [patientData, setPatientData] = useState(null);
  const [hospitalData, setHospitalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const printContentRef = useRef(null);

  // DEBUG: Add detailed logging right at the start
  /*console.log('🔍 OutPatientRecordModal Props Debug:', {
    patientId: {
      raw: patientId,
      type: typeof patientId,
      isUndefined: patientId === undefined,
      isNull: patientId === null,
      isEmpty: patientId === '',
      stringValue: patientId?.toString()
    },
    hospitalId: {
      raw: hospitalId,
      type: typeof hospitalId,
      isValid: hospitalId && typeof hospitalId === 'string' && hospitalId.trim() !== ''
    },
    debug: debug
  });*/

  // FIXED: Move ID normalization to the top
  const normalizedPatientId = (() => {
    if (!patientId) return '';
    if (typeof patientId === 'string') return patientId.trim();
    if (typeof patientId === 'object' && patientId._id) return patientId._id.toString();
    return patientId.toString();
  })();

  // FIXED: Check if props are valid
  const hasValidIds = normalizedPatientId && 
                      normalizedPatientId.trim() !== '' && 
                      hospitalId && 
                      typeof hospitalId === 'string' && 
                      hospitalId.trim() !== '';

  // Add debug logging for useEffect
  useEffect(() => {
   /* console.log('🎭 OutPatientRecordModal useEffect triggered:', {
      isOpen,
      patientId: {
        value: patientId,
        type: typeof patientId,
        stringValue: patientId?.toString(),
        normalized: normalizedPatientId,
        isValid: patientId && patientId.toString().trim() !== ''
      },
      hospitalId: {
        value: hospitalId,
        type: typeof hospitalId,
        isValid: hospitalId && typeof hospitalId === 'string' && hospitalId.trim() !== ''
      },
      hasValidIds,
      debug
    });*/
  }, [isOpen, patientId, hospitalId, debug, normalizedPatientId]);

  // Format date from ISO string to DD-MM-YYYY
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Capitalize first letter
  const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Fetch hospital data
  const fetchHospitalData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const profileResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const hospital = profileData.hospital;
        if (hospital) {
          setHospitalData(hospital);
        }
      }
    } catch (err) {
     // console.error('❌ Error fetching hospital data:', err);
    }
  };

  // FIXED: Fetch patient data from API
  const fetchPatientData = async () => {
    /*console.log('📡 fetchPatientData called with:', {
      patientId,
      normalizedPatientId,
      hospitalId,
      hasValidIds
    });*/

    if (!patientId || !hospitalId) {
      const errorMsg = `Missing required IDs: patientId="${patientId}", hospitalId="${hospitalId}"`;
     // console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    if (!hasValidIds) {
      const errorMsg = `Invalid IDs: patientId valid=${!!normalizedPatientId?.trim()}, hospitalId valid=${!!(hospitalId && typeof hospitalId === 'string' && hospitalId.trim() !== '')}`;
    //  console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await fetchHospitalData();

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/patients/${hospitalId.trim()}/${normalizedPatientId.trim()}`;
      //console.log('📡 Fetching patient data from:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      //console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        let errorMessage;
        switch (response.status) {
          case 401:
            errorMessage = 'Unauthorized access - please check authentication';
            break;
          case 404:
            errorMessage = `Patient not found with ID: ${normalizedPatientId}`;
            break;
          case 500:
            errorMessage = 'Server error, please try again';
            break;
          default:
            errorMessage = `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      //console.log('✅ Patient data fetched successfully:', responseData);
      
      // FIXED: Handle the API response structure properly
      // Your API returns { data: {...}, success: true, message: "...", timestamp: "..." }
      // So we need to extract the actual patient data from the 'data' property
      if (responseData && responseData.data) {
        setPatientData(responseData.data);
        //console.log('✅ Patient data set successfully:', responseData.data);
      } else {
        console.warn('⚠️ Unexpected API response structure:', responseData);
        setPatientData(responseData); // Fallback for different API structure
      }
    } catch (err) {
     // console.error('❌ Error fetching patient data:', err);
      if (err.name === 'TypeError' || err.message.includes('fetch')) {
        setError('Network error, check connection');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Retry function
  const handleRetry = () => {
    //console.log('🔄 Retrying fetch...');
    fetchPatientData();
  };

  // Handle share functionality
  const handleShare = () => {
    //console.log('Share functionality');
    // TODO: Implement share logic
  };

  // FIXED: PDF generation for single page only
  const handleDownload = async () => {
    //console.log('Download function called');
    
    if (!printContentRef.current) {
    //  console.error('printContentRef is null');
      return;
    }
    
    if (!displayData?.patientName) {
    //  console.error('Patient name not available');
      return;
    }

    try {
      //console.log('Starting PDF generation...');
      const element = printContentRef.current;
      
      // Create canvas with better options for single page
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      //console.log('Canvas created successfully');
      
      const imgData = canvas.toDataURL('image/png', 0.95); // High quality PNG
      
      // Create PDF with A4 dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // A4 dimensions in mm
      const pageWidth = 210;
      const pageHeight = 297;
      
      // Calculate dimensions to fit content in single page
      const imgWidth = pageWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If content is too tall, scale it down to fit one page
      let finalWidth = imgWidth;
      let finalHeight = imgHeight;
      const maxHeight = pageHeight - 20; // 10mm margin top and bottom
      
      if (imgHeight > maxHeight) {
        finalHeight = maxHeight;
        finalWidth = (canvas.width * maxHeight) / canvas.height;
      }
      
      // Center the content
      const xOffset = (pageWidth - finalWidth) / 2;
      const yOffset = (pageHeight - finalHeight) / 2;
      
      // Add image to PDF - single page only
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
      
      // Generate filename
      const patientName = displayData.patientName.replace(/[^a-zA-Z0-9\s]/g, '');
      const filename = `${patientName.replace(/\s+/g, '_')}_Receipt.pdf`;
      
      //console.log('Saving PDF with filename:', filename);
      pdf.save(filename);
      
    } catch (error) {
     // console.error('Error generating PDF:', error);
      // Fallback to window.print() if PDF generation fails
      window.print();
    }
  };

  // Clear data when modal closes
  const handleClose = () => {
    setPatientData(null);
    setHospitalData(null);
    setError(null);
    onClose();
  };

  // Fetch data when modal opens
  useEffect(() => {
    //console.log('🔄 Main useEffect triggered:', { isOpen, patientId, hospitalId, hasValidIds });
    if (isOpen && hasValidIds) {
      fetchPatientData();
    }
  }, [isOpen, patientId, hospitalId, hasValidIds]);

  // Add print styles for better PDF generation
  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      .print-content, .print-content * {
        visibility: visible;
      }
      .print-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        page-break-inside: avoid;
      }
      .no-print {
        display: none !important;
      }
    }
    
    .print-content {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 20px;
    }
  `;

  // Add print styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = printStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  if (!isOpen) return null;

  /*console.log('🎭 OutPatientRecordModal render state:', { 
    hasValidIds, 
    loading, 
    error, 
    patientData: !!patientData 
  });*/

  // FIXED: Add debug logging for patientData
  //console.log('📋 Patient data for display preparation:', patientData);

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{zIndex: 9999}}>
        <div className="bg-white rounded-lg shadow-xl w-[600px] border border-gray-200" autoComplete="off">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Out Patient Record</h2>
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
          <div className="px-6 py-8 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="animate-spin text-blue-500" size={32} />
            <p className="text-sm text-gray-600">Loading patient data...</p>
            <p className="text-xs text-gray-400">Patient ID: {normalizedPatientId}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-[600px] h-[50%] border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Out Patient Record</h2>
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
          <div className="px-6 py-8 flex flex-col items-center justify-center space-y-4">
            <AlertCircle className="text-red-500" size={32} />
            <p className="text-sm text-gray-600 text-center">{error}</p>
            {debug && (
              <div className="text-xs text-gray-400 max-w-md text-center">
                <details>
                  <summary className="cursor-pointer">Debug Info</summary>
                  <pre className="mt-2 text-left text-xs overflow-auto max-h-32">
                    {JSON.stringify(debug, null, 2)}
                  </pre>
                </details>
              </div>
            )}
            <button
              onClick={handleRetry}
              className="flex items-center px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className="mr-2" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Missing required props or invalid props
  if (!hasValidIds) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-[400px] border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Out Patient Record</h2>
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
          <div className="px-6 py-8 flex flex-col items-center justify-center space-y-4">
            <AlertCircle className="text-yellow-500" size={32} />
            <p className="text-sm text-gray-600 text-center">
              Patient ID and Hospital ID are required to load data
            </p>
            <div className="text-xs text-gray-500 text-center mt-2 max-w-md">
              <div>PatientId: "{patientId}" (type: {typeof patientId})</div>
              <div>Normalized: "{normalizedPatientId}" (valid: {!!normalizedPatientId?.trim()})</div>
              <div>HospitalId: "{hospitalId}" (type: {typeof hospitalId})</div>
              {debug && (
                <details className="mt-2">
                  <summary className="cursor-pointer">Debug Info</summary>
                  <pre className="mt-2 text-left text-xs overflow-auto max-h-32">
                    {JSON.stringify(debug, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FIXED: Prepare display data - this was the main issue
  const displayData = patientData ? {
    patientId: patientData.patientId || '',
    patientName: `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim(),
    age: patientData.age || '',
    gender: capitalizeFirst(patientData.gender) || '',
    bloodType: patientData.bloodType || '',
    phoneNumber: patientData.primaryNumber || '',
    address: [patientData.address, patientData.city, patientData.stateProvince]
      .filter(Boolean)
      .join(', '),
    primaryDentalIssue: patientData.primaryDentalIssue || '',
    symptoms: patientData.currentSymptoms || '',
    bloodPressure: patientData.allergies || '', 
    medicalHistory: patientData.medicalHistory || '',
    opFee: patientData.opFee ? `₹${patientData.opFee}` : '',
    appointmentDate: patientData.appointments && patientData.appointments.length > 0 
      ? formatDate(patientData.appointments[0].appointmentDate)
      : 'No appointment scheduled',
    appointmentTime: patientData.appointments && patientData.appointments.length > 0 
      ? patientData.appointments[0].appointmentTime || 'No appointment scheduled'
      : 'No appointment scheduled'
  } : null;

  // FIXED: Add debug logging for displayData
  //console.log('📋 Display data prepared:', displayData);

  // Get current date for the receipt
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Get hospital name dynamically
  const hospitalName = hospitalData?.name || 'Dental Clinic';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[80vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Out Patient Record</h2>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* FIXED: Content with dynamic hospital name and proper formatting */}
        <div ref={printContentRef} className="px-6 py-6 space-y-4 print-content">
          {/* Hospital Header */}
          <div className="pb-4 mb-4">
            <h1 className="text-xl font-bold text-gray-900 text-center mb-4">{hospitalName} Clinic</h1>
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-700">Out Patient Record</h2>
              <p className="text-sm text-gray-600">Date: {currentDate}</p>
            </div>
          </div>

          {/* Patient Information Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 border-b border-gray-300 pb-1">Patient Information</h3>
            <div className="text-sm space-y-2 ml-4">
              <div>
                <span className="font-semibold text-gray-700">Patient ID:</span> 
                <span className="text-gray-600"> {displayData?.patientId || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Patient Name:</span> 
                <span className="text-gray-600"> {displayData?.patientName || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Age:</span> 
                <span className="text-gray-600"> {displayData?.age || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Gender:</span> 
                <span className="text-gray-600"> {displayData?.gender || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Blood Type:</span> 
                <span className="text-gray-600"> {displayData?.bloodType || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Phone Number:</span> 
                <span className="text-gray-600"> {displayData?.phoneNumber || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Address:</span> 
                <span className="text-gray-600"> {displayData?.address || '-'}</span>
              </div>
            </div>
          </div>

          {/* Medical Information Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 border-b border-gray-300 pb-1">Medical Information</h3>
            <div className="text-xs space-y-2 ml-4">
              <div>
                <span className="font-semibold text-gray-700">Primary Dental Issue:</span> 
                <span className="text-gray-600"> {displayData?.primaryDentalIssue || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Symptoms:</span> 
                <span className="text-gray-600"> {displayData?.symptoms || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Blood Pressure(B.P):</span> 
                <span className="text-gray-600"> {displayData?.bloodPressure || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Medical History:</span> 
                <span className="text-gray-600"> {displayData?.medicalHistory || '-'}</span>
              </div>
            </div>
          </div>

          {/* Payment and Appointment Details Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 border-b border-gray-300 pb-1">Payment & Appointment Details</h3>
            <div className="text-xs space-y-2 ml-4">
              <div>
                <span className="font-semibold text-gray-700">OP Fee:</span> 
                <span className="text-gray-600"> {displayData?.opFee || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Appointment Date:</span> 
                <span className="text-gray-600"> {displayData?.appointmentDate || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Appointment Time:</span> 
                <span className="text-gray-600"> {displayData?.appointmentTime || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-2 bg-white border-t border-gray-200 flex justify-end space-x-2 no-print">
          <button
            onClick={handleShare}
            className="flex items-center px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Share2 size={12} className="mr-1" />
            Share
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Download size={12} className="mr-1" />
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default OutPatientRecordModal;