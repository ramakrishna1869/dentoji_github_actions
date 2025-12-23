import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import logo from '../assets/icons/dentoji_image.png';
import teeth from '../assets/icons/teeth.png';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  // Get data from navigation state
  const email = location.state?.email;
  const verificationToken = location.state?.verificationToken;
  const verified = location.state?.verified;

  useEffect(() => {
    if (!email || !verificationToken || !verified) {
      showToast('Invalid verification. Please start over.', 'error');
      setTimeout(() => navigate('/forgot-password'), 2000);
    }
  }, [email, verificationToken, verified, navigate]);

  const showToast = (message, type = 'info') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 max-w-sm shadow-xl ${
      type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    }`;
    toast.innerHTML = `<div class="flex items-center space-x-2"><span>${type === 'error' ? '❌' : '✅'}</span><span>${message}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          verificationToken: verificationToken,
          newPassword: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Password reset successfully!', 'success');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        showToast(data.message || 'Failed to reset password', 'error');
      }
    } catch (error) {
     // console.error('Reset password error:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#ECF3FF] flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url(${teeth})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-white opacity-75 z-0"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <img src={logo} alt="Dentoji" className="mx-auto mb-4 h-12" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
            <p className="text-sm text-gray-600">Enter a new password for your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-12 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } disabled:opacity-50`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-xs text-red-600">{errors.password}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-12 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                  } disabled:opacity-50`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-xs text-red-600">{errors.confirmPassword}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              disabled={isLoading}
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;