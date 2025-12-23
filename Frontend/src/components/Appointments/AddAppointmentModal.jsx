import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Stethoscope, Plus, Edit, Trash2, ChevronDown, AlertCircle, CheckCircle, Save } from 'lucide-react';

const AddAppointmentModal = ({
  isOpen,
  onClose,
  onSuccess,
  onAppointmentAdded,
  mode = 'add',
  patientId,
  appointmentId = null,
  hospitalId,
  initialData = null,
  preSelectedPatient = null,
  showNotification = null
}) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newField, setNewField] = useState({ label: '', type: 'text', applyToAll: false });
  const [editingField, setEditingField] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    treatment: '',
    doctor: '',
    status: 'Scheduled',
    priority: 'Medium',
    notes: '',
    customFields: []
  });

  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availableTreatments, setAvailableTreatments] = useState([]);

  // Show notification helper
  const notify = (message, type = 'success') => {
    if (showNotification) {
      showNotification(message, type);
    } else {
      alert(message);
    }
  };

  // HTTP helper functions
  const apiRequest = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const baseUrl = import.meta.env.VITE_BACKEND_URL ;
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...options
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(`${baseUrl}${url}`, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
     // console.error('API request failed:', error);
      throw error;
    }
  };

  // Predefined options
  const statusOptions = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Pending'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

  // Enhanced validation functions
  const validateAppointmentDate = (dateStr) => {
    if (!dateStr) return 'Appointment date is required';
    
    try {
      const selectedDate = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(selectedDate.getTime())) {
        return 'Invalid date format';
      }
      
      if (mode === 'add' && selectedDate < today) {
        return 'Cannot schedule appointments in the past';
      }
      
      const maxFutureDate = new Date();
      maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 2);
      if (selectedDate > maxFutureDate) {
        return 'Appointment date cannot be more than 2 years in the future';
      }
      
      return null;
    } catch (error) {
      return 'Invalid date format';
    }
  };

  const validateAppointmentTime = (timeStr) => {
    if (!timeStr) return 'Appointment time is required';
    
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(timeStr)) {
      return 'Invalid time format. Use HH:MM format (e.g., 14:30)';
    }
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const startTime = 0 * 60; // 12:00 AM
    const endTime = 24 * 60;  // 12:00 AM (next day)
    
    if (timeInMinutes < startTime || timeInMinutes > endTime) {
      return 'Appointment time must be between 8:00 AM and 8:00 PM';
    }
    
    return null;
  };

  const validateTreatment = (treatment) => {
    if (!treatment || !treatment.trim()) {
      return 'Treatment is required';
    }
    
    if (treatment.trim().length < 2) {
      return 'Treatment must be at least 2 characters long';
    }
    
    if (treatment.trim().length > 100) {
      return 'Treatment cannot exceed 100 characters';
    }
    
    const treatmentRegex = /^[a-zA-Z0-9\s\-()]+$/;
    if (!treatmentRegex.test(treatment.trim())) {
      return 'Treatment contains invalid characters';
    }
    
    return null;
  };

  const validateDoctor = (doctor) => {
    if (!doctor || !doctor.trim()) {
      return null; // Doctor is optional
    }
    
    if (doctor.trim().length < 2) {
      return 'Doctor name must be at least 2 characters long';
    }
    
    if (doctor.trim().length > 50) {
      return 'Doctor name cannot exceed 50 characters';
    }
    
    const doctorRegex = /^[a-zA-Z\s.\-]+$/;
    if (!doctorRegex.test(doctor.trim())) {
      return 'Doctor name contains invalid characters';
    }
    
    return null;
  };

  const validateNotes = (notes) => {
    if (notes && notes.length > 500) {
      return 'Notes cannot exceed 500 characters';
    }
    return null;
  };

  // Fetch available doctors and treatments dynamically
  const fetchDoctorsAndTreatments = async () => {
    try {
      //console.log('Fetching doctors and treatments for hospital:', hospitalId);
      
      let doctors = [];
      let treatments = [];
      
      try {
        const doctorsResponse = await apiRequest(`/api/hospitals/${hospitalId}/doctors`);
        doctors = doctorsResponse.doctors || [];
      } catch (error) {
        //console.log('Dedicated doctors endpoint not available, will extract from appointments');
      }
      
      try {
        const treatmentsResponse = await apiRequest(`/api/hospitals/${hospitalId}/treatments`);
        treatments = treatmentsResponse.treatments || [];
      } catch (error) {
        //console.log('Dedicated treatments endpoint not available, will extract from appointments');
      }
      
      if (doctors.length === 0 || treatments.length === 0) {
        const adminId = localStorage.getItem('adminId');
        const patientsResponse = await apiRequest(`/api/patients?hospitalId=${hospitalId}&adminId=${adminId}`);
        const patients = Array.isArray(patientsResponse) ? patientsResponse : [];
        
        const uniqueDoctors = new Set();
        const uniqueTreatments = new Set();
        
        patients.forEach(patient => {
          if (patient.appointments && Array.isArray(patient.appointments)) {
            patient.appointments.forEach(appointment => {
              if (appointment.doctor && appointment.doctor.trim() && appointment.doctor.trim().length > 1) {
                uniqueDoctors.add(appointment.doctor.trim());
              }
              if (appointment.treatment && appointment.treatment.trim() && appointment.treatment.trim().length > 1) {
                uniqueTreatments.add(appointment.treatment.trim());
              }
            });
          }
        });
        
        if (doctors.length === 0) {
          doctors = Array.from(uniqueDoctors).sort();
        }
        if (treatments.length === 0) {
          treatments = Array.from(uniqueTreatments).sort();
        }
      }
      
      //console.log(`Found ${doctors.length} doctors and ${treatments.length} treatments`);
      setAvailableDoctors(doctors);
      setAvailableTreatments(treatments);
      
    } catch (error) {
     // console.error('Error fetching doctors and treatments:', error);
      setAvailableDoctors([]);
      setAvailableTreatments([]);
      notify('Could not load doctors and treatments list', 'warning');
    }
  };

  // Priority colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Urgent': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Fetch patient data
  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId || !hospitalId) return;
      
      setLoading(true);
      try {
        await fetchDoctorsAndTreatments();
        
        const response = await apiRequest(`/api/patients/${hospitalId}/${patientId}`);
        
        if (response.success) {
          setPatient(response.data);
          
          if (mode === 'edit' && appointmentId) {
            const appointment = response.data.appointments?.find(
              apt => apt._id === appointmentId
            );
            
            if (appointment) {
              setFormData({
                appointmentDate: appointment.appointmentDate ? 
                  new Date(appointment.appointmentDate).toISOString().split('T')[0] : '',
                appointmentTime: appointment.appointmentTime || '',
                treatment: appointment.treatment || '',
                doctor: appointment.doctor || '',
                status: appointment.status || 'Scheduled',
                priority: appointment.priority || 'Medium',
                notes: appointment.notes || '',
                customFields: appointment.customFields || []
              });
            }
          }
        }
      } catch (error) {
      //  console.error('Error fetching patient:', error);
        notify('Failed to fetch patient data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchPatient();
    }
  }, [isOpen, patientId, hospitalId, mode, appointmentId]);

  // Populate initial data if provided
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData, mode]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        appointmentDate: '',
        appointmentTime: '',
        treatment: '',
        doctor: '',
        status: 'Scheduled',
        priority: 'Medium',
        notes: '',
        customFields: []
      });
      setErrors({});
      setPatient(null);
      setShowConfirmation(false);
    }
  }, [isOpen]);

  // Enhanced validation function
  const validateForm = () => {
    const newErrors = {};

    const dateError = validateAppointmentDate(formData.appointmentDate);
    if (dateError) newErrors.appointmentDate = dateError;

    const timeError = validateAppointmentTime(formData.appointmentTime);
    if (timeError) newErrors.appointmentTime = timeError;

    const treatmentError = validateTreatment(formData.treatment);
    if (treatmentError) newErrors.treatment = treatmentError;

    const doctorError = validateDoctor(formData.doctor);
    if (doctorError) newErrors.doctor = doctorError;

    const notesError = validateNotes(formData.notes);
    if (notesError) newErrors.notes = notesError;

    formData.customFields.forEach((field, index) => {
      if (field.label && field.label.trim()) {
        if (field.type === 'email' && field.value && field.value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(field.value.trim())) {
            newErrors[`customField_${index}`] = `Invalid email format for ${field.label}`;
          }
        }
        
        if (field.type === 'number' && field.value && field.value.trim()) {
          if (isNaN(field.value) || Number(field.value) < 0) {
            newErrors[`customField_${index}`] = `${field.label} must be a valid positive number`;
          }
        }
        
        if (field.type === 'tel' && field.value && field.value.trim()) {
          const phoneRegex = /^\d{10}$/;
          if (!phoneRegex.test(field.value.replace(/\D/g, ''))) {
            newErrors[`customField_${index}`] = `${field.label} must be a valid 10-digit phone number`;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes with validation
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      const newErrors = { ...errors };
      
      switch (name) {
        case 'appointmentDate':
          const dateError = validateAppointmentDate(value);
          if (dateError) {
            newErrors[name] = dateError;
          } else {
            delete newErrors[name];
          }
          break;
        case 'appointmentTime':
          const timeError = validateAppointmentTime(value);
          if (timeError) {
            newErrors[name] = timeError;
          } else {
            delete newErrors[name];
          }
          break;
        case 'treatment':
          const treatmentError = validateTreatment(value);
          if (treatmentError) {
            newErrors[name] = treatmentError;
          } else {
            delete newErrors[name];
          }
          break;
        case 'doctor':
          const doctorError = validateDoctor(value);
          if (doctorError) {
            newErrors[name] = doctorError;
          } else {
            delete newErrors[name];
          }
          break;
        case 'notes':
          const notesError = validateNotes(value);
          if (notesError) {
            newErrors[name] = notesError;
          } else {
            delete newErrors[name];
          }
          break;
        default:
          delete newErrors[name];
      }
      
      setErrors(newErrors);
    }
  };

  // Handle custom field changes
  const handleCustomFieldChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.map((field, i) => 
        i === index ? { ...field, value } : field
      )
    }));
    
    const errorKey = `customField_${index}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Add custom field
  const handleAddCustomField = () => {
    if (!newField.label.trim()) {
      notify('Please enter a field label', 'error');
      return;
    }

    const customField = {
      label: newField.label,
      value: '',
      type: newField.type,
      section: 'appointment'
    };

    if (editingField !== null) {
      setFormData(prev => ({
        ...prev,
        customFields: prev.customFields.map((field, i) => 
          i === editingField ? customField : field
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        customFields: [...prev.customFields, customField]
      }));
    }

    setNewField({ label: '', type: 'text', applyToAll: false });
    setEditingField(null);
    setIsPopupOpen(false);
    notify('Custom field added successfully');
  };

  // Edit custom field
  const handleEditCustomField = (index) => {
    const field = formData.customFields[index];
    setNewField({ 
      label: field.label, 
      type: field.type || 'text', 
      applyToAll: false 
    });
    setEditingField(index);
    setIsPopupOpen(true);
  };

  // Remove custom field
  const handleRemoveCustomField = (index) => {
    if (window.confirm('Are you sure you want to remove this custom field?')) {
      setFormData(prev => ({
        ...prev,
        customFields: prev.customFields.filter((_, i) => i !== index)
      }));
      notify('Custom field removed');
    }
  };

  // Handle save as draft
  const handleSaveDraft = () => {
    notify('Draft saved successfully');
  };

  // Add new doctor/treatment with validation
  const handleAddNewDoctor = () => {
    const newDoctor = prompt('Enter new doctor name (e.g., Dr. Smith):');
    if (newDoctor && newDoctor.trim()) {
      const doctorName = newDoctor.trim();
      const doctorError = validateDoctor(doctorName);
      
      if (doctorError) {
        notify(doctorError, 'error');
        return;
      }
      
      if (!availableDoctors.includes(doctorName)) {
        setAvailableDoctors(prev => [...prev, doctorName].sort());
        setFormData(prev => ({ ...prev, doctor: doctorName }));
        notify('New doctor added successfully');
      } else {
        notify('This doctor already exists in the list', 'warning');
      }
    }
  };

  const handleAddNewTreatment = () => {
    const newTreatment = prompt('Enter new treatment:');
    if (newTreatment && newTreatment.trim()) {
      const treatmentName = newTreatment.trim();
      const treatmentError = validateTreatment(treatmentName);
      
      if (treatmentError) {
        notify(treatmentError, 'error');
        return;
      }
      
      if (!availableTreatments.includes(treatmentName)) {
        setAvailableTreatments(prev => [...prev, treatmentName].sort());
        setFormData(prev => ({ ...prev, treatment: treatmentName }));
        notify('New treatment added successfully');
      } else {
        notify('This treatment already exists in the list', 'warning');
      }
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      notify('Please fix the validation errors before submitting', 'error');
      return;
    }

    setSaving(true);
    try {
      const currentPatientId = patientId || preSelectedPatient?._id;
      const currentHospitalId = hospitalId || preSelectedPatient?.hospitalId;
      
      if (!currentPatientId || !currentHospitalId) {
        throw new Error('Patient ID and Hospital ID are required');
      }

      // Prepare appointment data with validation
      const appointmentData = {
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime.trim(),
        treatment: formData.treatment.trim(),
        doctor: formData.doctor.trim(),
        status: formData.status,
        priority: formData.priority,
        notes: formData.notes.trim(),
        customFields: formData.customFields.filter(field => field.label && field.label.trim())
      };

      if (mode === 'edit' && appointmentId) {
        appointmentData._id = appointmentId;
      }

      // Get current patient data and update appointments array
      const currentPatientResponse = await apiRequest(`/api/patients/${currentHospitalId}/${currentPatientId}`);
      let appointments = currentPatientResponse.data.appointments || [];

      if (mode === 'edit') {
        appointments = appointments.map(apt => 
          apt._id === appointmentId ? { ...apt, ...appointmentData } : apt
        );
      } else {
        // For new appointments, do not include a temporary _id
        const newAppointment = {
          ...appointmentData
        };
        appointments.push(newAppointment);
      }

      // Update patient with modified appointments
      await apiRequest(`/api/patients/${currentHospitalId}/${currentPatientId}`, {
        method: 'PUT',
        body: { appointments }
      });

      notify(`Appointment ${mode === 'edit' ? 'updated' : 'created'} successfully!`);
      
      setShowConfirmation(true);
      
      setTimeout(() => {
        setShowConfirmation(false);
        
        if (onAppointmentAdded) {
          onAppointmentAdded(appointmentData);
        } else if (onSuccess) {
          onSuccess(appointmentData);
        }
        
        onClose();
      }, 2000);
      
    } catch (error) {
     // console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} appointment:`, error);
      notify(error.message || `Failed to ${mode} appointment`, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
      
      {/* Confirmation Popup */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="bg-green-50 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg border-b border-green-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-base sm:text-lg font-semibold text-green-800">
                    Appointment {mode === 'edit' ? 'Updated' : 'Created'} Successfully!
                  </h3>
                  <p className="text-xs sm:text-sm text-green-600">
                    The appointment has been {mode === 'edit' ? 'updated' : 'scheduled'}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 rounded-b-lg">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">Closing...</p>
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-green-500 border-t-transparent mr-2"></div>
                  <span className="text-xs sm:text-sm text-green-600 font-medium">Success</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              {mode === 'edit' ? 'Edit Appointment' : 'Add New Appointment'}
            </h2>
            {(patient || preSelectedPatient) && (
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 truncate">
                Patient: {(patient || preSelectedPatient).firstName} {(patient || preSelectedPatient).lastName} ({(patient || preSelectedPatient).patientId})
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 rounded-md flex-shrink-0 cursor-pointer"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Custom Field Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {editingField !== null ? 'Edit Field' : 'Add Custom Field'}
                </h3>
                <button
                  onClick={() => {
                    setIsPopupOpen(false);
                    setNewField({ label: '', type: 'text', applyToAll: false });
                    setEditingField(null);
                  }}
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Field Label
                  </label>
                  <input
                    type="text"
                    value={newField.label}
                    onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter field name"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Field Type
                  </label>
                  <select
                    value={newField.type}
                    onChange={(e) => setNewField(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="date">Date</option>
                    <option value="textarea">Textarea</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end space-x-2 sm:space-x-3">
                <button
                  onClick={() => {
                    setIsPopupOpen(false);
                    setNewField({ label: '', type: 'text', applyToAll: false });
                    setEditingField(null);
                  }}
                  className="px-3 sm:px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-xs sm:text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomField}
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs sm:text-sm font-medium cursor-pointer"
                >
                  {editingField !== null ? 'Update' : 'Add Field'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Body - Made scrollable */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm sm:text-base text-gray-600">Loading patient data...</span>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Appointment Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  <Calendar className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Appointment Date *
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.appointmentDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.appointmentDate && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{errors.appointmentDate}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  <Clock className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Appointment Time *
                </label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                  min="00:00"
                  max="24:00"
                  step="900"
                  className={`w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.appointmentTime ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.appointmentTime && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{errors.appointmentTime}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Treatment and Doctor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  <Stethoscope className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Treatment *
                </label>
                <input
                  type="text"
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleInputChange}
                  list="treatments"
                  maxLength="100"
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.treatment ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter treatment"
                />
                <datalist id="treatments">
                  {availableTreatments.map(treatment => (
                    <option key={treatment} value={treatment} />
                  ))}
                </datalist>
                {errors.treatment && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{errors.treatment}</span>
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.treatment.length}/100 characters
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  <User className="inline w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Doctor
                </label>
                <input
                  type="text"
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleInputChange}
                  list="doctors"
                  maxLength="50"
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.doctor ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter doctor name"
                />
                <datalist id="doctors">
                  {availableDoctors.map(doctor => (
                    <option key={doctor} value={doctor} />
                  ))}
                </datalist>
                {errors.doctor && (
                  <p className="text-red-600 text-xs sm:text-sm mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{errors.doctor}</span>
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.doctor.length}/50 characters
                </p>
              </div>
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Priority
                </label>
                <div className="flex space-x-1.5 sm:space-x-2">
                  {priorityOptions.map(priority => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority }))}
                      className={`flex-1 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium border transition-colors cursor-pointer ${
                        formData.priority === priority
                          ? getPriorityColor(priority)
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                maxLength="500"
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.notes ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Additional notes..."
              />
              {errors.notes && (
                <p className="text-red-600 text-xs sm:text-sm mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                  <span>{errors.notes}</span>
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.notes.length}/500 characters
              </p>
            </div>

            {/* Custom Fields */}
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-base font-medium text-gray-900">Custom Fields</h3>
                <button
                  type="button"
                  onClick={() => setIsPopupOpen(true)}
                  className="flex items-center px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md cursor-pointer"
                >
                  <Plus size={14} className="sm:w-4 sm:h-4 mr-1" />
                  Add Field
                </button>
              </div>

              {formData.customFields.map((field, index) => (
                <div key={index} className="mb-3 sm:mb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    {field.label}
                  </label>
                  <div className="flex items-center space-x-2">
                    {field.type === 'textarea' ? (
                      <textarea
                        value={field.value || ''}
                        onChange={(e) => handleCustomFieldChange(index, e.target.value)}
                        className={`flex-grow px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`customField_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        rows="3"
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={field.value || ''}
                        onChange={(e) => handleCustomFieldChange(index, e.target.value)}
                        className={`flex-grow px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`customField_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleEditCustomField(index)}
                      className="p-2 text-blue-600 hover:text-blue-700 flex-shrink-0 cursor-pointer"
                    >
                      <Edit size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(index)}
                      className="p-2 text-red-600 hover:text-red-700 flex-shrink-0 cursor-pointer "
                    >
                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  {errors[`customField_${index}`] && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span>{errors[`customField_${index}`]}</span>
                    </p>
                  )}
                </div>
              ))}

              {/* Add new doctor/treatment buttons */}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleAddNewDoctor}
                    className="flex items-center px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-green-600 border border-green-300 rounded-md hover:bg-green-50 cursor-pointer"
                  >
                    <Plus size={12} className="sm:w-3.5 sm:h-3.5 mr-1" />
                    Add New Doctor
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleAddNewTreatment}
                    className="flex items-center px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-purple-600 border border-purple-300 rounded-md hover:bg-purple-50 cursor-pointer"
                  >
                    <Plus size={12} className="sm:w-3.5 sm:h-3.5 mr-1" />
                    Add New Treatment
                  </button>
                </div>
                
                <div className="mt-2 sm:mt-3 text-xs text-gray-500">
                  Available: {availableDoctors.length} doctors, {availableTreatments.length} treatments
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-xs sm:text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-xs sm:text-sm font-medium disabled:opacity-50 flex items-center justify-center cursor-pointer"
          >
            <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || loading || Object.keys(errors).length > 0}
            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs sm:text-sm font-medium disabled:opacity-50 flex items-center justify-center cursor-pointer"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                {mode === 'edit' ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                {mode === 'edit' ? 'Update Appointment' : 'Create Appointment'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);
};

export default AddAppointmentModal;