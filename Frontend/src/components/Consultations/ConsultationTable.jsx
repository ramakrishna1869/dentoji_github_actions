//ConsultationTable
import React, { useState } from "react";
import { CalendarDays, Eye, Edit, Trash2, IndianRupee } from "lucide-react";
import ConsultationModal from "./ConsultationModal";
import UpdatePaymentModal from "./UpdatePaymentModal";


const ConsultationTable = ({ data, onView, onEdit, onDelete, onUpdate }) => {
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // Local state to manage data updates
  const [consultations, setConsultations] = useState(data || []);

  // Update local state when data prop changes
  React.useEffect(() => {
    setConsultations(data || []);
  }, [data]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      Scheduled: "bg-blue-100 text-blue-800",
      "In Progress": "bg-yellow-100 text-yellow-800",
      Completed: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
      "High Urgency": "bg-orange-100 text-orange-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      Partial: "bg-yellow-100 text-yellow-800",
      Pending: "bg-orange-100 text-orange-800",
      Paid: "bg-green-100 text-green-800",
      "Fully Paid": "bg-green-100 text-green-800", // Handle both "Paid" and "Fully Paid"
      Overdue: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleViewClick = (consultation) => {
    setSelectedConsultation(consultation);
    setIsModalOpen(true);
    if (onView) onView(consultation);
  };

  const handlePaymentClick = (consultation) => {
    setSelectedPayment(consultation);
    setIsPaymentModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedConsultation(null);
    setIsModalOpen(false);
  };

  const handlePaymentModalClose = () => {
    setSelectedPayment(null);
    setIsPaymentModalOpen(false);
  };

  const handlePaymentUpdate = (updatedConsultation) => {
    //console.log('Payment update received:', updatedConsultation);
    
    // Update local state immediately
    setConsultations(prevConsultations => 
      prevConsultations.map(consultation => 
        consultation._id === updatedConsultation._id 
          ? updatedConsultation 
          : consultation
      )
    );
    
    // Call parent's onUpdate if it exists
    if (onUpdate) {
      onUpdate(updatedConsultation);
    }
  };

  if (!consultations || consultations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="text-gray-500">
          <CalendarDays className="w-12 h-12 mx-auto mb-3" />
          <p className="text-lg font-medium">No consultations found</p>
          <p className="text-sm">Start by adding a new consultation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-700">S NO</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Patient</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Doctor</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Payment</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {consultations.map((consultation, index) => {
              // Enhanced payment data extraction with fallbacks
              const paymentTotal = consultation.payment?.total ?? consultation.total ?? 0;
              const paymentPaid = consultation.payment?.paid ?? consultation.paid ?? 0;
              const paymentStatus = consultation.payment?.status ?? "Pending";
              
              return (
                <tr key={consultation._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{index + 1}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {consultation.patientName || consultation.patient || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {consultation.patientPhone || "-"}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-900">
                      {consultation.consultantDoctor || consultation.doctor || "-"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {consultation.clinicName || consultation.clinic || "-"}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-900">
                      {consultation.consultationType || consultation.treatment || "-"}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-900">
                      {formatDate(consultation.appointmentDate || consultation.date)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {consultation.appointmentTime || "-"}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                      {consultation.status || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(paymentStatus)}`}>
                      {paymentStatus}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      ₹{Number(paymentPaid).toFixed(2)}/₹{Number(paymentTotal).toFixed(2)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewClick(consultation)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(consultation)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors cursor-pointer"
                        title="Edit consultation"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(consultation)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title="Delete consultation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePaymentClick(consultation)}
                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                        title="Update payment"
                      >
                        <IndianRupee className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {isModalOpen && selectedConsultation && (
        <ConsultationModal data={selectedConsultation} onClose={handleModalClose} />
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && selectedPayment && (
        <UpdatePaymentModal
          data={selectedPayment}
          onClose={handlePaymentModalClose}
          onUpdate={handlePaymentUpdate}
        />
      )}
    </div>
  );
};

export default ConsultationTable;
