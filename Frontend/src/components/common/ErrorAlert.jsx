// components/common/ErrorAlert.jsx

import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorAlert = ({ message, onRetry }) => {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <div className="flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2" />
        <span className="block sm:inline">{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorAlert;