// src/pages/AdminPages/Coupons.jsx
import React from 'react';
import CouponsHeader from '../../components/Host/Coupons/CouponsHeader';
import CouponsTable from '../../components/Host/Coupons/CouponsTable';

const Coupons = () => {
  return (
    <div className="min-h-screen bg-gray-100 overflow-hidden">
      <div className="max-w-full px-6 py-6">
        {/* Header Stats Component */}
        <CouponsHeader />
        
        {/* Coupons Table Component */}
        <CouponsTable />
        
        {/* Footer */}
        
      </div>
    </div>
  );
};

export default Coupons;