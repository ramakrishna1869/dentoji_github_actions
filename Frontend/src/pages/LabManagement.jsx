//LabManagement.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import LabHeader from "../components/LabManagement/Header";
import LabFilterBar from "../components/LabManagement/FilterBar";
import LabTable from "../components/LabManagement/LabTable";
import AddLabRecordModal from "../components/LabManagement/AddLabRecordModal";
import LabRecordDetailsModal from "../components/LabManagement/LabRecordDetailsModal";
import UpdatePaymentModal from "../components/LabManagement/UpdatePaymentModal";
import UploadBillModal from "../components/LabManagement/UploadBillModal";
import LabStatCards from "../components/LabManagement/LabStatCards";

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const LabRecordManagement = () => {
  const [allLabRecords, setAllLabRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUploadBillModalOpen, setIsUploadBillModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found. Please login again.");
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  }, []);

  const fetchLabRecords = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError("");
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/lab-records`,
        { headers: getAuthHeaders() }
      );
      
      const records = response.data || [];
      //console.log(`Fetched ${records.length} records from server`);
      
      setAllLabRecords(records);
      
    } catch (err) {
     // console.error("Error fetching lab records:", err);
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
        localStorage.removeItem("token");
      } else {
        setError(err.response?.data?.message || "Failed to fetch lab records.");
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchLabRecords(true);
  }, [fetchLabRecords, refreshTrigger]);

  const filteredRecords = useMemo(() => {
    return allLabRecords.filter((record) => {
      const searchLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch =
        debouncedSearchTerm === "" ||
        record?.patientName?.toLowerCase()?.includes(searchLower) ||
        record?.labName?.toLowerCase()?.includes(searchLower) ||
        record?.labRecordId?.toLowerCase()?.includes(searchLower) ||
        record?.patientPhone?.includes(debouncedSearchTerm) ||
        record?.crownType?.toLowerCase()?.includes(searchLower) ||
        record?.technician?.toLowerCase()?.includes(searchLower);

      const matchesStatus = statusFilter === "" || record?.status === statusFilter;
      const matchesPayment = paymentFilter === "" || record?.payment?.status === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [allLabRecords, debouncedSearchTerm, statusFilter, paymentFilter]);

  const handleAddRecord = useCallback((savedRecord) => {
    //console.log('Record saved, triggering refresh:', savedRecord);
    if (savedRecord && savedRecord._id) {
      setIsAddModalOpen(false);
      setError("");
      setRefreshTrigger(prev => prev + 1);
    }
  }, []);

  const handleEditUpdate = useCallback((updatedRecord) => {
    //console.log('Record updated, triggering refresh:', updatedRecord);
    if (updatedRecord && updatedRecord._id) {
      setIsEditModalOpen(false);
      setSelectedRecord(null);
      setError("");
      setRefreshTrigger(prev => prev + 1);
    }
  }, []);

  const handleDeleteRecord = useCallback(async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/lab-records/${recordId}`,
        { headers: getAuthHeaders() }
      );
      
      setRefreshTrigger(prev => prev + 1);
      
    } catch (err) {
     // console.error("Error deleting record:", err);
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
        localStorage.removeItem("token");
      } else {
        setError(err.response?.data?.message || "Failed to delete record.");
      }
    }
  }, [getAuthHeaders]);

  const handlePaymentUpdate = useCallback((updatedRecord) => {
    if (updatedRecord && updatedRecord._id) {
      setIsPaymentModalOpen(false);
      setSelectedRecord(null);
      setRefreshTrigger(prev => prev + 1);
    }
  }, []);

  const handleBillUpload = useCallback((updatedRecord) => {
    if (updatedRecord && updatedRecord._id) {
      setIsUploadBillModalOpen(false);
      setSelectedRecord(null);
      setRefreshTrigger(prev => prev + 1);
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("");
    setPaymentFilter("");
  }, []);

  const handleRefresh = useCallback(() => {
    //console.log('Manual refresh triggered');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleViewRecord = useCallback((record) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  }, []);

  const handleEditRecord = useCallback((record) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  }, []);

  const handleUpdatePayment = useCallback((record) => {
    setSelectedRecord(record);
    setIsPaymentModalOpen(true);
  }, []);

  const handleUploadBill = useCallback((record) => {
    setSelectedRecord(record);
    setIsUploadBillModalOpen(true);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-90 min-h-screen">
      <LabHeader 
        onAddClick={() => setIsAddModalOpen(true)} 
        onRefresh={handleRefresh} 
      />
      
      <LabStatCards records={filteredRecords} />
      
      <LabFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}
        onClearFilters={handleClearFilters}
        recordsCount={filteredRecords.length}
        totalRecords={allLabRecords.length}
      />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-500 hover:text-red-700 text-lg font-bold cursor-pointer">×</button>
        </div>
      )}
      
      <LabTable
        records={filteredRecords}
        onViewRecord={handleViewRecord}
        onUpdatePayment={handleUpdatePayment}
        onUploadBill={handleUploadBill}
        onEditRecord={handleEditRecord}
        onDeleteRecord={handleDeleteRecord}
      />
      
      <AddLabRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRecord={handleAddRecord}
        initialData={null}
        isEdit={false}
        recordId={null}
      />
      
      {selectedRecord && (
        <>
          <AddLabRecordModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedRecord(null);
            }}
            onAddRecord={handleEditUpdate}
            initialData={selectedRecord}
            isEdit={true}
            recordId={selectedRecord._id}
          />
          
          <LabRecordDetailsModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedRecord(null);
            }}
            record={selectedRecord}
          />
          
          <UpdatePaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedRecord(null);
            }}
            record={selectedRecord}
            onUpdate={handlePaymentUpdate}
          />
          
          <UploadBillModal
            isOpen={isUploadBillModalOpen}
            onClose={() => {
              setIsUploadBillModalOpen(false);
              setSelectedRecord(null);
            }}
            record={selectedRecord}
            onUpload={handleBillUpload}
          />
        </>
      )}
    </div>
  );
};

export default LabRecordManagement;