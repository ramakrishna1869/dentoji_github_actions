import React from 'react';
import { Lottie } from 'lottie-react';
import deniedAnimation from '../animations/access-denied.json'; // Add your Lottie JSON here

const AccessDenied = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <div className="w-72 h-72">
        <Lottie animationData={deniedAnimation} loop autoplay />
      </div>
      <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
      <p className="text-gray-600 mt-2">You do not have permission to view this page.</p>
    </div>
  );
};

export default AccessDenied;
