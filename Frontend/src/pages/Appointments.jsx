// //Appointments.jsx
// import React, { useState, useEffect } from "react";
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { jwtDecode } from 'jwt-decode';
// import { useNavigate } from "react-router-dom";
// import { FaEdit, FaEye, FaCalendarAlt, FaUsers, FaCheckCircle, FaBan } from "react-icons/fa";
// import { Trash2 } from "lucide-react";
// import { Search, Download, ChevronsLeft, ChevronsRight } from "lucide-react";

// // Stats Card Component
// const StatsCard = ({ title, value, icon: Icon, bgColor, textColor, iconBgColor }) => (
//   <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
//         <p className="text-3xl font-bold text-gray-900">{value}</p>
//       </div>
//       <div className={`${iconBgColor} rounded-2xl p-3 flex items-center justify-center`}>
//         <Icon className="h-6 w-6 text-white" />
//       </div>
//     </div>
//   </div>
// );

// // Edit Appointment Modal
// const EditAppointmentModal = ({ isOpen, onClose, appointment, onUpdate, user }) => {
//   const [formData, setFormData] = useState({
//     appointmentDate: '',
//     appointmentTime: '',
//     treatment: '',
//     doctor: '',
//     status: '',
//     priority: 'Medium',
//     notes: '',
//     firstName: '',
//     lastName: '',
//     patientPhone: '',
//   });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (appointment) {
//       //console.log('Edit Modal - Full appointment object:', appointment);
//       //console.log('Edit Modal - Patient ID:', appointment.patientId);
//       //console.log('Edit Modal - Appointment ID:', appointment._id || appointment.appointmentId);

//       const fullName = appointment.patientName || '';
//       const nameParts = fullName.trim().split(' ');
//       const firstName = nameParts[0] || '';
//       const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

//       setFormData({
//         appointmentDate: appointment.appointmentDate ? appointment.appointmentDate.split('T')[0] : '',
//         appointmentTime: appointment.appointmentTime || '',
//         treatment: appointment.treatment || '',
//         doctor: appointment.doctor || '',
//         status: appointment.status || 'Scheduled',
//         priority: appointment.priority || 'Medium',
//         notes: appointment.notes || '',
//         firstName: firstName,
//         lastName: lastName,
//         patientPhone: appointment.patientPhone || '',
//       });
//     }
//   }, [appointment]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const token = localStorage.getItem('token');

//       if (!appointment?.patientId) {
//         throw new Error('Patient ID is missing in appointment data');
//       }

//       let hospitalIdToUse = appointment.hospitalId;
//       if (user.role === 'Admin') {
//         hospitalIdToUse = appointment.hospitalId || '000000000000000000000000';
//       }

//       const appointmentId = appointment._id || appointment.appointmentId;

//       //console.log('API Call Debug:', {
//         hospitalId: hospitalIdToUse,
//         patientId: appointment.patientId,
//         appointmentId: appointmentId,
//         apiUrl: `${import.meta.env.VITE_BACKEND_URL}/api/patients/${hospitalIdToUse}/${appointment.patientId}/appointments/${appointmentId}`
//       });

//       const patientName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

//       await axios.put(
//         `${import.meta.env.VITE_BACKEND_URL}/api/patients/${hospitalIdToUse}/${appointment.patientId}/appointments/${appointmentId}`,
//         {
//           appointmentDate: formData.appointmentDate,
//           appointmentTime: formData.appointmentTime,
//           treatment: formData.treatment,
//           doctor: formData.doctor,
//           status: formData.status,
//           priority: formData.priority,
//           notes: formData.notes,
//           patientName: patientName,
//           patientPhone: formData.patientPhone,
//         },
//         { headers: { 'Authorization': `Bearer ${token}` } }
//       );

//       toast.success('Appointment updated successfully!');

//       if (Notification.permission === 'granted') {
//         new Notification('Appointment Updated', {
//           body: `Appointment for ${patientName || 'patient'} with ${formData.doctor || 'doctor'} on ${formData.appointmentDate} at ${formData.appointmentTime} has been updated.`,
//           icon: '/favicon.ico',
//         });
//       }

//       onUpdate();
//       onClose();
//     } catch (error) {
//       console.error('Error updating appointment:', error);
//       toast.error(error.response?.data?.message || 'Failed to update appointment');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
//       <div className="bg-white p-6 rounded-lg shadow-xl w-[500px] mx-4 max-h-[80vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-xl font-semibold text-gray-900">Edit Appointment</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
//           >
//             ×
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
//               <input
//                 type="text"
//                 value={formData.firstName}
//                 onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter first name"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
//               <input
//                 type="text"
//                 value={formData.lastName}
//                 onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter last name"
//                 required
//               />
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Patient Phone</label>
//             <input
//               type="tel"
//               value={formData.patientPhone}
//               onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter phone number"
//             />
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
//               <input
//                 type="date"
//                 value={formData.appointmentDate}
//                 onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
//               <input
//                 type="time"
//                 value={formData.appointmentTime}
//                 onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 required
//               />
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
//             <input
//               type="text"
//               value={formData.doctor}
//               onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter doctor name"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
//             <input
//               type="text"
//               value={formData.treatment}
//               onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter treatment type"
//               required
//             />
//           </div>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//               <select
//                 value={formData.status}
//                 onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="Scheduled">Scheduled</option>
//                 <option value="Rescheduled">Rescheduled</option>
//                 <option value="Completed">Completed</option>
//                 <option value="Cancelled">Cancelled</option>
//                 <option value="Pending">Pending</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
//               <select
//                 value={formData.priority}
//                 onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="Low">Low</option>
//                 <option value="Medium">Medium</option>
//                 <option value="High">High</option>
//                 <option value="Urgent">Urgent</option>
//               </select>
//             </div>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
//             <textarea
//               value={formData.notes}
//               onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               rows="4"
//               placeholder="Enter any additional notes..."
//             />
//           </div>
//           <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
//               disabled={loading}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
//               disabled={loading}
//             >
//               {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
//               {loading ? 'Updating...' : 'Update Appointment'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // View Appointment Modal
// const ViewAppointmentModal = ({ isOpen, onClose, appointment, onEdit }) => {
//   if (!isOpen || !appointment) return null;

//   const formatDate = (dateString) => {
//     if (!dateString) return 'No date';
//     return new Date(dateString).toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//     });
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       'Scheduled': 'bg-blue-100 text-blue-800',
//       'Completed': 'bg-green-100 text-green-800',
//       'Cancelled': 'bg-red-100 text-red-800',
//       'Pending': 'bg-yellow-100 text-yellow-800',
//       'Rescheduled': 'bg-purple-100 text-purple-800',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800';
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
//       <div className="bg-white p-6 rounded-lg shadow-xl w-[500px] mx-4 max-h-[80vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
//           >
//             ×
//           </button>
//         </div>

//         <div className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="text-sm font-medium text-gray-500">Appointment ID</label>
//               <p className="text-sm text-gray-900 mt-1 font-mono bg-gray-50 px-2 py-1 rounded">
//                 {appointment._id || appointment.appointmentId || 'N/A'}
//               </p>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Patient Name</label>
//               <p className="text-sm text-gray-900 mt-1">{appointment.patientName || 'N/A'}</p>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Patient ID</label>
//               <p className="text-sm text-gray-900 mt-1 font-mono bg-gray-50 px-2 py-1 rounded">
//                 {appointment.patientCustomId || 'N/A'}
//               </p>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Patient Phone</label>
//               <p className="text-sm text-gray-900 mt-1">{appointment.patientPhone || 'N/A'}</p>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Doctor</label>
//               <p className="text-sm text-gray-900 mt-1">{appointment.doctor || 'Not assigned'}</p>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Treatment</label>
//               <p className="text-sm text-gray-900 mt-1">{appointment.treatment || 'Not specified'}</p>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Date</label>
//               <p className="text-sm text-gray-900 mt-1">{formatDate(appointment.appointmentDate)}</p>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Time</label>
//               <p className="text-sm text-gray-900 mt-1">{appointment.appointmentTime || 'No time'}</p>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Status</label>
//               <div className="mt-1">
//                 <span className={`inline-flex px-1 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
//                   {appointment.status || 'Scheduled'}
//                 </span>
//               </div>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Priority</label>
//               <p className="text-sm text-gray-900 mt-1">{appointment.priority || 'Medium'}</p>
//             </div>
//             {appointment.notes && (
//               <div className="col-span-2">
//                 <label className="text-sm font-medium text-gray-500">Notes</label>
//                 <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-md">{appointment.notes}</p>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
//           >
//             Close
//           </button>
//           {!['Completed', 'Cancelled'].includes(appointment.status) && (
//             <button
//               onClick={() => {
//                 onClose();
//                 onEdit(appointment);
//               }}
//               className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
//             >
//               Edit Appointment
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Delete Confirmation Modal
// const DeleteConfirmModal = ({ isOpen, onClose, appointment, onDelete, loading, user }) => {
//   if (!isOpen || !appointment) return null;

//   const handleDelete = async () => {
//     try {
//       const token = localStorage.getItem('token');

//       let hospitalIdToUse = appointment.hospitalId;
//       if (user.role === 'Admin') {
//         hospitalIdToUse = appointment.hospitalId || '000000000000000000000000';
//       }

//       const appointmentId = appointment._id || appointment.appointmentId;

//       await axios.delete(
//         `${import.meta.env.VITE_BACKEND_URL}/api/patients/${hospitalIdToUse}/${appointment.patientId}/appointments/${appointmentId}`,
//         { headers: { 'Authorization': `Bearer ${token}` } }
//       );

//       toast.success('Appointment deleted successfully!');
//       onDelete();
//       onClose();
//     } catch (error) {
//       console.error('Error deleting appointment:', error);
//       toast.error(error.response?.data?.message || 'Failed to delete appointment');
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
//       <div className="bg-white p-6 rounded-lg shadow-xl w-[400px] mx-4">
//         <div className="text-center">
//           <div className="text-red-500 text-4xl mb-4">🗑️</div>
//           <h2 className="text-lg font-semibold mb-4 text-gray-900">Delete Appointment?</h2>
//           <p className="text-sm text-gray-600 mb-6">
//             Are you sure you want to permanently delete this appointment?
//           </p>

//           <div className="flex justify-center gap-3">
//             <button
//               onClick={onClose}
//               className="px-4 py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
//               disabled={loading}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleDelete}
//               className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2"
//               disabled={loading}
//             >
//               {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
//               {loading ? 'Deleting...' : 'Delete'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Main Appointments Component
// const Appointments = () => {
//   const navigate = useNavigate();
//   const [appointments, setAppointments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('All Status');
//   const [priorityFilter, setPriorityFilter] = useState('All Priorities');
//   const [user, setUser] = useState({ role: null, id: null });
//   const [refreshTrigger, setRefreshTrigger] = useState(0);
//   const [statusLoading, setStatusLoading] = useState({});

//   // Modal states
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedAppointment, setSelectedAppointment] = useState(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);

//   // Stats data
//   const [statsData, setStatsData] = useState({
//     totalAppointments: 0,
//     upcomingAppointments: 0,
//     pastAppointments: 0,
//   });

//   const appointmentsPerPage = 5;

//   // Handle row clicks to navigate to patient data
//   // For Appointments component - replace your current handleRowClick function

//   // For Appointments component - Updated handleRowClick with better error handling
//   const handleRowClick = async (appointment) => {
//     //console.log('🔄 Clicking on appointment:', appointment);

//     const patientId = appointment.patientId;
//     const patientHospitalId = user.hospitalId || appointment.hospitalId;

//     if (!patientId) {
//       console.error('❌ Missing patient ID:', patientId);
//       alert('Patient ID not found. Cannot navigate to patient details.');
//       return;
//     }

//     if (!patientHospitalId) {
//       console.error('❌ Missing hospital ID:', {
//         userHospitalId: user.hospitalId,
//         appointmentHospitalId: appointment.hospitalId
//       });
//       alert('Hospital ID not found. Cannot navigate to patient details.');
//       return;
//     }

//     //console.log('🚀 Navigating to:', `/patientdata/${patientHospitalId}/${patientId}`);

//     // Store correct hospitalId BEFORE navigation
//     localStorage.setItem('currentHospitalId', patientHospitalId);
//     //console.log('💾 Hospital ID stored in localStorage:', patientHospitalId);

//     try {
//       // Try to fetch complete patient data before navigation
//       const token = localStorage.getItem('token');
//       //console.log('📡 Fetching complete patient data...');

//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/api/patients/${patientHospitalId}/${patientId}`,
//         { headers: { 'Authorization': `Bearer ${token}` } }
//       );

//       const patientData = response.data;
//       //console.log('✅ Fetched complete patient data:', patientData);

//       navigate(`/patientdata/${patientHospitalId}/${patientId}`, {
//         state: {
//           patient: {
//             ...patientData,
//             hospitalId: patientHospitalId,
//             currentAppointment: appointment
//           }
//         }
//       });
//     } catch (error) {
//       console.warn('⚠️ Could not fetch complete patient data, using appointment data:', error);

//       // Create a patient object from appointment data
//       const fallbackPatientData = {
//         _id: patientId,
//         patientName: appointment.patientName,
//         firstName: appointment.patientName ? appointment.patientName.split(' ')[0] : '',
//         lastName: appointment.patientName ? appointment.patientName.split(' ').slice(1).join(' ') : '',
//         patientPhone: appointment.patientPhone,
//         primaryNumber: appointment.patientPhone,
//         patientCustomId: appointment.patientCustomId,
//         hospitalId: patientHospitalId,
//         currentAppointment: appointment
//       };

//       //console.log('🔄 Using fallback patient data:', fallbackPatientData);

//       navigate(`/patientdata/${patientHospitalId}/${patientId}`, {
//         state: {
//           patient: fallbackPatientData
//         }
//       });
//     }
//   };

//   // Request notification permission on component mount
//   useEffect(() => {
//     if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
//       Notification.requestPermission();
//     }
//   }, []);

//   // Initialize authentication
//   useEffect(() => {
//     const initializeAuth = () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           console.error('No authentication token found');
//           toast.error('Please log in again');
//           return;
//         }

//         const decoded = jwtDecode(token);
//         setUser({
//           role: decoded.role,
//           id: decoded.id || decoded.userId,
//           hospitalId: decoded.hospitalId
//         });

//         //console.log('User authenticated:', {
//           role: decoded.role,
//           id: decoded.id || decoded.userId,
//           hospitalId: decoded.hospitalId
//         });
//       } catch (error) {
//         console.error('Error initializing auth:', error);
//         toast.error('Authentication error. Please log in again.');
//       }
//     };

//     initializeAuth();
//   }, []);

//   // Fetch appointments - backend now handles scheduled filtering
//   const fetchAppointments = async (page = 1) => {
//     if (!user.role) {
//       console.warn('User not authenticated, skipping fetch');
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');

//       const params = new URLSearchParams({
//         page: page.toString(),
//         limit: appointmentsPerPage.toString()
//       });

//       if (user.role === 'Receptionist' && user.hospitalId) {
//         params.append('hospitalId', user.hospitalId);
//       }

//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/api/patients/appointments?${params.toString()}`,
//         {
//           headers: { 'Authorization': `Bearer ${token}` },
//         }
//       );

//       const { appointments: appointmentsData, totalAppointments, totalPages: total } = response.data;

//       setAppointments(appointmentsData || []);
//       setTotalPages(total || 1);
//       setCurrentPage(page);

//       //console.log(`Fetched ${appointmentsData?.length || 0} scheduled appointments from backend`);

//       if (appointmentsData && appointmentsData.length > 0) {
//         //console.log('First appointment structure:', {
//           appointmentId: appointmentsData[0]._id || appointmentsData[0].appointmentId,
//           patientId: appointmentsData[0].patientId,
//           patientName: appointmentsData[0].patientName,
//           hasRequiredIds: !!(appointmentsData[0]._id && appointmentsData[0].patientId)
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching appointments:', error);
//       toast.error(error.response?.data?.message || 'Failed to fetch appointments');
//       setAppointments([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch appointment statistics
//   const fetchAppointmentStats = async () => {
//     if (!user.role) return;

//     try {
//       const token = localStorage.getItem('token');

//       const params = new URLSearchParams();

//       if (user.role === 'Receptionist' && user.hospitalId) {
//         params.append('hospitalId', user.hospitalId);
//       }

//       const queryString = params.toString();
//       const url = queryString ?
//         `${import.meta.env.VITE_BACKEND_URL}/api/patients/appointments/stats?${queryString}` :
//         `${import.meta.env.VITE_BACKEND_URL}/api/patients/appointments/stats`;

//       const response = await axios.get(url, {
//         headers: { 'Authorization': `Bearer ${token}` },
//       });

//       setStatsData(response.data);
//     } catch (error) {
//       console.error('Error fetching appointment stats:', error);
//     }
//   };

//  const handleStatusChange = async (appointment, newStatus, event) => {
//   if (event) {
//     event.stopPropagation();
//   }

//   const appointmentId = appointment._id || appointment.appointmentId;
  
//   if (statusLoading[appointmentId] || appointment.status === newStatus) {
//     //console.log('⏭️ Skipping status change:', { 
//       loading: statusLoading[appointmentId], 
//       sameStatus: appointment.status === newStatus 
//     });
//     return;
//   }

//   try {
//     setStatusLoading(prev => ({ ...prev, [appointmentId]: true }));
//     const token = localStorage.getItem('token');
    
//     if (!appointment?.patientId) {
//       throw new Error('Patient ID is missing in appointment data');
//     }

//     let hospitalIdToUse = appointment.hospitalId;
//     if (user.role === 'Admin') {
//       hospitalIdToUse = appointment.hospitalId || '000000000000000000000000';
//     }

//     //console.log('🔄 Status change request:', {
//       hospitalId: hospitalIdToUse,
//       patientId: appointment.patientId,
//       appointmentId: appointmentId,
//       currentStatus: appointment.status,
//       newStatus: newStatus,
//       timestamp: new Date().toISOString()
//     });

//     const response = await axios.put(
//       `${import.meta.env.VITE_BACKEND_URL}/api/patients/${hospitalIdToUse}/${appointment.patientId}/appointments/${appointmentId}`,
//       { status: newStatus },
//       { 
//         headers: { 
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         } 
//       }
//     );

//     //console.log('✅ Status update response:', response.data);

//     if (response.data.success) {
//       // Update local state immediately
//       setAppointments(prev => prev.map(apt => {
//         const aptId = apt._id || apt.appointmentId;
//         if (aptId === appointmentId) {
//           //console.log('📝 Updating local state for appointment:', aptId);
//           return { 
//             ...apt, 
//             status: newStatus,
//             updatedAt: new Date().toISOString()
//           };
//         }
//         return apt;
//       }));

//       toast.success(`Status updated to ${newStatus}`);
      
//       if (Notification.permission === 'granted') {
//         new Notification('Status Updated', {
//           body: `Appointment status changed to ${newStatus} for ${appointment.patientName}`,
//           icon: '/favicon.ico',
//         });
//       }
      
//       // Refresh after short delay
//       setTimeout(() => {
//         //console.log('🔄 Refreshing appointments list...');
//         setRefreshTrigger(prev => prev + 1);
//       }, 500);
//     } else {
//       throw new Error(response.data.message || 'Failed to update status');
//     }
      
//   } catch (error) {
//     console.error('❌ Error updating appointment status:', error);
//     console.error('Error details:', {
//       message: error.message,
//       response: error.response?.data,
//       status: error.response?.status,
//       appointmentId,
//       newStatus
//     });
    
//     toast.error(error.response?.data?.message || error.message || 'Failed to update status');
    
//     // Force refresh on error
//     setRefreshTrigger(prev => prev + 1);
//   } finally {
//     setStatusLoading(prev => ({ ...prev, [appointmentId]: false }));
//   }
// };
//   // Filter appointments (client-side)
//   const getFilteredAppointments = () => {
//     let filtered = [...appointments];

//     if (searchTerm.trim()) {
//       const searchLower = searchTerm.toLowerCase();
//       filtered = filtered.filter(apt =>
//         (apt.patientName || '').toLowerCase().includes(searchLower) ||
//         (apt.patientPhone || '').includes(searchLower) ||
//         (apt.doctor || '').toLowerCase().includes(searchLower) ||
//         (apt.treatment || '').toLowerCase().includes(searchLower) ||
//         (apt.patientCustomId || '').toLowerCase().includes(searchLower) ||
//         (apt._id || apt.appointmentId || '').toLowerCase().includes(searchLower)
//       );
//     }

//     if (statusFilter !== 'All Status') {
//       filtered = filtered.filter(apt => apt.status === statusFilter);
//     }

//     if (priorityFilter !== 'All Priorities') {
//       filtered = filtered.filter(apt => apt.priority === priorityFilter);
//     }

//     return filtered;
//   };

//   // Handle delete appointment
//   const handleDeleteAppointment = () => {
//     setRefreshTrigger(prev => prev + 1);
//   };

//   // Handle export
//   const handleExport = () => {
//     try {
//       const filteredAppointments = getFilteredAppointments();

//       if (filteredAppointments.length === 0) {
//         toast.warning('No appointments to export');
//         return;
//       }

//       const csvData = filteredAppointments.map(apt => [
//         apt._id || apt.appointmentId || '',
//         apt.patientName || '',
//         apt.patientCustomId || '',
//         apt.patientPhone || '',
//         apt.doctor || '',
//         apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('en-GB') : '',
//         apt.appointmentTime || '',
//         apt.treatment || '',
//         apt.status || '',
//         apt.priority || '',
//         apt.notes || '',
//       ]);

//       const csvContent = [
//         ['Appointment ID', 'Patient Name', 'Patient ID', 'Phone', 'Doctor', 'Date', 'Time', 'Treatment', 'Status', 'Priority', 'Notes'].join(','),
//         ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
//       ].join('\n');

//       const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//       const link = document.createElement('a');
//       const url = URL.createObjectURL(blob);
//       link.setAttribute('href', url);
//       link.setAttribute('download', `scheduled_appointments_${new Date().toISOString().split('T')[0]}.csv`);
//       link.style.visibility = 'hidden';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);

//       toast.success('Scheduled appointments exported successfully!');
//     } catch (error) {
//       console.error('Export error:', error);
//       toast.error('Failed to export appointments');
//     }
//   };

//   // Handle page change
//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       fetchAppointments(page);
//     }
//   };

//   // Effects
//   useEffect(() => {
//     if (user.role) {
//       fetchAppointments(1);
//       fetchAppointmentStats();
//     }
//   }, [user.role, refreshTrigger]);

//   // Format functions
//   const formatDate = (dateString) => {
//     if (!dateString) return 'No date';
//     return new Date(dateString).toLocaleDateString('en-GB', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//     });
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       'Scheduled': 'bg-blue-100 text-blue-800',
//       'Completed': 'bg-green-100 text-green-800',
//       'Cancelled': 'bg-red-100 text-red-800',
//       'Pending': 'bg-yellow-100 text-yellow-800',
//       'Rescheduled': 'bg-purple-100 text-purple-800',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-800';
//   };

//   // Pagination
//   const filteredAppointments = getFilteredAppointments();
//   const displayedAppointments = filteredAppointments;

//   if (loading && !appointments.length) {
//     return (
//       <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-2 text-gray-600">Loading scheduled appointments...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-8 bg-gray-50 min-h-screen">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-2xl font-bold text-gray-900">Scheduled Appointments</h1>
//         <p className="text-gray-600">View and manage scheduled patient appointments</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <StatsCard
//           title="Total Appointments"
//           value={statsData.totalAppointments || 0}
//           icon={FaCalendarAlt}
//           iconBgColor="bg-blue-400"
//         />
//         <StatsCard
//           title="Upcoming"
//           value={statsData.upcomingAppointments || 0}
//           icon={FaUsers}
//           iconBgColor="bg-green-400"
//         />
//         <StatsCard
//           title="Completed"
//           value={statsData.pastAppointments || 0}
//           icon={FaCheckCircle}
//           iconBgColor="bg-green-400"
//         />
//         <StatsCard
//           title="This Month"
//           value={displayedAppointments.filter(apt => {
//             const appointmentDate = new Date(apt.appointmentDate);
//             const now = new Date();
//             return appointmentDate.getMonth() === now.getMonth() &&
//               appointmentDate.getFullYear() === now.getFullYear();
//           }).length}
//           icon={FaBan}
//           iconBgColor="bg-red-400"
//         />
//       </div>

//       {/* Search and Filters */}
//       <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
//         <div className="flex flex-col md:flex-row gap-4">
//           <div className="flex-1">
//             <div className="relative">
//               <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search by patient name, phone, doctor, treatment, patient ID, or appointment ID..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>

//           <div className="flex gap-4">
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="All Status">All Status</option>
//               <option value="Scheduled">Scheduled</option>
//               <option value="Rescheduled">Rescheduled</option>
//               <option value="Pending">Pending</option>
//               <option value="Completed">Completed</option>
//               <option value="Cancelled">Cancelled</option>
//             </select>

//             <button
//               onClick={handleExport}
//               className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-green-600 hover:text-white transition-colors flex items-center gap-2"
//             >
//               <Download className="h-4 w-4" />
//               Export
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Appointments Table */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="px-6 py-4 border-b border-gray-200">
//           <h3 className="text-lg font-semibold text-gray-900">
//             Scheduled Appointments ({displayedAppointments.length})
//           </h3>

//         </div>

//         {displayedAppointments.length === 0 ? (
//           <div className="p-8 text-center text-gray-500">
//             <div className="text-4xl mb-4">📅</div>
//             <h4 className="text-lg font-medium mb-2">No Scheduled Appointments Found</h4>
//             <p>No appointments match your search criteria.</p>
//           </div>
//         ) : (
//           <>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     {["S.No", "Patient Name", "Patient ID", "Phone", "Doctor", "Date & Time", "Treatment", "Status", "Actions"].map((head) => (
//                       <th key={head} className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
//                         {head}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {displayedAppointments.map((appointment, index) => {
//                     const serialNumber = (currentPage - 1) * appointmentsPerPage + index + 1;
//                     const appointmentId = appointment._id || appointment.appointmentId;

//                     // Skip if missing critical IDs
//                     if (!appointmentId || !appointment.patientId) {
//                       console.warn('Missing critical IDs for appointment:', {
//                         appointmentId,
//                         patientId: appointment.patientId,
//                         appointmentObject: appointment
//                       });
//                       return null;
//                     }

//                     return (
//                       <tr
//                         key={appointmentId}
//                         className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
//                         onClick={() => handleRowClick(appointment)}
//                         data-appointment-id={appointmentId}
//                       >
//                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                           {serialNumber}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm font-medium text-gray-900">
//                             {appointment.patientName || 'N/A'}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded max-w-[120px] truncate" title={appointment.patientCustomId}>
//                             {appointment.patientCustomId || 'N/A'}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">
//                             {appointment.patientPhone || 'N/A'}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm font-medium text-gray-900">
//                             {appointment.doctor || 'Not assigned'}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">
//                             {formatDate(appointment.appointmentDate)}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             {appointment.appointmentTime || 'No time'}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">
//                             {appointment.treatment || 'Not specified'}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {['Completed', 'Cancelled'].includes(appointment.status) ? (
//                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
//                               {appointment.status || 'Scheduled'}
//                             </span>
//                           ) : (
//                             <div className="relative" onClick={(e) => e.stopPropagation()}>
//                               <select
//                                 value={appointment.status || 'Scheduled'}
//                                 onChange={(e) => handleStatusChange(appointment, e.target.value, e)}
//                                 className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(appointment.status)} focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusLoading[appointmentId] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
//                                   }`}
//                                 disabled={statusLoading[appointmentId]}
//                               >
//                                 <option value="Scheduled">Scheduled</option>
//                                 <option value="Rescheduled">Rescheduled</option>
//                                 <option value="Pending">Pending</option>
//                                 <option value="Completed">Completed</option>
//                                 <option value="Cancelled">Cancelled</option>
//                               </select>
//                               {statusLoading[appointmentId] && (
//                                 <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
//                                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
//                                 </div>
//                               )}
//                             </div>
//                           )}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-lg font-medium">
//                           <div
//                             className="flex items-center gap-2"
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             <button
//                               onClick={() => {
//                                 setSelectedAppointment(appointment);
//                                 setShowViewModal(true);
//                               }}
//                               className="text-blue-500 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50"
//                               title="View Details"
//                             >
//                               <FaEye size={18} />
//                             </button>

//                             {!['Completed', 'Cancelled'].includes(appointment.status) && (
//                               <button
//                                 onClick={() => {
//                                   setSelectedAppointment(appointment);
//                                   setShowEditModal(true);
//                                 }}
//                                 className="text-green-500 hover:text-green-600 transition-colors p-1 rounded hover:bg-green-50"
//                                 title="Edit Appointment"
//                               >
//                                 <FaEdit size={18} />
//                               </button>
//                             )}

//                             <button
//                               onClick={() => {
//                                 setSelectedAppointment(appointment);
//                                 setShowDeleteModal(true);
//                               }}
//                               className="text-red-500 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
//                               title="Delete Appointment"
//                             >
//                               <Trash2 size={18} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
//                 <div className="flex justify-between items-center">
//                   <div className="text-sm text-gray-600">
//                     Showing {appointments.length} scheduled appointments (Page {currentPage} of {totalPages})
//                   </div>

//                   <div className="flex justify-center items-center gap-2">
//                     <button
//                       onClick={() => handlePageChange(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className={`p-2 rounded-md transition-colors ${currentPage === 1
//                           ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                           : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm border"
//                         }`}
//                       title="Previous Page"
//                     >
//                       <ChevronsLeft className="w-4 h-4" />
//                     </button>

//                     <div className="flex items-center gap-1">
//                       {Array.from({ length: totalPages }, (_, idx) => {
//                         const page = idx + 1;
//                         const isCurrentPage = currentPage === page;
//                         const shouldShow =
//                           page === 1 ||
//                           page === totalPages ||
//                           (page >= currentPage - 1 && page <= currentPage + 1);

//                         if (!shouldShow) return null;

//                         return (
//                           <button
//                             key={page}
//                             onClick={() => handlePageChange(page)}
//                             className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isCurrentPage
//                                 ? "bg-blue-500 text-white shadow-sm"
//                                 : "bg-white text-gray-700 hover:bg-gray-100 border"
//                               }`}
//                           >
//                             {page}
//                           </button>
//                         );
//                       })}
//                     </div>

//                     <button
//                       onClick={() => handlePageChange(currentPage + 1)}
//                       disabled={currentPage === totalPages}
//                       className={`p-2 rounded-md transition-colors ${currentPage === totalPages
//                           ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                           : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm border"
//                         }`}
//                       title="Next Page"
//                     >
//                       <ChevronsRight className="w-4 h-4" />
//                     </button>
//                   </div>

//                   <div className="text-sm text-gray-600">
//                     Page {currentPage} of {totalPages}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Modals */}
//       <ViewAppointmentModal
//         isOpen={showViewModal}
//         onClose={() => {
//           setShowViewModal(false);
//           setSelectedAppointment(null);
//         }}
//         appointment={selectedAppointment}
//         onEdit={(appointment) => {
//           setShowViewModal(false);
//           setSelectedAppointment(appointment);
//           setShowEditModal(true);
//         }}
//       />

//       <EditAppointmentModal
//         isOpen={showEditModal}
//         onClose={() => {
//           setShowEditModal(false);
//           setSelectedAppointment(null);
//         }}
//         appointment={selectedAppointment}
//         onUpdate={() => setRefreshTrigger(prev => prev + 1)}
//         user={user}
//       />

//       <DeleteConfirmModal
//         isOpen={showDeleteModal}
//         onClose={() => {
//           setShowDeleteModal(false);
//           setSelectedAppointment(null);
//         }}
//         appointment={selectedAppointment}
//         onDelete={handleDeleteAppointment}
//         loading={deleteLoading}
//         user={user}
//       />
//     </div>
//   );
// };

// export default Appointments;




//Appointments.jsx
import React, { useState, useEffect } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from "react-router-dom";
import { FaEdit, FaEye, FaCalendarAlt, FaUsers, FaCheckCircle, FaBan } from "react-icons/fa";
import { Trash2, Upload } from "lucide-react";
import { Search, Download, ChevronsLeft, ChevronsRight } from "lucide-react";

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, bgColor, textColor, iconBgColor }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`${iconBgColor} rounded-2xl p-3 flex items-center justify-center`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

// Edit Appointment Modal
const EditAppointmentModal = ({ isOpen, onClose, appointment, onUpdate, user }) => {
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    treatment: '',
    doctor: '',
    status: '',
    priority: 'Medium',
    notes: '',
    firstName: '',
    lastName: '',
    patientPhone: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appointment) {
      //console.log('Edit Modal - Full appointment object:', appointment);
      //console.log('Edit Modal - Patient ID:', appointment.patientId);
      //console.log('Edit Modal - Appointment ID:', appointment._id || appointment.appointmentId);

      const fullName = appointment.patientName || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      setFormData({
        appointmentDate: appointment.appointmentDate ? appointment.appointmentDate.split('T')[0] : '',
        appointmentTime: appointment.appointmentTime || '',
        treatment: appointment.treatment || '',
        doctor: appointment.doctor || '',
        status: appointment.status || 'Scheduled',
        priority: appointment.priority || 'Medium',
        notes: appointment.notes || '',
        firstName: firstName,
        lastName: lastName,
        patientPhone: appointment.patientPhone || '',
      });
    }
  }, [appointment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (!appointment?.patientId) {
        throw new Error('Patient ID is missing in appointment data');
      }

      let hospitalIdToUse = appointment.hospitalId;
      if (user.role === 'Admin') {
        hospitalIdToUse = appointment.hospitalId || '000000000000000000000000';
      }

      const appointmentId = appointment._id || appointment.appointmentId;

    /*  console.log('API Call Debug:', {
        hospitalId: hospitalIdToUse,
        patientId: appointment.patientId,
        appointmentId: appointmentId,
        apiUrl: `${import.meta.env.VITE_BACKEND_URL}/api/patients/${hospitalIdToUse}/${appointment.patientId}/appointments/${appointmentId}`
      }); */

      const patientName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/patients/${hospitalIdToUse}/${appointment.patientId}/appointments/${appointmentId}`,
        {
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          treatment: formData.treatment,
          doctor: formData.doctor,
          status: formData.status,
          priority: formData.priority,
          notes: formData.notes,
          patientName: patientName,
          patientPhone: formData.patientPhone,
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      toast.success('Appointment updated successfully!');

      if (Notification.permission === 'granted') {
        new Notification('Appointment Updated', {
          body: `Appointment for ${patientName || 'patient'} with ${formData.doctor || 'doctor'} on ${formData.appointmentDate} at ${formData.appointmentTime} has been updated.`,
          icon: '/favicon.ico',
        });
      }

      onUpdate();
      onClose();
    } catch (error) {
     // console.error('Error updating appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[500px] mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Appointment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter first name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Phone</label>
            <input
              type="tel"
              value={formData.patientPhone}
              onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter phone number"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={formData.appointmentTime}
                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <input
              type="text"
              value={formData.doctor}
              onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter doctor name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
            <input
              type="text"
              value={formData.treatment}
              onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter treatment type"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Rescheduled">Rescheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Enter any additional notes..."
            />
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2 cursor-pointer"
              disabled={loading}
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {loading ? 'Updating...' : 'Update Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Appointment Modal
const ViewAppointmentModal = ({ isOpen, onClose, appointment, onEdit }) => {
  if (!isOpen || !appointment) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Rescheduled': 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[500px] mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Appointment ID</label>
              <p className="text-sm text-gray-900 mt-1 font-mono bg-gray-50 px-2 py-1 rounded">
                {appointment._id || appointment.appointmentId || '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Patient Name</label>
              <p className="text-sm text-gray-900 mt-1">{appointment.patientName || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Patient ID</label>
              <p className="text-sm text-gray-900 mt-1 font-mono bg-gray-50 px-2 py-1 rounded">
                {appointment.patientCustomId || '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Patient Phone</label>
              <p className="text-sm text-gray-900 mt-1">{appointment.patientPhone || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Doctor</label>
              <p className="text-sm text-gray-900 mt-1">{appointment.doctor || 'Not assigned'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Treatment</label>
              <p className="text-sm text-gray-900 mt-1">{appointment.treatment || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Date</label>
              <p className="text-sm text-gray-900 mt-1">{formatDate(appointment.appointmentDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Time</label>
              <p className="text-sm text-gray-900 mt-1">{appointment.appointmentTime || 'No time'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <span className={`inline-flex px-1 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                  {appointment.status || 'Scheduled'}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Priority</label>
              <p className="text-sm text-gray-900 mt-1">{appointment.priority || 'Medium'}</p>
            </div>
            {appointment.notes && (
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="text-sm text-gray-900 mt-1 p-3 bg-gray-50 rounded-md">{appointment.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            Close
          </button>
          {!['Completed', 'Cancelled'].includes(appointment.status) && (
            <button
              onClick={() => {
                onClose();
                onEdit(appointment);
              }}
              className="px-4 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Edit Appointment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ isOpen, onClose, appointment, onDelete, loading, user }) => {
  if (!isOpen || !appointment) return null;

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');

      let hospitalIdToUse = appointment.hospitalId;
      if (user.role === 'Admin') {
        hospitalIdToUse = appointment.hospitalId || '000000000000000000000000';
      }

      const appointmentId = appointment._id || appointment.appointmentId;

      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/patients/${hospitalIdToUse}/${appointment.patientId}/appointments/${appointmentId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      toast.success('Appointment deleted successfully!');
      onDelete();
      onClose();
    } catch (error) {
     // console.error('Error deleting appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete appointment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white p-6 rounded-lg shadow-xl w-[400px] mx-4">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">🗑️</div>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Delete Appointment?</h2>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to permanently delete this appointment?
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2 cursor-pointer"
              disabled={loading}
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Appointments Component
const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [priorityFilter, setPriorityFilter] = useState('All Priorities');
  const [user, setUser] = useState({ role: null, id: null });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [statusLoading, setStatusLoading] = useState({});

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Stats data
  const [statsData, setStatsData] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    pastAppointments: 0,
  });

  const appointmentsPerPage = 5;

  // Handle row clicks to navigate to patient data
  const handleRowClick = async (appointment) => {
    //console.log('🔄 Clicking on appointment:', appointment);

    const patientId = appointment.patientId;
    const patientHospitalId = user.hospitalId || appointment.hospitalId;

    if (!patientId) {
     // console.error('❌ Missing patient ID:', patientId);
      alert('Patient ID not found. Cannot navigate to patient details.');
      return;
    }

    if (!patientHospitalId) {
     /* console.error('❌ Missing hospital ID:', {
        userHospitalId: user.hospitalId,
        appointmentHospitalId: appointment.hospitalId
      }); */
      alert('Hospital ID not found. Cannot navigate to patient details.');
      return;
    }

    //console.log('🚀 Navigating to:', `/patientdata/${patientHospitalId}/${patientId}`);

    localStorage.setItem('currentHospitalId', patientHospitalId);
    //console.log('💾 Hospital ID stored in localStorage:', patientHospitalId);

    try {
      const token = localStorage.getItem('token');
      //console.log('📡 Fetching complete patient data...');

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/patients/${patientHospitalId}/${patientId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const patientData = response.data;
      //console.log('✅ Fetched complete patient data:', patientData);

      navigate(`/patientdata/${patientHospitalId}/${patientId}`, {
        state: {
          patient: {
            ...patientData,
            hospitalId: patientHospitalId,
            currentAppointment: appointment
          }
        }
      });
    } catch (error) {
      console.warn('⚠️ Could not fetch complete patient data, using appointment data:', error);

      const fallbackPatientData = {
        _id: patientId,
        patientName: appointment.patientName,
        firstName: appointment.patientName ? appointment.patientName.split(' ')[0] : '',
        lastName: appointment.patientName ? appointment.patientName.split(' ').slice(1).join(' ') : '',
        patientPhone: appointment.patientPhone,
        primaryNumber: appointment.patientPhone,
        patientCustomId: appointment.patientCustomId,
        hospitalId: patientHospitalId,
        currentAppointment: appointment
      };

      //console.log('🔄 Using fallback patient data:', fallbackPatientData);

      navigate(`/patientdata/${patientHospitalId}/${patientId}`, {
        state: {
          patient: fallbackPatientData
        }
      });
    }
  };

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  // Initialize authentication
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
        //  console.error('No authentication token found');
          toast.error('Please log in again');
          return;
        }

        const decoded = jwtDecode(token);
        setUser({
          role: decoded.role,
          id: decoded.id || decoded.userId,
          hospitalId: decoded.hospitalId
        });

       /* console.log('User authenticated:', {
          role: decoded.role,
          id: decoded.id || decoded.userId,
          hospitalId: decoded.hospitalId
        });*/
      } catch (error) {
      //  console.error('Error initializing auth:', error);
        toast.error('Authentication error. Please log in again.');
      }
    };

    initializeAuth();
  }, []);

  // Fetch appointments - Get all appointments and handle filtering/pagination on frontend
  const fetchAppointments = async () => {
    if (!user.role) {
      console.warn('User not authenticated, skipping fetch');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const params = new URLSearchParams({
        page: '1',
        limit: '1000' // Fetch all appointments
      });

      if (user.role === 'Receptionist' && user.hospitalId) {
        params.append('hospitalId', user.hospitalId);
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/patients/appointments?${params.toString()}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      const { appointments: appointmentsData } = response.data;

      setAppointments(appointmentsData || []);

      //console.log(`Fetched ${appointmentsData?.length || 0} scheduled appointments from backend`);

      if (appointmentsData && appointmentsData.length > 0) {
      /*  console.log('First appointment structure:', {
          appointmentId: appointmentsData[0]._id || appointmentsData[0].appointmentId,
          patientId: appointmentsData[0].patientId,
          patientName: appointmentsData[0].patientName,
          hasRequiredIds: !!(appointmentsData[0]._id && appointmentsData[0].patientId)
        });*/
      }
    } catch (error) {
     // console.error('Error fetching appointments:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointment statistics
  const fetchAppointmentStats = async () => {
    if (!user.role) return;

    try {
      const token = localStorage.getItem('token');

      const params = new URLSearchParams();

      if (user.role === 'Receptionist' && user.hospitalId) {
        params.append('hospitalId', user.hospitalId);
      }

      const queryString = params.toString();
      const url = queryString ?
        `${import.meta.env.VITE_BACKEND_URL}/api/patients/appointments/stats?${queryString}` :
        `${import.meta.env.VITE_BACKEND_URL}/api/patients/appointments/stats`;

      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      setStatsData(response.data);
    } catch (error) {
     // console.error('Error fetching appointment stats:', error);
    }
  };

  const handleStatusChange = async (appointment, newStatus, event) => {
    if (event) {
      event.stopPropagation();
    }

    const appointmentId = appointment._id || appointment.appointmentId;
    
    if (statusLoading[appointmentId] || appointment.status === newStatus) {
    /*  console.log('⏭️ Skipping status change:', { 
        loading: statusLoading[appointmentId], 
        sameStatus: appointment.status === newStatus 
      });*/
      return;
    }

    try {
      setStatusLoading(prev => ({ ...prev, [appointmentId]: true }));
      const token = localStorage.getItem('token');
      
      if (!appointment?.patientId) {
        throw new Error('Patient ID is missing in appointment data');
      }

      let hospitalIdToUse = appointment.hospitalId;
      if (user.role === 'Admin') {
        hospitalIdToUse = appointment.hospitalId || '000000000000000000000000';
      }

     /* console.log('🔄 Status change request:', {
        hospitalId: hospitalIdToUse,
        patientId: appointment.patientId,
        appointmentId: appointmentId,
        currentStatus: appointment.status,
        newStatus: newStatus,
        timestamp: new Date().toISOString()
      });*/

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/patients/${hospitalIdToUse}/${appointment.patientId}/appointments/${appointmentId}`,
        { status: newStatus },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      //console.log('✅ Status update response:', response.data);

      if (response.data.success) {
        // Update local state immediately
        setAppointments(prev => prev.map(apt => {
          const aptId = apt._id || apt.appointmentId;
          if (aptId === appointmentId) {
            //console.log('📝 Updating local state for appointment:', aptId);
            return { 
              ...apt, 
              status: newStatus,
              updatedAt: new Date().toISOString()
            };
          }
          return apt;
        }));

        toast.success(`Status updated to ${newStatus}`);
        
        if (Notification.permission === 'granted') {
          new Notification('Status Updated', {
            body: `Appointment status changed to ${newStatus} for ${appointment.patientName}`,
            icon: '/favicon.ico',
          });
        }
        
        // Refresh after short delay
        setTimeout(() => {
          //console.log('🔄 Refreshing appointments list...');
          setRefreshTrigger(prev => prev + 1);
        }, 500);
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
        
    } catch (error) {
     // console.error('❌ Error updating appointment status:', error);
     /* console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        appointmentId,
        newStatus
      }); */
      
      toast.error(error.response?.data?.message || error.message || 'Failed to update status');
      
      // Force refresh on error
      setRefreshTrigger(prev => prev + 1);
    } finally {
      setStatusLoading(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  // Filter appointments (client-side)
  const getFilteredAppointments = () => {
    let filtered = [...appointments];

    // Hide completed appointments by default unless "Completed" is selected in filter
    if (statusFilter !== 'Completed') {
      filtered = filtered.filter(apt => apt.status !== 'Completed');
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(apt =>
        (apt.patientName || '').toLowerCase().includes(searchLower) ||
        (apt.patientPhone || '').includes(searchLower) ||
        (apt.doctor || '').toLowerCase().includes(searchLower) ||
        (apt.treatment || '').toLowerCase().includes(searchLower) ||
        (apt.patientCustomId || '').toLowerCase().includes(searchLower) ||
        (apt._id || apt.appointmentId || '').toLowerCase().includes(searchLower)
      );
    }

    if (statusFilter !== 'All Status') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    if (priorityFilter !== 'All Priorities') {
      filtered = filtered.filter(apt => apt.priority === priorityFilter);
    }

    return filtered;
  };

  // Handle delete appointment
  const handleDeleteAppointment = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle export
  const handleExport = () => {
    try {
      const filteredAppointments = getFilteredAppointments();

      if (filteredAppointments.length === 0) {
        toast.warning('No appointments to export');
        return;
      }

      const csvData = filteredAppointments.map(apt => [
        apt._id || apt.appointmentId || '',
        apt.patientName || '',
        apt.patientCustomId || '',
        apt.patientPhone || '',
        apt.doctor || '',
        apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('en-GB') : '',
        apt.appointmentTime || '',
        apt.treatment || '',
        apt.status || '',
        apt.priority || '',
        apt.notes || '',
      ]);

      const csvContent = [
        ['Appointment ID', 'Patient Name', 'Patient ID', 'Phone', 'Doctor', 'Date', 'Time', 'Treatment', 'Status', 'Priority', 'Notes'].join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `scheduled_appointments_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Scheduled appointments exported successfully!');
    } catch (error) {
      // console.error('Export error:', error);
      toast.error('Failed to export appointments');
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Effects
  useEffect(() => {
    if (user.role) {
      fetchAppointments();
      fetchAppointmentStats();
    }
  }, [user.role, refreshTrigger]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, priorityFilter]);

  // Format functions
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Rescheduled': 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Pagination
  const filteredAppointments = getFilteredAppointments();
  const displayedAppointments = filteredAppointments;

  // Calculate dynamic stats based on filtered appointments
  const calculateDynamicStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return {
      total: filteredAppointments.length,
      upcoming: filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= now && apt.status !== 'Completed' && apt.status !== 'Cancelled';
      }).length,
      completed: filteredAppointments.filter(apt => apt.status === 'Completed').length,
      thisMonth: filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
      }).length
    };
  };

  const dynamicStats = calculateDynamicStats();

  if (loading && !appointments.length) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading scheduled appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Scheduled Appointments</h1>
        <p className="text-sm text-gray-600 mt-1">View and manage scheduled patient appointments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Appointments"
          value={dynamicStats.total}
          icon={FaCalendarAlt}
          iconBgColor="bg-blue-400"
        />
        <StatsCard
          title="Upcoming"
          value={dynamicStats.upcoming}
          icon={FaUsers}
          iconBgColor="bg-green-400"
        />
        <StatsCard
          title="Completed"
          value={dynamicStats.completed}
          icon={FaCheckCircle}
          iconBgColor="bg-green-400"
        />
        <StatsCard
          title="This Month"
          value={dynamicStats.thisMonth}
          icon={FaCalendarAlt}
          iconBgColor="bg-purple-400"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name, phone, doctor, treatment, patient ID, or appointment ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Status">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

          <button
  onClick={handleExport}
  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 cursor-pointer"
>
  <Upload className="h-4 w-4" />
  Export
</button>

          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Scheduled Appointments ({displayedAppointments.length})
          </h3>
        </div>

        {displayedAppointments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">📅</div>
            <h4 className="text-lg font-medium mb-2">No Scheduled Appointments Found</h4>
            <p>No appointments match your search criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["S.No", "Patient Name", "Patient ID", "Phone", "Doctor", "Date & Time", "Treatment", "Status", "Actions"].map((head) => (
                      <th key={head} className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedAppointments.map((appointment, index) => {
                    const serialNumber = (currentPage - 1) * appointmentsPerPage + index + 1;
                    const appointmentId = appointment._id || appointment.appointmentId;

                    // Skip if missing critical IDs
                    if (!appointmentId || !appointment.patientId) {
                      console.warn('Missing critical IDs for appointment:', {
                        appointmentId,
                        patientId: appointment.patientId,
                        appointmentObject: appointment
                      });
                      return null;
                    }

                    return (
                      <tr
                        key={appointmentId}
                        className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                        onClick={() => handleRowClick(appointment)}
                        data-appointment-id={appointmentId}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {serialNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patientName || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded max-w-[120px] truncate" title={appointment.patientCustomId}>
                            {appointment.patientCustomId || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {appointment.patientPhone || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.doctor || 'Not assigned'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(appointment.appointmentDate)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.appointmentTime || 'No time'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {appointment.treatment || 'Not specified'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {['Completed', 'Cancelled'].includes(appointment.status) ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                              {appointment.status || 'Scheduled'}
                            </span>
                          ) : (
                            <div className="relative" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={appointment.status || 'Scheduled'}
                                onChange={(e) => handleStatusChange(appointment, e.target.value, e)}
                                className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(appointment.status)} focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusLoading[appointmentId] ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                  }`}
                                disabled={statusLoading[appointmentId]}
                              >
                                <option value="Scheduled">Scheduled</option>
                                <option value="Rescheduled">Rescheduled</option>
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                              {statusLoading[appointmentId] && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-lg font-medium">
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowViewModal(true);
                              }}
                              className="text-blue-500 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50 cursor-pointer"
                              title="View Details"
                            >
                              <FaEye size={18} />
                            </button>

                            {!['Completed', 'Cancelled'].includes(appointment.status) && (
                              <button
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowEditModal(true);
                                }}
                                className="text-green-500 hover:text-green-600 transition-colors p-1 rounded hover:bg-green-50 cursor-pointer"
                                title="Edit Appointment"
                              >
                                <FaEdit size={18} />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-500 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50 cursor-pointer"
                              title="Delete Appointment"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {appointments.length} scheduled appointments (Page {currentPage} of {totalPages})
                  </div>

                  <div className="flex justify-center items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-md transition-colors cursor-pointer ${currentPage === 1
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm border"
                        }`}
                      title="Previous Page"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, idx) => {
                        const page = idx + 1;
                        const isCurrentPage = currentPage === page;
                        const shouldShow =
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1);

                        if (!shouldShow) return null;

                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${isCurrentPage
                                ? "bg-blue-500 text-white shadow-sm"
                                : "bg-white text-gray-700 hover:bg-gray-100 border"
                              }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-md transition-colors cursor-pointer ${currentPage === totalPages
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-100 shadow-sm border"
                        }`}
                      title="Next Page"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ViewAppointmentModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onEdit={(appointment) => {
          setShowViewModal(false);
          setSelectedAppointment(appointment);
          setShowEditModal(true);
        }}
      />

      <EditAppointmentModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onUpdate={() => setRefreshTrigger(prev => prev + 1)}
        user={user}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onDelete={handleDeleteAppointment}
        loading={deleteLoading}
        user={user}
      />
    </div>
  );
};

export default Appointments;