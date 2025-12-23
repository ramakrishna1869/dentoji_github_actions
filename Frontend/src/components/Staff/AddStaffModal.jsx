import React, { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const AddStaffModal = ({ 
  isOpen, 
  onClose, 
  mode = 'add',
  staffData = null,
  onStaffAdded,
  onStaffUpdated,
  onStaffDeleted 
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    phoneCountryCode: '+91',
    address: '',
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [hospitalId, setHospitalId] = useState('');
  const [adminId, setAdminId] = useState('');

  const inputClass = "w-full border border-gray-300 px-3 py-2.5 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

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
        toast.error('Invalid token');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' || mode === 'view') {
        if (staffData) {
          setFormData({
            firstName: staffData.firstName || '',
            lastName: staffData.lastName || '',
            email: staffData.email || '',
            phone: staffData.phone || '',
            phoneCountryCode: staffData.phoneCountryCode || '+91',
            address: staffData.address || '',
            role: staffData.role || '',
            department: staffData.department || '',
            status: staffData.status || 'Active',
            startDate: staffData.startDate ? staffData.startDate.split('T')[0] : '',
            emergencyContactName: staffData.emergencyContactName || '',
            emergencyContactPhone: staffData.emergencyContactPhone || '',
            notes: staffData.notes || ''
          });
        }
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          phoneCountryCode: '+91',
          address: '',
          role: '',
          department: '',
          status: 'Active',
          startDate: '',
          emergencyContactName: '',
          emergencyContactPhone: '',
          notes: ''
        });
      }
      setError('');
    }
  }, [isOpen, mode, staffData]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!hospitalId) {
      setError('Hospital ID not found. Please refresh and try again.');
      toast.error('Hospital ID not found. Please refresh and try again.');
      return;
    }

    if (mode === 'add' && formData.role.toLowerCase().includes('receptionist')) {
      try {
        const token = localStorage.getItem('token');
        const countResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/receptionists/count`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (countResponse.ok) {
          const countData = await countResponse.json();
          const currentCount = countData.count || 0;
          
          if (currentCount >= 2) {
            toast.error('Receptionist limit reached! Please make payment to add more receptionists.');
            setError('You have reached the free receptionist limit (2/2). Payment required to add more.');
            return;
          }
        }
      } catch (error) {
        // Continue anyway if count check fails
      }
    }
    
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const url = mode === 'add' 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/staff/${hospitalId}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/staff/${staffData._id}`;
      
      const method = mode === 'add' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
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
      
      if (mode === 'add' && onStaffAdded) {
        onStaffAdded(result.staff || result);
        toast.success('Staff member added successfully!');
      } else if (mode === 'edit' && onStaffUpdated) {
        onStaffUpdated(result.staff || result);
        toast.success('Staff member updated successfully!');
      }
      
      onClose();
    } catch (err) {
      const errorMessage = err.message || `Failed to ${mode} staff member`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/staff/${staffData._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete staff member');
      }

      if (onStaffDeleted) {
        onStaffDeleted(staffData._id);
      }
      
      toast.success('Staff member deleted successfully!');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete staff member');
      toast.error(err.message || 'Failed to delete staff member');
    } finally {
      setIsDeleting(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'add': return 'Add New Staff Member';
      case 'edit': return 'Edit Staff Member';
      case 'view': return 'Staff Member Details';
      default: return 'Staff Member';
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{getModalTitle()}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
            disabled={isLoading || isDeleting}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={inputClass}
                    disabled={isReadOnly || isLoading}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={inputClass}
                    disabled={isReadOnly || isLoading}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClass}
                    disabled={isReadOnly || isLoading}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <div className="flex gap-1">
                    <select
                      name="phoneCountryCode"
                      value={formData.phoneCountryCode}
                      onChange={handleInputChange}
                      className="w-23 px-2 py-2.5 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:border-gray-400"
                      disabled={isReadOnly || isLoading}
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
                      disabled={isReadOnly || isLoading}
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

            {/* Work Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Work Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Role</label>
                  <select 
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={inputClass}
                    disabled={isReadOnly || isLoading}
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
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Department</label>
                  <input 
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="Enter Department"
                    className={inputClass}
                    disabled={isReadOnly || isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input 
                    type="date" 
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={inputClass}
                    disabled={isReadOnly || isLoading}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
          {mode === 'edit' && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading || isDeleting}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete Staff'}
            </button>
          )}
          
          <div className={`flex gap-3 ${mode !== 'edit' ? 'ml-auto' : ''}`}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            
            {!isReadOnly && (
              <button 
                onClick={handleSubmit}
                disabled={isLoading || isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-cyan-500 border border-transparent rounded-md hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading 
                  ? (mode === 'add' ? 'Adding...' : 'Updating...')
                  : (mode === 'add' ? 'Add Staff Member' : 'Update Staff Member')
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStaffModal;