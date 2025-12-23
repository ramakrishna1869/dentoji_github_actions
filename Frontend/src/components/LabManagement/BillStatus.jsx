//BillStatus
import React from "react";
import { Eye, Upload, FileText, AlertCircle } from "lucide-react";

const BillStatusComponent = ({ record, onUploadBill }) => {
  // Handle view bill
  const handleViewBill = (e) => {
    e.stopPropagation(); // Prevent row click
    e.preventDefault();
    
    if (record.billUploaded && record._id) {
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      // Open bill in new tab with auth token
      const billUrl = `${import.meta.env.VITE_BACKEND_URL}/api/lab-records/${record._id}/view-bill?token=${encodeURIComponent(token)}`;
      window.open(billUrl, '_blank');
    }
  };

  // Handle upload bill
  const handleUploadClick = (e) => {
    e.stopPropagation(); // Prevent row click
    e.preventDefault();
    
    if (onUploadBill) {
      onUploadBill(record);
    }
  };

  if (record.billUploaded) {
    return (
      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-1 text-green-600 text-xs">
          <FileText size={14} />
          <span>Uploaded</span>
        </div>
        <button
          onClick={handleViewBill}
          className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors cursor-pointer"
          title="View Bill"
        >
          <Eye size={14} />
        </button>
        <button
          onClick={handleUploadClick}
          className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors cursor-pointer"
          title="Replace Bill"
        >
          <Upload size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
      <div className="flex items-center gap-1 text-orange-600 text-xs">
        <AlertCircle size={14} />
        <span>Pending</span>
      </div>
      <button
        onClick={handleUploadClick}
        className="text-blue-500 hover:text-blue-700 p-1 rounded transition-colors cursor-pointer"
        title="Upload Bill"
      >
        <Upload size={14} />
      </button>
    </div>
  );
};

export default BillStatusComponent;
