import React, { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const EditStaffModal = ({ 
  isOpen, 
  onClose, 
  staffData = null,
  onStaffUpdated
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    phoneCountryCode: '+91',
    role: '',
    department: '',
    status: 'Active',
    startDate: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [adminId, setAdminId] = useState('');

  const inputClass = "w-full border border-gray-200 px-3 py-2.5 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  // Get hospitalId and adminId from localStorage/token
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('token');
      const storedHospital = localStorage.getItem('hospital');

      if (!token) {
        toast.error('No authentication token found. Please log in.');
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const fetchedAdminId = decoded.id;
        setAdminId(fetchedAdminId);

        if (storedHospital) {
          const hospital = JSON.parse(storedHospital);
          if (hospital._id && hospital.adminId === fetchedAdminId) {
            setHospitalId(hospital._id);
            return;
          }
        }

        const tokenHospitalId = decoded.hospitalId;
        if (tokenHospitalId) {
          setHospitalId(tokenHospitalId);
          localStorage.setItem('hospital', JSON.stringify({ _id: tokenHospitalId, adminId: fetchedAdminId }));
          return;
        }

        console.warn('No hospital ID found in token or localStorage');
      } catch (err) {
      //  console.error('Error decoding token:', err);
        toast.error('Invalid token');
      }
    }
  }, [isOpen]);

  // ✅ FIXED: Properly parse phone number with country code
  useEffect(() => {
    if (isOpen && staffData) {
      let firstName = '';
      let lastName = '';
      
      if (staffData.name) {
        const nameParts = staffData.name.trim().split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      } else {
        firstName = staffData.firstName || '';
        lastName = staffData.lastName || '';
      }

      // ✅ Parse phone number to separate country code and number
      let phoneNumber = '';
      let countryCode = '+91';
      
      if (staffData.phone) {
        const phoneStr = staffData.phone.toString();
        // Check if phone starts with + (has country code)
        if (phoneStr.startsWith('+')) {
          // Extract country code (e.g., +91, +1, +44)
          const match = phoneStr.match(/^(\+\d{1,4})(\d+)$/);
          if (match) {
            countryCode = match[1];
            phoneNumber = match[2];
          } else {
            phoneNumber = phoneStr.replace(/\D/g, '').slice(-10);
          }
        } else {
          // No country code, just the number
          phoneNumber = phoneStr.replace(/\D/g, '').slice(-10);
        }
      }

      setFormData({
        firstName: firstName,
        lastName: lastName,
        email: staffData.email || '',
        phone: phoneNumber,
        phoneCountryCode: countryCode,
        address: staffData.address || '',
        role: staffData.role || '',
        department: staffData.department || '',
        status: staffData.status || 'Active',
        startDate: staffData.startDate ? staffData.startDate.split('T')[0] : '',
        emergencyContactName: staffData.emergencyContactName || '',
        emergencyContactPhone: staffData.emergencyContactPhone || '',
        notes: staffData.notes || ''
      });
      setError('');
    }
  }, [isOpen, staffData]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      if (/^\d{0,10}$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'role'];
    const missing = required.filter(field => !formData[field].trim());
    
    if (missing.length > 0) {
      setError(`Please fill in all required fields: ${missing.join(', ')}`);
      toast.error(`Please fill in all required fields: ${missing.join(', ')}`);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits');
      toast.error('Phone number must be exactly 10 digits');
      return false;
    }

    return true;
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!hospitalId) {
      setError('Hospital ID not found. Please refresh and try again.');
      toast.error('Hospital ID not found. Please refresh and try again.');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // ✅ FIXED: Combine country code with phone number
      const fullPhoneNumber = `${formData.phoneCountryCode}${formData.phone}`;

      let url;
      let updateData = { ...formData };

      if (staffData.source === 'both') {
        url = `${import.meta.env.VITE_BACKEND_URL}/api/staff/${staffData.staffId || staffData._id}`;
        updateData.phone = fullPhoneNumber; // ✅ Send full phone with country code
      } else if (staffData.source === 'staff') {
        url = `${import.meta.env.VITE_BACKEND_URL}/api/staff/${staffData._id}`;
        updateData.phone = fullPhoneNumber; // ✅ Send full phone with country code
      } else if (staffData.source === 'receptionist') {
        url = `${import.meta.env.VITE_BACKEND_URL}/api/receptionists/${staffData._id}`;
        updateData = {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: fullPhoneNumber, // ✅ Send full phone with country code
          position: formData.role,
          status: formData.status
        };
      } else {
        url = `${import.meta.env.VITE_BACKEND_URL}/api/staff/${staffData._id}`;
        updateData.phone = fullPhoneNumber; // ✅ Send full phone with country code
      }
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage;
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || `Server error: ${response.status}`;
        } else {
          errorMessage = `Server error: ${response.status}. Please check if the backend is running.`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      toast.success('Staff member updated successfully!');
      
      if (onStaffUpdated) {
        onStaffUpdated();
      }
      
      onClose();
    } catch (err) {
     // console.error('Error updating staff:', err);
      const errorMessage = err.message || 'Failed to update staff member';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Staff Member</h2>
          <button 
            onClick={onClose} 
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            disabled={isLoading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSaveChanges} className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name *</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={inputClass}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Name *</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={inputClass}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={labelClass}>Email*</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClass}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <div className="flex gap-1">
                    <select
                      name="phoneCountryCode"
                      value={formData.phoneCountryCode}
                      onChange={handleInputChange}
                      className="w-23 px-2 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading}
                    >
                      <option value="+91">+91 (IN)</option>
                      <option value="+1">+1 (US)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (AU)</option>
                      <option value="+971">+971 (AE)</option>
                      <option value="+65">+65 (SG)</option>
                    </select>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`flex-1 ${inputClass}`}
                      disabled={isLoading}
                      required
                      pattern="\d{10}"
                      maxLength={10}
                      title="Phone number must be exactly 10 digits"
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Work Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Role *</label>
                  <select 
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={inputClass}
                    disabled={isLoading}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Anesthesiologist">Anesthesiologist</option>
                    <option value="Technician">Technician</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Radiologist">Radiologist</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Support Staff">Support Staff</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Senior Receptionist">Senior Receptionist</option>
                    <option value="Head Receptionist">Head Receptionist</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Department</label>
                  <select 
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className={inputClass}
                    disabled={isLoading}
                  >
                    <option value="">Select Department</option>
                    <option value="General">General</option>
                    <option value="General Dentistry">General Dentistry</option>
                    <option value="Oral Surgery">Oral Surgery</option>
                    <option value="Orthodontics">Orthodontics</option>
                    <option value="Periodontics">Periodontics</option>
                    <option value="Endodontics">Endodontics</option>
                    <option value="Pediatric Dentistry">Pediatric Dentistry</option>
                    <option value="Prosthodontics">Prosthodontics</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Reception">Reception</option>
                    <option value="Administration">Administration</option>
                    <option value="Support">Support</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={labelClass}>Status</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={inputClass}
                    disabled={isLoading}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input 
                    type="date" 
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={inputClass}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button 
            onClick={handleSaveChanges}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-500 border border-transparent rounded-md hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isLoading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStaffModal;