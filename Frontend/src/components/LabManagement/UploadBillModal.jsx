import React, { useRef, useState } from "react";
import { X, UploadCloud, Eye, CheckCircle, AlertCircle } from "lucide-react";

export default function UploadBillModal({ isOpen, onClose, record, onUpload }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isViewingBill, setIsViewingBill] = useState(false);

  // Return null if modal is not open or record is invalid
  if (!isOpen || !record || !record._id || !record.patientName) {
    return null;
  }

  // Handle file selection via input
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10 MB = 10 * 1024 * 1024 bytes)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10 MB limit.");
        setSelectedFile(null);
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError("Only PNG, JPG, JPEG, and PDF files are allowed.");
        setSelectedFile(null);
        return;
      }

      setError(null);
      setSelectedFile(file);
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 1) {
      setError("Please drop only one file.");
      setSelectedFile(null);
      return;
    }

    const file = files[0];
    if (file) {
      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10 MB limit.");
        setSelectedFile(null);
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError("Only PNG, JPG, JPEG, and PDF files are allowed.");
        setSelectedFile(null);
        return;
      }

      setError(null);
      setSelectedFile(file);
    }
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle file upload with proper authentication
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('bill', selectedFile);

      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      // Make API call to upload bill with proper headers
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/lab-records/${record._id}/upload-bill`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP Error ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || `Failed to upload bill (${response.status})`);
      }

      const data = await response.json();

      // Call the parent component's upload handler with the updated record
      if (onUpload) {
        onUpload(data.labRecord);
      }

      // Reset state
      setSelectedFile(null);
      setError(null);

      // Close modal
      onClose();
    } catch (err) {
     // console.error('Upload error:', err);
      setError(err.message || 'Failed to upload bill. Please try again.');
      if (err.message.includes('Authentication')) {
        localStorage.removeItem('token');
      }
    } finally {
      setUploading(false);
    }
  };

  // View existing bill
  const handleViewBill = async () => {
    if (record.billUploaded && record._id) {
      try {
        setIsViewingBill(true);
        setError(null);

        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found. Please login again.');
        }

        const billUrl = `${import.meta.env.VITE_BACKEND_URL}/api/lab-records/${record._id}/view-bill`;
        const response = await fetch(billUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP Error ${response.status}: ${response.statusText}`,
          }));
          throw new Error(errorData.message || 'Failed to load bill');
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const newWindow = window.open(blobUrl, '_blank');

        if (!newWindow) {
          throw new Error('Failed to open new window. Please allow popups.');
        }

        // Clean up blob URL after 1 minute
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 60000);
      } catch (error) {
       // console.error('Error viewing bill:', error);
        setError(error.message || 'Failed to view bill. Please try again.');
      } finally {
        setIsViewingBill(false);
      }
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Reset modal state when closing
  const handleClose = () => {
    if (!uploading && !isViewingBill) {
      setSelectedFile(null);
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        {/* Close button */}
        <button
          className={`absolute top-3 right-3 text-gray-400 hover:text-gray-600 ${
            uploading || isViewingBill ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
          onClick={handleClose}
          disabled={uploading || isViewingBill}
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h3 className="text-base font-semibold mb-4">
          Upload Bill - <span className="text-gray-700">{record.patientName}</span>
        </h3>

        {/* Record Info */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <div className="font-medium text-blue-900">Record: {record.labRecordId || '-'}</div>
          <div className="text-blue-700">Lab: {record.labName || '-'}</div>
          <div className="text-blue-700">Crown: {record.crownType || '-'}</div>
        </div>

        {/* Current Bill Status */}
        {record.billUploaded && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm text-green-800">Bill already uploaded</span>
              </div>
              <button
                onClick={handleViewBill}
                disabled={uploading || isViewingBill}
                className={`flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm ${
                  uploading || isViewingBill ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Eye size={14} />
                {isViewingBill ? 'Loading...' : 'View'}
              </button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Label */}
        <label className="text-sm font-medium mb-1 block">
          {record.billUploaded ? 'Replace Lab Bill' : 'Upload Lab Bill'}
        </label>

        {/* Upload Area */}
        <div
          className={`mt-1 border-2 border-dashed rounded-lg px-4 py-8 flex flex-col items-center justify-center cursor-pointer transition ${
            uploading || isViewingBill
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : selectedFile
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => !(uploading || isViewingBill) && fileInputRef.current?.click()}
          onDrop={!(uploading || isViewingBill) ? handleDrop : undefined}
          onDragOver={!(uploading || isViewingBill) ? handleDragOver : undefined}
        >
          <UploadCloud
            className={`w-10 h-16 mb-2 ${
              uploading || isViewingBill
                ? 'text-gray-300'
                : selectedFile
                ? 'text-green-500'
                : 'text-gray-400'
            }`}
          />

          {uploading ? (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Uploading...</p>
              <div className="w-32 h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-blue-500 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          ) : selectedFile ? (
            <div className="text-center">
              <p className="text-sm text-green-700 font-medium">{selectedFile.name}</p>
              <p className="text-xs text-green-600">{formatFileSize(selectedFile.size)}</p>
              <p className="text-xs text-gray-500 mt-1">Click to change file</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Drag and drop your bill here, or click to browse
                <br />
                <span className="text-gray-400">PNG, JPG, PDF up to 10 MB</span>
              </p>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.pdf"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={uploading || isViewingBill}
        />

        {/* Footer buttons */}
        <div className="mt-6 flex justify-end space-x-3 text-sm">
          <button
            onClick={handleClose}
            disabled={uploading || isViewingBill}
            className={`px-4 py-1.5 rounded-md transition ${
              uploading || isViewingBill
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 hover:bg-gray-200 cursor-pointer'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading || isViewingBill}
            className={`px-4 py-1.5 rounded-md text-white transition ${
              selectedFile && !uploading && !isViewingBill
                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                : 'bg-blue-300 cursor-not-allowed'
            }`}
          >
            {uploading ? 'Uploading...' : record.billUploaded ? 'Replace Bill' : 'Upload Bill'}
          </button>
        </div>
      </div>
    </div>
  );
}
