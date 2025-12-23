// components/common/LoadingSpinner.jsx

import React from 'react';

const LoadingSpinner = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-4',
    large: 'w-12 h-12 border-4',
  };

  return (
    <div className={`animate-spin rounded-full border-t-transparent border-blue-500 ${sizeClasses[size] || sizeClasses.medium}`}></div>
  );
};

export default LoadingSpinner;