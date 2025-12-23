import React, { useState, useEffect } from 'react';
import { X, User, Mail, AlertCircle, Phone } from 'lucide-react';
import { toast } from 'react-toastify';

const EditReceptionistModal = ({ 
  isOpen, 
  onClose, 
  receptionistData, 
  onReceptionistUpdated 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    phoneCountryCode: '+91',
    position: '',
    status: 'Active'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const statusOptions = [
    { value: 'Active', label: 'Active', color: 'text-green-600' },
    { value: 'Inactive', label: 'Inactive', color: 'text-gray-600' },
    { value: 'On Leave', label: 'On Leave', color: 'text-yellow-600' },
    { value: 'Suspended', label: 'Suspended', color: 'text-red-600' }
  ];

  const roleOptions = [
    'Receptionist',
    'Senior Receptionist',
    'Head Receptionist'
  ];

  // Status color mapping for badges
  const getStatusColor = (status) => {
    const statusColors = {
      'Active': 'bg-green-100 text-green-600 border-green-200',
      'Inactive': 'bg-gray-100 text-gray-600 border-gray-200',
      'On Leave': 'bg-yellow-100 text-yellow-600 border-yellow-200',
      'Suspended': 'bg-red-100 text-red-600 border-red-200'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  useEffect(() => {
    if (isOpen && receptionistData) {
      // Parse phone number to separate country code and number
      let phoneNumber = '';
      let countryCode = '+91';
      
      if (receptionistData.phone) {
        const phoneStr = receptionistData.phone.toString();
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
        name: receptionistData.name || '',
        email: receptionistData.email || '',
        phone: phoneNumber,
        phoneCountryCode: countryCode,
        position: receptionistData.position || 'Receptionist',
        status: receptionistData.status || 'Active'
      });
      setError('');
    }
  }, [isOpen, receptionistData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validate phone input - only allow digits, max 10
    if (name === 'phone') {
      if (/^\d{0,10}$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      setError('Phone number must be exactly 10 digits');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Combine country code with phone number
      const fullPhoneNumber = formData.phone 
        ? `${formData.phoneCountryCode}${formData.phone}` 
        : '';

      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: fullPhoneNumber,
        position: formData.position,
        status: formData.status
      };

     // console.log('Updating receptionist with data:', updateData);

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/receptionists/${receptionistData._id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        }
      );

      const data = await response.json();
    //  console.log('Update response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update receptionist');
      }

      // Success - call the callback with updated data
      if (onReceptionistUpdated && data.receptionist) {
        onReceptionistUpdated(data.receptionist);
      }
      
      // Show success message
      toast.success('Receptionist updated successfully!');
      
      onClose();
    } catch (err) {
     // console.error('Update error:', err);
      setError(
        err.message || 'Failed to update receptionist. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Edit Receptionist
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Current Status Badge */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Status
            </label>
            <div className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${getStatusColor(receptionistData?.status || 'Active')}`}>
              {receptionistData?.status || 'Active'}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter full name"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter email address"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex gap-2">
                <select
                  name="phoneCountryCode"
                  value={formData.phoneCountryCode}
                  onChange={handleInputChange}
                  className="w-24 px-2 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                >
                  <option value="+91">+91 IN</option>
                  <option value="+1">+1 US</option>
                  <option value="+44">+44 UK</option>
                  <option value="+61">+61 AU</option>
                  <option value="+971">+971 AE</option>
                  <option value="+65">+65 SG</option>
                </select>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Phone number"
                    disabled={isLoading}
                    maxLength={10}
                    pattern="\d{10}"
                  />
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter 10-digit phone number
              </p>
            </div>

            {/* Position Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position *
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={isLoading}
                required
              >
                {roleOptions.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={isLoading}
                required
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Suspended and Inactive receptionists cannot login
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Receptionist'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditReceptionistModal;