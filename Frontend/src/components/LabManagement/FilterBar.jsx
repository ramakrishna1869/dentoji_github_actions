//FilterBar
import React from "react";
import { Search, Filter, X, RotateCcw } from "lucide-react";

export default function LabFilterBar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  paymentFilter,
  setPaymentFilter,
  onClearFilters,
  recordsCount = 0,
  totalRecords = 0
}) {
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "Pending", label: "Pending" },
    { value: "Received", label: "Received" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" }
  ];

  const paymentOptions = [
    { value: "", label: "All Payments" },
    { value: "Fully Paid", label: "Fully Paid " },
    { value: "Partial", label: "Partial" },
    { value: "Pending", label: "Pending" },
    {value:"Overdue" , label:"Overdue"}
  ];

  const hasActiveFilters = searchTerm || statusFilter || paymentFilter;
  const isFiltered = recordsCount !== totalRecords;
return (
  <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 mb-4 sm:mb-6">
    {/* Top Filter Controls */}
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4">
      {/* Search Input */}
      <div className="relative w-full sm:flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        <input
          type="text"
          placeholder="Search by patient name, lab name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-xs sm:text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={14} className="sm:w-4 sm:h-4" />
          </button>
        )}
      </div>

      {/* Status Filter */}
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-full sm:w-auto py-2 pl-3 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-xs sm:text-sm bg-white"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Payment Filter */}
      <select
        value={paymentFilter}
        onChange={(e) => setPaymentFilter(e.target.value)}
        className="w-full sm:w-auto py-2 pl-3 pr-8 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 text-xs sm:text-sm bg-white"
      >
        {paymentOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          <RotateCcw size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Clear Filters</span>
          <span className="sm:hidden">Clear</span>
        </button>
      )}
    </div>

    {/* Bottom Summary */}
    <div className="flex flex-col gap-2 text-xs sm:text-sm text-gray-600 border-t border-gray-100 pt-2 sm:pt-3">
      {/* Records Count */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <span>
          Showing {recordsCount.toLocaleString()} of {totalRecords.toLocaleString()} records
        </span>
        {isFiltered && (
          <div className="flex items-center gap-1">
            <Filter size={12} className="sm:w-[14px] sm:h-[14px]" />
            <span className="text-blue-600 font-medium">Filtered</span>
          </div>
        )}
      </div>

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="flex items-start gap-2 flex-wrap">
          <span className="text-gray-500 text-xs whitespace-nowrap mt-1">Filters:</span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-[10px] sm:text-xs">
                <span className="hidden sm:inline">Search: </span>"{searchTerm.length > 15 ? searchTerm.substring(0, 15) + '...' : searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="hover:text-blue-900 flex-shrink-0 cursor-pointer"
                >
                  <X size={10} className="sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-[10px] sm:text-xs">
                <span className="hidden sm:inline">Status: </span>{statusFilter}
                <button
                  onClick={() => setStatusFilter("")}
                  className="hover:text-green-900 flex-shrink-0 cursor-pointer"
                >
                  <X size={10} className="sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
            {paymentFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-[10px] sm:text-xs">
                <span className="hidden sm:inline">Payment: </span>{paymentFilter}
                <button
                  onClick={() => setPaymentFilter("")}
                  className="hover:text-orange-900 flex-shrink-0 cursor-pointer"
                >
                  <X size={10} className="sm:w-3 sm:h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);
}
