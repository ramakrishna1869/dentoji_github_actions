import React, { useRef, useState } from "react";
import { X, Download, CheckCircle } from "lucide-react";

export default function LabRecordDetailsModal({ isOpen, onClose, record }) {
  const contentRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !record) return null;

  const handleDownloadReceipt = () => {
    setIsDownloading(true);
    const { jsPDF } = window.jspdf;
    const html2pdf = window.html2pdf;

    const element = contentRef.current;
    if (!element) {
    //  console.error("Content element not found");
      setIsDownloading(false);
      return;
    }

    html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: `receipt-${record.id}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(element)
      .save()
      .then(() => {
        setIsDownloading(false);
      })
      .catch((error) => {
      //  console.error("Error generating PDF:", error);
        setIsDownloading(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4">
      <div
        ref={contentRef}
        className="bg-white rounded-sm shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="text-base font-semibold mb-2 text-gray-800">
          Lab Record Details – {record.id}
        </h2>
        <div className="border-b border-gray-200 mb-5" />

        {/* Patient Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
          {/* Patient Information */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex-1">
            <p className="text-xs font-semibold text-gray-500 mb-2">Patient Information</p>
            <p className="text-xs text-gray-700 mb-1">
              <span className="font-semibold">Name:</span> {record.patientName}
            </p>
            <p className="text-xs text-gray-700 mb-1">
              <span className="font-semibold">ID:</span> {record.id}
            </p>
            <p className="text-xs text-gray-700">
              <span className="font-semibold">Tooth:</span> {record.tooth}
            </p>
          </div>

          {/* Lab Information */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex-1">
            <p className="text-xs font-semibold text-gray-500 mb-2">Lab Information</p>
            <p className="text-xs text-gray-700 mb-1">
              <span className="font-semibold">Lab:</span> {record.labName}
            </p>
            <p className="text-xs text-gray-700 mb-1">
              <span className="font-semibold">Technician:</span> Saran
            </p>
            <p className="text-xs text-gray-700">
              <span className="font-semibold">Sent Date:</span> {record.dueDate}
            </p>
          </div>
        </div>

        {/* Crown Details */}
        <p className="text-xs font-semibold text-gray-500 mb-1">Crown Details</p>
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 mb-5">
          <p className="text-xs text-gray-700 mb-1">
            <span className="font-semibold">Type:</span> {record.crownType}
          </p>
          <p className="text-xs text-gray-700 mb-1">
            <span className="font-semibold">Material:</span> Zirconia
          </p>
          <p className="text-xs text-gray-700 mb-1">
            <span className="font-semibold">Tag:</span> Digital upper restoration
          </p>
        </div>

        {/* Status & Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Status Information */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Status Information</p>
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 h-full">
              <p className="text-xs text-gray-700 mb-2">
                <span className="font-semibold">Current Status:</span>{" "}
                <span
                  className={`inline-block ${
                    record.status === "Received"
                      ? "bg-blue-100 text-blue-600"
                      : record.status === "Inprogress" || record.status === "In Progress"
                      ? "bg-yellow-100 text-yellow-600"
                      : record.status === "Completed"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-600"
                  } px-2 py-0.5 rounded text-[10px]`}
                >
                  {record.status}
                </span>
              </p>
              <p className="text-xs text-gray-700 mb-2">
                <span className="font-semibold">Due Date:</span> {record.dueDate}
              </p>
              <p className="text-xs text-gray-700">
                <span className="font-semibold">Received:</span> 28/07/2025
              </p>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Payment Information</p>
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 h-full">
              <p className="text-xs text-gray-700 mb-2">
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={`inline-block ${
                    record.payment.status === "Fully Paid"
                      ? "bg-green-100 text-green-600"
                      : record.payment.status === "Partial"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                  } px-2 py-0.5 rounded text-[10px]`}
                >
                  {record.payment.status}
                </span>
              </p>
              <p className="text-xs text-gray-700 mb-2">
                <span className="font-semibold">Total Amount:</span> ₹{record.payment.total}
              </p>
              <p className="text-xs text-gray-700 mb-2">
                <span className="font-semibold">Received:</span> ₹{record.payment.paid}
              </p>
              <p className="text-xs text-gray-700">
                <span className="font-semibold">Bill Uploaded:</span> Yes
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <p className="text-xs font-semibold text-gray-500 mb-1">Notes</p>
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 mb-6">
          <p className="text-xs text-gray-700">
            Perfect fluorescent color match
          </p>
        </div>

        {/* Download Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleDownloadReceipt}
            disabled={isDownloading}
            className={`flex items-center gap-1 px-4 py-2 rounded-sm text-gray-700 text-xs font-semibold border border-gray-300 transition ${
              isDownloading ? "bg-gray-200 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200 cursor-pointer"
            }`}
          >
            {isDownloading ? (
              <div className="flex items-center gap-1">
                <span className="w-4 h-4 border-2 border-t-transparent border-gray-600 rounded-full animate-spin"></span>
                <CheckCircle className="w-4 h-4 text-green-500 opacity-0 animate-[tickAnimation_1s_ease-in-out_forwards]" />
                <span>Downloading...</span>
              </div>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Receipt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}