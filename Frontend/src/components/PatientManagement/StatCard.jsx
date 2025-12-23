import React from "react";

export default function StatCard({ title, value, icon, iconBg }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 flex items-center justify-between w-full  h-24 transition-all duration-300 hover:shadow-lg">
      {/* Text Section */}
      <div>
        <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
        <p className="text-lg sm:text-2xl font-bold text-black mt-1">{value}</p>
      </div>

      {/* Icon Section */}
      <div
        className={`p-2 sm:p-3 rounded-xl ${iconBg} flex items-center justify-center`}
      >
        {icon}
      </div>
    </div>
  );
}
