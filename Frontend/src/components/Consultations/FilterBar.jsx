
//FilterBar
import React, { useState } from "react";
import { CalendarDays, ChevronDown, Search } from "lucide-react";

const FilterBar = ({ search, setSearch, setDate, setStatus, setPayment }) => {
  const [date, setLocalDate] = useState("");
  const [status, setLocalStatus] = useState("All Status");
  const [payment, setLocalPayment] = useState("All Payments");

  // Sync local state with parent state
  const handleDateChange = (e) => {
    setLocalDate(e.target.value);
    setDate(e.target.value);
  };

  const handleStatusChange = (e) => {
    setLocalStatus(e.target.value);
    setStatus(e.target.value);
  };

  const handlePaymentChange = (e) => {
    setLocalPayment(e.target.value);
    setPayment(e.target.value);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap gap-3 items-center mb-6 border border-gray-100">
      {/* Search Input */}
      <div className="relative w-full sm:w-150">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by patient name, doctor name ……"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 placeholder:text-gray-400"
        />
      </div>

      {/* Native HTML5 Date Picker */}
      <div className="relative w-full sm:w-58">
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 cursor-pointer"
        />
      </div>

      {/* Status Dropdown */}
      <div className="relative w-full sm:w-50">
        <select
          value={status}
          onChange={handleStatusChange}
          className="appearance-none w-full border border-gray-300 rounded-md px-4 py-2 pr-10 text-sm text-gray-500 bg-white"
        >
          <option>All Status</option>
          <option>Scheduled</option>
          <option>Completed</option>
          <option>High Urgency</option>
          <option>In Progress</option>
          <option>Cancelled</option>
        </select>
        <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Payment Dropdown */}
      <div className="relative w-full sm:w-50">
        <select
          value={payment}
          onChange={handlePaymentChange}
          className="appearance-none w-full border border-gray-300 rounded-md px-4 py-2 pr-10 text-sm text-gray-500 bg-white"
        >
          <option>All Payments</option>
          <option>Paid</option>
          <option>Partial</option>
          <option>Pending</option>
          <option>Overdue</option>
        </select>
        <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default FilterBar;
