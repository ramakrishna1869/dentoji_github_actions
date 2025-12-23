import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Heart, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import teeth from '../assets/icons/teeth.png';

export default function ReceptionistSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get staff data from navigation state
  const staffMemberData = location.state?.staffMemberData || null;
  const fromStaffManagement = location.state?.fromStaffManagement || false;
  const fromPayment = location.state?.fromPayment || false; // ✅ NEW: Check if coming from payment
  const staffMemberId = location.state?.staffMemberId || null; // ✅ NEW: Staff member ID
  const initialPermissions = location.state?.permissions || null;
  
  const [formData, setFormData] = useState({
    name: staffMemberData?.name || '',
    email: staffMemberData?.email || '',
    password: '',
    status: 'Active'
  });
 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hospitalId, setHospitalId] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');
  const [initError, setInitError] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // ✅ NEW: Show message if coming from payment
  useEffect(() => {
    if (fromPayment) {
      showToast('Payment successful! Please create the receptionist account.', 'success');
    }
  }, [fromPayment]);
 
  const statusOptions = [
    { value: 'Active', label: 'Active', color: 'text-green-600' },
    { value: 'Inactive', label: 'Inactive', color: 'text-gray-600' },
    { value: 'On Leave', label: 'On Leave', color: 'text-yellow-600' },
    { value: 'Suspended', label: 'Suspended', color: 'text-red-600' }
  ];
 
  const showToast = (message, type = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
      setToastType('');
    }, 4000);
  };
 
  const jwtDecode = (token) => {
    try {
      if (!token || typeof token !== 'string') {
        throw new Error('Token is required and must be a string');
      }
     
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format - must have 3 parts');
      }
     
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
     
      const padLength = 4 - (base64.length % 4);
      const paddedBase64 = padLength === 4 ? base64 : base64 + '='.repeat(padLength);
     
      const jsonPayload = decodeURIComponent(
        atob(paddedBase64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
     
      const decoded = JSON.parse(jsonPayload);
     
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        throw new Error('Token has expired');
      }
     
      return decoded;
    } catch (error) {
     // console.error('Token decode error:', error);
      throw new Error(`Invalid token: ${error.message}`);
    }
  };
 
  const safeParseJSON = (jsonString) => {
    try {
      return jsonString ? JSON.parse(jsonString) : null;
    } catch (error) {
    //  console.error('JSON parse error:', error);
      return null;
    }
  };
 
  useEffect(() => {
    const initializeData = async () => {
      try {
        setInitError(null);
       
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in.');
        }
 
        const decoded = jwtDecode(token);
        const possibleAdminIds = [
          decoded.id,
          decoded.adminId,
          decoded.userId,
          decoded.sub,
          decoded._id
        ].filter(Boolean);
 
        if (possibleAdminIds.length === 0) {
          throw new Error('No admin ID found in authentication token');
        }
 
        const fetchedAdminId = possibleAdminIds[0];
        setAdminId(fetchedAdminId);
 
        const storedHospital = safeParseJSON(localStorage.getItem('hospital'));
       
        if (storedHospital && storedHospital._id) {
          setHospitalId(storedHospital._id);
          setIsInitialized(true);
          return;
        }
 
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
 
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch profile`);
        }
 
        const profileData = await response.json();
        const possibleHospitalIds = [
          profileData.hospital?._id,
          profileData.hospitalId,
          profileData.hospital?.id,
          profileData._id,
          profileData.id
        ].filter(Boolean);
 
        if (possibleHospitalIds.length === 0) {
          throw new Error('No hospital associated with this admin account. Please contact support.');
        }
 
        const fetchedHospitalId = possibleHospitalIds[0];
        setHospitalId(fetchedHospitalId);
       
        localStorage.setItem('hospital', JSON.stringify({ _id: fetchedHospitalId }));
        localStorage.setItem('admin', JSON.stringify({ _id: fetchedAdminId }));
       
      } catch (err) {
       // console.error('Error during initialization:', err);
        setInitError(err.message);
        localStorage.removeItem('admin');
        localStorage.removeItem('hospital');
        showToast(err.message);
      } finally {
        setIsInitialized(true);
      }
    };
 
    initializeData();
  }, []);
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
 
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
 
  const handleBackClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/staff');
  };
 
  const handleSignup = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isLoading) return;

    const { name, email, password, status } = formData;

    // Validation
    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast('All fields are required!');
      return;
    }

    if (name.trim().length < 2) {
      showToast('Name must be at least 2 characters long!');
      return;
    }

    if (!validateEmail(email)) {
      showToast('Enter a valid email address!');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long!');
      return;
    }

    if (!hospitalId || !adminId) {
      showToast('Missing hospital or admin information. Please refresh the page and try again.');
      return;
    }

    const requestData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: staffMemberData?.phone || '',
      position: staffMemberData?.role || 'Receptionist',
      admin: adminId,
      hospitalId,
      status,
      // ✅ NEW: Include staff member ID if available
      staffMemberId: staffMemberId || staffMemberData?._id,
    };

    //console.log('Sending signup request:', { ...requestData, password: '[HIDDEN]' });

    try {
      setIsLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/receptionists/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();
     // console.log('Signup response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `Signup failed with status ${response.status}`);
      }

      // Show success toast
      showToast('Receptionist account created successfully!', 'success');
     
      // Reset form
      setFormData({ name: '', email: '', password: '', status: 'Active' });

      // Set initial permissions if provided
      try {
        const createdReceptionistId = responseData?.receptionist?._id || responseData?._id || responseData?.data?._id;
        if (initialPermissions && createdReceptionistId) {
          const permResp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/permissions/receptionist/${createdReceptionistId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ permissions: initialPermissions })
          });

          const permData = await permResp.json().catch(() => ({}));
          if (!permResp.ok) console.warn('Failed to set initial permissions:', permData);
        }
      } catch (permErr) {
        console.warn('Error assigning initial permissions to receptionist:', permErr);
      }
     
      // Set redirecting state and navigate after a delay
      setIsRedirecting(true);
     
      setTimeout(() => {
        navigate('/staff', {
          state: {
            message: `Receptionist account for "${name.trim()}" was successfully created!`,
            type: 'success',
            refresh: true // ✅ Signal to refresh data
          }
        });
      }, 2000);
     
    } catch (error) {
    //  console.error('Signup error:', error);
      showToast(error.message || 'An unexpected error occurred during signup');
      setIsRedirecting(false);
    } finally {
      setIsLoading(false);
    }
  };
 
  const handleRetry = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('hospital');
    setIsInitialized(false);
    setInitError(null);
    setHospitalId(null);
    setAdminId(null);
    window.location.reload();
  };
 
  const Toast = () => {
    if (!toastMessage) return null;
    const bgColor = toastType === 'success' ? 'bg-green-500' : 'bg-red-500';
    return (
      <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300`}>
        <div className="flex items-center">
          {toastType === 'success' && (
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {toastMessage}
        </div>
      </div>
    );
  };
 
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#ECF3FF] flex items-center justify-center p-4"
        style={{ 
          backgroundImage: `url(${teeth})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-white opacity-75 z-0"></div>
        
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Initializing...</p>
          <p className="text-sm text-gray-500">Loading admin and hospital information</p>
        </div>
      </div>
    );
  }
 
  if (!hospitalId || !adminId || initError) {
    return (
      <div className="min-h-screen bg-[#ECF3FF] flex items-center justify-center p-4"
        style={{ 
          backgroundImage: `url(${teeth})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-white opacity-75 z-0"></div>
        
        <div className="text-center max-w-md mx-auto p-6 relative z-10">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Setup Required</h3>
          <p className="text-red-600 mb-4">
            {initError || 'Missing hospital or admin information'}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Retry Setup
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="block bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-[#ECF3FF] flex items-center justify-center p-4 relative"
      style={{ 
        backgroundImage: `url(${teeth})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-white opacity-75 z-0"></div>
      
      <Toast />
     
      <button
        type="button"
        onClick={handleBackClick}
        disabled={isLoading || isRedirecting}
        className={`fixed top-6 left-6 z-10 flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-200 focus:ring-3 focus:ring-gray-100 ${
          isLoading || isRedirecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'
        }`}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to Staff</span>
      </button>
 
      {isRedirecting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 mb-2">Account created successfully!</p>
            <p className="text-sm text-gray-500">Redirecting to staff management...</p>
          </div>
        </div>
      )}
 
      <div className="flex items-center justify-center w-full h-full relative z-10">
        <div className="w-full max-w-7xl flex rounded-3xl overflow-hidden">
          <div className="w-[60%] p-16 text-black">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-8">
                <div>
                  <h1 className="flex items-center space-x-2">
                    <img src="dentoji_image.png" className="w-20 h-auto" />
                    <span className="text-blue-600 text-2xl"></span>
                  </h1>
                  <p className="text-sm text-gray-500">Receptionist Signup</p>
                </div>
              </div>
            </div>
           
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Help streamline operations and enhance the patient experience as a valued
              receptionist at DentalX.
            </p>
            
            {/* ✅ NEW: Show payment success indicator */}
            {fromPayment && (
              <div className="mt-6 bg-green-50 border border-blue-200 rounded-lg p-4 max-w-lg">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Payment Successful!</h4>
                    <p className="text-sm text-blue-700">
                      Complete the receptionist account creation for <strong>{staffMemberData?.name}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
         
          <div className="w-[40%] p-8 flex items-center justify-center rounded-3xl ml-60">
            <div className="w-full max-w-sm bg-white rounded-2xl p-6 min-h-[540px] flex flex-col justify-center shadow-lg">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Create account</h3>
                <p className="text-gray-500 text-sm">Create your receptionist account</p>
              </div>
             
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      disabled={isLoading || isRedirecting}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-3 focus:ring-blue-100 focus:border-blue-500 outline-none text-gray-700 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
               
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter email"
                      disabled={isLoading || isRedirecting}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-3 focus:ring-blue-100 focus:border-blue-500 outline-none text-gray-700 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
               
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password (min 6 characters)"
                      disabled={isLoading || isRedirecting}
                      className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-3 focus:ring-blue-100 focus:border-blue-500 outline-none text-gray-700 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading || isRedirecting}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
 
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleBackClick}
                    disabled={isLoading || isRedirecting}
                    className={`flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 text-sm rounded-lg transition-all duration-200 focus:ring-3 focus:ring-gray-100 ${
                      isLoading || isRedirecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSignup}
                    disabled={isLoading || isRedirecting}
                    className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 text-sm rounded-lg transition-all duration-200 focus:ring-3 focus:ring-blue-100 ${
                      isLoading || isRedirecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    {isLoading ? 'Creating...' : isRedirecting ? 'Redirecting...' : 'Create Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}