import React from "react";
const StatsCard = ({ title, value, iconSrc, bgColor }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
        <img src={iconSrc} alt={title} className="w-8 h-8" />
      </div>
    </div>
  </div>
);
export default StatsCard;
