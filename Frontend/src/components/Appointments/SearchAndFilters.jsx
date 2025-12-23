import React from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';

const SearchAndFilters = ({ 
  filters, 
  setFilters, 
  doctors = [], 
  searchTerm = '', 
  setSearchTerm 
}) => {
  const handleFilterChange = (filterType, value) => {
    //console.log(`🔍 Filter changed - ${filterType}: ${value}`);
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSearchChange = (e) => {
    //console.log('🔍 Search changed:', e.target.value);
    if (setSearchTerm && typeof setSearchTerm === 'function') {
      setSearchTerm(e.target.value);
    } else {
      console.warn('setSearchTerm function not provided or not a function');
    }
  };

  const clearSearch = () => {
    //console.log('🧹 Clearing search');
    if (setSearchTerm && typeof setSearchTerm === 'function') {
      setSearchTerm('');
    }
  };

  const clearFilters = () => {
    //console.log('🧹 Clearing all filters');
    setFilters({
      status: "All Status",
      doctor: "All Doctors",
      date: "",
    });
  };

  const hasActiveFilters = 
    filters.status !== "All Status" || 
    filters.doctor !== "All Doctors" || 
    filters.date !== "";

  const statusOptions = ["All Status", "Scheduled", "Pending", "Completed", "Cancelled"];
  const doctorOptions = ["All Doctors", ...doctors];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search Bar with Filter Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
          {/* Search Bar */}
          <div className="flex-1 max-w-full relative mt-6">

            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by patient name, doctor, or treatment..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
              >
                <span className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</span>
              </button>
            )}
          </div>

       
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Status Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[140px]"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Doctor</label>
            <select
              value={filters.doctor}
              onChange={(e) => handleFilterChange('doctor', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[160px]"
            >
              {doctorOptions.map(doctor => (
                <option key={doctor} value={doctor}>
                  {doctor}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-w-[140px]"
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="flex flex-col justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors border border-gray-300 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Search:</span> "{searchTerm}"
          </div>
        </div>
      )}

      {/* Active Filter Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">Active Filters:</span>
            
            {filters.status !== "All Status" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Status: {filters.status}
                <button
                  onClick={() => handleFilterChange('status', 'All Status')}
                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters.doctor !== "All Doctors" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Doctor: {filters.doctor}
                <button
                  onClick={() => handleFilterChange('doctor', 'All Doctors')}
                  className="text-green-600 hover:text-green-800 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
            
            {filters.date && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Date: {new Date(filters.date).toLocaleDateString()}
                <button
                  onClick={() => handleFilterChange('date', '')}
                  className="text-purple-600 hover:text-purple-800 cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilters