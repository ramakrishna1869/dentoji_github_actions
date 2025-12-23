import React from "react";

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm w-full h-27 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-lg font-bold">{value.toString().padStart(2, '0')}</p>
    </div>
    <div
      className={`w-10 h-10 flex items-center justify-center rounded-lg ${color}`}
    >
      {icon}
    </div>
  </div>
);

export default StatCard;
