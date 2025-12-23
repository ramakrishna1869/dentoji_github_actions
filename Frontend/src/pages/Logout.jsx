import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Logout() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('logging-out'); // logging-out, success, redirecting

useEffect(() => {
  // ✅ Clear all storage immediately
  localStorage.clear();
  //console.log('🔒 Logged out, all localStorage cleared.');

  // Progress animation
  const progressInterval = setInterval(() => {
    setProgress(prev => {
      if (prev >= 100) {
        clearInterval(progressInterval);
        return 100;
      }
      return prev + 2;
    });
  }, 30);

  // Stage transitions
  const timer1 = setTimeout(() => {
    setStage('success');
    toast.success("You've been logged out successfully.", {
      position: 'top-right',
      autoClose: 3000,
    });
  }, 1500);

  const timer2 = setTimeout(() => {
    setStage('redirecting');
  }, 2500);

  const timer3 = setTimeout(() => {
    navigate('/login', { replace: true });
  }, 4000);

  return () => {
    clearInterval(progressInterval);
    clearTimeout(timer1);
    clearTimeout(timer2);
    clearTimeout(timer3);
  };
}, [navigate]);

  const getStageContent = () => {
    switch (stage) {
      case 'logging-out':
        return {
          icon: (
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-25"></div>
              <div className="relative bg-blue-100 rounded-full p-4">
                <svg
                  className="w-10 h-10 text-blue-600 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
            </div>
          ),
          title: 'Logging Out...',
          subtitle: 'Securing your session',
          showProgress: true
        };
      
      case 'success':
        return {
          icon: (
            <div className="bg-green-100 rounded-full p-4 animate-bounce">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ),
          title: 'Successfully Logged Out',
          subtitle: 'Your session has been terminated securely',
          showProgress: false
        };
      
      case 'redirecting':
        return {
          icon: (
            <div className="bg-purple-100 rounded-full p-4">
              <svg
                className="w-10 h-10 text-purple-600 animate-pulse"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          ),
          title: 'Redirecting...',
          subtitle: 'Taking you back to login',
          showProgress: false
        };
      
      default:
        return getStageContent();
    }
  };

  const content = getStageContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-200 to-blue-400 flex items-center justify-center px-4">
      <ToastContainer />
      
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 bg-white/95 shadow-2xl rounded-3xl p-10 w-full max-w-md text-center border border-white/50 backdrop-blur-xl transform transition-all duration-700 ease-out animate-fade-in-up">
        {/* Icon Section */}
        <div className="flex justify-center mb-6 transform transition-all duration-500 ease-out">
          {content.icon}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-800 mb-3 transition-all duration-500 ease-out">
          {content.title}
        </h2>

        {/* Subtitle */}
        <p className="text-gray-600 mb-6 transition-all duration-500 ease-out">
          {content.subtitle}
        </p>

        {/* dentoji Branding */}
        <p className="text-gray-600 mb-6">
          Thank you for using <span className="font-bold text-blue-600">dentoji</span>
        </p>

        {/* Progress Bar */}
        {content.showProgress && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            <p className="text-sm text-gray-500">{progress}% Complete</p>
          </div>
        )}

        {/* Countdown dots for redirecting stage */}
        {stage === 'redirecting' && (
          <div className="flex justify-center space-x-2 mt-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.7s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}