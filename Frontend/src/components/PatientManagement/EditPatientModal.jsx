
// src/components/EditPatientModal.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, User, ChevronDown, Wallet, PlusCircle, Camera, Plus, Edit, Trash2, X } from 'lucide-react';
import { FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';

const countries = [
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  // Add more countries as needed
];

const CountrySelect = ({ value, onChange, name }) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (code) => {
    onChange({ target: { name, value: code } });
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative w-20 sm:w-24">
      <div
        className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2">
          {value ? (<span>{countries.find(c => c.code === value)?.flag || ''}</span>) : null}
          <span>{value || 'Select'}</span>
        </span>
        <ChevronDown className="absolute right-3 w-4 h-4 text-gray-400" />
      </div>
      {isOpen && (
        <div className="absolute z-50 left-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country..."
            className="w-full px-3 py-2 border-b border-gray-200 text-sm focus:outline-none"
          />
          {filteredCountries.map((country) => (
            <div
              key={country.code}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm flex justify-between items-center"
              onClick={() => handleSelect(country.code)}
            >
              <span className="flex items-center gap-2">{country.flag} {country.name}</span>
              <span className="text-gray-500">{country.code}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EditPatientModal = ({ patient, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    firstName: '',
    lastName: '',
  
    age: 0,
    gender: '',
    bloodType: '',
    patientType: '',
    memberSince: '',

    lastVisit: '',
  
    primaryNumber: '',
    primaryCountryCode: '+91', // Default to India
    emailAddress: '',
    address: '',
    city: '',
    phoneNumber: '',
    phoneCountryCode: '+91',
    stateProvince: '',
    zipPostalCode: '',
    emergencyContactName: '',
    relationship: '',
    emergencyContactNumber: '',
    emergencyCountryCode: '+91',
    emergencyContactEmail: '',
    primaryDentalIssue: '',
    currentSymptoms: '',
    allergies: '',
    medicalHistory: '',
    currentMedications: '',
    diabetes: false,
    hypertension: false,
    cardiacHeartProblems: false,
    disordersOthers: '',
    smoking: false,
    drinking: false,
    gutkaChewing: false,
    disordersOthersSpecify: false,
    totalPaid: '',
    opFee: '',
    lastPaymentAmount: '',
    lastPaymentDate: '',
    paymentMethod: '',
    customFields: [],
    avatar: '',
    appointments: [],
    // New section-based custom fields
    personalCustomFields: [],
    contactCustomFields: [],
    emergencyCustomFields: [],
    medicalCustomFields: [],
    paymentCustomFields: [],
    appointmentCustomFields: [],
  });

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState('');
  const [newField, setNewField] = useState({ label: '', type: 'text', applyToAll: false });
  const [hospitalId, setHospitalId] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fileInputRef, setFileInputRef] = useState(null);

  const validPaymentMethods = ['cash', 'card', 'upi', 'bank_transfer', 'insurance', 'manual', ''];

  // Validation functions
  const restrictToAlphabetsAndSpaces = (value) => {
    return value.replace(/[^a-zA-Z\s]/g, '');
  };

  const restrictToNumbers = (value) => {
    return value.replace(/[^0-9]/g, '');
  };

  const restrictPhoneNumber = (value) => {
    let numericValue = value.startsWith('+') ? value.slice(1) : value;
    numericValue = numericValue.replace(/[^0-9]/g, '');
    const maxLength = 10; // Strictly 10 digits
    if (numericValue.length > maxLength) {
      toast.warn('Phone number must be exactly 10 digits');
      numericValue = numericValue.slice(0, maxLength);
    }
    return numericValue;
  };

  // New function to validate phone number length
  const validatePhoneNumber = (value) => {
    return value.length === 10; // Exactly 10 digits required
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  /*const validateAge = (value) => {
    if (!value) return true; // Empty date is valid
    const date = new Date(value);
    return !isNaN(date.getTime());
  };*/

  // Reset form data when modal opens/closes to prevent duplication
  useEffect(() => {
    if (!patient) {
      setFormData({
        patientId: '',
        firstName: '',
        lastName: '',
        
        age: 0,
        gender: '',
        bloodType: '',
        
        patientType: '',
        memberSince: '',
        lastVisit: '',
        primaryNumber: '',
        primaryCountryCode: '+91',
        emailAddress: '',
        address: '',
        city: '',
        phoneNumber: '',
        phoneCountryCode: '+91',
        stateProvince: '',
        zipPostalCode: '',
        emergencyContactName: '',
        relationship: '',
        emergencyContactNumber: '',
        emergencyCountryCode: '+91',
        emergencyContactEmail: '',
        primaryDentalIssue: '',
        currentSymptoms: '',
        allergies: '',
        medicalHistory: '',
        currentMedications: '',
        diabetes: false,
        hypertension: false,
        cardiacHeartProblems: false,
        disordersOthers: '',
        smoking: false,
        drinking: false,
        gutkaChewing: false,
        disordersOthersSpecify: false,
        totalPaid: '',
        opFee: '',
        lastPaymentAmount: '',
        lastPaymentDate: '',
        paymentMethod: '',
        customFields: [],
        avatar: '',
        appointments: [],
        personalCustomFields: [],
        contactCustomFields: [],
        emergencyCustomFields: [],
        medicalCustomFields: [],
        paymentCustomFields: [],
        appointmentCustomFields: [],
      });
    }
  }, [patient]);

  useEffect(() => {
    if (patient) {
      //console.log('Received patient data:', patient);

      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
      };

      const formatTimeForInput = (timeString) => {
        if (!timeString) return '';
        return timeString.match(/^\d{2}:\d{2}$/) ? timeString : '';
      };

      // Parse phone numbers to separate country codes and numbers
      const parsePhoneNumber = (fullNumber, defaultCountryCode = '+91') => {
        if (!fullNumber) return { countryCode: defaultCountryCode, number: '' };
       
        const foundCountry = countries.find(country => fullNumber.startsWith(country.code));
        if (foundCountry) {
          return {
            countryCode: foundCountry.code,
            number: fullNumber.substring(foundCountry.code.length)
          };
        }
       
        // If no country code found, treat as just the number
        return { countryCode: defaultCountryCode, number: fullNumber };
      };

      // Parse lastPayment (e.g., "200 · Jun 28, 2025" -> amount: "200", date: "2025-06-28")
      let lastPaymentAmount = '';
      let lastPaymentDate = '';
      if (patient.lastPayment && typeof patient.lastPayment === 'string' && patient.lastPayment !== '') {
        const [amount, dateStr] = patient.lastPayment.split(' · ');
        lastPaymentAmount = amount.replace(/,/g, '') || '';
        lastPaymentDate = dateStr ? formatDateForInput(new Date(dateStr)) : '';
      }

      // Parse medical history checkboxes from text - prevent duplication
      const medicalHistoryText = patient.medicalHistory || '';
      const diabetes = Boolean(patient.diabetes) || (medicalHistoryText.includes('Diabetes') && !Boolean(patient.diabetes));
      const hypertension = Boolean(patient.hypertension) || (medicalHistoryText.includes('Hypertension') && !Boolean(patient.hypertension));
      const cardiacHeartProblems = Boolean(patient.cardiacHeartProblems) || (medicalHistoryText.includes('Cardiac/Heart Problems') && !Boolean(patient.cardiacHeartProblems));
      const disordersOthersSpecify = Boolean(patient.disordersOthersSpecify) || (medicalHistoryText.includes('Disorders Others') && !Boolean(patient.disordersOthersSpecify));
      const smoking = Boolean(patient.smoking) || (medicalHistoryText.includes('Smoking') && !Boolean(patient.smoking));
      const drinking = Boolean(patient.drinking) || (medicalHistoryText.includes('Drinking') && !Boolean(patient.drinking));
      const gutkaChewing = Boolean(patient.gutkaChewing) || (medicalHistoryText.includes('Gutka Chewing') && !Boolean(patient.gutkaChewing));

      // Parse phone numbers
      const primaryPhone = parsePhoneNumber(patient.primaryNumber);
      const secondaryPhone = parsePhoneNumber(patient.phoneNumber);
      const emergencyPhone = parsePhoneNumber(patient.emergencyContactNumber);

      // Properly separate custom fields by section - prevent mixing
      const customFields = Array.isArray(patient.customFields) ? patient.customFields : [];

      //console.log('All custom fields from patient:', customFields);
      //console.log('Patient object structure:', patient);

      // Initialize arrays for each section
      const personalCustomFields = [];
      const contactCustomFields = [];
      const emergencyCustomFields = [];
      const medicalCustomFields = [];
      const paymentCustomFields = [];
      const appointmentCustomFields = [];

      // Categorize fields based on their section property
      customFields.forEach((field, index) => {
        //console.log(`Processing field ${index}:`, field);
       
        if (!field.section || field.section === 'personal') {
          personalCustomFields.push(field);
        } else if (field.section === 'contact') {
          contactCustomFields.push(field);
        } else if (field.section === 'emergency') {
          emergencyCustomFields.push(field);
        } else if (field.section === 'medical') {
          medicalCustomFields.push(field);
        } else if (field.section === 'payment') {
          paymentCustomFields.push(field);
        } else if (field.section === 'appointment') {
          appointmentCustomFields.push(field);
        } else {
          // Fallback for unknown sections - add to personal
          console.warn(`Unknown section "${field.section}" for field "${field.label}", adding to personal`);
          personalCustomFields.push(field);
        }
      });

      /*console.log('Filtered results:', {
        personal: personalCustomFields,
        contact: contactCustomFields,
        emergency: emergencyCustomFields,
        medical: medicalCustomFields,
        payment: paymentCustomFields,
        appointment: appointmentCustomFields
      });*/

      setFormData({
        patientId: patient.patientId || '',
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
      
        age: patient.age || 0,
        gender: patient.gender || '',
        bloodType: patient.bloodType || '',
        
        patientType: patient.patientType || '',
        memberSince: formatDateForInput(patient.memberSince),
        lastVisit: formatDateForInput(patient.lastVisit),
        primaryNumber: primaryPhone.number,
        primaryCountryCode: primaryPhone.countryCode,
        emailAddress: patient.emailAddress || '',
        address: patient.address || '',
        city: patient.city || '',
        phoneNumber: secondaryPhone.number,
        phoneCountryCode: secondaryPhone.countryCode,
        stateProvince: patient.stateProvince || '',
        zipPostalCode: patient.zipPostalCode || '',
        emergencyContactName: patient.emergencyContactName || '',
        relationship: patient.relationship || '',
        emergencyContactNumber: emergencyPhone.number,
        emergencyCountryCode: emergencyPhone.countryCode,
        emergencyContactEmail: patient.emergencyContactEmail || '',
        primaryDentalIssue: patient.primaryDentalIssue || '',
        currentSymptoms: patient.currentSymptoms || '',
        allergies: patient.allergies || '',
        medicalHistory: patient.medicalHistory || '',
        currentMedications: patient.currentMedications || '',
        diabetes,
        hypertension,
        cardiacHeartProblems,
        disordersOthers: patient.disordersOthers || '',
        smoking,
        drinking,
        gutkaChewing,
        disordersOthersSpecify,
        totalPaid: patient.totalPaid || '',
        opFee: patient.opFee || '',
        lastPaymentAmount,
        lastPaymentDate,
        paymentMethod: validPaymentMethods.includes(patient.paymentMethod) ? patient.paymentMethod : '',
        customFields: [], // Clear this to prevent duplication
        avatar: patient.avatar || '',
       appointments: Array.isArray(patient.appointments) && patient.appointments.length > 0
  ? patient.appointments.map((appointment) => ({
      _id: appointment._id || null,
      appointmentDate: formatDateForInput(appointment.appointmentDate),
      appointmentTime: formatTimeForInput(appointment.appointmentTime),
      treatment: appointment.treatment || '',
      doctor: appointment.doctor || '',
      status: appointment.status || 'Scheduled',
      priority: appointment.priority || 'Medium',
    }))
  : [{
      appointmentDate: '',
      appointmentTime: '',
      treatment: '',
      doctor: '',
      status: 'Scheduled',  // Added to ensure the conditional block renders
      priority: 'Medium',   // Added to ensure the conditional block renders
    }],
        // Section-based custom fields
        personalCustomFields,
        contactCustomFields,
        emergencyCustomFields,
        medicalCustomFields,
        paymentCustomFields,
        appointmentCustomFields,
      });
    }
  }, [patient]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No authentication token found. Please log in.');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setAdminId(decoded.id);
      if (decoded.hospitalId) {
        setHospitalId(decoded.hospitalId);
      } else {
        axios
          .get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`)
          .then((response) => {
            setHospitalId(response.data.hospital?._id || null);
            if (!response.data.hospital?._id) {
              toast.error('No hospital ID found.');
            }
          })
          .catch((err) => {
           // console.error('Error fetching user profile:', err);
            toast.error('Failed to fetch hospital ID');
          });
      }
    } catch (err) {
     // console.error('Error decoding token:', err);
      toast.error('Invalid token');
    }
  }, []);

  useEffect(() => {
    if (formData.dateOfBirth) {
      setFormData((prev) => ({ ...prev, age: calculateAge(formData.dateOfBirth) }));
    }
  }, [formData.dateOfBirth]);

  const handleInputChange = (e, index = null, sectionType = null, appointmentIndex = null) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    // Apply validation based on field name
    if (['firstName', 'lastName', 'emergencyContactName', 'city', 'stateProvince', 'primaryDentalIssue', 'currentSymptoms', 'disordersOthers', 'currentMedications', 'address', 'treatment', 'doctor'].includes(name)) {
      newValue = restrictToAlphabetsAndSpaces(value);
    } else if (name === 'allergies') {
      // Allow numbers and forward slash for blood pressure format like "120/80"
      newValue = value.replace(/[^0-9\/]/g, '');
    } else if (['primaryNumber', 'phoneNumber', 'emergencyContactNumber'].includes(name)) {
      newValue = restrictPhoneNumber(value);
      if (newValue.length > 10) {
        toast.warn('Phone number must be exactly 10 digits');
      }
    } else if (['totalPaid', 'opFee', 'lastPaymentAmount'].includes(name)) {
      newValue = restrictToNumbers(value);
    } else if (['emailAddress', 'emergencyContactEmail'].includes(name)) {
      newValue = value; // Email validation will be checked on save
    } else if (['primaryCountryCode', 'phoneCountryCode', 'emergencyCountryCode'].includes(name)) {
      newValue = value; // Allow country code to be set
    } else if (['dateOfBirth', 'memberSince', 'lastVisit', 'appointmentDate', 'lastPaymentDate'].includes(name)) {
      newValue = value; // Date validation will be checked on save
    }

    if (appointmentIndex !== null) {
      setFormData((prev) => {
        const updatedAppointments = [...prev.appointments];
        updatedAppointments[appointmentIndex] = {
          ...updatedAppointments[appointmentIndex],
          [name]: newValue,
        };
        return { ...prev, appointments: updatedAppointments };
      });
    } else if (sectionType && index !== null) {
      // Handle section-based custom fields
      setFormData((prev) => {
        const fieldName = `${sectionType}CustomFields`;
        const updatedFields = [...prev[fieldName]];
        if (updatedFields[index]) {
          updatedFields[index] = {
            ...updatedFields[index],
            value: type === 'checkbox' ? checked : newValue,
          };
        }
        return { ...prev, [fieldName]: updatedFields };
      });
    } else if (index !== null && !sectionType) {
      // Handle legacy custom fields
      setFormData((prev) => {
        const updatedCustomFields = [...prev.customFields];
        if (updatedCustomFields[index]) {
          updatedCustomFields[index] = { ...updatedCustomFields[index], value: newValue };
        }
        return { ...prev, customFields: updatedCustomFields };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : newValue,
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file.');
        return;
      }
     
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result,
        }));
        toast.success('Image uploaded successfully!');
      };
      reader.onerror = () => {
        toast.error('Failed to read image file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    if (fileInputRef) {
      fileInputRef.click();
    }
  };

  const handleOpenPopup = (section) => {
    //console.log('Opening popup for section:', section);
    setCurrentSection(section);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setNewField({ label: '', type: 'text', applyToAll: false });
    setCurrentSection('');
    setEditingField(null);
    setIsPopupOpen(false);
  };

  const handlePopupInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewField((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddCustomField = async () => {
    if (!newField.label.trim() || !newField.type.trim()) {
      toast.error('Please fill in both label and field type.');
      return;
    }

    if (!currentSection) {
      toast.error('Section not specified. Please try again.');
      return;
    }

    // Debug logs to track the process
    //console.log('Adding field to section:', currentSection);
    //console.log('Field data:', newField);

    const fieldName = `${currentSection}CustomFields`;
    //console.log('Target field name:', fieldName);
   
    if (editingField !== null) {
      // Edit existing field
      setFormData((prev) => {
        const updatedFields = [...(prev[fieldName] || [])];
        if (updatedFields[editingField.index]) {
          updatedFields[editingField.index] = {
            label: newField.label,
            value: editingField.value || '',
            type: newField.type,
            section: currentSection
          };
        }
        //console.log(`Updated ${fieldName}:`, updatedFields);
        return { ...prev, [fieldName]: updatedFields };
      });
      toast.success('Custom field updated successfully!');
    } else {
      // Add new field to the correct section
      const newCustomField = {
        label: newField.label,
        value: '',
        type: newField.type,
        section: currentSection
      };
     
      //console.log('New custom field being added:', newCustomField);
     
      if (newField.applyToAll && hospitalId) {
        try {
          await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/patients/${hospitalId}/add-custom-field`, {
            label: newField.label,
            value: '',
            section: currentSection,
          }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          toast.success('Custom field added to all patients successfully!');
        } catch (err) {
        //  console.error('Error adding custom field to all patients:', err);
          toast.error('Failed to add custom field to all patients');
        }
      }

      setFormData((prev) => {
        const currentFields = prev[fieldName] || [];
        const updatedFields = [...currentFields, newCustomField];
       
        //console.log(`Before update - ${fieldName}:`, currentFields);
        //console.log(`After update - ${fieldName}:`, updatedFields);
       
        // Ensure we're not accidentally adding to wrong section
        const newState = {
          ...prev,
          [fieldName]: updatedFields
        };
       
        // Debug: Check all section fields after update
        /*console.log('All section fields after update:', {
          personal: newState.personalCustomFields,
          contact: newState.contactCustomFields,
          emergency: newState.emergencyCustomFields,
          medical: newState.medicalCustomFields,
          payment: newState.paymentCustomFields,
          appointment: newState.appointmentCustomFields
        });*/
       
        return newState;
      });
      toast.success('Custom field added successfully!');
    }

    handleClosePopup();
  };

  const handleEditField = (index, field, sectionType) => {
    setEditingField({ index, value: field.value, sectionType });
    setNewField({ label: field.label, type: field.type || 'text', applyToAll: false });
    setCurrentSection(sectionType);
    setIsPopupOpen(true);
  };

  const handleRemoveCustomField = (index, sectionType) => {
    if (window.confirm('Are you sure you want to delete this custom field?')) {
      const fieldName = `${sectionType}CustomFields`;
      setFormData((prev) => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((_, i) => i !== index),
      }));
      toast.success('Custom field removed successfully!');
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatCurrency = (value) => {
    if (!value || value === '') return '';
    const numValue = parseFloat(value.replace(/,/g, ''));
    if (isNaN(numValue)) return value;
    return numValue.toString();
  };

  const handleSaveDraft = () => {
    //console.log('Saving draft:', formData);
    toast.success('Draft saved successfully!');
  };
    const validateDate = (value) => {
    if (!value) return true; // Empty date is valid
    const date = new Date(value);
    return !isNaN(date.getTime());
  };


  const validateForm = () => {
    // Only validate fields that have content (non-mandatory validation)
   
    // Validate phone numbers only if they have content
    if (formData.primaryNumber && !validatePhoneNumber(formData.primaryNumber)) {
      toast.error('Primary phone number must be exactly 10 digits');
      return false;
    }
    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      toast.error('Secondary phone number must be exactly 10 digits');
      return false;
    }
    if (formData.emergencyContactNumber && !validatePhoneNumber(formData.emergencyContactNumber)) {
      toast.error('Emergency contact number must be exactly 10 digits');
      return false;
    }

    // Validate email fields only if provided
    if (formData.emailAddress && !validateEmail(formData.emailAddress)) {
      toast.error('Invalid email address format');
      return false;
    }
    if (formData.emergencyContactEmail && !validateEmail(formData.emergencyContactEmail)) {
      toast.error('Invalid emergency contact email format');
      return false;
    }

    // Validate date fields only if provided
    if (formData.age && !validateDate(formData.age)) {
      toast.error('Invalid age');
      return false;
    }
    if (formData.memberSince && !validateDate(formData.memberSince)) {
      toast.error('Invalid member since date');
      return false;
    }
    if (formData.lastVisit && !validateDate(formData.lastVisit)) {
      toast.error('Invalid last visit date');
      return false;
    }
    if (formData.lastPaymentDate && !validateDate(formData.lastPaymentDate)) {
      toast.error('Invalid last payment date');
      return false;
    }

    // Validate appointment dates and times only if provided
    for (let i = 0; i < formData.appointments.length; i++) {
      const appointment = formData.appointments[i];
      if (appointment.appointmentDate && !validateDate(appointment.appointmentDate)) {
        toast.error(`Invalid appointment date for appointment ${i + 1}`);
        return false;
      }
      if (appointment.appointmentTime && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(appointment.appointmentTime)) {
        toast.error(`Invalid appointment time format for appointment ${i + 1}. Use HH:MM (e.g., 14:30)`);
        return false;
      }
    }

    // Validate payment fields only if provided
    if (formData.totalPaid && isNaN(parseFloat(formData.totalPaid))) {
      toast.error('Total paid must be a valid number');
      return false;
    }
    if (formData.opFee && isNaN(parseFloat(formData.opFee))) {
      toast.error('OP fee must be a valid number');
      return false;
    }
    if (formData.lastPaymentAmount && isNaN(parseFloat(formData.lastPaymentAmount))) {
      toast.error('Last payment amount must be a valid number');
      return false;
    }

    return true;
  };

  const handleUpdatePatient = async () => {
    //console.log("Updating patient");
    try {
      if (!validateForm()) return;

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found. Please log in.');
      if (!hospitalId) throw new Error('Invalid hospital ID');
      if (!patient?._id) throw new Error('Invalid patient ID');

      if (formData.paymentMethod && !validPaymentMethods.includes(formData.paymentMethod)) {
        toast.error('Invalid payment method selected. Please choose a valid option.');
        return;
      }

      const cleanAppointments = formData.appointments
        .filter(
          (appointment) =>
            appointment.appointmentDate ||
            appointment.appointmentTime ||
            appointment.treatment ||
            appointment.doctor
        )
        .map((appointment) => ({
          ...appointment,
          appointmentDate: appointment.appointmentDate ? new Date(appointment.appointmentDate) : undefined,
          status: appointment.status || 'Scheduled',
          priority: appointment.priority || 'Medium',
          _id: appointment._id || undefined,
        }));

      // Combine all custom fields with proper section information
      const allCustomFields = [
        // Only include legacy custom fields that don't have sections or have undefined sections
        ...formData.customFields.filter(field => !field.section || field.section === undefined || field.section === null).map(field => ({
          label: field.label,
          value: field.value,
          type: field.type || 'text',
          section: undefined
        })),
        // Include all section-based custom fields with their proper sections
        ...formData.personalCustomFields.map(field => ({
          label: field.label,
          value: field.value,
          type: field.type || 'text',
          section: 'personal'
        })),
        ...formData.contactCustomFields.map(field => ({
          label: field.label,
          value: field.value,
          type: field.type || 'text',
          section: 'contact'
        })),
        ...formData.emergencyCustomFields.map(field => ({
          label: field.label,
          value: field.value,
          type: field.type || 'text',
          section: 'emergency'
        })),
        ...formData.medicalCustomFields.map(field => ({
          label: field.label,
          value: field.value,
          type: field.type || 'text',
          section: 'medical'
        })),
        ...formData.paymentCustomFields.map(field => ({
          label: field.label,
          value: field.value,
          type: field.type || 'text',
          section: 'payment'
        })),
        ...formData.appointmentCustomFields.map(field => ({
          label: field.label,
          value: field.value,
          type: field.type || 'text',
          section: 'appointment'
        })),
      ];

      //console.log('All custom fields being saved:', allCustomFields);

      const patientData = {
        ...formData,
        hospitalId,
        adminId,
        
        memberSince: formData.memberSince ? new Date(formData.memberSince) : undefined,
        lastVisit: formData.lastVisit ? new Date(formData.lastVisit) : undefined,
        // Do not combine country code with phone number (consistent with AddPatient)
        primaryNumber: formData.primaryNumber || '',
        phoneNumber: formData.phoneNumber || '',
        emergencyContactNumber: formData.emergencyContactNumber || '',
        totalPaid: formData.totalPaid ? formatCurrency(formData.totalPaid) : '',
        opFee: formData.opFee ? formatCurrency(formData.opFee) : '',
        lastPayment:
          formData.lastPaymentAmount && formData.lastPaymentDate
            ? `${formatCurrency(formData.lastPaymentAmount)} · ${new Date(formData.lastPaymentDate).toLocaleDateString(
                'en-US',
                { month: 'short', day: 'numeric', year: 'numeric' }
              )}`
            : '',
        paymentMethod: formData.paymentMethod || '',
        appointments: cleanAppointments,
        customFields: allCustomFields,
        medicalHistory: (() => {
          const conditions = [];
          if (formData.diabetes) conditions.push("Diabetes");
          if (formData.hypertension) conditions.push("Hypertension (B.P)");
          if (formData.cardiacHeartProblems) conditions.push("Cardiac/Heart Problems");
          if (formData.disordersOthersSpecify) conditions.push("Disorders Others");
          if (formData.smoking) conditions.push("Smoking");
          if (formData.drinking) conditions.push("Drinking");
          if (formData.gutkaChewing) conditions.push("Gutka Chewing");
         
          // Get the original medical history text, removing any existing condition duplicates
          let medicalHistoryText = formData.medicalHistory?.trim() || '';
          const conditionsToRemove = ["Diabetes", "Hypertension (B.P)", "Cardiac/Heart Problems", "Disorders Others", "Smoking", "Drinking", "Gutka Chewing"];
         
          // Remove existing conditions from the text to prevent duplication
          conditionsToRemove.forEach(condition => {
            const regex = new RegExp(
              `${condition.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[,;]?\\s*`,
              'gi'
            );
            medicalHistoryText = medicalHistoryText.replace(regex, '');
          });
         
          // Clean up any remaining separators
          medicalHistoryText = medicalHistoryText
            .replace(/^[,;\s]+|[,;\s]+$/g, '') // remove leading/trailing , ; or spaces
            .replace(/[,;]\s*[,;]/g, ',')      // collapse multiple separators
            .trim();
         
          if (conditions.length > 0) {
            const conditionsText = conditions.join(", ");
            medicalHistoryText = medicalHistoryText
              ? `${conditionsText}; ${medicalHistoryText}`
              : conditionsText;
          }
         
          return medicalHistoryText || '';
         
                })(),
      };

      // Remove temporary fields and undefined/empty values
      delete patientData.lastPaymentAmount;
      delete patientData.lastPaymentDate;
      delete patientData.primaryCountryCode;
      delete patientData.phoneCountryCode;
      delete patientData.emergencyCountryCode;
      delete patientData.personalCustomFields;
      delete patientData.contactCustomFields;
      delete patientData.emergencyCustomFields;
      delete patientData.medicalCustomFields;
      delete patientData.paymentCustomFields;
      delete patientData.appointmentCustomFields;
     
      Object.keys(patientData).forEach((key) => {
        if (patientData[key] === '' || patientData[key] === undefined) {
          delete patientData[key];
        }
      });

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/patients/${hospitalId}/${patient._id}`,
        patientData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      //console.log('Patient updated:', response.data);
      toast.success('Patient updated successfully!');
      setShowConfirmation(true);

      if (onUpdate) {
        onUpdate(response.data.patient || response.data);
      }

      setTimeout(() => {
        setShowConfirmation(false);
        onClose();
      }, 2000);
    } catch (err) {
     /* console.error('Update patient error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });*/
      toast.error(err.response?.data?.message || err.message || 'Failed to update patient');
    }
  };

  const renderSectionHeader = (title, sectionType) => (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      <button
        type="button"
        onClick={() => handleOpenPopup(sectionType)}
        className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200 cursor-pointer"
      >
        <Plus size={16} className="mr-1" />
        Add Field
      </button>
    </div>
  );

  const renderCustomFields = (fields, sectionType) => {
    if (!Array.isArray(fields) || fields.length === 0) {
      return null;
    }

    return fields.map((field, index) => (
      <div key={`${sectionType}-${index}-${field.label}`} className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
          {field.label}
        </label>
        <div className="flex items-center space-x-2">
          {field.type === 'textarea' ? (
            <textarea
              name="value"
              value={field.value || ''}
              onChange={(e) => handleInputChange(e, index, sectionType)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter field value"
              rows="3"
            />
          ) : (
            <input
              type={field.type || 'text'}
              name="value"
              value={field.value || ''}
              onChange={(e) => handleInputChange(e, index, sectionType)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter field value"
            />
          )}
          <button
            type="button"
            onClick={() => handleEditField(index, field, sectionType)}
            className="p-2 text-blue-600 hover:text-blue-700 cursor-pointer focus:outline-none"
          >
            <Edit size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleRemoveCustomField(index, sectionType)}
            className="p-2 text-red-600 hover:text-red-700 cursor-pointer focus:outline-none"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    ));
  };

  if (!hospitalId || !adminId) return <div>Loading...</div>;


 
 return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden m-2 sm:m-4 flex flex-col">
        <ToastContainer position="top-right" autoClose={3000} />
       
        <style>{`
          input::placeholder,
          textarea::placeholder {
            color: rgba(0, 0, 0, 0.2) !important;
          }
          select option:first-child {
            color: rgba(0, 0, 0, 0.2);
          }
        `}</style>

        {/* Header */}
        <div className="mb-4 sm:mb-8 flex items-start bg-gray-50 p-3 sm:p-4 rounded-md">
          <div className="flex items-start space-x-2">
            <button
              onClick={onClose}
              className="flex items-center text-gray-700 hover:text-gray-900 cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Patient</h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Update patient record with new information
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Popup */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="bg-green-50 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg border-b border-green-100">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-base sm:text-lg font-semibold text-green-800">Patient Updated Successfully!</h3>
                    <p className="text-xs sm:text-sm text-green-600">Patient record has been updated</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 rounded-b-lg">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">Closing...</p>
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent mr-2"></div>
                    <span className="text-sm text-green-600 font-medium">Success</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add New Field Popup */}
        {isPopupOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    {editingField !== null ? 'Edit Field' : 'Add New Field'}
                  </h3>
                  <button
                    onClick={handleClosePopup}
                    className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="px-4 sm:px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Label Name
                    </label>
                    <input
                      type="text"
                      name="label"
                      value={newField.label}
                      onChange={handlePopupInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Field Type
                    </label>
                    <div className="relative">
                      <select
                        name="type"
                        value={newField.type}
                        onChange={handlePopupInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="email">Email</option>
                        <option value="tel">Phone</option>
                        <option value="date">Date</option>
                        <option value="textarea">Textarea</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {editingField === null && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="applyToAll"
                        name="applyToAll"
                        checked={newField.applyToAll}
                        onChange={handlePopupInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="applyToAll" className="ml-2 block text-sm text-gray-700">
                        Apply to all patients (including existing)
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleClosePopup}
                    className="px-3 sm:px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomField}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium cursor-pointer"
                  >
                    {editingField !== null ? 'Update' : 'OK'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hidden file input for image upload */}
        <input
          type="file"
          ref={setFileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Main Form Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-3 sm:p-6">
              {/* Patient Information Section with Profile Image */}
              <div className="flex flex-col sm:flex-row items-start justify-between border-b border-gray-200 pb-4 sm:pb-6 mb-4 sm:mb-6 gap-4">
                <div className="flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Patient Information</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Fill in all required fields to update the patient record</p>
                </div>
               
                {/* Profile Image Section */}
                <div className="relative self-center sm:self-start">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200 overflow-hidden cursor-pointer">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Patient Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={triggerFileUpload}
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg cursor-pointer"
                  >
                    <Camera size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {/* Personal Information */}
                <div className="w-full">
                  {renderSectionHeader('Personal Information', 'personal')}
                 
                  {/* Responsive layout for Patient ID, First Name, Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                        Patient ID <span className="text-red-600"></span>
                      </label>
                      <input
                        type="text"
                        name="patientId"
                        value={formData.patientId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                        First Name <span className="text-red-600"></span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                     </div>
                     <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                        Last Name <span className="text-red-600"></span>
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Rest of personal information fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    <div>
  <label
    className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2"
    style={{ color: 'rgba(0, 0, 0, 0.4)' }}
  >
    Age
  </label>

  <input
    type="number"
    name="age"
    value={formData.age}
    onChange={(e) => {
      const age = e.target.value;

      // Block negative age or unrealistic large values
      if (age < 0 || age > 120) return;

      handleInputChange(e);
    }}
    placeholder="Enter Age"
    className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
  />
</div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                        Gender <span className="text-red-600"></span>
                      </label>
                      <div className="relative">
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="" disabled>Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                        Blood Type
                      </label>
                      <div className="relative">
                        <select
                          name="bloodType"
                          value={formData.bloodType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="" disabled>Select blood type</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                        Member Since
                      </label>
                      <input
                        type="date"
                        name="memberSince"
                        value={formData.memberSince}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                        Last Visit
                      </label>
                      <input
                        type="date"
                        name="lastVisit"
                        value={formData.lastVisit}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                  </div>
                 
                  {/* Render custom fields for personal section */}
                  {renderCustomFields(formData.personalCustomFields, 'personal')}
                </div>

                {/* Contact Information */}
                <div className="w-full">
                  {renderSectionHeader('Contact Information', 'contact')}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                          Primary Phone Number
                        </label>
                        <div className="flex gap-2">
                            <div className="w-20 sm:w-24">
                              <CountrySelect
                                name="primaryCountryCode"
                                value={formData.primaryCountryCode}
                                onChange={handleInputChange}
                              />
                            </div>
                            <input
                              type="tel"
                              name="primaryNumber"
                              value={formData.primaryNumber}
                              onChange={handleInputChange}
                              className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                          Secondary Phone Number
                        </label>
                        <div className="flex gap-2">
                          <div className="w-20 sm:w-24">
                            <CountrySelect
                              name="phoneCountryCode"
                              value={formData.phoneCountryCode}
                              onChange={handleInputChange}
                            />
                          </div>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                   
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                        Address <span className="text-red-600"></span>
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="emailAddress"
                          value={formData.emailAddress}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                          State/Province
                        </label>
                        <input
                          type="text"
                          name="stateProvince"
                          value={formData.stateProvince}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                        ZIP/Postal Code
                      </label>
                      <input
                        type="text"
                        name="zipPostalCode"
                        value={formData.zipPostalCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                   
                    {/* Render custom fields for contact section */}
                    {renderCustomFields(formData.contactCustomFields, 'contact')}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="w-full">
                  {renderSectionHeader('Emergency Contact', 'emergency')}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                          Emergency Contact Name
                        </label>
                        <input
                          type="text"
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                          Relationship
                        </label>
                        <div className="relative">
                          <select
                            name="relationship"
                            value={formData.relationship}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="" disabled>Select Relationship</option>
                            <option value="spouse">Spouse</option>
                            <option value="parent">Parent</option>
                            <option value="child">Child</option>
                            <option value="sibling">Sibling</option>
                            <option value="friend">Friend</option>
                            <option value="other">Other</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                   
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                          Emergency Contact Number
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="w-20 sm:w-24">
                            <CountrySelect
                              name="emergencyCountryCode"
                              value={formData.emergencyCountryCode}
                              onChange={handleInputChange}
                            />
                          </div>
                          <input
                            type="tel"
                            name="emergencyContactNumber"
                            value={formData.emergencyContactNumber}
                            onChange={handleInputChange}
                            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                          Emergency Contact Email
                        </label>
                        <input
                          type="email"
                          name="emergencyContactEmail"
                          value={formData.emergencyContactEmail}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                   
                    {/* Render custom fields for emergency section */}
                    {renderCustomFields(formData.emergencyCustomFields, 'emergency')}
                  </div>
                </div>

                {/* Medical Information */}
                <div className="w-full">
                  {renderSectionHeader('Medical Information', 'medical')}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                          Primary Dental Issue
                        </label>
                        <input
                          type="text"
                          name="primaryDentalIssue"
                          value={formData.primaryDentalIssue}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                          Current Symptoms
                        </label>
                        <input
                          type="text"
                          name="currentSymptoms"
                          value={formData.currentSymptoms}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                          Blood Pressure (B.P)
                        </label>
                        <input
                          type="text"
                          name="allergies"
                          value={formData.allergies}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Medical History */}
                    <div>
                      <label
                        className="block text-sm font-medium mb-2"
                        style={{ color: "rgba(0, 0, 0, 0.4)" }}
                      >
                        Medical History
                      </label>

                      {/* Outer Box */}
                      <div className="border border-gray-200 rounded-md p-3 sm:p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 sm:gap-y-4sm:gap-x-6">
                         
                          {/* Diabetes */}
                          <label className="flex items-center space-x-2 text-gray-600 text-sm">
                            <input
                              id="diabetes"
                              name="diabetes"
                              type="checkbox"
                              checked={formData.diabetes}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                            />
                            <span>Diabetes</span>
                          </label>

                          {/* Hypertension */}
                          <label className="flex items-center space-x-2 text-gray-600 text-sm">
                            <input
                              id="hypertension"
                              name="hypertension"
                              type="checkbox"
                              checked={formData.hypertension}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                            />
                            <span>Hypertension (B.P)</span>
                          </label>

                          {/* Cardiac/Heart Problems */}
                          <label className="flex items-center space-x-2 text-gray-600 text-sm">
                            <input
                              id="cardiacHeartProblems"
                              name="cardiacHeartProblems"
                              type="checkbox"
                              checked={formData.cardiacHeartProblems}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                            />
                            <span>Cardiac/Heart Problems</span>
                          </label>

                          {/* Disorders Others specify */}
                          <label className="flex items-center space-x-2 text-gray-600 text-sm">
                            <input
                              id="disordersOthersSpecify"
                              name="disordersOthersSpecify"
                              type="checkbox"
                              checked={formData.disordersOthersSpecify || false}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                            />
                            <span>Others </span>
                          </label>

                          {/* Smoking */}
                          <label className="flex items-center space-x-2 text-gray-600 text-sm">
                            <input
                              id="smoking"
                              name="smoking"
                              type="checkbox"
                              checked={formData.smoking}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                            />
                            <span>Smoking</span>
                          </label>

                          {/* Drinking */}
                          <label className="flex items-center space-x-2 text-gray-600 text-sm">
                            <input
                              id="drinking"
                              name="drinking"
                              type="checkbox"
                              checked={formData.drinking}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                            />
                            <span>Drinking</span>
                          </label>

                          {/* Gutka Chewing */}
                          <label className="flex items-center space-x-2 text-gray-600 text-sm">
                            <input
                              id="gutkaChewing"
                              name="gutkaChewing"
                              type="checkbox"
                              checked={formData.gutkaChewing}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                            />
                            <span>Gutka Chewing</span>
                          </label>

                        </div>
                      </div>
                    </div>
                   
                    {/* Render custom fields for medical section */}
                    {renderCustomFields(formData.medicalCustomFields, 'medical')}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="w-full">
                  {renderSectionHeader('Payment Information', 'payment')}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                          OP Fee
                        </label>
                        <input
                          type="text"
                          name="opFee"
                          value={formData.opFee}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                          Total Paid(OP Fee)
                        </label>
                        <input
                          type="text"
                          name="totalPaid"
                          value={formData.totalPaid}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                          Last Payment Amount
                        </label>
                        <input
                          type="text"
                          name="lastPaymentAmount"
                          value={formData.lastPaymentAmount}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                          Last Payment Date
                        </label>
                        <input
                          type="date"
                          name="lastPaymentDate"
                          value={formData.lastPaymentDate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                        Payment Method
                      </label>
                      <div className="relative">
                        <select
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Manual</option>
                          <option value="manual">Manual</option>
                          <option value="cash">Cash</option>
                          <option value="card">Card</option>
                          <option value="upi">UPI</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="insurance">Insurance</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                   
                    {/* Render custom fields for payment section */}
                    {renderCustomFields(formData.paymentCustomFields, 'payment')}
                  </div>
                </div>

                {/* Appointment Information */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900">Appointment Information</h3>
                    <button
                      type="button"
                      onClick={() => handleOpenPopup('appointment')}
                      className="flex items-center px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200 cursor-pointer"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Field
                    </button>
                  </div>

                  {formData.appointments.map((appointment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4 mb-4 relative">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm sm:text-md font-medium text-gray-800">Appointment {index + 1}</h4>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                            Appointment Date
                          </label>
                          <input
                            type="date"
                            name="appointmentDate"
                            value={appointment.appointmentDate}
                            onChange={(e) => handleInputChange(e, null, null, index)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                            Appointment Time
                          </label>
                          <input
                            type="time"
                            name="appointmentTime"
                            value={appointment.appointmentTime}
                            onChange={(e) => handleInputChange(e, null, null, index)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                            Treatment
                          </label>
                          <input
                            type="text"
                            name="treatment"
                            value={appointment.treatment}
                            onChange={(e) => handleInputChange(e, null, null, index)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(0, 0, 0, 0.4)' }}>
                            Doctor
                          </label>
                          <input
                            type="text"
                            name="doctor"
                            value={appointment.doctor}
                            onChange={(e) => handleInputChange(e, null, null, index)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                 
                  {/* Render custom fields for appointment section */}
                  {renderCustomFields(formData.appointmentCustomFields, 'appointment')}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 text-gray-600 cursor-pointer border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 text-gray-600 border cursor-pointer border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium flex items-center justify-center"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={handleUpdatePatient}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 cursor-pointer text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium flex items-center justify-center"
                >
                  Update Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPatientModal;


