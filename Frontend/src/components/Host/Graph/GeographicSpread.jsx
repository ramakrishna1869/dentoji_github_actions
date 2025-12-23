// src/components/Host/Graph/GeographicSpread.jsx
import React from 'react';

const GeographicSpread = () => {
  const locationData = [
    { city: 'Visakhapatnam', users: '690 users' },
    { city: 'Hyderabad', users: '550 users' },
    { city: 'Chennai', users: '480 users' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Geographic Spread</h2>
        <div className="mt-4">
          <h3 className="text-base font-semibold text-gray-900">Clinic Distribution</h3>
          <p className="text-sm text-gray-600 mt-1">Active clinics by city/state</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {locationData.map((location, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-3 rounded-lg"
            style={{
              background: '#407BFF0F',
              borderRadius: '10px',
              minHeight: '39px'
            }}
          >
            <span className="text-sm font-medium text-gray-900">{location.city}</span>
            <span 
              className="text-black"
              style={{
                fontFamily: 'Roboto',
                fontWeight: 400,
                fontSize: '16px',
                lineHeight: '100%',
                letterSpacing: '0%',
                textAlign: 'right',
                opacity: 1
              }}
            >
              {location.users}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeographicSpread;