
//UpdatePaymentModal


import React, { useState } from "react";
import axios from "axios";

const UpdatePaymentModal = ({ data, onClose, onUpdate }) => {
  const [total, setTotal] = useState(data.payment?.total ?? data.total ?? 0);
  const [paid, setPaid] = useState(data.payment?.paid ?? data.paid ?? 0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpdatePayment = async () => {
    // Validate inputs
    const totalAmount = parseFloat(total);
    const paidAmount = parseFloat(paid);

    if (isNaN(totalAmount) || totalAmount < 0) {
      setError("Please enter a valid non-negative consultant fee.");
      return;
    }
    if (isNaN(paidAmount) || paidAmount < 0) {
      setError("Please enter a valid non-negative paid amount.");
      return;
    }
    if (paidAmount > totalAmount) {
      setError("Paid amount cannot exceed consultant fee.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      /*console.log('Sending payment update:', {
        total: totalAmount,
        paid: paidAmount,
        consultationId: data._id
      });*/

      // Send API request to update payment
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/consultations/${data._id}/payment`,
        {
          total: totalAmount,
          paid: paidAmount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      //console.log('Payment update response:', response.data);

      if (response.data.success) {
        // Create updated consultation data for parent component
        const updatedConsultation = {
          ...data,
          payment: {
            ...data.payment,
            total: totalAmount,
            paid: paidAmount,
            status: response.data.data.payment.status, // Use status from backend response
          },
          // Also update direct properties if they exist (for backward compatibility)
          total: totalAmount,
          paid: paidAmount,
        };

        //console.log('Calling onUpdate with:', updatedConsultation);

        // Call onUpdate to notify parent component with the updated data
        if (onUpdate) {
          onUpdate(updatedConsultation);
        }
        
        onClose(); // Close modal on success
      } else {
        setError(response.data.message || "Failed to update payment.");
      }
    } catch (err) {
     // console.error("Update payment error:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Failed to update payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Calculate pending amount dynamically
  const pendingAmount = Math.max(0, parseFloat(total || 0) - parseFloat(paid || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-[400px]">
        <div className="px-6 py-4 font-semibold text-gray-800 text-base flex justify-between items-center">
          <span>Update Payment - {data.patientName || data.patient || "-"}</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
            disabled={loading}
          >
            ×
          </button>
        </div>
        
        <div className="px-6 py-4 space-y-4 text-sm text-gray-700">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block mb-2 font-medium">Consultant Fee</label>
            <input
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              disabled={loading}
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter consultant fee"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Paid Amount</label>
            <input
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={paid}
              onChange={(e) => setPaid(e.target.value)}
              disabled={loading}
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter paid amount"
            />
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Pending Amount</label>
            <input
              className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100"
              value={`₹${pendingAmount.toFixed(2)}`}
              readOnly
            />
          </div>

          {/* Payment Status Preview */}
          <div>
            <label className="block mb-2 font-medium">Payment Status</label>
            <div className={`px-3 py-2 rounded text-sm font-medium ${
              pendingAmount === 0 && parseFloat(paid || 0) > 0
                ? 'bg-green-100 text-green-800'
                : parseFloat(paid || 0) > 0
                ? 'bg-orange-100 text-orange-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {pendingAmount === 0 && parseFloat(paid || 0) > 0
                ? 'Paid'
                : parseFloat(paid || 0) > 0
                ? 'pending'
                : 'Partial'}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdatePayment}
            className="px-4 py-2 rounded bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePaymentModal;