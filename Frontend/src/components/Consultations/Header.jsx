import React from "react";

const Header = ({ onAddClick }) => (
  <div className="flex justify-between items-center mb-6">
    <div>
      <h1 className="text-xl font-semibold">Doctor Consultations & Referrals</h1>
      <p className="text-sm text-gray-500">
        Manage patient referrals to specialist doctors and track consultation fees
      </p>
    </div>
    <button
      onClick={onAddClick}
      className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 cursor-pointer"
    >
      + Add Consultation
    </button>
  </div>
);

export default Header;



