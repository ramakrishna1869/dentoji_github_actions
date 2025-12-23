import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  DollarSign,
  Upload,
  RefreshCw
} from "lucide-react";
import pending from "../../assets/icons/pending.png";
import inprogress from "../../assets/icons/inprogress.png";
import completed from "../../assets/icons/completed.png";
import record from "../../assets/icons/record.png";

const LabStatCards = ({ 
  records = [],
  apiEndpoint = `${import.meta.env.VITE_BACKEND_URL}/api/lab-records-statistics`, // Changed endpoint
  refreshInterval = null 
}) => {
  const [backendStats, setBackendStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function for auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Fetch statistics from backend
  const fetchBackendStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Alternative approach: Use query parameter instead
      const statsUrl = `${import.meta.env.VITE_BACKEND_URL}/api/lab-records?action=statistics`;

      const response = await fetch(statsUrl, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setBackendStats(data.statistics);
      } else {
        throw new Error(data.message || 'Failed to fetch statistics');
      }
    } catch (err) {
     // console.error('Error fetching statistics:', err);
      setError(err.message);
      // If backend fails, we'll fall back to calculating from records
      setBackendStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Setup auto-refresh and initial fetch
  useEffect(() => {
    // Only try to fetch from backend if we have records to work with locally as fallback
    if (records && records.length > 0) {
      fetchBackendStats();
    }

    // Setup auto-refresh interval
    let intervalId;
    if (refreshInterval && refreshInterval > 0) {
      intervalId = setInterval(fetchBackendStats, refreshInterval * 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [apiEndpoint, refreshInterval, records.length]);

  // Calculate stats from records (fallback functionality)
  const calculateLocalStats = (records) => {
    const safeRecords = Array.isArray(records) ? records : [];

    const getPaymentStatus = (record) => record?.payment?.status || null;
    const getRecordStatus = (record) => record?.status || null;
    const getBillStatus = (record) => record?.billUploaded || false;

    const stats = {
      total: safeRecords.length,
      pending: safeRecords.filter(record => getRecordStatus(record) === 'Pending').length,
      sent: safeRecords.filter(record => getRecordStatus(record) === 'Sent').length,
      inProgress: safeRecords.filter(record => getRecordStatus(record) === 'In Progress').length,
      completed: safeRecords.filter(record => getRecordStatus(record) === 'Completed').length,
      received: safeRecords.filter(record => getRecordStatus(record) === 'Received').length,
      fullyPaid: safeRecords.filter(record => getPaymentStatus(record) === 'Fully Paid').length,
      partialPaid: safeRecords.filter(record => getPaymentStatus(record) === 'Partial').length,
      pendingPayment: safeRecords.filter(record => {
        const status = getPaymentStatus(record);
        return status === 'Pending' || status === 'Unpaid' || status === null;
      }).length,
      billsUploaded: safeRecords.filter(record => getBillStatus(record) === true).length,
      billsPending: safeRecords.filter(record => getBillStatus(record) === false).length,
    };

    const getPercentage = (value) => {
      if (stats.total === 0) return 0;
      return Math.round((value / stats.total) * 100);
    };

    return {
      overview: { total: stats.total },
      status: {
        pending: { count: stats.pending, percentage: getPercentage(stats.pending) },
        sent: { count: stats.sent, percentage: getPercentage(stats.sent) },
        inProgress: { count: stats.inProgress, percentage: getPercentage(stats.inProgress) },
        completed: { count: stats.completed, percentage: getPercentage(stats.completed) },
        received: { count: stats.received, percentage: getPercentage(stats.received) }
      },
      payment: {
        fullyPaid: { count: stats.fullyPaid, percentage: getPercentage(stats.fullyPaid) },
        partial: { count: stats.partialPaid, percentage: getPercentage(stats.partialPaid) },
        pending: { count: stats.pendingPayment, percentage: getPercentage(stats.pendingPayment) }
      },
      bills: {
        uploaded: { count: stats.billsUploaded, percentage: getPercentage(stats.billsUploaded) },
        pending: { count: stats.billsPending, percentage: getPercentage(stats.billsPending) }
      }
    };
  };

  // Get the current stats to display (backend first, then fallback to local)
  const getCurrentStats = () => {
    if (backendStats) {
      return backendStats;
    }
    // Fallback to calculating from records
    return calculateLocalStats(records);
  };

  const stats = getCurrentStats();

  // Loading state (only show if we have no data at all)
  if (loading && !backendStats && (!records || records.length === 0)) {
    return (
      <div className="w-full mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-gray-100 border border-gray-200 rounded-lg p-3 animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-gray-300 rounded-md w-8 h-8"></div>
                <div className="bg-gray-300 rounded w-8 h-4"></div>
              </div>
              <div className="bg-gray-300 rounded w-12 h-6 mb-1"></div>
              <div className="bg-gray-300 rounded w-20 h-3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No data state
  if (!stats || stats.overview.total === 0) {
    return (
      <div className="w-full mb-6">
        <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <FileText size={32} className="mx-auto mb-2 text-gray-300" />
          <h3 className="text-base font-medium text-gray-500 mb-1">No Lab Records</h3>
          <p className="text-xs text-gray-400">Create your first lab record to see statistics</p>
        </div>
      </div>
    );
  }

  // Prepare stat cards data
 const statCards = [
  {
    title: "Total Records",
    value: stats.overview.total,
    image:record, // Add your image path
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    title: "In Progress",
    value: stats.status.inProgress.count,
    percentage: stats.status.inProgress.percentage,
    image: inprogress, // Add your image path
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  },
  {
    title: "Completed",
    value: (stats.status.completed?.count || 0) + (stats.status.received?.count || 0),
    percentage: (stats.status.completed?.percentage || 0) + (stats.status.received?.percentage || 0),
    image: completed, // Add your image path
    color: "bg-green-500",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  {
    title: "Pending Payment",
    value: stats.payment.pending.count,
    percentage: stats.payment.pending.percentage,
    image: pending, // Add your image path
    color: "bg-red-500",
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
];
  return (
    <>
      <div className="space-y-4 mb-6">
        {/* Header with error indicator if needed */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Lab Statistics</h2>
          {/* {error && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle size={16} />
              <span>Using local data</span>
            </div>
          )} */}
        </div>

        {/* Main Statistics Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
  {statCards.map((stat, index) => (
    <div
      key={index}
      className="flex justify-between items-center bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md w-full h-27"
    >
      {/* Left side - Title and Value */}
      <div>
        <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
        <p className="text-2xl font-bold mt-2">{stat.value}</p>
        {stat.percentage !== undefined && (
          <span className={`text-xs font-medium ${stat.textColor} mt-1 inline-block`}>
            {Math.round(stat.percentage)}%
          </span>
        )}
      </div>
      
      {/* Right side - Image instead of Icon */}
      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
        <img 
          src={stat.image} 
          alt={stat.title}
          className="w-6 h-6 object-contain"
        />
      </div>
    </div>
  ))}
</div>
      </div>
    </>
  );
};

export default LabStatCards;