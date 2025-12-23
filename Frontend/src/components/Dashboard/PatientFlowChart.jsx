

//PatientFlowChart.jsx
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { jwtDecode } from "jwt-decode";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const PatientRegistrationChart = () => {
  const [activeTab, setActiveTab] = useState("Weekly");
  const [chartType, setChartType] = useState("line");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hospitalId, setHospitalId] = useState(null);
  const [totalPatients, setTotalPatients] = useState(0);

  // Calendar states
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarMode, setCalendarMode] = useState("date"); // 'date', 'month', 'year'

  // Get hospital ID from token and fetch patient data
useEffect(() => {
  const fetchHospitalData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      // Decode token
      const decoded = jwtDecode(token);
      let fetchedHospitalId = null;

      // 1️⃣ First priority — check hospitalId inside token
    // 1️⃣ First priority — check hospitalId inside token (and fix object case)
if (decoded.hospitalId) {
  const h = decoded.hospitalId;
  fetchedHospitalId = typeof h === "object" ? h._id : h;
}
else {
        // 2️⃣ Otherwise fetch from profile
        const profileResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile");
        }

        const profileData = await profileResponse.json();

        // 3️⃣ Admin → hospital._id
        if (decoded.role === "Admin" && profileData.hospital) {
          fetchedHospitalId = profileData.hospital._id;
        }

        // 4️⃣ Receptionist → receptionist.hospitalId nested object fix
        else if (
          decoded.role === "Receptionist" &&
          profileData.receptionist?.hospitalId
        ) {
          const hospitalObj = profileData.receptionist?.hospitalId;
fetchedHospitalId =
  typeof hospitalObj === "object"
    ? hospitalObj?._id
    : hospitalObj;

        }
      }

      // STILL NO ID? Throw error
      if (!fetchedHospitalId) {
        setError("No hospital ID found. Please contact administrator.");
        setLoading(false);
        return;
      }

      // Make sure ID is string
      fetchedHospitalId = String(fetchedHospitalId);

    //  console.log("Final Hospital ID:", fetchedHospitalId);

      setHospitalId(fetchedHospitalId);

      // ------------ BUILD API URL ----------
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/patients`;
      const params = new URLSearchParams();
   //console.log("params before adding IDs:", params.toString());
      // 👇 RECEPTIONIST uses hospitalId
      if (decoded.role === "Receptionist") {
        params.append("hospitalId", fetchedHospitalId);
      }

      // 👇 ADMIN uses adminId
      else if (decoded.role === "Admin") {
        params.append("adminId", decoded.id);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      //console.log("Fetching patients from:", url);

      // ------------- Fetch Patients ------------
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const patients = await response.json();
      const patientsArray = Array.isArray(patients) ? patients : [];

      setTotalPatients(patientsArray.length);

      const processedData = processPatientData(patientsArray, activeTab);
      setData(processedData);
    } catch (error) {
      //console.error("Error fetching data:", error);
      setError(error.message || "Failed to fetch patient data");
      setData(getDefaultData(activeTab));
    } finally {
      setLoading(false);
    }
  };

  fetchHospitalData();
}, [activeTab, selectedDate, selectedMonth, selectedYear]);

  // Get default data structure for each tab
  const getDefaultData = (period) => {
    switch (period) {
      case "Weekly":
        return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
          label: day,
          value: 0,
        }));
      case "Monthly":
        const targetDate = new Date(selectedYear, selectedMonth, 1);
        const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => ({
          label: (i + 1).toString(),
          value: 0,
        }));
      case "Yearly":
        return [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ].map((month) => ({
          label: month,
          value: 0,
        }));
      default:
        return [];
    }
  };

  // Process patient registration data based on the selected time period
  const processPatientData = (patients, period) => {
    if (!Array.isArray(patients) || patients.length === 0) {
      return getDefaultData(period);
    }

    const dataMap = new Map();

    patients.forEach((patient) => {
      if (!patient || !patient.createdAt) return;

      const registrationDate = new Date(patient.createdAt);
      if (isNaN(registrationDate.getTime())) return; // Skip invalid dates

      let key;
      let shouldInclude = false;

      switch (period) {
        case "Weekly":
          // Show selected week
          const weekStart = new Date(selectedDate);
          weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
          weekStart.setHours(0, 0, 0, 0);

          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);

          shouldInclude = registrationDate >= weekStart && registrationDate <= weekEnd;
          key = registrationDate.toLocaleDateString("en-US", { weekday: "short" });
          break;

        case "Monthly":
          // Show selected month and year
          shouldInclude = registrationDate.getMonth() === selectedMonth &&
            registrationDate.getFullYear() === selectedYear;
          key = registrationDate.getDate().toString();
          break;

        case "Yearly":
          // Show selected year
          shouldInclude = registrationDate.getFullYear() === selectedYear;
          key = registrationDate.toLocaleDateString("en-US", { month: "short" });
          break;

        default:
          shouldInclude = true;
          key = registrationDate.toLocaleDateString("en-US", { weekday: "short" });
      }

      if (shouldInclude) {
        if (!dataMap.has(key)) {
          dataMap.set(key, 0);
        }
        dataMap.set(key, dataMap.get(key) + 1);
      }
    });

    // Create complete data array with all time periods
    const completeData = getDefaultData(period).map(item => ({
      ...item,
      value: dataMap.get(item.label) || 0
    }));

    //console.log("Processed registration data:", completeData);
    return completeData;
  };

  // Get period information
  const getPeriodInfo = () => {
    switch (activeTab) {
      case "Weekly":
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `Week of ${weekStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        })} - ${weekEnd.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        })}`;
      case "Monthly":
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
        return `${monthNames[selectedMonth]} ${selectedYear}`;
      case "Yearly":
        return selectedYear.toString();
      default:
        return "";
    }
  };

  // Get peak period name
  const getPeakPeriod = () => {
    if (!data || data.length === 0) return "N/A";

    const maxValue = Math.max(...data.map(d => d.value));
    const peakItem = data.find(d => d.value === maxValue);

    if (!peakItem || maxValue === 0) return "N/A";

    switch (activeTab) {
      case "Weekly":
        const dayNames = {
          "Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday",
          "Thu": "Thursday", "Fri": "Friday", "Sat": "Saturday", "Sun": "Sunday"
        };
        return dayNames[peakItem.label] || peakItem.label;
      case "Monthly":
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
        return `${monthNames[selectedMonth]} ${peakItem.label}`;
      case "Yearly":
        const fullMonthNames = {
          "Jan": "January", "Feb": "February", "Mar": "March", "Apr": "April",
          "May": "May", "Jun": "June", "Jul": "July", "Aug": "August",
          "Sep": "September", "Oct": "October", "Nov": "November", "Dec": "December"
        };
        return fullMonthNames[peakItem.label] || peakItem.label;
      default:
        return peakItem.label;
    }
  };

  // Calendar navigation functions
  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    switch (activeTab) {
      case "Weekly":
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        setSelectedDate(newDate);
        break;
      case "Monthly":
        if (direction === 'next') {
          if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(selectedYear + 1);
          } else {
            setSelectedMonth(selectedMonth + 1);
          }
        } else {
          if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(selectedYear - 1);
          } else {
            setSelectedMonth(selectedMonth - 1);
          }
        }
        break;
      case "Yearly":
        setSelectedYear(selectedYear + (direction === 'next' ? 1 : -1));
        break;
    }
  };

  // Calendar component
const CalendarPicker = () => {
  const currentDate = new Date();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (activeTab === "Yearly") {
    const startYear = selectedYear - 5;
    const years = Array.from({ length: 11 }, (_, i) => startYear + i);

    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 absolute top-full left-1/2 transform -translate-x-1/2 z-50 mt-2 min-w-[260px]">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setSelectedYear(selectedYear - 11)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <span className="font-semibold text-sm text-gray-800">
            {startYear} - {startYear + 10}
          </span>
          <button
            onClick={() => setSelectedYear(selectedYear + 11)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {years.map(year => (
            <button
              key={year}
              onClick={() => {
                setSelectedYear(year);
                setShowCalendar(false);
              }}
              className={`p-2 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                year === selectedYear
                  ? "bg-blue-500 text-white shadow-md"
                  : "hover:bg-blue-50 text-gray-700 border border-gray-200"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === "Monthly") {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 absolute top-full left-1/2 transform -translate-x-1/2 z-50 mt-2 min-w-[300px]">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setSelectedYear(selectedYear - 1)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <span className="font-semibold text-sm text-gray-800">{selectedYear}</span>
          <button
            onClick={() => setSelectedYear(selectedYear + 1)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {monthNames.map((month, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedMonth(index);
                setShowCalendar(false);
              }}
              className={`p-2 text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                index === selectedMonth
                  ? "bg-blue-500 text-white shadow-md"
                  : "hover:bg-blue-50 text-gray-700 border border-gray-200"
              }`}
            >
              {month.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Weekly (date picker)
  const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const days = [];
  const currentCalendarDate = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentCalendarDate));
    currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 absolute top-full left-1/2 transform -translate-x-1/2 z-50 mt-2 min-w-[340px]">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() - 1);
            setSelectedDate(newDate);
          }}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={16} className="text-gray-600" />
        </button>
        <span className="font-semibold text-sm text-gray-800">
          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </span>
        <button
          onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setMonth(newDate.getMonth() + 1);
            setSelectedDate(newDate);
          }}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight size={16} className="text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div
            key={day}
            className="p-2 text-center text-xs font-semibold text-gray-500 bg-gray-50 rounded-lg"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
          const isSelected = day.toDateString() === selectedDate.toDateString();
          const isToday = day.toDateString() === currentDate.toDateString();

          return (
            <button
              key={index}
              onClick={() => {
                setSelectedDate(day);
                setShowCalendar(false);
              }}
              className={`p-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                !isCurrentMonth
                  ? "text-gray-300 hover:bg-gray-50"
                  : isSelected
                  ? "bg-blue-500 text-white shadow-md"
                  : isToday
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "text-gray-700 hover:bg-blue-50 border border-gray-100"
              }`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};



  const CustomGrid = () => {
    const safeData = Array.isArray(data) ? data : [];
    const maxValue = Math.max(...safeData.map(d => d.value), 10);
    const gridLines = Array.from({ length: 6 }, (_, i) => (i * maxValue) / 5);

    return (
      <g>
        {gridLines.map((value) => (
          <line
            key={value}
            x1="0"
            y1={`${100 - (value / maxValue) * 100}%`}
            x2="100%"
            y2={`${100 - (value / maxValue) * 100}%`}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
        ))}
        {safeData.map((_, index) => (
          <line
            key={index}
            x1={`${((index + 1) / (safeData.length + 1)) * 100}%`}
            y1="0"
            x2={`${((index + 1) / (safeData.length + 1)) * 100}%`}
            y2="100%"
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
        ))}
      </g>
    );
  };

  const CustomYAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={4}
          textAnchor="end"
          fill="#9ca3af"
          fontSize="14"
          fontWeight="400"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  const CustomXAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize="14"
          fontWeight="400"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  const CustomDot = ({ cx, cy }) => {
    return (
      <circle
        cx={cx}
        cy={cy}
        r="4"
        fill="#3b82f6"
        stroke="#ffffff"
        strokeWidth="2"
        style={{
          transition: "all 0.3s ease",
        }}
      />
    );
  };

  const getMaxValue = () => {
    if (!Array.isArray(data) || data.length === 0) return 10;

    const values = data.map(d => Number(d?.value) || 0).filter(v => !isNaN(v));
    if (values.length === 0) return 10;

    const maxValue = Math.max(...values);
    return Math.max(maxValue * 1.2, 10);
  };

  const maxYValue = getMaxValue();
return (
  <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 w-full max-w-6xl mx-auto">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
        Patient Registration Trends
      </h2>
      <span className="text-sm sm:text-base md:text-lg text-gray-500">
        {getPeriodInfo()}
      </span>
    </div>

    <p className="text-gray-600 mt-1 transition-all duration-300 ease-in-out text-sm sm:text-base">
      {/* You can add a description here */}
    </p>

    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8">
      {/* Left: Navigation Controls & Calendar */}
      <div className="flex items-center gap-2 sm:gap-3">

<div className="flex items-center gap-2 sm:gap-3">
  <button
    onClick={() => navigateDate('prev')}
    className="flex items-center justify-center hover:bg-gray-100 rounded-full h-6 w-6 sm:h-7 sm:w-7 transition-colors border border-gray-200"
    title="Previous"
  >
    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
  </button>
</div>




        {/* Calendar Picker */}
        <div className="relative">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-3 sm:py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors  cursor-pointer"
            title="Select Date"
          >
            <Calendar size={14} className="sm:w-4 sm:h-4 text-blue-600" />
            <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
              {activeTab === "Weekly" && "Pick Date"}
              {activeTab === "Monthly" && "Pick Month"}
              {activeTab === "Yearly" && "Pick Year"}
            </span>
          </button>
          {showCalendar && <CalendarPicker />}
        </div>

      <button
  onClick={() => navigateDate('next')}
  className="flex items-center justify-center hover:bg-gray-100 rounded-full h-6 w-6 sm:h-7 sm:w-7 transition-colors border border-gray-200"
  title="Next"
>
  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
</button>

      </div>

      {/* Right: Chart Type & Period Toggle */}
      <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
        {/* Chart Type Toggle */}
       <div className="flex bg-[#f5f5f5]  bg-opacity-30 rounded-3xl p-1 transition-all duration-300 ease-in-out h-9">
  <button
    onClick={() => setChartType("line")}
    className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-3xl h-7  text-[10px] sm:text-xs font-medium transition-all duration-300 ease-in-out transform cursor-pointer ${
      chartType === "line"
        ? "bg-blue-500 text-white shadow-sm scale-105"
        : "text-gray-900 hover:text-gray-900 hover:bg-gray-100"
    }`}
  >
    Line
  </button>

  <button
    onClick={() => setChartType("bar")}
    className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-3xl h-7 text-[10px] sm:text-xs font-medium transition-all duration-300 ease-in-out transform cursor-pointer ${
      chartType === "bar"
        ? "bg-blue-500 text-white shadow-sm scale-105"
        : "text-gray-900 hover:text-gray-900 hover:bg-gray-100"
    }`}
  >
    Bar
  </button>
</div>


        {/* Time Period Toggle */}
       <div className="flex bg-[#f5f5f5] bg-opacity-30 rounded-3xl p-1 transition-all duration-300 ease-in-out h-9">


          {["Weekly", "Monthly", "Yearly"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setShowCalendar(false);
              }}
              className={`px-3 py-1 h-7 sm:px-4 sm:py-1.5 rounded-3xl text-[10px] sm:text-xs
 font-medium transition-all duration-300 ease-in-out transform cursor-pointer ${activeTab === tab
                  ? "bg-blue-500 text-white shadow-sm scale-105"
                  : "text-gray-900 hover:text-gray-900 hover:bg-gray-100"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Loading State */}
    {loading && (
      <div className="h-60 sm:h-80 w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )}

    {/* Error State */}
    {error && (
      <div className="h-60 sm:h-80 w-full flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-500 text-base sm:text-lg mb-2">Error Loading Data</p>
          <p className="text-gray-400 text-xs sm:text-sm">{error}</p>
        </div>
      </div>
    )}

    {/* Chart Container */}
    {!loading && !error && (
      <div className="h-60 sm:h-80 w-full transition-all duration-500 ease-in-out">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart
              data={data}
              margin={{
                top: 20,

                right: 10,
                left: 20,
                bottom: 40,
              }}
            >
              <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow
                    dx="0"
                    dy="2"
                    stdDeviation="2"
                    floodOpacity="0.1"
                  />
                </filter>
              </defs>

              <CustomGrid />

              <Tooltip
                cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
                labelStyle={{ color: "#6b7280", fontWeight: "500" }}
                formatter={(value) => [`${value} Registrations`, "New Patients"]}
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={<CustomXAxisTick />}
                className="text-gray-400"
              />

              <YAxis
                domain={[0, maxYValue]}
                axisLine={false}
                tickLine={false}
                tick={<CustomYAxisTick />}
                className="text-gray-400"
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={<CustomDot />}
                activeDot={{
                  r: 5,
                  fill: "#3b82f6",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                  filter: "url(#shadow)",
                }}
                animationDuration={800}
                animationEasing="ease-in-out"
              />
            </LineChart>
          ) : (
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 10,
                left: 20,
                bottom: 40,
              }}
            >
              <CustomGrid />

              <Tooltip
                cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                }}
                labelStyle={{ color: "#6b7280", fontWeight: "500" }}
                formatter={(value) => [`${value} Registrations`, "New Patients"]}
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={<CustomXAxisTick />}
                className="text-gray-400"
              />

              <YAxis
                domain={[0, maxYValue]}
                axisLine={false}
                tickLine={false}
                tick={<CustomYAxisTick />}
                className="text-gray-400"
              />

              <Bar
                dataKey="value"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                animationDuration={800}
                animationEasing="ease-in-out"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    )}

    {/* Summary Stats */}
    {!loading && !error && data.length > 0 && (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 transition-all duration-500 ease-in-out">
        <div className="text-center group hover:bg-blue-50 p-2 sm:p-3 rounded-lg transition-all duration-300">
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300">
            {data.reduce((sum, item) => sum + item.value, 0)}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">This {activeTab.toLowerCase().slice(0, -2)}</p>
        </div>
        <div className="text-center group hover:bg-green-50 p-2 sm:p-3 rounded-lg transition-all duration-300">
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-300">
            {Math.max(...data.map(d => d.value))}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Peak: {getPeakPeriod()}</p>
        </div>
        <div className="text-center group hover:bg-orange-50 p-2 sm:p-3 rounded-lg transition-all duration-300">
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600 group-hover:scale-110 transition-transform duration-300">
            {(data.reduce((sum, item) => sum + item.value, 0) / data.length).toFixed(1)}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Daily Average</p>
        </div>
        <div className="text-center group hover:bg-purple-50 p-2 sm:p-3 rounded-lg transition-all duration-300">
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600 group-hover:scale-110 transition-transform duration-300">
            {totalPatients}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Total Patients</p>
        </div>
      </div>
    )}

    {/* Empty State */}
    {!loading && !error && (!data || data.length === 0) && (
      <div className="h-60 sm:h-80 w-full flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-gray-500 text-base sm:text-lg">No patient registration data available</p>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">Start adding patients to see trends</p>
        </div>
      </div>
    )}

    {/* Click outside to close calendar */}
    {showCalendar && (
      <div
        className="fixed inset-0 z-40"
        onClick={() => setShowCalendar(false)}
      />
    )}
  </div>
);
};

export default PatientRegistrationChart;