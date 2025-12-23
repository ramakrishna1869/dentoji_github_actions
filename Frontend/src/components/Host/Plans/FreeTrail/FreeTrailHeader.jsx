// src/components/Host/FreeTrail/FreeTrailHeader.jsx
import React from 'react';

const FreeTrailHeader = () => {
  const stats = [
    {
      title: "Active Trials",
      value: "892",
      bgColor: "bg-gray-50",
      iconColor: "text-green-500"
    },
    {
      title: "Expiring Soon", 
      value: "25",
      bgColor: "bg-gray-50",
      iconColor: "text-yellow-500"
    },
    {
      title: "Expired Trials",
      value: "25",
      bgColor: "bg-gray-50", 
      iconColor: "text-red-500"
    },
    {
      title: "Conversion Rate",
      value: "25%",
      bgColor: "bg-gray-50",
      iconColor: "text-purple-500"
    }
  ];

  return (
    <div className="bg-gray-100 rounded-xl shadow-sm p-6 mb-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Trials & Subscriptions</h1>
          <p className="text-gray-500 text-sm">Track and manage all trial users and active subscriptions in one place.</p>
        </div>
        
        {/* Profile Avatar - positioned at top right */}
        <div className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-medium text-lg">
          R
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 h-24 flex items-center justify-between border border-gray-200 shadow-sm">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 mb-1 leading-tight">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center ml-3 flex-shrink-0">
              <div className="w-6 h-6 bg-green-400 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreeTrailHeader;