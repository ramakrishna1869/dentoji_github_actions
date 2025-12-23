//AddConsultationModal
import React, { useState, useEffect, useRef } from "react";
import { X, Search, User, Phone, Calendar, AlertCircle, ChevronDown } from "lucide-react";
import axios from "axios";

export default function AddConsultationModal({ isOpen, onClose, onCreate, isEdit = false, initialData = null, consultationId = null }) {
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    patientPhone: "",
    patientAge: "",
    patientGender: "",
    consultantDoctor: "",
    doctorPhone: "",
    clinicName: "",
    treatmentSpecialty: "",
    consultationType: "",
    status: "Scheduled",
    appointmentDate: "",
    appointmentTime: "",
    paymentTotal: "",
    paymentPaid: "0",
    paymentStatus: "Pending",
    referralReason: "",
    additionalNotes: "",
    customFields: []
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const searchResultsRef = useRef(null);

  // Initialize form data for edit mode
  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        patientId: initialData.patientObjectId || "",
        patientName: initialData.patientName || "",
        patientPhone: initialData.patientPhone || "",
        patientAge: initialData.patientAge ? initialData.patientAge.toString() : "",
        patientGender: initialData.patientGender || "",
        consultantDoctor: initialData.consultantDoctor || "",
        doctorPhone: initialData.doctorPhone || "",
        clinicName: initialData.clinicName || "",
        treatmentSpecialty: initialData.treatmentSpecialty || "",
        consultationType: initialData.consultationType || "",
        status: initialData.status || "Scheduled",
        appointmentDate: initialData.appointmentDate ? new Date(initialData.appointmentDate).toISOString().split('T')[0] : "",
        appointmentTime: initialData.appointmentTime || "",
        paymentTotal: initialData.payment?.total ? initialData.payment.total.toString() : "",
        paymentPaid: initialData.payment?.paid ? initialData.payment.paid.toString() : "0",
        paymentStatus: initialData.payment?.status || "Pending",
        referralReason: initialData.referralReason || "",
        additionalNotes: initialData.additionalNotes || "",
        customFields: initialData.customFields || []
      });

      setSearchQuery(initialData.patientName || "");
      if (initialData.patientObjectId) {
        setSelectedPatient({
          patientId: initialData.patientObjectId,
          firstName: initialData.patientName?.split(' ')[0] || "",
          lastName: initialData.patientName?.split(' ').slice(1).join(' ') || "",
          phoneNumber: initialData.patientPhone,
          age: initialData.patientAge,
          gender: initialData.patientGender
        });
      }
    }
  }, [initialData, isEdit]);

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Search patients by name, phone, or patient ID
  const searchPatients = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      setHighlightedIndex(-1);
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/consultations/search-patients?query=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSearchResults(response.data.data || []);
      setShowSearchResults(response.data.data.length > 0);
      setHighlightedIndex(-1);
    } catch (err) {
     // console.error("Error searching patients:", err);
      setError(err.response?.data?.message || "Failed to search patients. Please try again.");
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchPatients(value);
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (!showSearchResults || searchResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const newIndex = prev < searchResults.length - 1 ? prev + 1 : 0;
          scrollToHighlightedItem(newIndex);
          return newIndex;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : searchResults.length - 1;
          scrollToHighlightedItem(newIndex);
          return newIndex;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
          selectPatient(searchResults[highlightedIndex]);
        }
        break;
      case "Escape":
        setShowSearchResults(false);
        setHighlightedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  const scrollToHighlightedItem = (index) => {
    if (searchResultsRef.current) {
      const item = searchResultsRef.current.children[index];
      if (item) {
        item.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  };

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setFormData((prev) => ({
      ...prev,
      patientId: patient._id || "",
      patientName: `${patient.firstName} ${patient.lastName}`.trim(),
      patientPhone: patient.phoneNumber || patient.primaryNumber || "",
      patientAge: patient.age ? patient.age.toString() : "",
      patientGender: patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1).toLowerCase() : ""
    }));
    setSearchQuery(`${patient.firstName} ${patient.lastName}`.trim());
    setShowSearchResults(false);
    setHighlightedIndex(-1);
  };

  const clearPatientSelection = () => {
    setSelectedPatient(null);
    setFormData((prev) => ({
      ...prev,
      patientId: "",
      patientName: "",
      patientPhone: "",
      patientAge: "",
      patientGender: ""
    }));
    setSearchQuery("");
    setShowSearchResults(false);
    setHighlightedIndex(-1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const addCustomField = () => {
    setFormData((prev) => ({
      ...prev,
      customFields: [...prev.customFields, { key: "", value: "" }]
    }));
  };

  const removeCustomField = (index) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const handleCustomFieldChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    // Validate required fields
    if (
      !formData.patientName ||
      !formData.consultantDoctor ||
      !formData.clinicName ||
      !formData.consultationType ||
      !formData.appointmentDate ||
      !formData.appointmentTime
    ) {
      setError("Please fill in all required fields: Patient Name, Consultant Doctor, Clinic Name, Consultation Type, Appointment Date, Appointment Time");
      setIsSubmitting(false);
      return;
    }

    const selectedDate = new Date(formData.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      setError("Appointment date cannot be in the past");
      setIsSubmitting(false);
      return;
    }

    if (formData.paymentTotal && isNaN(Number(formData.paymentTotal))) {
      setError("Payment total must be a valid number");
      setIsSubmitting(false);
      return;
    }

    if (formData.paymentPaid && isNaN(Number(formData.paymentPaid))) {
      setError("Payment paid must be a valid number");
      setIsSubmitting(false);
      return;
    }

    if (Number(formData.paymentPaid) > Number(formData.paymentTotal)) {
      setError("Paid amount cannot exceed total amount");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const submitData = {
        patientId: selectedPatient?.patientId || formData.patientId,
        patientName: formData.patientName.trim(),
        patientPhone: formData.patientPhone.trim(),
        patientAge: formData.patientAge ? parseInt(formData.patientAge) : null,
        patientGender: formData.patientGender,
        consultantDoctor: formData.consultantDoctor.trim(),
        doctorPhone: formData.doctorPhone.trim(),
        clinicName: formData.clinicName.trim(),
        treatmentSpecialty: formData.treatmentSpecialty.trim(),
        consultationType: formData.consultationType.trim(),
        status: formData.status,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        payment: {
          status: formData.paymentStatus,
          total: formData.paymentTotal ? parseFloat(formData.paymentTotal) : 0,
          paid: formData.paymentPaid ? parseFloat(formData.paymentPaid) : 0
        },
        referralReason: formData.referralReason.trim(),
        additionalNotes: formData.additionalNotes.trim(),
        customFields: formData.customFields.filter(field => field.key.trim() && field.value.trim())
      };

      let response;
      if (isEdit) {
        response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/consultations/${consultationId}`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/consultations`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      setSuccess(isEdit ? "Consultation updated successfully!" : "Consultation created successfully!");

      if (typeof onCreate === "function") {
        onCreate(response.data.data);
      }

      setTimeout(() => {
        resetForm();
        onClose();
      }, 1000);
    } catch (err) {
     // console.error("Error processing consultation:", err);
      const errorMessage = err.response?.data?.message || err.message;
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
        localStorage.removeItem("token");
      } else if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors
          .map((e) => `${e.field}: ${e.message}`)
          .join("; ");
        setError(`Validation failed: ${errorMessages}`);
      } else {
        setError(errorMessage || "Failed to process consultation. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: "",
      patientName: "",
      patientPhone: "",
      patientAge: "",
      patientGender: "",
      consultantDoctor: "",
      doctorPhone: "",
      clinicName: "",
      treatmentSpecialty: "",
      consultationType: "",
      status: "Scheduled",
      appointmentDate: "",
      appointmentTime: "",
      paymentTotal: "",
      paymentPaid: "",
      paymentStatus: "Pending",
      referralReason: "",
      additionalNotes: "",
      customFields: []
    });
    setSelectedPatient(null);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    setHighlightedIndex(-1);
    setError("");
    setSuccess("");
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
        setHighlightedIndex(-1);
      }
    };

    if (showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSearchResults]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {isEdit ? "Edit Consultation" : "Add New Consultation"}
            </h2>
            <p className="text-gray-500 text-sm">
              Search for existing patient or add new details
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {/* Patient Search Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
              <User size={18} />
              Patient Information
            </h3>

            <div ref={searchContainerRef} className="relative mb-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  size={16}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by patient name, phone, or ID..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (searchResults.length > 0 && searchQuery.length >= 2) {
                      setShowSearchResults(true);
                    }
                  }}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
                {showSearchResults && searchResults.length > 0 && (
                  <ChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                    size={16}
                  />
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div
                  ref={searchResultsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                  style={{ maxHeight: "16rem" }}
                >
                  {searchResults.map((patient, index) => (
                    <div
                      key={patient._id}
                      onClick={() => selectPatient(patient)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`p-4 cursor-pointer border-b last:border-b-0 transition-colors ${
                        index === highlightedIndex
                          ? "bg-blue-50 border-blue-100"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 truncate">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 shrink-0">
                              <Phone size={12} />
                              {patient.phoneNumber || patient.primaryNumber || "-"}
                            </span>
                            {patient.lastVisit && (
                              <span className="flex items-center gap-1 shrink-0">
                                <Calendar size={12} />
                                Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2 shrink-0">
                          {patient.age}y, {patient.gender}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No results message */}
              {showSearchResults &&
                searchResults.length === 0 &&
                !isSearching &&
                searchQuery.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-gray-500 text-center">
                    No patients found for "{searchQuery}"
                  </div>
                )}
            </div>

            {/* Selected Patient Info */}
            {selectedPatient && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium text-green-800 mb-1">
                      Selected Patient
                    </div>
                    <div className="text-green-700">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      {selectedPatient.phoneNumber || selectedPatient.primaryNumber || "No phone"} •{" "}
                      {selectedPatient.age} years • {selectedPatient.gender}
                    </div>
                  </div>
                  <button
                    onClick={clearPatientSelection}
                    className="text-green-600 hover:text-green-800 text-sm underline whitespace-nowrap cursor-pointer"
                  >
                    Clear selection
                  </button>
                </div>
              </div>
            )}

            {/* Manual Patient Entry Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Patient Name *
  </label>
  <input
    type="text"
    name="patientName"
    value={formData.patientName}
    onChange={(e) => {
      const value = e.target.value;
      // Only allow letters (a-z, A-Z) and spaces
      const textOnly = value.replace(/[^a-zA-Z\s]/g, '');
      
      handleChange({
        target: {
          name: 'patientName',
          value: textOnly
        }
      });
    }}
    onKeyPress={(e) => {
      // Prevent typing numbers and special characters
      const char = e.key;
      if (!/[a-zA-Z\s]/.test(char)) {
        e.preventDefault();
      }
    }}
    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter patient name"
  />
</div>
            <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Phone Number
  </label>
  <input
    type="text"
    name="patientPhone"
    value={formData.patientPhone}
    onChange={(e) => {
      const value = e.target.value;
      // Only allow numbers and limit to 10 digits
      const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 10);
      
      handleChange({
        target: {
          name: 'patientPhone',
          value: numbersOnly
        }
      });
    }}
    onKeyPress={(e) => {
      // Prevent typing non-numeric characters
      const char = e.key;
      if (!/[0-9]/.test(char)) {
        e.preventDefault();
      }
    }}
    maxLength="10"
    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter 10-digit phone number"
  />
  {formData.patientPhone && formData.patientPhone.length < 10 && (
    <p className="text-xs text-red-500 mt-1">
      Phone number must be 10 digits
    </p>
  )}
</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="patientAge"
                  value={formData.patientAge}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <input
                  name="patientGender"
                  value={formData.patientGender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Male/Female"
                />
                  {/* <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option> */}
                
              </div>
            </div>
          </div>

          {/* Consultation Information */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Consultation Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Consultant Doctor *
  </label>
  <input
    type="text"
    name="consultantDoctor"
    value={formData.consultantDoctor}
    onChange={(e) => {
      const value = e.target.value;
      // Only allow letters (a-z, A-Z) and spaces
      const textOnly = value.replace(/[^a-zA-Z\s]/g, '');
      
      handleChange({
        target: {
          name: 'consultantDoctor',
          value: textOnly
        }
      });
    }}
    onKeyPress={(e) => {
      // Prevent typing numbers and special characters
      const char = e.key;
      if (!/[a-zA-Z\s]/.test(char)) {
        e.preventDefault();
      }
    }}
    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter doctor name"
  />
</div>
            <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Doctor Phone
  </label>
  <input
    type="text"
    name="doctorPhone"
    value={formData.doctorPhone}
    onChange={(e) => {
      const value = e.target.value;
      // Only allow numbers and limit to 10 digits
      const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 10);
      
      handleChange({
        target: {
          name: 'doctorPhone',
          value: numbersOnly
        }
      });
    }}
    onKeyPress={(e) => {
      // Prevent typing non-numeric characters
      const char = e.key;
      if (!/[0-9]/.test(char)) {
        e.preventDefault();
      }
    }}
    maxLength="10"
    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Enter 10-digit phone number"
  />
  {formData.doctorPhone && formData.doctorPhone.length < 10 && formData.doctorPhone.length > 0 && (
    <p className="text-xs text-red-500 mt-1">
      Phone number must be 10 digits
    </p>
  )}
</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clinic Name *
                </label>
                <input
                  type="text"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter clinic name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Specialty
                </label>
                <select
                  name="treatmentSpecialty"
                  value={formData.treatmentSpecialty}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consultation Type *
                </label>
                <select
                  name="consultationType"
                  value={formData.consultationType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="General Checkup">General Checkup</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Treatment">Treatment</option>
                  <option value="Surgery">Surgery</option>
                  <option value="Routine">Routine</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="High Urgency">High Urgency</option>
                </select>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
              <Calendar size={18} />
              Appointment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Appointment Time *
                </label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                 
                </select>
              </div>
             <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Total Amount (₹)
  </label>
  <input
    type="number"
    name="paymentTotal"
    value={formData.paymentTotal}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="0.00"
    min="0"
    step="0.01"
  />
</div>
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Paid Amount (₹)
  </label>
  <input
    type="number"
    name="paymentPaid"
    value={formData.paymentPaid}
    onChange={(e) => {
      const paidValue = parseFloat(e.target.value) || 0;
      const totalValue = parseFloat(formData.paymentTotal) || 0;
      
      // Prevent paid amount from exceeding total amount
      if (paidValue > totalValue) {
        return;
      }
      
      handleChange(e);
    }}
    onBlur={(e) => {
      const paidValue = parseFloat(e.target.value) || 0;
      const totalValue = parseFloat(formData.paymentTotal) || 0;
      
      // Alert and clear if paid exceeds total
      if (paidValue > totalValue) {
        handleChange({
          target: {
            name: 'paymentPaid',
            value: ''
          }
        });
        alert(`Paid amount cannot exceed total amount of ₹${totalValue}`);
      }
    }}
    max={formData.paymentTotal || undefined}
    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="0.00"
    min="0"
    step="0.01"
  />
</div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referral Reason
                </label>
                <textarea
                  name="referralReason"
                  value={formData.referralReason}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Enter referral reason or symptoms..."
                  maxLength={1000}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.referralReason.length}/1000 characters
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Any additional notes or instructions..."
                  maxLength={1000}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.additionalNotes.length}/1000 characters
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Custom Fields
                  </label>
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4 mr-1 rotate-45" />
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
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Field value"
                      value={field.value}
                      onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 bg-white border-t p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !formData.patientName ||
                !formData.consultantDoctor ||
                !formData.clinicName ||
                !formData.consultationType ||
                !formData.appointmentDate ||
                !formData.appointmentTime ||
                isSubmitting
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
              {isSubmitting
                ? "Processing..."
                : isEdit
                ? "Update Consultation"
                : "Create Consultation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
