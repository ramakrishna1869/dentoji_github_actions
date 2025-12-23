import { useEffect, useState, createElement } from 'react';
import { useNavigate } from 'react-router-dom';

// Add this to your main App component or a layout component that wraps authenticated routes
const AutoLogoutAtMidnight = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const checkAndLogout = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      //console.log(`Current time: ${hours}:${minutes}`); // Debug log
      
      // Check if it's 12:00 AM (00:00)
      if (hours === 0 && minutes === 0) {
        // Clear localStorage
        localStorage.clear();
        
        // Show popup modal
        setShowLogoutModal(true);
      }
    };

    // Check every minute
    const interval = setInterval(checkAndLogout, 60000); // 60000ms = 1 minute
    
    // Run immediately on mount to check current time
    checkAndLogout();

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);

  const handleModalClose = () => {
    setShowLogoutModal(false);
    navigate('/login');
  };

  if (!showLogoutModal) return null;

  return createElement('div', {
    className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
  },
    createElement('div', {
      className: 'bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4 text-center'
    },
      createElement('h2', {
        className: 'text-2xl font-semibold text-gray-800 mb-4'
      }, 'Session Expired'),
      createElement('p', {
        className: 'text-gray-600 mb-6'
      }, 'Your session has expired at 12:00 AM. Please login again.'),
      createElement('button', {
        onClick: handleModalClose,
        className: 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-8 rounded-md transition-colors duration-200'
      }, 'Go to Login')
    )
  );
};

export default AutoLogoutAtMidnight;