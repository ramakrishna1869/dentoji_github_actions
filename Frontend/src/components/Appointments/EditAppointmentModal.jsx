import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Stethoscope, FileText, AlertCircle, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';

const EditAppointmentModal = ({ isOpen, onClose, appointment, onUpdate }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    phoneNumber: '',
    emailAddress: '',
    doctor: '',
    treatmentType: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: '45 mins',
    priority: 'Medium',
    status: 'Scheduled',
    sendReminder: 'Yes',
    additionalNotes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [hospitalId, setHospitalId] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Populate form data when appointment prop changes
  useEffect(() => {
    if (appointment) {
      //console.log('📝 Received appointment data for edit:', appointment);
      
      // Format date for input field (YYYY-MM-DD)
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return '';
          return date.toISOString().split('T')[0];
        } catch (error) {
          console.warn('⚠️ Error formatting date:', dateString);
          return '';
        }
      };

      // Format time for input field (HH:MM) - ensure 24-hour format
      const formatTimeForInput = (timeString) => {
        if (!timeString) return '';
        
        // If it's already in HH:MM 24-hour format, return as is
        if (timeString.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
          return timeString;
        }
        
        // If it contains AM/PM, convert to 24-hour format
        if (timeString.match(/^\d{1,2}:\d{2}\s?(AM|PM)$/i)) {
          try {
            const [time, period] = timeString.split(/\s/);
            const [hours, minutes] = time.split(':');
            let hour = parseInt(hours, 10);
            
            if (period.toUpperCase() === 'PM' && hour !== 12) {
              hour += 12;
            } else if (period.toUpperCase() === 'AM' && hour === 12) {
              hour = 0;
            }
            
            return `${hour.toString().padStart(2, '0')}:${minutes}`;
          } catch (error) {
            console.warn('⚠️ Error converting time:', timeString);
            return timeString;
          }
        }
        
        return timeString;
      };

      // Set form data with proper formatting
      setFormData({
        patientName: appointment.patientName || '',
        phoneNumber: appointment.phoneNumber || '',
        emailAddress: appointment.emailAddress || '',
        doctor: appointment.doctor || '',
        treatmentType: appointment.treatmentType || '',
        appointmentDate: formatDateForInput(appointment.appointmentDate),
        appointmentTime: formatTimeForInput(appointment.appointmentTime),
        duration: appointment.duration || '45 mins',
        priority: appointment.priority || 'Medium',
        status: appointment.status || 'Scheduled',
        sendReminder: appointment.sendReminder === true || appointment.sendReminder === 'Yes' ? 'Yes' : 'No',
        additionalNotes: appointment.additionalNotes || ''
      });

      // Clear any previous errors
      setErrors({});
      
     /* console.log('✅ Form data populated:', {
        patientName: appointment.patientName,
        appointmentDate: formatDateForInput(appointment.appointmentDate),
        appointmentTime: formatTimeForInput(appointment.appointmentTime),
        status: appointment.status
      });*/
    }
  }, [appointment]);

  // Get hospital and admin ID from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No authentication token found. Please log in.');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const fetchedAdminId = decoded.id;
      setAdminId(fetchedAdminId);

      if (decoded.hospitalId) {
        setHospitalId(decoded.hospitalId);
      } else {
        // Fetch hospital ID from profile if not in token
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`)
          .then((response) => {
            const fetchedHospitalId = response.data.hospital?._id;
            if (fetchedHospitalId) {
              setHospitalId(fetchedHospitalId);
            } else {
              toast.error('No hospital ID found.');
            }
          })
          .catch((err) => {
           // console.error('❌ Error fetching user profile:', err);
            toast.error('Failed to fetch hospital ID');
          });
      }
    } catch (err) {
    //  console.error('❌ Error decoding token:', err);
      toast.error('Invalid token');
    }
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Enhanced validation function
  const validateForm = () => {
    const newErrors = {};
    
    // Required field validations
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?\d{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number (10-15 digits)';
    }
    
    if (formData.emailAddress && !/^\S+@\S+\.\S+$/.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address';
    }
    
    if (!formData.doctor.trim()) {
      newErrors.doctor = 'Doctor is required';
    }
    
    if (!formData.treatmentType.trim()) {
      newErrors.treatmentType = 'Treatment type is required';
    }
    
    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Appointment date is required';
    } else {
      // Check if date is not in the past (optional validation)
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.appointmentDate = 'Appointment date cannot be in the past';
      }
    }
    
    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'Appointment time is required';
    } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.appointmentTime)) {
      newErrors.appointmentTime = 'Please enter time in HH:MM format (e.g., 14:30)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = () => {
    //console.log('💾 Saving appointment draft:', formData);
    toast.success('Draft saved successfully!');
  };

  // Enhanced update appointment function
  const handleUpdateAppointment = async () => {
    if (!validateForm()) {
      //console.log('❌ Form validation failed:', errors);
      toast.error('Please fix the validation errors before updating.');
      return;
    }

    try {
      setIsUpdating(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }
      if (!hospitalId) {
        throw new Error('Invalid hospital ID');
      }
      if (!appointment?._id) {
        throw new Error('Invalid appointment ID');
      }

      //console.log('🔄 Updating appointment with ID:', appointment._id);
      //console.log('📝 Form data to update:', formData);

      // Prepare appointment data with proper formatting
      const appointmentData = {
        patientName: formData.patientName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        emailAddress: formData.emailAddress ? formData.emailAddress.trim() : '',
        doctor: formData.doctor.trim(),
        treatmentType: formData.treatmentType.trim(),
        appointmentDate: formData.appointmentDate, // This will be ISO date string
        appointmentTime: formData.appointmentTime, // 24-hour format HH:MM
        duration: formData.duration,
        priority: formData.priority,
        status: formData.status,
        sendReminder: formData.sendReminder === 'Yes',
        additionalNotes: formData.additionalNotes ? formData.additionalNotes.trim() : '',
        hospitalId,
        adminId
      };

    /*  console.log('📤 Sending update request:', {
        url: `${import.meta.env.VITE_BACKEND_URL}/api/appointments/${hospitalId}/${appointment._id}`,
        data: appointmentData
      }); */

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/appointments/${hospitalId}/${appointment._id}`, 
        appointmentData,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      //console.log('✅ Appointment updated successfully:', response.data);
      
      // Show success message
      toast.success('Appointment updated successfully!');
      setShowConfirmation(true);
      
      // Call the onUpdate callback to refresh the appointment list
      if (onUpdate && typeof onUpdate === 'function') {
        try {
          await onUpdate(response.data.appointment || response.data);
        } catch (callbackError) {
          console.warn('⚠️ Error in onUpdate callback:', callbackError);
          // Continue anyway, the update was successful
        }
      }
      
      // Close the modal after a short delay
      setTimeout(() => {
        setShowConfirmation(false);
        onClose();
      }, 2000);
      
    } catch (err) {
     /* console.error('❌ Update appointment error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        hospitalId,
        appointmentId: appointment?._id
      });*/

      let errorMessage = 'Failed to update appointment';
      
      if (err.response?.status === 404) {
        errorMessage = 'Appointment not found in the specified hospital';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to update this appointment';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || 'Invalid appointment data';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setErrors({});
    setShowConfirmation(false);
    onClose();
  };

  if (!isOpen) return null;

  if (!hospitalId || !adminId) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
        <div className="bg-white p-6 rounded-lg shadow-xl">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <div>Loading authentication...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto m-4">
        <ToastContainer position="top-right" autoClose={3000} />
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Appointment</h1>
              <p className="text-gray-500">Update appointment details for {formData.patientName || 'patient'}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-md cursor-pointer text-sm transition-colors"
            disabled={isUpdating}
          >
            <X className="w-4 h-4 mr-1" />
            Close
          </button>
        </div>

        {/* Confirmation Popup */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 w-full max-w-md text-center shadow-2xl">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-green-600 mb-2">Success!</h2>
              <p className="text-gray-700">Appointment updated successfully!</p>
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-8">
          {/* Appointment Information Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Appointment Information</h2>
              <p className="text-sm text-gray-500">Fill in all required fields to update the appointment</p>
            </div>
          </div>

          <div className="space-y-12">
            {/* Patient Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Patient Information
              </h3>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.patientName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter patient name"
                    disabled={isUpdating}
                  />
                  {errors.patientName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.patientName}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="+91 9876543210"
                    disabled={isUpdating}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  Email Address
                </label>
                <input
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.emailAddress ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="example@email.com"
                  disabled={isUpdating}
                />
                {errors.emailAddress && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.emailAddress}
                  </p>
                )}
              </div>
            </div>

            {/* Appointment Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Stethoscope className="w-5 h-5 mr-2 text-gray-600" />
                Appointment Details
              </h3>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    Doctor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.doctor ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter doctor name"
                    disabled={isUpdating}
                  />
                  {errors.doctor && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.doctor}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    Treatment Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="treatmentType"
                    value={formData.treatmentType}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.treatmentType ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter treatment type"
                    disabled={isUpdating}
                  />
                  {errors.treatmentType && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.treatmentType}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    Appointment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.appointmentDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isUpdating}
                  />
                  {errors.appointmentDate && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.appointmentDate}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    Appointment Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.appointmentTime ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isUpdating}
                  />
                  {errors.appointmentTime && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.appointmentTime}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Appointment Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-600" />
                Appointment Settings
              </h3>
              
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    Duration
                  </label>
                  <div className="relative">
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={isUpdating}
                    >
                      <option value="30 mins">30 mins</option>
                      <option value="45 mins">45 mins</option>
                      <option value="1 hour">1 hour</option>
                      <option value="1.5 hours">1.5 hours</option>
                      <option value="2 hours">2 hours</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    Priority
                  </label>
                  <div className="relative">
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={isUpdating}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      disabled={isUpdating}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="No-show">No-show</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  Send Reminder
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sendReminder"
                      value="Yes"
                      checked={formData.sendReminder === 'Yes'}
                      onChange={handleInputChange}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                      disabled={isUpdating}
                    />
                    <span className="text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sendReminder"
                      value="No"
                      checked={formData.sendReminder === 'No'}
                      onChange={handleInputChange}
                      className="mr-2 text-blue-600 focus:ring-blue-500"
                      disabled={isUpdating}
                    />
                    <span className="text-sm text-gray-700">No</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-gray-600" />
                Additional Information
              </h3>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-600">
                  Additional Notes
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                  placeholder="Enter any additional notes or special instructions..."
                  disabled={isUpdating}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUpdating}
                >
                  Save Draft
                </button>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-3 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateAppointment}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isUpdating}
                  >
                    {isUpdating && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {isUpdating ? 'Updating...' : 'Update Appointment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentModal;
