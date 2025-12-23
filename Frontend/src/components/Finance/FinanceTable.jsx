import React, { useState, useEffect } from "react";
import { Upload, Eye, RefreshCw, AlertCircle, X, Search } from "lucide-react";

export default function FinanceTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientName, setSelectedPatientName] = useState('all');
  const [selectedPatientId, setSelectedPatientId] = useState('all');

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      
      const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      const response = await fetch(`${VITE_BACKEND_URL}/api/finance/patient-pending-amounts-combined`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error('Server returned an invalid response. Database may not be connected.');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch finance data');
      }
      
      setData(result.data || []);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return '-';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleViewClick = async (row) => {
    try {
      setLoadingDetails(true);
      const token = localStorage.getItem('token');
      const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

      const response = await fetch(`${VITE_BACKEND_URL}/api/finance/patient-details/${row.patientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an invalid response');
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch patient details');
      }
      
      setSelectedPatient(result.data);
      setIsModalOpen(true);
    } catch (error) {
      alert('Failed to load patient details: ' + error.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleExport = () => {
    const headers = ['Patient Name', 'Patient ID', 'Phone Number', 'Pending OP', 'Pending Treatment Encounter', 'Pending Lab', 'Pending Consultation', 'Total Pending'];
    const csvData = filteredData.map(row => [
      row.name,
      row.patientId,
      row.phone,
      row.pendingOP || 0,
      row.pendingTreatmentEncounter || 0,
      row.pendingLab || 0,
      row.pendingConsultation || 0,
      row.total
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-pending-amounts-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Filter data based on search and filters
  const filteredData = data.filter(row => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      row.name?.toLowerCase().includes(searchLower) ||
      row.patientId?.toLowerCase().includes(searchLower) ||
      row.phone?.includes(searchQuery);

    const matchesPatientName = selectedPatientName === 'all' || row.name === selectedPatientName;
    const matchesPatientId = selectedPatientId === 'all' || row.patientId === selectedPatientId;

    return matchesSearch && matchesPatientName && matchesPatientId;
  });

  // Get unique patient names and IDs for dropdowns
  const uniquePatientNames = ['all', ...new Set(data.map(row => row.name).filter(Boolean))];
  const uniquePatientIds = ['all', ...new Set(data.map(row => row.patientId).filter(Boolean))];

  return (
    <>
      {/* Filter Bar */}
      <div className="bg-white shadow rounded-lg p-4 mb-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by patient name, ID, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select 
            value={selectedPatientName}
            onChange={(e) => setSelectedPatientName(e.target.value)}
            className="px-4 py-2 w-full md:w-1/4 border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Patient Name</option>
            {uniquePatientNames.slice(1).map((name, idx) => (
              <option key={idx} value={name}>{name}</option>
            ))}
          </select>

          <select 
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="px-4 py-2 w-full md:w-1/4 border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Patient ID</option>
            {uniquePatientIds.slice(1).map((id, idx) => (
              <option key={idx} value={id}>{id}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Patient Pending Amount Overview</h2>
            {filteredData.length !== data.length && (
              <p className="text-xs text-gray-500 mt-1">
                Showing {filteredData.length} of {data.length} patients
              </p>
            )}
          </div>
          <button
            onClick={handleExport}
            disabled={filteredData.length === 0}
            className="border border-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Upload size={16} />
            Export
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start gap-3">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Error loading finance data</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Patient Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Patient ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Phone Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Pending OP Amt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Pending Treatment Amt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Pending Lab Amt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Pending Consultation Amt</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Total Pending</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={20} className="animate-spin" />
                      <span>Loading financial data...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-500">
                      <AlertCircle size={48} className="text-red-400" />
                      <span className="font-medium">Unable to load data</span>
                      <button
                        onClick={fetchFinanceData}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">🎉</span>
                      <span className="font-medium">No pending payments found</span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">🔍</span>
                      <span className="font-medium">No matching results found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.patientId}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{row.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatCurrency(row.pendingOP)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatCurrency(row.pendingTreatmentEncounter)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatCurrency(row.pendingLab)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatCurrency(row.pendingConsultation)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatCurrency(row.total)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleViewClick(row)}
                        disabled={loadingDetails}
                        className="p-2 hover:bg-gray-100 rounded-md transition inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        title="View Details"
                      >
                        {loadingDetails ? (
                          <RefreshCw className="w-4 h-4 text-gray-600 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700">Grand Total :</span>
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(filteredData.reduce((sum, row) => sum + row.total, 0))}
              </span>
            </div>
          </div>
        )}

      {isModalOpen && selectedPatient && (
        <PaymentDetailsModal
          patient={selectedPatient}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
    </>
  );
}

function PaymentDetailsModal({ patient, onClose }) {
  const [activeTab, setActiveTab] = useState('all');
  
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    if (amount === 0) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const allTransactions = [
    ...(patient.treatmentEncounters || []).map(encounter => ({
      type: 'Treatment',
      date: encounter.dateTime,
      description: encounter.treatment,
      doctor: encounter.dentist || '-',
      expectedCost: encounter.expectedCost || 0,
      amountPaid: encounter.amountPaid || 0,
      pendingAmount: encounter.pendingAmount || 0,
      status: encounter.status,
      id: encounter._id,
      paymentMode: encounter.paymentMode,
      notes: encounter.notes
    })),
    ...(patient.labRecords || []).map(record => ({
      type: 'Lab',
      date: record.dueDate,
      description: record.crownType,
      doctor: record.labName,
      expectedCost: record.total || 0,
      amountPaid: record.paid || 0,
      pendingAmount: record.pending || 0,
      status: record.status,
      id: record.id,
      tooth: record.tooth
    })),
    ...(patient.consultations || []).map(record => ({
      type: 'Consultation',
      date: record.appointmentDate,
      description: record.type,
      doctor: record.doctor,
      expectedCost: record.total || 0,
      amountPaid: record.paid || 0,
      pendingAmount: record.pending || 0,
      status: record.status,
      id: record.id
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (patient.summary?.totalOPPending > 0) {
    allTransactions.push({
      type: 'OP',
      date: patient.patient?.registrationDate || new Date(),
      description: 'OP Registration Fee',
      doctor: '-',
      expectedCost: (patient.summary.totalOPPending || 0) + (patient.opPaid || 0),
      amountPaid: patient.opPaid || 0,
      pendingAmount: patient.summary.totalOPPending || 0,
      status: patient.summary.totalOPPending > 0 ? 'Pending' : 'Paid',
      id: 'op-fee'
    });
  }

  const filteredTransactions = activeTab === 'all' 
    ? allTransactions 
    : allTransactions.filter(t => t.type.toLowerCase() === activeTab.toLowerCase());

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Payment Details - {patient.patient?.name || 'Patient'}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Summary Cards - Reordered: Total, OP, Treatment, Lab, Consultation */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-900 text-3xl font-bold text-left">
                {formatCurrency(patient.summary?.grandTotal || 0)}
              </p>
              <p className="text-gray-500 text-sm mt-1 text-left">Total Amount</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-green-600 text-3xl font-bold text-left">
                {formatCurrency(patient.summary?.totalOPPending || 0)}
              </p>
              <p className="text-gray-500 text-sm mt-1 text-left">OP Amount</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-orange-600 text-3xl font-bold text-left">
                {formatCurrency(patient.summary?.totalTreatmentPending || 0)}
              </p>
              <p className="text-gray-500 text-sm mt-1 text-left">Treatment Amount</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-blue-600 text-3xl font-bold text-left">
                {formatCurrency(patient.summary?.totalLabPending || 0)}
              </p>
              <p className="text-gray-500 text-sm mt-1 text-left">Lab Amount</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-red-600 text-3xl font-bold text-left">
                {formatCurrency(patient.summary?.totalConsultationPending || 0)}
              </p>
              <p className="text-gray-500 text-sm mt-1 text-left">Consultation Amount</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
                activeTab === 'all' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Transactions
              {activeTab === 'all' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('treatment')}
              className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
                activeTab === 'treatment' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Treatment
              {activeTab === 'treatment' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('lab')}
              className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
                activeTab === 'lab' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Lab
              {activeTab === 'lab' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('op')}
              className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
                activeTab === 'op' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              OP Fee
              {activeTab === 'op' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('consultation')}
              className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
                activeTab === 'consultation' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Consultation
              {activeTab === 'consultation' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>

          {/* Transactions Table */}
          {filteredTransactions.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Doctor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Actual Cost</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Paid</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Pending</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTransactions.map((transaction, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'Treatment'
                            ? 'bg-orange-100 text-orange-700'
                            : transaction.type === 'Lab' 
                            ? 'bg-blue-100 text-blue-700' 
                            : transaction.type === 'OP'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {transaction.description}
                        {transaction.tooth && <span className="text-gray-500 ml-1">• Tooth: {transaction.tooth}</span>}
                        {transaction.paymentMode && (
                          <span className="text-gray-500 ml-1">• {transaction.paymentMode}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {transaction.doctor}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatCurrency(transaction.expectedCost || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-green-600">
                        {formatCurrency(transaction.amountPaid || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-red-600">
                        {formatCurrency(transaction.pendingAmount || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'Paid' || transaction.status === 'Completed'
                            ? 'bg-green-100 text-green-700' 
                            : transaction.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-700'
                            : transaction.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-base">No transactions found</p>
              <p className="text-sm mt-1">This category has no records</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}