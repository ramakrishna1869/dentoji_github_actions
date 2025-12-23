
import React from "react";
const TableHeader = ({ onExport, iconSrc }) => (
  <div className="p-6 border-b border-gray-200 flex justify-between items-center">
    <h3 className="text-lg font-semibold">Recent Appointments</h3>
    <button
      onClick={onExport}
      className="flex items-center space-x-2 text-gray-600 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer"
    >
      <img src={iconSrc} alt="Export" className="w-4 h-4" />
      <span className="text-gray-400">Export</span>
    </button>
  </div>
);

export default TableHeader;
