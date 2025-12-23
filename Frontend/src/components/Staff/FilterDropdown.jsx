import React from "react";
import { ChevronDown } from "lucide-react";

const FilterDropdown = ({ value, onChange, options, className = "" }) => (
 <div className={`relative ${className}`}>
  <select
    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={value}
    onChange={onChange}
    size="1"
    style={{ 
      backgroundPosition: "right 8px center",
      overflow: "auto"
    }}
  >
    {options.map((option, index) => (
      <option key={index} value={option}>{option}</option>
    ))}
  </select>
  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
</div>
);
export default FilterDropdown;
