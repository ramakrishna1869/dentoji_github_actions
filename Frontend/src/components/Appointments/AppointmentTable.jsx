// import React, { useState, useEffect } from "react";
// import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
// import { ChevronsLeft, ChevronsRight } from "lucide-react";
// import { toast } from "react-toastify";
// import axios from 'axios';

// const PatientAppointmentsTable = ({
//   patientId,
//   hospitalId,
//   patientName,
//   onAppointmentChange,
//   onEditAppointment,
// }) => {
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [pagination, setPagination] = useState({
//     totalPages: 0,
//     totalAppointments: 0,
//     limit: 5,
//     hasNext: false,
//     hasPrev: false,
//   });

//   // Modal states
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedAppointment, setSelectedAppointment] = useState(null);

//   // Fetch appointments from backend using getPatientById
//   const fetchAppointments = async (page = currentPage) => {
//     if (!patientId || !hospitalId) return;

//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(
//         `https://dentoji-27vb.onrender.com0/api/patients/${hospitalId}/${patientId}`,
//         {
//           headers: { 'Authorization': `Bearer ${token}` },
//         }
//       );

//       const patientData = response.data;
//       const appointmentsData = patientData.appointments || [];

//       // Simulate pagination for frontend
//       const limit = pagination.limit || 5;
//       const totalAppointments = appointmentsData.length;
//       const totalPages = Math.ceil(totalAppointments / limit);
//       const startIndex = (page - 1) * limit;
//       const paginatedAppointments = appointmentsData.slice(startIndex, startIndex + limit);

//       setAppointments(paginatedAppointments);
//       setPagination({
//         currentPage: page,
//         totalPages,
//         totalAppointments,
//         limit,
//         hasNext: page < totalPages,
//         hasPrev: page > 1,
//       });

//       //console.log(`✅ Fetched ${appointmentsData.length} appointments for patient ${patientId}`);
//     } catch (error) {
//       console.error('❌ Error fetching appointments:', {
//         status: error.response?.status,
//         data: error.response?.data,
//         message: error.message,
//       });
//       toast.error(error.response?.data?.message || 'Failed to fetch appointments');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAppointments(1);
//   }, [patientId, hospitalId, onAppointmentChange]);

//   // Handle page change
//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= pagination.totalPages) {
//       setCurrentPage(page);
//       fetchAppointments(page);
//     }
//   };

//   // Handle delete appointment
//   const handleDeleteAppointment = async () => {
//     setLoading(true);

//     try {
//       const token = localStorage.getItem('token');
//       await axios.delete(
//         `https://dentoji-27vb.onrender.com0/api/patients/${hospitalId}/${patientId}/appointments/${selectedAppointment._id}`,
//         {
//           headers: { 'Authorization': `Bearer ${token}` },
//         }
//       );

//       toast.success('Appointment deleted successfully!');
//       setShowDeleteModal(false);
//       fetchAppointments(currentPage);
//       if (onAppointmentChange) onAppointmentChange();
//     } catch (error) {
//       console.error('❌ Error deleting appointment:', error);
//       toast.error(error.response?.data?.message || 'Failed to delete appointment');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get status color
//   const getStatusColor = (status) => {
//     const colors = {
//       'Scheduled': 'bg-blue-100 text-blue-800',
//       'Completed': 'bg-green-100 text-green-800',
//       'Cancelled': 'bg-red-100 text-red-800',
//       'Pending': 'bg-yellow-100 text-yellow-800',
//       'Confirmed': 'bg-purple-100 text-purple-800',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800';
//   };

//   // Format date for display
//   const formatDate = (dateString) => {
//     if (!dateString) return 'No date';
//     return new Date(dateString).toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//     });
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//       {/* Header */}
//       <div className="px-6 py-4 border-b border-gray-200">
//         <h3 className="text-lg font-semibold text-gray-900">
//           Appointments for {patientName}
//         </h3>
//         <p className="text-sm text-gray-600">
//           Total: {pagination.totalAppointments} appointments
//         </p>
//       </div>

//       {/* Table */}
//       {loading ? (
//         <div className="p-8 text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-2 text-gray-600">Loading appointments...</p>
//         </div>
//       ) : appointments.length === 0 ? (
//         <div className="p-8 text-center text-gray-500">
//           <div className="text-4xl mb-4">📅</div>
//           <h4 className="text-lg font-medium mb-2">No Appointments Found</h4>
//           <p>This patient has no appointments scheduled.</p>
//         </div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   {["S.No","Name", "Doctor", "Date & Time", "Treatment", "Status", "Priority", "Actions"].map((head) => (
//                     <th key={head} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       {head}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {appointments.map((appointment, index) => {
//                   const serialNumber = (currentPage - 1) * 5 + index + 1;

//                   return (
//                     <tr key={appointment._id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {serialNumber}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-900">
//                           {appointment.doctor || 'Not assigned'}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {formatDate(appointment.appointmentDate)}
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           {appointment.appointmentTime || 'No time'}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="text-sm text-gray-900">
//                           {appointment.treatmentType || appointment.treatment || 'Not specified'}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {appointment.duration || '45 mins'}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
//                           {appointment.status || 'Scheduled'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className={`text-xs font-medium ${
//                           appointment.priority === 'High' || appointment.priority === 'Urgent'
//                             ? 'text-red-600'
//                             : appointment.priority === 'Low'
//                               ? 'text-gray-600'
//                               : 'text-blue-600'
//                         }`}>
//                           {appointment.priority || 'Medium'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <div className="flex items-center gap-2">
//                           <button
//                             onClick={() => {
//                               setSelectedAppointment(appointment);
//                               setShowViewModal(true);
//                             }}
//                             className="text-blue-500 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50"
//                             title="View Details"
//                           >
//                             <FaEye size={14} />
//                           </button>

//                           {!['Completed', 'Cancelled'].includes(appointment.status) && (
//                             <button
//                               onClick={() => {
//                                 setSelectedAppointment(appointment);
//                                 onEditAppointment(appointment);
//                               }}
//                               className="text-green-500 hover:text-green-600 transition-colors p-1 rounded hover:bg-green-50"
//                               title="Edit Appointment"
//                             >
//                               <FaEdit size={14} />
//                             </button>
//                           )}

//                           <button
//                             onClick={() => {
//                               setSelectedAppointment(appointment);
//                               setShowDeleteModal(true);
//                             }}
//                             className="text-red-500 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
//                             title="Delete Appointment"
//                           >
//                             <FaTrash size={14} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {pagination.totalPages > 1 && (
//             <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
//               <div className="flex justify-between items-center">
//                 <div className="text-sm text-gray-600">
//                   Showing {((currentPage - 1) * 5) + 1} to {Math.min(currentPage * 5, pagination.totalAppointments)} of {pagination.totalAppointments} appointments
//                 </div>

//                 <div className="flex justify-center items-center gap-2">
//                   <button
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={!pagination.hasPrev}
//                     className={`p-2 rounded-md transition-colors ${
//                       !pagination.hasPrev
//                         ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                         : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm border"
//                     }`}
//                     title="Previous Page"
//                   >
//                     <ChevronsLeft className="w-4 h-4" />
//                   </button>

//                   <div className="flex items-center gap-1">
//                     {Array.from({ length: pagination.totalPages }, (_, idx) => {
//                       const page = idx + 1;
//                       const isCurrentPage = currentPage === page;
//                       const shouldShow =
//                         page === 1 ||
//                         page === pagination.totalPages ||
//                         (page >= currentPage - 1 && page <= currentPage + 1);

//                       if (!shouldShow) return null;

//                       return (
//                         <button
//                           key={page}
//                           onClick={() => handlePageChange(page)}
//                           className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
//                             isCurrentPage
//                               ? "bg-blue-500 text-white shadow-sm"
//                               : "bg-white text-gray-700 hover:bg-gray-100 border"
//                           }`}
//                         >
//                           {page}
//                         </button>
//                       );
//                     })}
//                   </div>

//                   <button
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={!pagination.hasNext}
//                     className={`p-2 rounded-md transition-colors ${
//                       !pagination.hasNext
//                         ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                         : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm border"
//                     }`}
//                     title="Next Page"
//                   >
//                     <ChevronsRight className="w-4 h-4" />
//                   </button>
//                 </div>

//                 <div className="text-sm text-gray-600">
//                   Page {currentPage} of {pagination.totalPages}
//                 </div>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {/* View Appointment Modal */}
//       {showViewModal && selectedAppointment && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
//           <div className="bg-white p-6 rounded-lg shadow-xl w-[500px] mx-4 max-h-[80vh] overflow-y-auto">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-semibold text-gray-900">
//                 Appointment Details
//               </h2>
//               <button
//                 onClick={() => {
//                   setShowViewModal(false);
//                   setSelectedAppointment(null);
//                 }}
//                 className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
//               >
//                 ×
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Doctor</label>
//                   <p className="text-sm text-gray-900 mt-1">{selectedAppointment.doctor || 'Not assigned'}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Treatment Type</label>
//                   <p className="text-sm text-gray-900 mt-1">{selectedAppointment.treatmentType || selectedAppointment.treatment || 'Not specified'}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Date</label>
//                   <p className="text-sm text-gray-900 mt-1">{formatDate(selectedAppointment.appointmentDate)}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Time</label>
//                   <p className="text-sm text-gray-900 mt-1">{selectedAppointment.appointmentTime || 'No time'}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Status</label>
//                   <div className="mt-1">
//                     <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAppointment.status)}`}>
//                       {selectedAppointment.status || 'Scheduled'}
//                     </span>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Priority</label>
//                   <p className="text-sm text-gray-900 mt-1">{selectedAppointment.priority || 'Medium'}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Duration</label>
//                   <p className="text-sm text-gray-900 mt-1">{selectedAppointment.duration || '45 mins'}</p>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Created</label>
//                   <p className="text-xs text-gray-600 mt-1">
//                     {selectedAppointment.createdAt ? new Date(selectedAppointment.createdAt).toLocaleString('en-GB') : 'N/A'}
//                   </p>
//                 </div>
//               </div>

//               {selectedAppointment.additionalNotes && (
//                 <div>
//                   <label className="text-sm font-medium text-gray-500">Additional Notes</label>
//                   <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-md">
//                     {selectedAppointment.additionalNotes}
//                   </p>
//                 </div>
//               )}
//             </div>

//             <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
//               <button
//                 onClick={() => {
//                   setShowViewModal(false);
//                   setSelectedAppointment(null);
//                 }}
//                 className="px-4 py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
//               >
//                 Close
//               </button>

//               {!['Completed', 'Cancelled'].includes(selectedAppointment.status) && (
//                 <button
//                   onClick={() => {
//                     setShowViewModal(false);
//                     onEditAppointment(selectedAppointment);
//                   }}
//                   className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
//                 >
//                   Edit Appointment
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && selectedAppointment && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
//           <div className="bg-white p-6 rounded-lg shadow-xl w-[400px] mx-4">
//             <div className="text-center">
//               <div className="text-red-500 text-4xl mb-4">🗑️</div>
//               <h2 className="text-lg font-semibold mb-4 text-gray-900">
//                 Delete Appointment?
//               </h2>
//               <p className="text-sm text-gray-600 mb-6">
//                 Are you sure you want to permanently delete this appointment? This action cannot be undone.
//               </p>

//               <div className="bg-gray-50 p-3 rounded-md mb-6 text-left">
//                 <p className="text-sm"><strong>Doctor:</strong> {selectedAppointment.doctor}</p>
//                 <p className="text-sm"><strong>Date:</strong> {formatDate(selectedAppointment.appointmentDate)}</p>
//                 <p className="text-sm"><strong>Time:</strong> {selectedAppointment.appointmentTime}</p>
//                 <p className="text-sm"><strong>Treatment:</strong> {selectedAppointment.treatmentType || selectedAppointment.treatment}</p>
//               </div>

//               <div className="flex justify-center gap-3">
//                 <button
//                   onClick={() => {
//                     setShowDeleteModal(false);
//                     setSelectedAppointment(null);
//                   }}
//                   className="px-4 py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
//                   disabled={loading}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDeleteAppointment}
//                   className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2"
//                   disabled={loading}
//                 >
//                   {loading && (
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                   )}
//                   {loading ? 'Deleting...' : 'Delete Permanently'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PatientAppointmentsTable;
