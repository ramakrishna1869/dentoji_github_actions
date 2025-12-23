//EditConsultationModal
import React, { useState, useEffect, useRef } from "react";
import { X, Search, User, Calendar, Clock, Phone, DollarSign, FileText, Plus } from "lucide-react";

const EditConsultationModal = ({ consultation, onClose, onUpdate, onSearchPatients }) => {
  // Initialize form state with existing consultation data
  const [formData, setFormData] = useState({
    patientId: consultation?.patientId || "",
    patientName: consultation?.patientName || "",
    patientPhone: consultation?.patientPhone || "",
    patientAge: consultation?.patientAge || "",
    patientGender: consultation?.patientGender || "",
    consultantDoctor: consultation?.consultantDoctor || "",
    doctorPhone: consultation?.doctorPhone || "",
    clinicName: consultation?.clinicName || "",
    treatmentSpecialty: consultation?.treatmentSpecialty || "",
    consultationType: consultation?.consultationType || "",
    status: consultation?.status || "Scheduled",
    appointmentDate: consultation?.appointmentDate || "",
    appointmentTime: consultation?.appointmentTime || "",
    paymentTotal: consultation?.payment?.total?.toString() || "",
    paymentPaid: consultation?.payment?.paid?.toString() || "0",
    paymentStatus: consultation?.payment?.status || "Pending",
    referralReason: consultation?.referralReason || "",
    additionalNotes: consultation?.additionalNotes || "",
    customFields: consultation?.customFields || []
  });

  // Patient search state
  const [patientSearchQuery, setPatientSearchQuery] = useState(consultation?.patientName || "");
  const [patientSearchResults, setPatientSearchResults] = useState([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(-1);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Refs
  const patientSearchRef = useRef(null);
  const dropdownRef = useRef(null);

  // Search debounce timer
  const searchTimeoutRef = useRef(null);

  // Patient search functionality
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (patientSearchQuery.length >= 2 && patientSearchQuery !== consultation?.patientName) {
      searchTimeoutRef.current = setTimeout(async () => {
        setSearchLoading(true);
        try {
          const results = await onSearchPatients(patientSearchQuery);
          setPatientSearchResults(results);
          setShowPatientDropdown(true);
          setSelectedPatientIndex(-1);
        } catch (error) {
        //  console.error('Patient search error:', error);
          setPatientSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      }, 300);
    } else {
      setPatientSearchResults([]);
      setShowPatientDropdown(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [patientSearchQuery, onSearchPatients, consultation?.patientName]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPatientDropdown(false);
        setSelectedPatientIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!showPatientDropdown || patientSearchResults.length === 0) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedPatientIndex(prev => 
            prev < patientSearchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedPatientIndex(prev => 
            prev > 0 ? prev - 1 : patientSearchResults.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (selectedPatientIndex >= 0) {
            handlePatientSelect(patientSearchResults[selectedPatientIndex]);
          }
          break;
        case 'Escape':
          setShowPatientDropdown(false);
          setSelectedPatientIndex(-1);
          break;
      }
    };

    if (showPatientDropdown) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showPatientDropdown, patientSearchResults, selectedPatientIndex]);

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setFormData(prev => ({
      ...prev,
      patientId: patient.patientId || "",
      patientName: `${patient.firstName} ${patient.lastName}`.trim(),
      patientPhone: patient.phoneNumber || patient.primaryNumber || "",
      patientAge: patient.age || "",
      patientGender: patient.gender || ""
    }));
    setPatientSearchQuery(`${patient.firstName} ${patient.lastName}`.trim());
    setShowPatientDropdown(false);
    setSelectedPatientIndex(-1);
    // Clear any patient-related errors
    setErrors(prev => ({
      ...prev,
      patientName: "",
      patientPhone: ""
    }));
  };

  // Handle patient search input
  const handlePatientSearchChange = (e) => {
    const value = e.target.value;
    setPatientSearchQuery(value);
    
    // If user is typing, update the patient name
    if (value !== formData.patientName) {
      setFormData(prev => ({
        ...prev,
        patientName: value
      }));
      
      // If they clear the search or change it significantly, clear patient data
      if (value.length < 2 || !consultation?.patientName?.toLowerCase().includes(value.toLowerCase())) {
        setFormData(prev => ({
          ...prev,
          patientId: "",
          patientPhone: "",
          patientAge: "",
          patientGender: ""
        }));
      }
    }
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Add custom field
  const addCustomField = () => {
    setFormData(prev => ({
      ...prev,
      customFields: [...prev.customFields, { key: "", value: "" }]
    }));
  };

  // Remove custom field
  const removeCustomField = (index) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  // Handle custom field change
  const handleCustomFieldChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.patientName.trim()) {
      newErrors.patientName = "Patient name is required";
    }

    if (!formData.consultantDoctor.trim()) {
      newErrors.consultantDoctor = "Consultant doctor is required";
    }

    if (!formData.clinicName.trim()) {
      newErrors.clinicName = "Clinic name is required";
    }

    if (!formData.consultationType.trim()) {
      newErrors.consultationType = "Consultation type is required";
    }

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = "Appointment date is required";
    }

    if (!formData.appointmentTime) {
      newErrors.appointmentTime = "Appointment time is required";
    }

    if (formData.paymentTotal && isNaN(Number(formData.paymentTotal))) {
      newErrors.paymentTotal = "Payment total must be a valid number";
    }

    if (formData.paymentPaid && isNaN(Number(formData.paymentPaid))) {
      newErrors.paymentPaid = "Payment paid must be a valid number";
    }

    if (Number(formData.paymentPaid) > Number(formData.paymentTotal)) {
      newErrors.paymentPaid = "Paid amount cannot exceed total amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        id: consultation.id || consultation._id, // Include the consultation ID
        patientAge: formData.patientAge ? Number(formData.patientAge) : undefined,
        payment: {
          status: formData.paymentStatus,
          total: Number(formData.paymentTotal) || 0,
          paid: Number(formData.paymentPaid) || 0
        },
        customFields: formData.customFields.filter(field => field.key.trim() && field.value.trim())
      };

      // Remove payment fields from main object
      delete submitData.paymentStatus;
      delete submitData.paymentTotal;
      delete submitData.paymentPaid;

      const result = await onUpdate(submitData);
      if (result && result.success) {
        onClose();
      }
    } catch (error) {
     // console.error('Update consultation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date for input (convert from various formats to YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split('T')[0];
  };

  // Format time for input (ensure HH:MM format)
  const formatTimeForInput = (timeString) => {
    if (!timeString) return "";
    // If it's already in HH:MM format, return as is
    if (/^\d{2}:\d{2}$/.test(timeString)) return timeString;
    // If it includes seconds, strip them
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) return timeString.substring(0, 5);
    return timeString;
  };

  // Update form data when consultation prop changes
  useEffect(() => {
    if (consultation) {
      setFormData({
        patientId: consultation.patientId || "",
        patientName: consultation.patientName || "",
        patientPhone: consultation.patientPhone || "",
        patientAge: consultation.patientAge?.toString() || "",
        patientGender: consultation.patientGender || "",
        consultantDoctor: consultation.consultantDoctor || "",
        doctorPhone: consultation.doctorPhone || "",
        clinicName: consultation.clinicName || "",
        treatmentSpecialty: consultation.treatmentSpecialty || "",
        consultationType: consultation.consultationType || "",
        status: consultation.status || "Scheduled",
        appointmentDate: formatDateForInput(consultation.appointmentDate),
        appointmentTime: formatTimeForInput(consultation.appointmentTime),
        paymentTotal: consultation.payment?.total?.toString() || "",
        paymentPaid: consultation.payment?.paid?.toString() || "0",
        paymentStatus: consultation.payment?.status || "Pending",
        referralReason: consultation.referralReason || "",
        additionalNotes: consultation.additionalNotes || "",
        customFields: consultation.customFields || []
      });
      setPatientSearchQuery(consultation.patientName || "");
    }
  }, [consultation]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Edit Consultation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Information Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Patient Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patient Search */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Patient *
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    ref={patientSearchRef}
                    type="text"
                    value={patientSearchQuery}
                    onChange={handlePatientSearchChange}
                    placeholder="Type patient name, ID, or phone..."
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.patientName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {searchLoading && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  )}
                </div>
                
                {/* Patient Search Dropdown */}
                {showPatientDropdown && patientSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {patientSearchResults.map((patient, index) => (
                      <div
                        key={patient._id || index}
                        onClick={() => handlePatientSelect(patient)}
                        className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                          index === selectedPatientIndex ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          ID: {patient.patientId} | Phone: {patient.phoneNumber || patient.primaryNumber || '-'}
                        </div>
                        {patient.age && (
                          <div className="text-xs text-gray-500">
                            Age: {patient.age} | Gender: {patient.gender || '-'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {errors.patientName && (
                  <p className="mt-1 text-sm text-red-600">{errors.patientName}</p>
                )}
              </div>

              {/* Patient ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID
                </label>
                <input
                  type="text"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  placeholder="Auto-filled or enter manually"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Patient Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Phone
                </label>
                <input
                  type="tel"
                  name="patientPhone"
                  value={formData.patientPhone}
                  onChange={handleInputChange}
                  placeholder="Auto-filled or enter manually"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Patient Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Age
                </label>
                <input
                  type="number"
                  name="patientAge"
                  value={formData.patientAge}
                  onChange={handleInputChange}
                  placeholder="Auto-filled or enter manually"
                  min="0"
                  max="150"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Patient Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Gender
                </label>
                <select
                  name="patientGender"
                  value={formData.patientGender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Consultation Details Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Consultation Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Consultant Doctor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultant Doctor *
                </label>
                <input
                  type="text"
                  name="consultantDoctor"
                  value={formData.consultantDoctor}
                  onChange={handleInputChange}
                  placeholder="Enter doctor name"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.consultantDoctor ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.consultantDoctor && (
                  <p className="mt-1 text-sm text-red-600">{errors.consultantDoctor}</p>
                )}
              </div>

              {/* Doctor Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor Phone
                </label>
                <input
                  type="tel"
                  name="doctorPhone"
                  value={formData.doctorPhone}
                  onChange={handleInputChange}
                  placeholder="Enter doctor phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Clinic Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clinic Name *
                </label>
                <input
                  type="text"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleInputChange}
                  placeholder="Enter clinic name"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.clinicName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.clinicName && (
                  <p className="mt-1 text-sm text-red-600">{errors.clinicName}</p>
                )}
              </div>

              {/* Treatment Specialty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Specialty
                </label>
                <select
                  name="treatmentSpecialty"
                  value={formData.treatmentSpecialty}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Specialty</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Gynecology">Gynecology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="ENT">ENT</option>
                  <option value="Ophthalmology">Ophthalmology</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Consultation Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultation Type *
                </label>
                <select
                  name="consultationType"
                  value={formData.consultationType}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.consultationType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Type</option>
                  <option value="Initial Consultation">Initial Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Routine Checkup">Routine Checkup</option>
                  <option value="Specialist Referral">Specialist Referral</option>
                  <option value="Second Opinion">Second Opinion</option>
                </select>
                {errors.consultationType && (
                  <p className="mt-1 text-sm text-red-600">{errors.consultationType}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Rescheduled">Rescheduled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Appointment Details Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Appointment Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Appointment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.appointmentDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.appointmentDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.appointmentDate}</p>
                )}
              </div>

              {/* Appointment Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Time *
                </label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.appointmentTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.appointmentTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.appointmentTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Information Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Payment Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount
                </label>
                <input
                  type="number"
                  name="paymentTotal"
                  value={formData.paymentTotal}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.paymentTotal ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.paymentTotal && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentTotal}</p>
                )}
              </div>

              {/* Paid Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paid Amount
                </label>
                <input
                  type="number"
                  name="paymentPaid"
                  value={formData.paymentPaid}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.paymentPaid ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.paymentPaid && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentPaid}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Information</h3>
            
            <div className="space-y-4">
              {/* Referral Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referral Reason
                </label>
                <textarea
                  name="referralReason"
                  value={formData.referralReason}
                  onChange={handleInputChange}
                  placeholder="Enter referral reason or symptoms..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  placeholder="Any additional notes or instructions..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Custom Fields */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Custom Fields
                  </label>
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="inline-flex items-center px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Field
                  </button>
                </div>
                
                {formData.customFields.map((field, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Field name"
                      value={field.key}
                      onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Field value"
                      value={field.value}
                      onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomField(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Consultation'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditConsultationModal;