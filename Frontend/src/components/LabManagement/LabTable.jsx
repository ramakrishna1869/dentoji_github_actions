//LabTable
import React, { useState, useEffect } from "react";
import {
  Eye,
  UploadCloud,
  IndianRupee,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Trash2,
  FileText,
  AlertCircle,
  Download,
  X,
 Upload ,
} from "lucide-react";


export default function LabTable({
  records,
  onViewRecord,
  onUpdatePayment,
  onUploadBill,
  onEditRecord,
  onDeleteRecord,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const rowsPerPage = 5;
  const totalPages = Math.ceil((records?.length || 0) / rowsPerPage);

  // Ensure records is always an array
  const safeRecords = Array.isArray(records) ? records : [];

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (safeRecords.length === 0) {
      setCurrentPage(1);
    }
  }, [safeRecords, currentPage, totalPages]);

  const paginatedRecords = safeRecords.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Safe getter for payment status
  const getPaymentStatus = (record) => {
    return record?.payment?.status || "-";
  };

  // Safe getter for payment amounts
  const getPaymentAmounts = (record) => {
    const payment = record?.payment || {};
    return {
      paid: payment.paid || 0,
      total: payment.total || 0,
    };
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    const colors = {
      Pending: "bg-gray-100 text-gray-600",
      Received: "bg-blue-100 text-blue-600",
      "In Progress": "bg-yellow-100 text-yellow-600",
      Completed: "bg-green-100 text-green-600",
      Sent: "bg-purple-100 text-purple-600",
      Ready: "bg-teal-100 text-teal-600",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  // Get payment status badge color
  const getPaymentStatusColor = (status) => {
    const colors = {
      "Fully Paid": "bg-green-100 text-green-600",
      Partial: "bg-yellow-100 text-yellow-600",
      Pending: "bg-red-100 text-red-600",
      Overdue: "bg-red-200 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  // CSV Export Function
  const exportToCSV = () => {
    const dataToExport = safeRecords.map((record, index) => {
      const paymentAmounts = getPaymentAmounts(record);
      const paymentStatus = getPaymentStatus(record);
      
      return {
        "SNO": index + 1,
        "Patient Name": record.patientName || "Unknown",
        "Patient Phone": record.patientPhone || "-",
        "Lab Name": record.labName || "-",
        "Technician": record.technician || "-",
        "Crown Type": record.crownType || "-",
        "Material": record.material || "-",
        "Tooth": record.tooth || "-",
        "Trays Details": record.traysDetails || "-",
        "Lab Status": record.status || "-",
        "Payment Status": paymentStatus,
        "Amount Paid": paymentAmounts.paid,
        "Total Amount": paymentAmounts.total,
        "Bill Status": record.billUploaded ? "Uploaded" : "Pending",
        "Due Date": record.dueDate ? new Date(record.dueDate).toLocaleDateString() : "-",
      };
    });

    // Convert to CSV format
    const csvHeaders = Object.keys(dataToExport[0] || {}).join(',');
    const csvRows = dataToExport.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      ).join(',')
    );
    
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `lab_records_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bill Status Component
  const BillStatus = ({ record }) => {
    const [isViewingBill, setIsViewingBill] = useState(false);
    const [isDownloadingBill, setIsDownloadingBill] = useState(false);

    const handleViewBill = async (e) => {
      e.stopPropagation();
      if (record.billUploaded && record._id) {
        try {
          setIsViewingBill(true);
          setError(null);
          const token = localStorage.getItem("token");
          if (!token) {
            setError("Authentication required. Please login again.");
            return;
          }

          const billUrl = `${import.meta.env.VITE_BACKEND_URL}/api/lab-records/${record._id}/view-bill`;

          const response = await fetch(billUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const newWindow = window.open(blobUrl, '_blank');
            if (!newWindow) {
              setError("Failed to open bill. Please allow popups.");
              return;
            }
            setTimeout(() => {
              URL.revokeObjectURL(blobUrl);
            }, 60000);
          } else {
            const errorData = await response.json().catch(() => ({
              message: `HTTP Error ${response.status}: ${response.statusText}`,
            }));
            setError(errorData.message || "Failed to load bill. Please try again.");
          }
        } catch (error) {
        //  console.error("Error viewing bill:", error);
          setError(error.message || "Error viewing bill. Please try again.");
        } finally {
          setIsViewingBill(false);
        }
      }
    };

    const handleDownloadBill = async (e) => {
      e.stopPropagation();
      if (record.billUploaded && record._id) {
        try {
          setIsDownloadingBill(true);
          setError(null);
          const token = localStorage.getItem("token");
          if (!token) {
            setError("Authentication required. Please login again.");
            return;
          }

          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/lab-records/${record._id}/view-bill`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const contentType = response.headers.get("Content-Type");
            const mimeToExtension = {
              "application/pdf": "pdf",
              "image/png": "png",
              "image/jpeg": "jpg",
              "image/jpg": "jpg",
            };
            const extension = mimeToExtension[contentType] || "file";
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            const filename = `bill-${record.labRecordId || record._id}.${extension}`;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          } else {
            const errorData = await response.json().catch(() => ({
              message: `HTTP Error ${response.status}: ${response.statusText}`,
            }));
            setError(errorData.message || "Failed to download bill. Please try again.");
          }
        } catch (error) {
       //   console.error("Error downloading bill:", error);
          setError(error.message || "Error downloading bill. Please try again.");
          if (error.message.includes("Authentication")) {
            localStorage.removeItem("token");
          }
        } finally {
          setIsDownloadingBill(false);
        }
      }
    };

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {record.billUploaded ? (
          <>
            <div className="flex items-center gap-1 text-green-600 text-xs mb-1">
              <FileText size={12} />
              <span className="hidden sm:inline">Uploaded</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleViewBill}
                disabled={isViewingBill || isDownloadingBill}
                className={`p-1.5 sm:p-1 rounded hover:bg-blue-50 transition-colors ${
                  isViewingBill || isDownloadingBill ? "text-blue-300 cursor-not-allowed" : "text-blue-500 hover:text-blue-700"
                }`}
                title="View Bill"
              >
                <Eye size={14} className="sm:w-3 sm:h-3" />
              </button>
              <button
                onClick={handleDownloadBill}
                disabled={isViewingBill || isDownloadingBill}
                className={`p-1.5 sm:p-1 rounded hover:bg-green-50 transition-colors ${
                  isViewingBill || isDownloadingBill ? "text-green-300 cursor-not-allowed" : "text-green-500 hover:text-green-700"
                }`}
                title="Download Bill"
              >
                <Download size={14} className="sm:w-3 sm:h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUploadBill(record);
                }}
                disabled={isViewingBill || isDownloadingBill}
                className={`p-1.5 sm:p-1 rounded hover:bg-orange-50 transition-colors ${
                  isViewingBill || isDownloadingBill ? "text-orange-300 cursor-not-allowed" : "text-orange-500 hover:text-orange-700"
                }`}
                title="Replace Bill"
              >
                <UploadCloud size={14} className="sm:w-3 sm:h-3" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1 text-orange-600 text-xs">
              <AlertCircle size={12} />
              <span className="hidden sm:inline">Pending</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUploadBill(record);
              }}
              disabled={isViewingBill || isDownloadingBill}
              className={`p-1.5 sm:p-1 rounded hover:bg-blue-50 transition-colors ${
                isViewingBill || isDownloadingBill ? "text-blue-300 cursor-not-allowed" : "text-blue-500 hover:text-blue-700"
              }`}
              title="Upload Bill"
            >
              <UploadCloud size={14} className="sm:w-3 sm:h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Empty state
  if (safeRecords.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-3 sm:p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-2">
          Lab Records
        </h2>
        <div className="p-4 sm:p-6 text-center text-gray-500 text-xs">
          No lab records found matching your filters.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-3 sm:p-4">
<div className="flex justify-between items-center mb-4">
  <h2 className="text-base font-semibold">Lab Records</h2>
         <button
   className="border border-gray-300 text-gray-800 px-5 py-2 rounded-lg cursor-pointer text-sm flex items-center gap-2 mr-5 bg-white hover:bg-gray-50"
   onClick={exportToCSV}
 >
   <Upload size={16} />
   Export
 </button>
</div>
      {error && (
        <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg flex items-start sm:items-center gap-2">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" />
          <span className="text-xs sm:text-sm text-red-800 flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700 flex-shrink-0 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full text-left">
            <thead className="bg-white">
              <tr>
                {[
                  "SNO",
                  "Patient Name",
                  "Lab Name",
                  "Crown Type",
                  "Tooth",
                  "Trays",
                  "Lab Status",
                  "Payment",
                  "Bill Status",
                  "Due Date",
                  "Actions",
                ].map((header, idx) => (
                  <th
                    key={idx}
                    className="px-2 sm:px-3 py-2 text-left text-[10px] sm:text-xs font-semibold text-gray-500 whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {paginatedRecords.map((record, idx) => {
                const paymentAmounts = getPaymentAmounts(record);
                const paymentStatus = getPaymentStatus(record);

                return (
                  <tr
                    key={record._id || idx}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-gray-700 whitespace-nowrap">
                      {(currentPage - 1) * rowsPerPage + idx + 1}
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-gray-700 whitespace-nowrap">
                      <div>
                        <div className="font-medium">{record.patientName ?? "Unknown"}</div>
                        {record.patientPhone && (
                          <div className="text-[9px] sm:text-[10px] text-gray-400">{record.patientPhone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-gray-700 whitespace-nowrap">
                      <div>
                        <div className="font-medium">{record.labName ?? "-"}</div>
                        {record.technician && (
                          <div className="text-[9px] sm:text-[10px] text-gray-400">{record.technician}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-gray-700 whitespace-nowrap">
                      <div className="font-medium">{record.crownType ?? "-"}</div>
                      <div className="text-[9px] sm:text-[10px] text-gray-400">{record.material || "Material -"}</div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-gray-700 whitespace-nowrap">{record.tooth ?? "-"}</td>
                    
                    {/* Trays Details Column */}
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap">
                      {record.traysDetails ? (
                        <span
                          className={`text-[9px] sm:text-[10px] px-2 sm:px-3 py-1 rounded-full font-medium inline-flex justify-center min-w-[50px] ${
                            record.traysDetails === "Yes"
                              ? "bg-green-100 text-green-600"
                              : record.traysDetails === "No"
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {record.traysDetails}
                        </span>
                      ) : (
                        <span className="text-[9px] sm:text-[10px] text-gray-400">-</span>
                      )}
                    </td>

                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap">
                      <span
                        className={`text-[9px] sm:text-[10px] px-2 sm:px-3 py-1 rounded-full font-medium inline-flex justify-center min-w-[70px] sm:min-w-[80px] ${getStatusBadgeColor(
                          record.status
                        )}`}
                      >
                        {record.status ?? "-"}
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap">
                      <div
                        className={`text-[9px] sm:text-[10px] px-2 sm:px-4 py-1 rounded-full font-medium inline-flex justify-center mb-1 min-w-[70px] sm:min-w-[80px] ${getPaymentStatusColor(
                          paymentStatus
                        )}`}
                      >
                        {paymentStatus}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-gray-500 mt-1 ml-1">
                        ₹{paymentAmounts.paid?.toLocaleString("en-IN") ?? "0"} / ₹
                        {paymentAmounts.total?.toLocaleString("en-IN") ?? "0"}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <BillStatus record={record} />
                    </td>
                    <td className="px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-gray-700 whitespace-nowrap">
                      {record.dueDate ? new Date(record.dueDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-2 sm:px-3 py-2 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          onClick={() => onViewRecord(record)}
                          className="p-1.5 sm:p-1 rounded-sm text-gray-600 hover:text-gray-600 cursor-pointer transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => onEditRecord(record)}
                          className="p-1.5 sm:p-1 rounded-sm cursor-pointer transition-colors"
                          title="Edit Record"
                        >
                          <Edit className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-blue-600 hover:text-blue-800" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this record?")) {
                              onDeleteRecord(record._id);
                            }
                          }}
                          className="p-1.5 sm:p-1 rounded-sm cursor-pointer transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-red-600 hover:text-red-800" />
                        </button>
                        <button
                          onClick={() => onUpdatePayment(record)}
                          className="p-1.5 sm:p-1 rounded-sm cursor-pointer transition-colors"
                          title="Update Payment"
                        >
                          <IndianRupee className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-green-600 hover:text-green-800" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-3 sm:mt-4 gap-1 text-xs flex-wrap">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-1.5 sm:p-1 rounded ${
              currentPage === 1 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200 cursor-pointer"
            }`}
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              onClick={() => handlePageChange(idx + 1)}
              className={`px-2.5 py-1.5 sm:px-2 sm:py-1 rounded ${
                currentPage === idx + 1 ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200 cursor-pointer"
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-1.5 sm:p-1 rounded ${
              currentPage === totalPages ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-100 hover:bg-gray-200 cursor-pointer"
            }`}
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}