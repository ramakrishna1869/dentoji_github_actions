// In PatientManagement.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/PatientManagement/Header";
import StatCard from "../components/PatientManagement/StatCard";
import PatientTable from "../components/PatientManagement/PatientTable";
import { Users, UserCheck, UserPlus, UserX, AlertCircle, Crown } from "lucide-react";
import { usePatientLimit } from '../hooks/usePatientLimit'; // ✅ ADD THIS
import startIcon from '../assets/icons/start1.png';
import startIcon1 from '../assets/icons/start2.png';
import receptionistIcon from '../assets/StaffManagement/receptionist.png';
import completed from "../assets/icons/completed1.png";
import inprogress from "../assets/icons/inprogress1.png";


export default function PatientManagement() {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalPatients: 0,
    malePatients: 0,
    newThisMonth: 0,
    femalePatients: 0,
  });
 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ ADD THIS - Patient Limit Hook
  const { 
    currentCount, 
    maxPatients, 
    planType,
    loading: limitLoading,
    canAddPatient,
    showLimitModal,
    setShowLimitModal
  } = usePatientLimit();
 
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
       
        const token = localStorage.getItem("token");
       
        if (!token) {
          throw new Error("No authentication token found");
        }
       
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/patients/stats`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );
 
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
 
        const data = await response.json();
       // console.log("Fetched patient stats:", data);
          
        if (data.success) {
          setStats({
            totalPatients: data.data?.totalPatients || data.totalPatients || 0,
            malePatients: data.data?.malePatients || data.malePatients || 0,
            newThisMonth: data.data?.newThisMonth || data.newThisMonth || 0,
            femalePatients: data.data?.femalePatients || data.femalePatients || 0,
          });
        } else {
          setStats({
            totalPatients: data.totalPatients || 0,
            malePatients: data.malePatients || 0,
            newThisMonth: data.newThisMonth || 0,
            femalePatients: data.femalePatients || 0,
          });
        }
       
      } catch (err) {
       // console.error("Error fetching stats:", err);
        setError(err.message || "Failed to fetch statistics");
        setStats({
          totalPatients: 0,
          malePatients: 0,
          newThisMonth: 0,
          femalePatients: 0,
        });
      } finally {
        setLoading(false);
      }
    };
 
    fetchStats();
  }, []);

  // ✅ ADD THIS - Handle Add Patient Click
  const handleAddPatientClick = () => {
 //   console.log("Add Patient Clicked. Can add patient:", canAddPatient);
    if (!canAddPatient) {
      setShowLimitModal(true);
      return;
    }
    navigate('/addpatient');
  };
 
  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-90 min-h-screen">
      {/* ✅ UPDATED HEADER with Limit Info and Disabled Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage patient records and information</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Patient Count Badge */}
          {!limitLoading && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              maxPatients === -1 
                ? 'bg-green-100 text-green-800' 
                : currentCount >= maxPatients 
                ? 'bg-red-100 text-red-800'
                : currentCount >= maxPatients * 0.8
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              <Users className="w-5 h-5" />
              <span className="font-semibold text-sm">
                {maxPatients === -1 
                  ? `${currentCount} Patients (Unlimited)` 
                  : `${currentCount} / ${maxPatients} Patients`}
              </span>
            </div>
          )}

          {/* Add Patient Button - Disabled when limit reached */}
          <button
            onClick={handleAddPatientClick}
            disabled={!canAddPatient || limitLoading}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              canAddPatient && !limitLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
            }`}
            title={!canAddPatient ? `Patient limit reached (${maxPatients} patients max)` : 'Add new patient'}
          >
            <UserPlus className="w-5 h-5" />
            <span>Add New Patient</span>
          </button>
        </div>
      </div>

      {/* ✅ Patient Limit Warning Banner */}
      {!limitLoading && maxPatients !== -1 && currentCount >= maxPatients && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">
                Patient Limit Reached
              </p>
              <p className="text-sm text-red-700 mt-1">
                You've reached the maximum of {maxPatients} patients for your {planType}. 
                Upgrade to <strong>Monthly Plan</strong> or <strong>Yearly Plan</strong> for unlimited patients.
              </p>
              <button
                onClick={() => navigate('/pricing')}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                <Crown className="w-4 h-4" />
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Approaching Limit Warning (at 80%) */}
      {!limitLoading && maxPatients !== -1 && currentCount >= maxPatients * 0.8 && currentCount < maxPatients && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-yellow-800">
                Approaching Patient Limit
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                You have {currentCount} out of {maxPatients} patients ({Math.round((currentCount/maxPatients)*100)}% full). 
                Only {maxPatients - currentCount} patients remaining in your {planType}.
              </p>
            </div>
          </div>
        </div>
      )}
     
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-start sm:items-center">
            <div className="text-red-800 text-sm sm:text-base">
              <strong>Error loading statistics:</strong> {error}
            </div>
          </div>
        </div>
      )}
     
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard
          title="Total Patients"
          value={loading ? "..." : stats.totalPatients}
          icon={<img src={startIcon} alt="Patients" className="w-5 h-5 sm:w-6 sm:h-6" />}
          iconBg="bg-blue-100"
        />
        <StatCard
          title="New This Month"
          value={loading ? "..." : stats.newThisMonth}
          icon={<img src={startIcon1} alt="Patients" className="w-5 h-5 sm:w-6 sm:h-6" />}
          iconBg="bg-yellow-100"
        />
        <StatCard
          title="Female Patients"
          value={loading ? "..." : stats.femalePatients}
          icon={<img src={completed} alt="Patients" className="w-5 h-5 sm:w-6 sm:h-6" />}
          iconBg="bg-green-100"
        />
        <StatCard
          title="Male Patients"
          value={loading ? "..." : stats.malePatients}
          icon={<img src={inprogress} alt="Patients" className="w-5 h-5 sm:w-6 sm:h-6" />}
          iconBg="bg-red-100"
        />
      </div>
     
      <PatientTable />

      {/* ✅ ADD Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 border-2 border-red-100">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Users className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
                Patient Limit Reached!
              </h2>

              <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium mb-4">
                <AlertCircle className="w-4 h-4 mr-2" />
                {currentCount} / {maxPatients} Patients
              </div>

              <p className="text-gray-700 font-medium mb-3">
                You've reached the maximum patient limit for:
              </p>
              <p className="text-lg font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg mb-4">
                {planType}
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Upgrade to <strong>Monthly Plan</strong> or <strong>Yearly Plan</strong> for unlimited patients!
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Upgrade Benefits:</span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1 ml-7 text-left">
                  <li>✓ Unlimited patients</li>
                  <li>✓ Advanced reporting</li>
                  <li>✓ Priority support</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLimitModal(false);
                    navigate('/pricing');
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}