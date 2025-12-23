import React, { useState, useEffect } from "react";
import { X, IndianRupee, AlertCircle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UpdatePaymentModal({ isOpen, onClose, record, onUpdate }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    totalAmount: "",
    paidAmount: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (record && isOpen) {
      setFormData({
        totalAmount: record.payment?.total?.toString() || "0",
        paidAmount: record.payment?.paid?.toString() || "0"
      });
      setError("");
      setSuccess("");
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
      setError("");
    }
  };

  const calculatePaymentStatus = (paid, total) => {
    if (paid >= total && total > 0) return "Fully Paid";
    if (paid > 0) return "Partial";
    return "Pending";
  };

  const handleUpdate = async () => {
    const paidAmount = parseFloat(formData.paidAmount);
    const totalAmount = parseFloat(formData.totalAmount);

    if (isNaN(paidAmount) || paidAmount < 0) {
      setError("Please enter a valid paid amount");
      return;
    }
    if (isNaN(totalAmount) || totalAmount <= 0) {
      setError("Total amount must be greater than 0");
      return;
    }
    if (paidAmount > totalAmount) {
      setError("Paid amount cannot exceed total amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/lab-records/${record._id}/payment`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ paidAmount, totalAmount })
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        if (onUpdate) onUpdate(data.labRecord);
        onClose();
        navigate("/labmanagement");
      } else {
        setError(data.message || "Failed to update payment");
      }
    } catch (err) {
     // console.error("Error updating payment:", err);
      setError(err.message || "Failed to update payment");
      if (err.message.includes("Authentication")) {
        localStorage.removeItem("token");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError("");
      setSuccess("");
      onClose();
    }
  };

  const currentTotal = parseFloat(formData.totalAmount) || 0;
  const currentPaid = parseFloat(formData.paidAmount) || 0;
  const remainingAmount = currentTotal - currentPaid;
  const paymentStatus = calculatePaymentStatus(currentPaid, currentTotal);

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={loading}
          className={`absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors ${
            loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          }`}
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <IndianRupee size={20} className="text-green-600" />
            Update Payment
          </h2>
          <p className="text-sm text-gray-600">
            {record.patientName} - {record.labRecordId || "Lab Record"}
          </p>
        </div>

        {/* Record Info */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <div className="font-medium text-blue-900">
            Lab: {record.labName || "-"}
          </div>
          <div className="text-blue-700">
            Crown: {record.crownType || "-"} - {record.tooth || "-"}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* Total Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount (₹) *
            </label>
            <div className="relative">
              <IndianRupee
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Enter total amount"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Paid Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paid Amount (₹) *
            </label>
            <div className="relative">
              <IndianRupee
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="number"
                name="paidAmount"
                value={formData.paidAmount}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Enter paid amount"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Payment Summary */}
          {currentTotal > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-medium">
                  ₹{currentTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Paid Amount:</span>
                <span className="font-medium text-green-600">
                  ₹{currentPaid.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining:</span>
                <span
                  className={`font-medium ${
                    remainingAmount > 0
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  ₹{Math.max(0, remainingAmount).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
                <span className="text-gray-600">Payment Status:</span>
                <span
                  className={`font-medium px-2 py-1 rounded-full text-xs ${
                    paymentStatus === "Fully Paid"
                      ? "bg-green-100 text-green-700"
                      : paymentStatus === "Partial"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={loading}
            className={`px-4 py-2 rounded-lg border border-gray-300 text-gray-700 transition-colors ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50 cursor-pointer"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading || !formData.paidAmount || !formData.totalAmount}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2 ${
              loading || !formData.paidAmount || !formData.totalAmount
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            }`}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            {loading ? "Updating..." : "Update Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
