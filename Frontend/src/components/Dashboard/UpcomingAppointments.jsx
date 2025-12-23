//Upcoming Appointments
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, Calendar, Clock, User } from "lucide-react";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const UpcomingAppointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [tempMonth, setTempMonth] = useState(selectedDate.getMonth());
  const [tempYear, setTempYear] = useState(selectedDate.getFullYear());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ role: null, hospitalId: null });
  const [appointmentDates, setAppointmentDates] = useState(new Set());

  // Initialize user authentication
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
         // console.error('No authentication token found');
          return;
        }

        const decoded = jwtDecode(token);
        setUser({
          role: decoded.role,
          id: decoded.id || decoded.userId,
          hospitalId: decoded.hospitalId
        });
      } catch (error) {
       // console.error('Error initializing auth:', error);
      }
    };

    initializeAuth();
  }, []);

  // Utility function to format date as YYYY-MM-DD
  const formatDateKey = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-based, so add 1
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch appointments from database
  const fetchAppointments = async () => {
    if (!user.role) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams({
        limit: '1000'
      });
      
      if (user.role === 'Receptionist' && user.hospitalId) {
        params.append('hospitalId', user.hospitalId);
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/patients/appointments?${params.toString()}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      const { appointments: appointmentsData } = response.data;
      //console.log('Raw appointments data:', appointmentsData); // Debug log
      setAppointments(appointmentsData || []);

      // Create a set of dates that have appointments
      const datesWithAppointments = new Set();
      appointmentsData?.forEach(apt => {
        if (apt.appointmentDate) {
          const dateKey = formatDateKey(apt.appointmentDate);
          if (dateKey) {
            //console.log(`Appointment: ${apt.patientName || apt.patientFirstName + ' ' + apt.patientLastName} on ${apt.appointmentDate} -> key: ${dateKey}`);
            datesWithAppointments.add(dateKey);
          }
        }
      });
      
      //console.log('All appointment date keys:', Array.from(datesWithAppointments));
      setAppointmentDates(datesWithAppointments);

    } catch (error) {
     // console.error('Error fetching appointments:', error);
      setAppointments([]);
      setAppointmentDates(new Set());
    } finally {
      setLoading(false);
    }
  };

  // Fetch appointments when user is authenticated or when month/year changes
  useEffect(() => {
    if (user.role) {
      fetchAppointments();
    }
  }, [user.role]);

  // Filter appointments for selected date
  const getAppointmentsForSelectedDate = () => {
    const selectedDateKey = formatDateKey(selectedDate);
    //console.log('Filtering for selected date key:', selectedDateKey);
    
    const filtered = appointments.filter(apt => {
      if (!apt.appointmentDate) return false;
      const aptDateKey = formatDateKey(apt.appointmentDate);
      const matches = aptDateKey === selectedDateKey;
      
      if (matches) {
        /*console.log('Matching appointment found:', {
          patient: apt.patientName || `${apt.patientFirstName || ''} ${apt.patientLastName || ''}`,
          date: apt.appointmentDate,
          time: apt.appointmentTime
        });*/
      }
      
      return matches;
    }).sort((a, b) => {
      const timeA = a.appointmentTime || '00:00';
      const timeB = b.appointmentTime || '00:00';
      return timeA.localeCompare(timeB);
    });
    
    //console.log(`Found ${filtered.length} appointments for ${selectedDateKey}`);
    return filtered;
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayIndex = (year, month) => new Date(year, month, 1).getDay();

  const handleDayClick = (day) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    //console.log('Day clicked:', day, 'New selected date:', formatDateKey(newDate));
    setSelectedDate(newDate);
  };

  // Check if a date has appointments
  const hasAppointments = (year, month, day) => {
    const checkDate = new Date(year, month, day);
    const dateKey = formatDateKey(checkDate);
    const hasAppt = appointmentDates.has(dateKey);
    return hasAppt;
  };

  // Get appointment count for a specific date
  const getAppointmentCount = (year, month, day) => {
    const checkDate = new Date(year, month, day);
    const dateKey = formatDateKey(checkDate);
    
    const count = appointments.filter(apt => {
      if (!apt.appointmentDate) return false;
      const aptDateKey = formatDateKey(apt.appointmentDate);
      return aptDateKey === dateKey;
    }).length;
    
    return count;
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'No time';
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const period = hour >= 12 ? 'PM' : 'AM';
      const adjustedHour = hour % 12 || 12;
      return `${adjustedHour}:${minutes} ${period}`;
    } catch (error) {
      return timeString; // Return original if parsing fails
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Scheduled': 'bg-blue-100 text-blue-800 border-blue-200',
      'Confirmed': 'bg-purple-100 text-purple-800 border-purple-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Check if date is upcoming (today or future)
  const isUpcomingDate = (year, month, day) => {
    const dateToCheck = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck >= today;
  };

  // Get patient name from appointment data
  const getPatientName = (appointment) => {
    // Try different possible field names for patient name
    if (appointment.patientName && appointment.patientName.trim()) {
      return appointment.patientName.trim();
    }
    
    const firstName = appointment.patientFirstName || appointment.firstName || '';
    const lastName = appointment.patientLastName || appointment.lastName || '';
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    return 'Unknown Patient';
  };

  const selectedDateAppointments = getAppointmentsForSelectedDate();

  return (
    <div className="bg-white rounded-xl p-6 max-w-md mx-auto shadow-sm h-224">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2
            className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => setShowPicker(!showPicker)}
            aria-label={`Select month and year, currently ${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`}
          >
            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </h2>
        </div>

        {showPicker && (
          <div className="absolute z-20 mt-2 top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-2">
              <select
                value={tempMonth}
                onChange={(e) => setTempMonth(Number(e.target.value))}
                className="border text-black border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label="Select month"
              >
                {monthNames.map((month, idx) => (
                  <option key={month} value={idx}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={tempYear}
                onChange={(e) => setTempYear(Number(e.target.value))}
                className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                aria-label="Select year"
              >
                {Array.from({ length: 20 }, (_, i) => {
                  const year = 2020 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>

              <button
                className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                onClick={() => {
                  const newDate = new Date(tempYear, tempMonth, Math.min(selectedDate.getDate(), getDaysInMonth(tempYear, tempMonth)));
                  setSelectedDate(newDate);
                  setShowPicker(false);
                }}
                aria-label="Apply selected month and year"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const prevMonth = selectedDate.getMonth() - 1;
              const prevYear = selectedDate.getFullYear();
              setSelectedDate(new Date(prevYear, prevMonth, 1));
            }}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <button
            onClick={() => {
              const nextMonth = selectedDate.getMonth() + 1;
              const nextYear = selectedDate.getFullYear();
              setSelectedDate(new Date(nextYear, nextMonth, 1));
            }}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="mt-6 border-t border-gray-200 pt-4">

        {/* Day Labels */}
        <div className="grid grid-cols-7 text-xs text-center text-gray-500 font-medium mb-3">
          {dayNames.map((day) => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-7 gap-1 text-center  text-sm">
          {Array.from({ length: getFirstDayIndex(selectedDate.getFullYear(), selectedDate.getMonth()) }).map((_, i) => (
            <div key={`empty-${i}`} className="py-3" />
          ))}

          {Array.from({ length: getDaysInMonth(selectedDate.getFullYear(), selectedDate.getMonth()) }, (_, i) => {
            const day = i + 1;
            const isSelected = selectedDate.getDate() === day;
            const hasAppts = hasAppointments(selectedDate.getFullYear(), selectedDate.getMonth(), day);
            const isToday = new Date().toDateString() === new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toDateString();
            const appointmentCount = getAppointmentCount(selectedDate.getFullYear(), selectedDate.getMonth(), day);
            const isUpcoming = isUpcomingDate(selectedDate.getFullYear(), selectedDate.getMonth(), day);
            
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`
                  relative py-3 rounded-full transition-all duration-200 min-h-[2.5rem] flex items-center justify-center cursor-pointer
                  ${isSelected ? "bg-blue-600 text-white font-semibold" : "text-gray-800 "}
                  ${isToday ? "ring-2 ring-blue-300" : ""}
                  ${hasAppts && isUpcoming ? "bg-blue-50 hover:bg-blue-100" : hasAppts ? "bg-blue-100 text-black hover:bg-gray-100" : "hover:bg-gray-100"}
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
                aria-label={`Select ${monthNames[selectedDate.getMonth()]} ${day}, ${selectedDate.getFullYear()}${hasAppts ? `, has ${appointmentCount} appointment${appointmentCount !== 1 ? 's' : ''}` : ''}`}
              >
                <span className="relative z-10">{day}</span>
                {hasAppts && appointmentCount > 0 && (
                  <>
                    <span className={`
                      absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full
                      ${isSelected ? 'bg-white' : isUpcoming ? 'bg-blue-500' : 'bg-gray-500'}
                    `} />
                    {appointmentCount > 1 && (
                      <span className={`
                        absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold
                        ${isSelected ? 'bg-white text-blue-600' : isUpcoming ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'}
                      `}>
                        {appointmentCount > 9 ? '9+' : appointmentCount}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>Upcoming</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-500"></div>
          <span>Past</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-300 ring-2 ring-blue-300"></div>
          <span>Today</span>
        </div>
      </div>

      {/* Debug Info - Remove in production
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
          <div>Total appointments: {appointments.length}</div>
          <div>Selected date: {formatDateKey(selectedDate)}</div>
          <div>Appointments for selected date: {selectedDateAppointments.length}</div>
          <div>Appointment dates: {Array.from(appointmentDates).join(', ')}</div>
        </div>
      )} */}

      {/* Appointments */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-blue-600">
            Appointments
          </h3>
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          {' '}({selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? 's' : ''})
        </p>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-96">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading appointments...</p>
          </div>
        ) : selectedDateAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">No appointments scheduled</p>
            <p className="text-sm">for this date</p>
          </div>
        ) : (
          selectedDateAppointments.map((appointment, index) => (
            <div
              key={appointment._id || index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200 bg-white"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                      <Clock className="w-4 h-4 text-blue-500" />
                      {formatTime(appointment.appointmentTime)}
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(appointment.status)}`}>
                      {appointment.status || 'Scheduled'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {getPatientName(appointment)}
                      </span>
                    </div>
                    
                    {appointment.doctor && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-4 h-4 flex items-center justify-center">👨‍⚕️</span>
                        <span>Dr. {appointment.doctor}</span>
                      </div>
                    )}
                    
                    {appointment.treatment && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-4 h-4 flex items-center justify-center">🏥</span>
                        <span>{appointment.treatment}</span>
                      </div>
                    )}
                    
                    {appointment.patientPhone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-4 h-4 flex items-center justify-center">📞</span>
                        <span>{appointment.patientPhone}</span>
                      </div>
                    )}
                    
                    {appointment.priority && appointment.priority !== 'Medium' && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-4 h-4 flex items-center justify-center">⚡</span>
                        <span className={`font-medium ${
                          appointment.priority === 'High' || appointment.priority === 'Urgent' 
                            ? 'text-red-600' 
                            : 'text-gray-500'
                        }`}>
                          {appointment.priority} Priority
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <button className="text-gray-400 hover:text-gray-600 p-1" aria-label="More options">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              
              {appointment.notes && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-600 italic">
                    "{appointment.notes}"
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingAppointments;
