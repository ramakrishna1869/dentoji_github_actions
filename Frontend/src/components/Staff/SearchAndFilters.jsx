import { Search } from "lucide-react";
import FilterDropdown from "./FilterDropdown";
import React from "react";
const SearchAndFilters = ({ filters, setFilters }) => {
  const roleOptions = ["All Roles", "Doctor", "Receptionist", "Nurse", "Admin"];
  const statusOptions = ["All Status", "Active", "Inactive", "On Leave"];
  const departmentOptions = ["All Departments", "General Dentistry", "Oral Surgery", "Front Desk", "Administration"];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <FilterDropdown
          value={filters.role}
          onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
          options={roleOptions}
        />
        <FilterDropdown
          value={filters.status}
          onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          options={statusOptions}
        />
        <FilterDropdown
          value={filters.department}
          onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
          options={departmentOptions}
        />
      </div>
    </div>
  );
};

export default SearchAndFilters;
