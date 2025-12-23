//AddLabRecordModal
import React, { useState, useEffect, useRef } from "react";
import { X, Search, User, Phone, Calendar, AlertCircle, ChevronDown } from "lucide-react";
import axios from "axios";

export default function AddLabRecordModal({ isOpen, onClose, onAddRecord, initialData, isEdit = false, recordId }) {
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    patientPhone: "",
    patientAge: "",
    patientGender: "",
    labName: "",
    technician: "",
    crownType: "",
    material: "",
    tooth: "",
    status: "Sent",
    paymentStatus: "Pending",
    paidAmount: "",
    totalAmount: "",
    dueDate: "",
    sentDate: "",
    traysDetails: "",
    receivedDate: "",
    tag: "",
    notes: "",
    billUploaded: false
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

  useEffect(() => {
    if (initialData) {
      setFormData({
        patientId: initialData.patientId || "",
        patientName: initialData.patientName || "",
        patientPhone: initialData.patientPhone || "",
        patientAge: initialData.patientAge ? initialData.patientAge.toString() : "",
        patientGender: initialData.patientGender || "",
        labName: initialData.labName || "",
        technician: initialData.technician || "",
        crownType: initialData.crownType || "",
        material: initialData.material || "",
        traysDetails: initialData.traysDetails || "",
        tooth: initialData.tooth || "",
        status: initialData.status || "Sent",
        paymentStatus: initialData.payment?.status || "Pending",
        paidAmount: initialData.payment?.paid ? initialData.payment.paid.toString() : "",
        totalAmount: initialData.payment?.total ? initialData.payment.total.toString() : "",
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : "",
        sentDate: initialData.sentDate ? new Date(initialData.sentDate).toISOString().split('T')[0] : "",
        receivedDate: initialData.receivedDate ? new Date(initialData.receivedDate).toISOString().split('T')[0] : "",
        tag: initialData.tag || "",
        notes: initialData.notes || "",
        billUploaded: initialData.billUploaded || false
      });

      setSearchQuery(initialData.patientName || "");
      setSelectedPatient({
        patientId: initialData.patientId,
        firstName: initialData.patientName?.split(' ')[0] || "",
        lastName: initialData.patientName?.split(' ')[1] || "",
        phoneNumber: initialData.patientPhone,
        age: initialData.patientAge,
        gender: initialData.patientGender
      });
    }
  }, [initialData]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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
        `${import.meta.env.VITE_BACKEND_URL}/api/lab-records/search-patients?query=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSearchResults(response.data);
      setShowSearchResults(response.data.length > 0);
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
      patientId: patient.patientId || "",
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientPhone: patient.phoneNumber || patient.primaryNumber || "",
      patientAge: patient.age ? patient.age.toString() : "",
      patientGender: patient.gender || "",
    }));
    setSearchQuery(`${patient.firstName} ${patient.lastName}`);
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
      patientGender: "",
    }));
    setSearchQuery("");
    setShowSearchResults(false);
    setHighlightedIndex(-1);
  };
const handleChange = (e) => {
  const { name, value } = e.target;
  
  // Clear receivedDate when status is set to Pending
  if (name === 'status' && value === 'Pending') {
    setFormData(prev => ({
      ...prev,
      [name]: value,
      receivedDate: '' // Clear the received date
    }));
  } 
  // Handle payment status changes
  else if (name === 'paymentStatus') {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // If Fully Paid is selected, auto-fill paid amount to match total
      if (value === 'Fully Paid' && prev.totalAmount) {
        newData.paidAmount = prev.totalAmount;
      }
      // If Pending is selected, set paid amount to 0
      else if (value === 'Pending') {
        newData.paidAmount = '0';
      }
      
      return newData;
    });
  }
  // Handle total amount changes - update paid if Fully Paid is selected
  else if (name === 'totalAmount') {
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // If payment status is Fully Paid, update paid amount to match
      if (prev.paymentStatus === 'Fully Paid' && value) {
        newData.paidAmount = value;
      }
      
      return newData;
    });
  }
  // Handle paid amount changes - auto-update payment status based on amounts
  else if (name === 'paidAmount') {
    setFormData(prev => {
      const paid = parseFloat(value) || 0;
      const total = parseFloat(prev.totalAmount) || 0;
      
      let newPaymentStatus = prev.paymentStatus;
      
      // Auto-calculate payment status based on amounts
      if (total > 0) {
        if (paid >= total) {
          newPaymentStatus = 'Fully Paid';
        } else if (paid > 0) {
          newPaymentStatus = 'Partial';
        } else {
          newPaymentStatus = 'Pending';
        }
      }
      
      return {
        ...prev,
        [name]: value,
        paymentStatus: newPaymentStatus
      };
    });
  }
  else {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
};

const getPaymentStatusWarning = () => {
  const paid = parseFloat(formData.paidAmount) || 0;
  const total = parseFloat(formData.totalAmount) || 0;
  const status = formData.paymentStatus;
  
  if (total === 0 && status !== 'Pending') {
    return "⚠️ Total amount is required for payment status";
  }
  
  if (status === 'Fully Paid' && paid < total) {
    return "⚠️ Paid amount should equal total amount for 'Fully Paid'";
  }
  
  if (status === 'Partial' && (paid === 0 || paid >= total)) {
    return "⚠️ For 'Partial', paid should be between 0 and total";
  }
  
  if (status === 'Pending' && paid > 0) {
    return "⚠️ Paid amount should be 0 for 'Pending' status";
  }
  
  return null;
};

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    if (!formData.patientName || !formData.labName || !formData.crownType || !formData.tooth) {
      setError("Please fill in all required fields: Patient Name, Lab Name, Crown Type, Tooth");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      // Parse amounts
      const paidAmount = parseFloat(formData.paidAmount) || 0;
      const totalAmount = parseFloat(formData.totalAmount) || 0;
      
      // Calculate payment status based on amounts
      let finalPaymentStatus = 'Pending';
      if (totalAmount > 0) {
        if (paidAmount >= totalAmount) {
          finalPaymentStatus = 'Fully Paid';
        } else if (paidAmount > 0) {
          finalPaymentStatus = 'Partial';
        }
      }

      const labRecordData = {
        patientId: selectedPatient?.patientId || formData.patientId,
        patientName: formData.patientName.trim(),
        patientPhone: formData.patientPhone.trim(),
        patientAge: formData.patientAge ? parseInt(formData.patientAge) : null,
        patientGender: formData.patientGender,
        labName: formData.labName.trim(),
        technician: formData.technician.trim(),
        sentDate: formData.sentDate || new Date().toISOString().split("T")[0],
        dueDate: formData.dueDate,
        crownType: formData.crownType.trim(),
        material: formData.material.trim(),
        tooth: formData.tooth.trim(),
        tag: formData.tag.trim(),
        traysDetails: formData.traysDetails || '',
        status: formData.status,
        receivedDate: formData.receivedDate,
        payment: {
          status: finalPaymentStatus,
          total: totalAmount,
          paid: paidAmount,
        },
        paymentStatus: finalPaymentStatus, // Also send as top-level for backend compatibility
        totalAmount: totalAmount,
        paidAmount: paidAmount,
        billUploaded: formData.billUploaded,
        notes: formData.notes.trim(),
      };

     // console.log('Submitting lab record with payment status:', finalPaymentStatus);
   //   console.log('Full data:', labRecordData);

      let response;
      if (isEdit) {
        response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/lab-records/${recordId}`,
          labRecordData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/lab-records`,
          labRecordData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

     // console.log('Server response:', response.data);

      const savedRecord = response.data.labRecord || response.data;
      
      if (!savedRecord || !savedRecord._id) {
      //  console.error('Invalid response from server:', response.data);
        setError('Record may have been saved but response is invalid. Please refresh to verify.');
        setIsSubmitting(false);
        return;
      }

    //  console.log('Lab record saved successfully with ID:', savedRecord._id);
    //  console.log('Saved payment status:', savedRecord.payment?.status);

      setSuccess(isEdit ? "Lab record updated successfully!" : "Lab record created successfully!");

      if (onAddRecord && typeof onAddRecord === "function") {
     //   console.log('Calling onAddRecord with saved record');
        onAddRecord(savedRecord);
      } else {
        console.warn('onAddRecord is not a function:', typeof onAddRecord);
      }

      setTimeout(() => {
        resetForm();
        onClose();
      }, 500);

    } catch (err) {
    //  console.error("Error processing lab record:", err);
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
        setError(errorMessage || "Failed to process lab record. Please try again.");
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
      labName: "",
      technician: "",
      crownType: "",
      traysDetails: "",
      material: "",
      tooth: "",
      status: "Sent",
      paymentStatus: "Pending",
      paidAmount: "",
      totalAmount: "",
      dueDate: "",
      sentDate: "",
      receivedDate: "",
      tag: "",
      notes: "",
      billUploaded: false,
    });
    setSelectedPatient(null);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    setHighlightedIndex(-1);
    setError("");
    setSuccess("");
  };

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

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-center p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex-shrink-0 bg-white border-b p-3 sm:p-4 md:p-6 flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 truncate">
              {isEdit ? "Edit Lab Record" : "Add New Lab Record"}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Search for existing patient or add new details
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 cursor-pointer"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {error && (
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Patient Search Section */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
              <User size={16} className="sm:w-[18px] sm:h-[18px]" />
              Patient Information
            </h3>

            <div ref={searchContainerRef} className="relative mb-3 sm:mb-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  size={16}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by name, phone, or ID..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (searchResults.length > 0 && searchQuery.length >= 2) {
                      setShowSearchResults(true);
                    }
                  }}
                  className="w-full pl-10 pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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

              {showSearchResults && searchResults.length > 0 && (
                <div
                  ref={searchResultsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 sm:max-h-64 overflow-y-auto"
                >
                  {searchResults.map((patient, index) => (
                    <div
                      key={patient._id}
                      onClick={() => selectPatient(patient)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`p-3 sm:p-4 cursor-pointer border-b last:border-b-0 transition-colors ${
                        index === highlightedIndex
                          ? "bg-blue-50 border-blue-100"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 truncate text-sm sm:text-base">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1 shrink-0">
                              <User size={12} />
                              ID: {patient.patientId}
                            </span>
                            <span className="flex items-center gap-1 shrink-0">
                              <Phone size={12} />
                              {patient.phoneNumber || patient.primaryNumber}
                            </span>
                            {patient.lastVisit && (
                              <span className="flex items-center gap-1 shrink-0">
                                <Calendar size={12} />
                                Last: {new Date(patient.lastVisit).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-[10px] sm:text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full shrink-0">
                          {patient.age}y, {patient.gender}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showSearchResults &&
                searchResults.length === 0 &&
                !isSearching &&
                searchQuery.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-3 sm:p-4 text-gray-500 text-center text-sm">
                    No patients found for "{searchQuery}"
                  </div>
                )}
            </div>

            {selectedPatient && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-green-800 mb-1">
                      Selected Patient
                    </div>
                    <div className="text-sm sm:text-base text-green-700 truncate">
                      {selectedPatient.firstName} {selectedPatient.lastName} (ID: {selectedPatient.patientId})
                    </div>
                    <div className="text-xs sm:text-sm text-green-600 mt-1">
                      {selectedPatient.phoneNumber || selectedPatient.primaryNumber} • {selectedPatient.age} years • {selectedPatient.gender}
                    </div>
                  </div>
                  <button
                    onClick={clearPatientSelection}
                    className="text-green-600 hover:text-green-800 text-xs sm:text-sm underline whitespace-nowrap cursor-pointer"
                  >
                    Clear selection
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Patient Name *
                </label>
             <input
  type="text"
  name="patientName"
  value={formData.patientName}
  onChange={(e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Only letters and spaces
    handleChange({
      target: {
        name: 'patientName',
        value: value
      }
    });
  }}
  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="Enter patient name"
  pattern="[a-zA-Z\s]+"
  title="Name should only contain letters and spaces"
/>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
              <input
  type="tel"
  name="patientPhone"
  value={formData.patientPhone}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 10) {
      handleChange({
        target: {
          name: 'patientPhone',
          value: value
        }
      });
    }
  }}
  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  placeholder="Enter phone number"
  maxLength={10}
  pattern="\d{10}"
  title="Phone number must be exactly 10 digits"
/>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="patientAge"
                  value={formData.patientAge}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Age"
                />
              </div>
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-3 sm:mb-4">Lab Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Lab Name *
                </label>
                <input
                  type="text"
                  name="labName"
                  value={formData.labName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Elite Dental Lab"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Technician
                </label>
                <input
                  type="text"
                  name="technician"
                  value={formData.technician}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Saran"
                />
              </div>
            <div>
  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
    Sent Date
  </label>
  <input
    type="date"
    name="sentDate"
    value={formData.sentDate}
    onChange={(e) => {
      const selectedDate = e.target.value;
      const today = new Date().toISOString().split("T")[0];
      
      if (selectedDate && selectedDate > today) {
        // Prevent future dates
        return;
      }
      
      handleChange(e);
    }}
    onBlur={(e) => {
      const selectedDate = e.target.value;
      const today = new Date().toISOString().split("T")[0];
      
      if (selectedDate && selectedDate > today) {
        // Clear invalid future date
        handleChange({
          target: {
            name: 'sentDate',
            value: ''
          }
        });
        alert('Please select a past or current date');
      }
    }}
    max={new Date().toISOString().split("T")[0]}
    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>
<div>
  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
    Due Date
  </label>
  <input
    type="date"
    name="dueDate"
    value={formData.dueDate}
    onChange={(e) => {
      const selectedDate = e.target.value;
      const sentDate = formData.sentDate;
      
      // Validate year has only 4 digits
      if (selectedDate) {
        const year = selectedDate.split('-')[0];
        if (year && year.length > 4) {
          return; // Prevent invalid year
        }
      }
      
      if (sentDate && selectedDate && selectedDate < sentDate) {
        return;
      }
      
      handleChange(e);
    }}
    onBlur={(e) => {
      const selectedDate = e.target.value;
      const sentDate = formData.sentDate;
      
      // Validate year format
      if (selectedDate) {
        const year = selectedDate.split('-')[0];
        if (year && (year.length !== 4 || isNaN(year))) {
          handleChange({
            target: {
              name: 'dueDate',
              value: ''
            }
          });
          alert('Please enter a valid date with a 4-digit year');
          return;
        }
      }
      
      if (sentDate && selectedDate && selectedDate < sentDate) {
        handleChange({
          target: {
            name: 'dueDate',
            value: ''
          }
        });
        alert('Due date must be after the sent date');
      }
    }}
    min={formData.sentDate || undefined}
    max="9999-12-31" // Restricts to 4-digit years
    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    disabled={!formData.sentDate}
  />
  {!formData.sentDate && (
    <p className="text-xs text-gray-500 mt-1">Please select sent date first</p>
  )}
</div>
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-3 sm:mb-4">Crown Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Crown Type *
                </label>
                <select
                  name="crownType"
                  value={formData.crownType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select crown type</option>
                  <option value="Zirconia Crown">Zirconia Crown</option>
                  <option value="Porcelain Crown">Porcelain Crown</option>
                  <option value="Metal Crown">Metal Crown</option>
                  <option value="Composite Crown">Composite Crown</option>
                  <option value="Ceramic Crown">Ceramic Crown</option>
                  <option value="PFM Crown">PFM Crown</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Material
                </label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Zirconia"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Tooth Number *
                </label>
                <input
                  type="number"
                  name="tooth"
                  value={formData.tooth}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (Number(value) >= 1 && Number(value) <= 32)) {
                      setFormData((prev) => ({
                        ...prev,
                        tooth: value
                      }));
                    }
                  }}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 14"
                  min="1"
                  max="32"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Tag
                </label>
                <input
                  type="text"
                  name="tag"
                  value={formData.tag}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Digital upper restoration"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Trays Details
                </label>
                <select
                  name="traysDetails"
                  value={formData.traysDetails}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-3 sm:mb-4">Status Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"> 
 <div>
  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
    Current Status
  </label>
  <select
    name="status"
    value={formData.status}
    onChange={handleChange}
    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="Pending">Pending</option>
    <option value="Sent">Sent</option>
    <option value="In Progress">In Progress</option>
    <option value="Ready">Ready</option>
    <option value="Received">Received</option>
    <option value="Completed">Completed</option>
  </select>
</div>

{/* Only show Received Date if status is not Pending */}
{formData.status !== "Pending" && (
  <div>
  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
    Received Date
  </label>
  <input
    type="date"
    name="receivedDate"
    value={formData.receivedDate}
    onChange={(e) => {
      const selectedDate = e.target.value;
      const today = new Date().toISOString().split("T")[0];
      
      // Validate year has only 4 digits
      if (selectedDate) {
        const year = selectedDate.split('-')[0];
        if (year && year.length > 4) {
          return; // Prevent invalid year
        }
      }
      
      // Only for "In Progress" - prevent past dates
      if (formData.status === "In Progress" && selectedDate && selectedDate < today) {
        return;
      }
      
      handleChange(e);
    }}
    onBlur={(e) => {
      const selectedDate = e.target.value;
      const today = new Date().toISOString().split("T")[0];
      
      // Validate year format
      if (selectedDate) {
        const year = selectedDate.split('-')[0];
        if (year && (year.length !== 4 || isNaN(year))) {
          handleChange({
            target: {
              name: 'receivedDate',
              value: ''
            }
          });
          alert('Please enter a valid date with a 4-digit year');
          return;
        }
      }
      
      // Only for "In Progress" - alert if past date selected
      if (formData.status === "In Progress" && selectedDate && selectedDate < today) {
        handleChange({
          target: {
            name: 'receivedDate',
            value: ''
          }
        });
        alert('Please select today or a future date for In Progress status');
      }
    }}
    min={formData.status === "In Progress" ? new Date().toISOString().split("T")[0] : undefined}
    max="9999-12-31"
    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>
)}
          </div>
</div>
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-medium text-gray-700 mb-3 sm:mb-4">Payment Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Fully Paid">Fully Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
             <div>
  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
    Total Amount (₹)
  </label>
  <input
    type="number"
    name="totalAmount"
    value={formData.totalAmount}
    onChange={handleChange}
    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="5000"
    min="0"
    step="0.01"
  />
</div>
<div>
  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
    Paid Amount (₹)
  </label>
  <input
    type="number"
    name="paidAmount"
    value={formData.paidAmount}
    onChange={(e) => {
      const paidValue = parseFloat(e.target.value) || 0;
      const totalValue = parseFloat(formData.totalAmount) || 0;
      
      // Prevent paid amount from exceeding total amount
      if (paidValue > totalValue) {
        return;
      }
      
      handleChange(e);
    }}
    onBlur={(e) => {
      const paidValue = parseFloat(e.target.value) || 0;
      const totalValue = parseFloat(formData.totalAmount) || 0;
      
      // Alert and clear if paid exceeds total
      if (paidValue > totalValue) {
        handleChange({
          target: {
            name: 'paidAmount',
            value: ''
          }
        });
        alert(`Paid amount cannot exceed total amount of ₹${totalValue}`);
      }
    }}
    max={formData.totalAmount || undefined}
    className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="5000"
    min="0"
    step="0.01"
  />
</div>
            </div>
            <div className="mt-3 sm:mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="billUploaded"
                  checked={formData.billUploaded}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs sm:text-sm text-gray-700">Bill Uploaded</span>
              </label>
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="e.g., Perfect fluorescent color match"
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {formData.notes.length}/1000 characters
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 bg-white border-t p-3 sm:p-4 md:p-6">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !formData.patientName ||
                !formData.labName ||
                !formData.crownType ||
                !formData.tooth ||
                isSubmitting
              }
              className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
              {isSubmitting
                ? "Processing..."
                : isEdit
                ? "Update Lab Record"
                : "Create Lab Record"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}