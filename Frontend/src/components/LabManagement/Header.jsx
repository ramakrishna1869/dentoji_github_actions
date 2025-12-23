import React from "react";

export default function Header({ onAddClick }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Lab Records Management
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage dental lab works, crowns, and payment tracking
        </p>
      </div>
      <button
        onClick={onAddClick}
        className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2.5 sm:py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap flex items-center justify-center gap-2"
      >
        <span className="text-base sm:text-sm">+</span>
        <span>Add Lab Record</span>
      </button>
    </div>
  );
}