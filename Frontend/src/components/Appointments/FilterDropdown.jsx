import React from "react";
import { ChevronDown } from "lucide-react";

const FilterDropdown = ({ value, onChange, options, className = "" }) => (
  <div className={`relative w-full ${className}`}>
    <select
      className="appearance-none w-full bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
      value={value}
      onChange={onChange}
    >
      {options.map((option, index) => (
        <option key={index} value={option}>{option}</option>
      ))}
    </select>
    <ChevronDown
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
      size={18}
    />
  </div>
);

export default FilterDropdown;
