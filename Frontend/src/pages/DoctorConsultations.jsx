//ConsultationPage
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, CalendarDays, AlertCircle, ChevronsLeft, ChevronsRight, AlertTriangle, CheckCircle2, CreditCard } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import ConsultationTable from "../components/Consultations/ConsultationTable";
import ConsultationViewModal from "../components/Consultations/ConsultationViewModal";
import AddConsultationModal from "../components/Consultations/AddConsultationModal";
import StatCard from "../components/Consultations/StatCard";
import FilterBar from "../components/Consultations/FilterBar";

const ConsultationManagement = () => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("All Status");
  const [payment, setPayment] = useState("All Payments");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    totalConsultations: 0,
    scheduledCount: 0,
    completedCount: 0,
    pendingPaymentCount: 0
  });

  const ITEMS_PER_PAGE = 10;

  // Fetch consultations from backend
  const fetchConsultations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/consultations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setConsultations(response.data.data.consultations || []);
        setStats(response.data.data.stats || {});
      }
    } catch (err) {
    //  console.error('Fetch consultations error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch consultations');
    } finally {
      setLoading(false);
    }
  };

  // Delete consultation
  const deleteConsultation = async (consultationId) => {
    if (!window.confirm('Are you sure you want to delete this consultation?')) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/consultations/${consultationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setConsultations(prev => prev.filter(c => c._id !== consultationId));
      setError(null);
    } catch (err) {
     // console.error('Delete consultation error:', err);
      setError(err.response?.data?.message || 'Failed to delete consultation');
    }
  };

  // Handle payment update
  const handlePaymentUpdate = (updatedConsultation) => {
    setConsultations(prev =>
      prev.map(c => c._id === updatedConsultation._id ? updatedConsultation : c)
    );
    fetchConsultations(); // Refresh to get updated stats
  };

  // Handle Add New Patient navigation
  const handleAddNewPatient = () => {
    navigate('/addpatient', { 
      state: { from: '/consultant' }
    });
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  // Filter consultations
  const filteredConsultations = consultations.filter((consultation) => {
    const searchMatch =
      (consultation.patientName || "").toLowerCase().includes(search.toLowerCase()) ||
      (consultation.consultationId || "").toLowerCase().includes(search.toLowerCase()) ||
      (consultation.consultantDoctor || "").toLowerCase().includes(search.toLowerCase());

    const dateMatch = !date || new Date(consultation.appointmentDate).toISOString().split('T')[0] === date;

    const statusMatch = status === "All Status" || consultation.status === status;

    const paymentMatch =
      payment === "All Payments" ||
      (payment === "Paid" && consultation.payment?.status === "Paid") ||
      (payment === "Partial" && consultation.payment?.status === "Partial") ||
      (payment === "Pending" && consultation.payment?.status === "Pending") ||
      (payment === "Overdue" && consultation.payment?.status === "Overdue");

    return searchMatch && dateMatch && statusMatch && paymentMatch;
  });

  const totalPages = Math.ceil(filteredConsultations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedConsultations = filteredConsultations.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleAddClick = () => {
    setSelectedConsultation(null);
    setIsEditMode(false);
    setShowAddModal(true);
  };

  const handleViewClick = (consultation) => {
    setSelectedConsultation(consultation);
    setShowViewModal(true);
  };

  const handleEditClick = (consultation) => {
    setSelectedConsultation(consultation);
    setIsEditMode(true);
    setShowViewModal(false);
    setShowAddModal(true);
  };

  const handleDeleteClick = (consultation) => {
    deleteConsultation(consultation._id);
  };

  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowViewModal(false);
    setSelectedConsultation(null);
    setIsEditMode(false);
  };

  const handleConsultationCreated = (newConsultation) => {
    if (isEditMode) {
      setConsultations(prev => 
        prev.map(c => c._id === newConsultation._id ? newConsultation : c)
      );
    } else {
      setConsultations(prev => [newConsultation, ...prev]);
    }
    fetchConsultations(); // Refresh to get updated stats
  };

return (
  <div className="p-3 sm:p-4 md:p-6 bg-[#f8f9fb] min-h-screen">
    {/* Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Consultations</h1>
        <p className="text-sm text-gray-600 mt-1">Manage patient consultations and appointments</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
        <button
          onClick={handleAddNewPatient}
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Patient
        </button>
        
        <button
          onClick={handleAddClick}
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Consultation
        </button>
      </div>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <StatCard 
        title="Scheduled" 
        value={stats.scheduledCount || 0} 
        icon={<CalendarDays className="text-blue-500 w-4 h-4 sm:w-5 sm:h-5" />} 
        color="bg-blue-100" 
      />
      <StatCard 
        title="High Urgency" 
        value={consultations.filter(c => c.status === 'High Urgency').length} 
        icon={<AlertTriangle className="text-red-500 w-4 h-4 sm:w-5 sm:h-5" />} 
        color="bg-red-100" 
      />
      <StatCard 
        title="Completed" 
        value={stats.completedCount || 0} 
        icon={<CheckCircle2 className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" />} 
        color="bg-green-100" 
      />
      <StatCard 
        title="Payment Pending" 
        value={stats.pendingPaymentCount || 0} 
        icon={<CreditCard className="text-indigo-500 w-4 h-4 sm:w-5 sm:h-5" />} 
        color="bg-indigo-100" 
      />
    </div>

    {/* Error Display */}
    {error && (
      <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-sm">
        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
        <span className="flex-1">{error}</span>
      </div>
    )}

    {/* Filter Bar */}
    <FilterBar
      search={search}
      setSearch={setSearch}
      setDate={setDate}
      setStatus={setStatus}
      setPayment={setPayment}
    />

    {/* Loading State */}
    {loading ? (
      <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Loading consultations...</p>
      </div>
    ) : (
      <>
        {/* Consultation Table */}
        <ConsultationTable 
          data={paginatedConsultations} 
          onView={handleViewClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onUpdate={handlePaymentUpdate}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-4 sm:mt-6 gap-1 sm:gap-2 flex-wrap">
            <button
              className="p-1.5 sm:px-3 sm:py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors cursor-pointer"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-2.5 py-1.5 sm:px-3 sm:py-1 rounded transition-colors text-xs sm:text-sm cursor-pointer ${
                  currentPage === i + 1 
                    ? "bg-blue-500 text-white" 
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              className="p-1.5 sm:px-3 sm:py-1 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </>
    )}

    {/* Modals */}
    {showViewModal && (
      <ConsultationViewModal 
        consultation={selectedConsultation} 
        onClose={handleCloseModals}
        onEdit={handleEditClick}
      />
    )}
    
    <AddConsultationModal 
      isOpen={showAddModal}
      onClose={handleCloseModals}
      onCreate={handleConsultationCreated}
      isEdit={isEditMode}
      initialData={selectedConsultation}
      consultationId={selectedConsultation?._id}
    />
  </div>
);
};

export default ConsultationManagement;
