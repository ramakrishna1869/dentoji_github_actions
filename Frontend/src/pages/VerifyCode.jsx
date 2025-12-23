import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import teeth from '../assets/icons/teeth.png';

const VerifyCode = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from navigation state or use placeholder
  const email = location.state?.email || 'example@gmail.com';

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

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    pastedData.split('').forEach((char, index) => {
      if (index < 6) {
        newCode[index] = char;
      }
    });
    setCode(newCode);

    // Focus last filled input or next empty one
    const lastFilledIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

const handleVerify = async () => {
  const verificationCode = code.join('');
  
  if (verificationCode.length !== 6) {
    setError('Please enter all 6 digits');
    return;
  }

  setIsLoading(true);
  setError('');

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-reset-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: email,
        otp: verificationCode 
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Navigate to reset password with verification token
      navigate('/reset-password', { 
        state: { 
          email: email,
          verificationToken: data.verificationToken,
          verified: true 
        } 
      });
    } else {
      setError(data.message || 'Invalid verification code');
      
      // Show remaining attempts if available
      if (data.attemptsLeft !== undefined) {
        setError(`Invalid OTP. ${data.attemptsLeft} attempts remaining.`);
      }
    }
  } catch (error) {
  //  console.error('Verification error:', error);
    setError('Network error. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

const handleResend = async () => {
  setIsLoading(true);
  setError('');
  
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      showToast('New OTP sent successfully', 'success');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } else {
      setError(data.message || 'Failed to resend OTP');
    }
  } catch (error) {
   // console.error('Resend error:', error);
    setError('Failed to resend code');
  } finally {
    setIsLoading(false);
  }
};
  const handleWrongEmail = () => {
    navigate('/forgot-password');
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
      {/* Background overlay */}
      <div className="absolute inset-0 bg-white opacity-75 z-0"></div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Enter the Verification Code sent to
            </h2>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-gray-500">{email}</span>
              <button
                onClick={handleWrongEmail}
                className="text-gray-900 font-medium underline hover:text-blue-600 transition-colors cursor-pointer"
              >
                wrong email?
              </button>
            </div>
          </div>

          {/* Code inputs */}
          <div className="flex justify-center gap-3 mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            ))}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-center text-sm text-red-600 mb-4">{error}</p>
          )}

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={isLoading || code.join('').length !== 6}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mb-4 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </button>

          {/* Resend link */}
          <div className="text-center">
            <span className="text-sm text-gray-600">Didn't receive the code? </span>
            <button
              onClick={handleResend}
              disabled={isLoading}
              className="text-sm text-gray-900 font-semibold hover:text-blue-600 transition-colors cursor-pointer disabled:opacity-50"
            >
              Resend
            </button>
          </div>
        </div>

        {/* Footer */}
        {/* <div className="mt-6 text-center">
          <p className="text-sm text-white bg-blue-600 px-4 py-2 rounded-full inline-block">
            Powered by @Technoji 2025
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default VerifyCode;