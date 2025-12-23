// src/components/Host/Coupons/CouponsHeader.jsx
import React from 'react';

const CouponsHeader = () => {
  const stats = [
    {
      title: "Total Coupons",
      value: "81",
      bgColor: "bg-green-100",
      iconColor: "text-green-500"
    },
    {
      title: "Active Coupons", 
      value: "29",
      bgColor: "bg-green-100",
      iconColor: "text-green-500"
    },
    {
      title: "Expired Coupons",
      value: "892",
      bgColor: "bg-green-100", 
      iconColor: "text-green-500"
    },
    {
      title: "Inactive Coupons",
      value: "56",
      bgColor: "bg-green-100",
      iconColor: "text-green-500"
    },
    {
      title: "Members Applied",
      value: "240",
      bgColor: "bg-green-100",
      iconColor: "text-green-500"
    },
    {
      title: "Coupons Expiring Soon",
      value: "19",
      bgColor: "bg-green-100",
      iconColor: "text-green-500"
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Coupons Overview</h1>
          <p className="text-gray-500 text-sm">Total number of coupons created.</p>
        </div>
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-lg">R</span>
        </div>
      </div>
     
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-4 h-20 flex items-center justify-between shadow-sm border border-gray-100">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1 leading-tight">{stat.title}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className="w-10 h-10 bg-green-200 rounded flex items-center justify-center ml-3 flex-shrink-0">
              {/* <div className="w-4 h-4 bg-green-500 rounded-sm"></div> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CouponsHeader;