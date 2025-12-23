//calendar.jsx
import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thurs", "Fri", "Sat"];

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(null);

  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");

  const daysInMonth = currentMonth.daysInMonth();
  const startDay = startOfMonth.day(); // 0 (Sun) - 6 (Sat)

  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

  const renderDays = () => {
    const days = [];

    // Add empty slots for alignment
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="py-2 text-center" />);
    }

    // Add actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = currentMonth.date(d);
      const isSelected = selectedDate?.isSame(thisDate, "date");

      days.push(
        <div
          key={d}
          onClick={() => setSelectedDate(thisDate)}
          className={`py-2 text-center rounded-lg cursor-pointer font-medium
            ${isSelected ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"}
          `}
        >
          {d}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-2xl p-6  w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {currentMonth.format("MMMM YYYY")}
        </h3>
        <div className="flex space-x-2">
          <button onClick={prevMonth}>
            <ChevronLeft className="w-5 h-5 text-gray-500 hover:text-black" />
          </button>
          <button onClick={nextMonth}>
            <ChevronRight className="w-5 h-5 text-gray-500 hover:text-black" />
          </button>
        </div>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-xs font-medium text-gray-500 text-center py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Dates Grid */}
      <div className="grid grid-cols-7 gap-2">{renderDays()}</div>
    </div>
  );
};

export default Calendar;
