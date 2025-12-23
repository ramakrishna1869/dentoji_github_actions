import React, { useState, useEffect } from "react";
import Header from "@/components/Dashboard/Header";
import WelcomeCard from "@/components/Dashboard/WelcomeCard";
import StatCard from "@/components/Dashboard/StatCard";
import PatientFlowChart from "@/components/Dashboard/PatientFlowChart";
import AccessManagement from "@/components/Dashboard/AccessManagement";
import SystemLogs from "@/components/Dashboard/SystemLogs";
import CommonIssuesChart from "@/components/Dashboard/CommonIssuesChart";
import UpcomingAppointments from "@/components/Dashboard/UpcomingAppointments";
import ReceptionistAccessManagement from "@/components/Dashboard/ReceptionistAccessManagement";
import { Users, Calendar, DollarSign, IndianRupee } from "lucide-react";

// Hook for appointment statistics
const useAppointmentStats = (appointments) => {
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    pending: 0,
    thisMonth: 0,
    revenue: 0,
    active: 0,
  });

  useEffect(() => {
    if (!appointments || appointments.length === 0) {
      setStats({
        total: 0,
        today: 0,
        upcoming: 0,
        completed: 0,
        cancelled: 0,
        pending: 0,
        thisMonth: 0,
        revenue: 0,
        active: 0,
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const newStats = {
      total: appointments.length,
      today: 0,
      upcoming: 0,
      completed: 0,
      cancelled: 0,
      pending: 0,
      thisMonth: 0,
      revenue: 0,
      active: 0,
    };

    appointments.forEach((apt) => {
      const aptDate = new Date(apt.appointmentDate);
      aptDate.setHours(0, 0, 0, 0);

      if (aptDate.getTime() === today.getTime()) newStats.today++;
      if (aptDate >= startOfMonth) newStats.thisMonth++;
      if (aptDate > today) newStats.upcoming++;
      
      const status = apt.status?.toLowerCase() || "pending";
      
      if (status === "completed") {
        newStats.completed++;
        newStats.revenue += apt.fee || 150;
      } else if (status === "cancelled") {
        newStats.cancelled++;
      } else {
        newStats.pending++;
        if (status === "scheduled" || status === "pending" || status === "rescheduled") {
          newStats.active++;
        }
      }
    });

    setStats(newStats);
  }, [appointments]);

  return stats;
};

const DentalDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientStats, setPatientStats] = useState({
    totalPatients: 0,
    malePatients: 0,
    newThisMonth: 0,
    femalePatients: 0,
  });
  const [activePatientsCount, setActivePatientsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch appointments
        const appointmentsRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/patients/appointments?limit=1000`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData.appointments || []);

        // Fetch patient stats
        const statsRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/patients/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const statsData = await statsRes.json();
        setPatientStats(statsData);

        // Fetch active patients count
        const activePatientsRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/treatment-encounters/active-patients/count`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const activePatientsData = await activePatientsRes.json();
        setActivePatientsCount(activePatientsData.count || 0);

      } catch (error) {
      //  console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const appointmentStats = useAppointmentStats(appointments);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="flex-1 w-full">
        <Header />

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
          {/* Top Row: Welcome + Stats + Common Issues */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-4 lg:mb-6">
            {/* Left Section: Welcome + Stats */}
            <div className="col-span-1 lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">
              <WelcomeCard />
              
              {/* Stats Cards - Responsive Grid */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
                <StatCard
                  title="Total Patients"
                  value={loading ? "..." : patientStats.totalPatients.toString()}
                  icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
                  bgColor="bg-blue-100"
                  textColor="text-blue-600"
                  loading={loading}
                />
                <StatCard
                  title="Active Appointments"
                  value={loading ? "..." : appointmentStats.active.toString()}
                  icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
                  bgColor="bg-purple-100"
                  textColor="text-purple-600"
                  loading={loading}
                />
                <StatCard
                  title="Active Patients"
                  value={loading ? "..." : activePatientsCount.toString()}
                  icon={<Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />}
                  bgColor="bg-green-100"
                  textColor="text-green-600"
                  loading={loading}
                />
              </div>
            </div>

            {/* Right Section: Common Issues Chart */}
            <div className="col-span-1">
              <CommonIssuesChart />
            </div>
          </div>

          {/* Bottom Row: Flow Chart + Access + Logs | Appointments */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {/* Left Section (2/3): Vertical Stack */}
            <div className="col-span-1 lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">
              <PatientFlowChart />
              <ReceptionistAccessManagement />
            </div>

            {/* Right Section (1/3): Appointments */}
            <div className="col-span-1">
              <UpcomingAppointments />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DentalDashboard;