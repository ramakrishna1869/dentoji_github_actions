// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
// import logo from '../assets/icons/dentoji_image.png';
// import teeth from '../assets/icons/teeth.png';

// const ForgotPassword = () => {
//   const [email, setEmail] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const showToast = (message, type = 'info') => {
//     const toast = document.createElement('div');
//     toast.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 max-w-sm shadow-xl ${
//       type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500'
//     }`;
//     toast.innerHTML = `<div class="flex items-center space-x-2"><span>${type === 'error' ? '❌' : '✅'}</span><span>${message}</span></div>`;
//     document.body.appendChild(toast);
//     setTimeout(() => {
//       if (document.body.contains(toast)) {
//         document.body.removeChild(toast);
//       }
//     }, 4000);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!email.trim()) {
//       setError('Email is required');
//       return;
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email.trim())) {
//       setError('Please enter a valid email address');
//       return;
//     }

//     setIsLoading(true);
//     setError('');

//     try {
//       const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email: email.trim().toLowerCase() }),
//       });

//       const data = await response.json();

//      if (response.ok) {
//   showToast('OTP sent to your email', 'success');
//   // Navigate to verify code page with email
//   setTimeout(() => {
//     navigate('/verify-code', { 
//       state: { 
//         email: email.trim().toLowerCase(),
//         fromForgotPassword: true 
//       } 
//     });
//   }, 1500);
// }
//        else {
//         setError(data.message || 'Failed to send reset link');
//         showToast(data.message || 'Failed to send reset link', 'error');
//       }
//     } catch (error) {
//       console.error('Forgot password error:', error);
//       setError('Network error. Please try again.');
//       showToast('Network error. Please try again.', 'error');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div
//       className="min-h-screen bg-[#ECF3FF] flex items-center justify-center p-4 relative"
//       style={{
//         backgroundImage: `url(${teeth})`,
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//         backgroundAttachment: 'fixed',
//         backgroundRepeat: 'no-repeat',
//       }}
//     >
//       <div className="absolute inset-0 bg-white opacity-75 z-0"></div>

//       <div className="relative z-10 w-full max-w-md">
//         <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
//           {/* Header */}
//           <div className="text-center mb-6">
//             <img src={logo} alt="Dentoji" className="mx-auto mb-4 h-12" />
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">
//               {isSuccess ? 'Check Your Email' : 'Forgot Your Password?'}
//             </h2>
//             <p className="text-sm text-gray-600">
//               {isSuccess
//                 ? 'We have sent a password reset link to your email address'
//                 : 'We will send you a link to reset your password'}
//             </p>
//           </div>

//           {!isSuccess ? (
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Username / Email
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => {
//                       setEmail(e.target.value);
//                       setError('');
//                     }}
//                     placeholder="Email to send reset instruction to"
//                     disabled={isLoading}
//                     className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
//                       error ? 'border-red-300 bg-red-50' : 'border-gray-200'
//                     } disabled:opacity-50`}
//                   />
//                 </div>
//                 {error && (
//                   <p className="mt-2 text-xs text-red-600">{error}</p>
//                 )}
//               </div>

//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
//               >
//                 {isLoading ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 "></div>
//                     Sending...
//                   </>
//                 ) : (
//                   'Send Reset Link'
//                 )}
//               </button>
//             </form>
//           ) : (
//             <div className="text-center py-6">
//               <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
//               <p className="text-base text-gray-700 mb-6">
//                 Please check your email and click on the provided link to reset your password.
//               </p>
//             </div>
//           )}

//           {/* Back to Login */}
//           <div className="mt-6 text-center">
//             <button
//               onClick={() => navigate('/login')}
//               disabled={isLoading}
//               className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50 cursor-pointer"
//             >
//               {/* <ArrowLeft className="w-4 h-4 mr-1" /> */}
//               Cancel
//             </button>
//           </div>
//         </div>

//         {/* Powered by footer */}
//         {/* <div className="mt-6 text-center">
//           <p className="text-sm text-gray-600">
//             Powered by <span className="font-semibold text-blue-600">@Technoji 2025</span>
//           </p>
//         </div> */}
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import logo from '../assets/icons/dentoji_image.png';
import teeth from '../assets/icons/teeth.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('OTP sent to your email', 'success');
        // Navigate to verify code page with email
        setTimeout(() => {
          navigate('/verify-code', { 
            state: { 
              email: email.trim().toLowerCase(),
              fromForgotPassword: true 
            } 
          });
        }, 1500);
      } else {
        setError(data.message || 'Failed to send OTP');
        showToast(data.message || 'Failed to send OTP', 'error');
      }
    } catch (error) {
     // console.error('Forgot password error:', error);
      setError('Network error. Please try again.');
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Forgot Your Password?
            </h2>
            <p className="text-sm text-gray-600">
              Enter your email to receive a verification code
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username / Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    error ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  } disabled:opacity-50`}
                />
              </div>
              {error && (
                <p className="mt-2 text-xs text-red-600">{error}</p>
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
                  Sending...
                </>
              ) : (
                'Send OTP'
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

export default ForgotPassword;