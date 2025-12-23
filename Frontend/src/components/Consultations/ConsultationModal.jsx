//ConsultationModal.jsx
import React from "react";
import { X, User, FileText, Calendar, DollarSign, Edit } from "lucide-react";

const ConsultationViewModal = ({ consultation, onClose, onEdit }) => {
  if (!consultation) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'Scheduled': 'bg-blue-100 text-blue-800',
      'In Progress': 'bg-yellow-100 text-yellow-800',
      'Completed': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800',
      'High Urgency': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Partial': 'bg-orange-100 text-orange-800',
      'Paid': 'bg-green-100 text-green-800',
      'Overdue': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0  bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Consultation Details</h2>
            <p className="text-gray-500 text-sm">ID: {consultation.consultationId}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(consultation)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Edit consultation"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Patient Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Name: </span>
                  <span className="text-gray-800">{consultation.patientName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Phone: </span>
                  <span className="text-gray-800">{consultation.patientPhone || '-'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Age: </span>
                  <span className="text-gray-800">{consultation.patientAge || '-'} years</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Gender: </span>
                  <span className="text-gray-800">{consultation.patientGender || '-'}</span>
                </div>
              </div>
            </div>

            {/* Consultation Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Consultation Details
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Doctor: </span>
                  <span className="text-gray-800">{consultation.consultantDoctor}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Clinic: </span>
                  <span className="text-gray-800">{consultation.clinicName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Type: </span>
                  <span className="text-gray-800">{consultation.consultationType}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Specialty: </span>
                  <span className="text-gray-800">{consultation.treatmentSpecialty } </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Status: </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}>
                    {consultation.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Appointment Details
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Date: </span>
                  <span className="text-gray-800">{formatDate(consultation.appointmentDate)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Time: </span>
                  <span className="text-gray-800">{consultation.appointmentTime || '-'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Created: </span>
                  <span className="text-gray-800">{formatDate(consultation.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Payment Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Status: </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(consultation.payment?.status)}`}>
                    {consultation.payment?.status || 'Pending'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Total: </span>
                  <span className="text-gray-800">₹{consultation.payment?.total || 0}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Paid: </span>
                  <span className="text-gray-800">₹{consultation.payment?.paid || 0}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Remaining: </span>
                  <span className="text-gray-800">₹{(consultation.payment?.total || 0) - (consultation.payment?.paid || 0)}</span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(consultation.referralReason || consultation.additionalNotes) && (
              <div className="bg-gray-50 p-4 rounded-lg lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Additional Information</h3>
                <div className="space-y-3 text-sm">
                  {consultation.referralReason && (
                    <div>
                      <span className="font-medium text-gray-600 block mb-1">Referral Reason:</span>
                      <p className="text-gray-800 bg-white p-3 rounded border">{consultation.referralReason}</p>
                    </div>
                  )}
                  {consultation.additionalNotes && (
                    <div>
                      <span className="font-medium text-gray-600 block mb-1">Additional Notes:</span>
                      <p className="text-gray-800 bg-white p-3 rounded border">{consultation.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Custom Fields */}
            {consultation.customFields && consultation.customFields.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Custom Fields</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {consultation.customFields.map((field, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <span className="font-medium text-gray-600">{field.key}: </span>
                      <span className="text-gray-800">{field.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationViewModal;