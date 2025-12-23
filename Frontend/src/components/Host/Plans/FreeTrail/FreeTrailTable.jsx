import React, { useState, useEffect } from 'react';
import { Mail, Phone, Search, TrendingUp, Users, DollarSign, Calendar, Loader2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const ReferralAdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Sort By');
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [stats, setStats] = useState({
    totalAmount: '0',
    totalReferrals: 0,
    yearlyAmount: '0',
    monthlyAmount: '0'
  });
  const [referrals, setReferrals] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchReferralList();
    }
  }, [sortBy, searchTerm]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchStats(),
        fetchReferralList()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load referral data. Please try again.');
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/referrals/stats`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Stats response:', data);
      
      if (data.success) {
        setStats(data.stats);
      } else {
        console.error('Stats fetch unsuccessful:', data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      throw error;
    }
  };

  const fetchReferralList = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      if (sortBy !== 'Sort By') {
        queryParams.append('sortBy', sortBy);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin/referrals/list?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📋 Referrals response:', data);
      console.log('📊 Total referrers found:', data.referrals?.length || 0);
      
      if (data.success) {
        setReferrals(data.referrals || []);
      } else {
        console.error('Referrals fetch unsuccessful:', data.message);
        setReferrals([]);
      }
    } catch (error) {
      console.error('❌ Error fetching referrals:', error);
      setReferrals([]);
      throw error;
    }
  };

  const toggleRowExpansion = (doctorId) => {
    setExpandedRows(prev => ({
      ...prev,
      [doctorId]: !prev[doctorId]
    }));
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === '0') return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const statsArray = [
    {
      title: "Total Referral Amount",
      value: formatCurrency(stats.totalAmount),
      icon: DollarSign,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500"
    },
    {
      title: "Total Referrals",
      value: stats.totalReferrals,
      icon: Users,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500"
    },
    {
      title: "Yearly Plan Earnings",
      value: formatCurrency(stats.yearlyAmount),
      icon: TrendingUp,
      bgColor: "bg-green-50",
      iconColor: "text-green-500"
    },
    {
      title: "Monthly Plan Earnings",
      value: formatCurrency(stats.monthlyAmount),
      icon: Calendar,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-500"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white flex items-center gap-2`}>
          <AlertCircle className="w-5 h-5" />
          {notification.message}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">{error}</p>
            <button 
              onClick={fetchAllData}
              className="text-red-600 underline text-sm mt-1 hover:text-red-700"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gray-100 rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
              Referral Information
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
              Track earnings from doctor referrals based on subscription amounts
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap">
            Edit Terms & Conditions
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statsArray.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-3 sm:p-4 min-h-[88px] sm:h-24 flex items-center justify-between border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-1 leading-tight truncate">
                    {stat.title}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} rounded-lg flex items-center justify-center ml-2 sm:ml-3 flex-shrink-0`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Doctors with Referral Earnings
            {referrals.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({referrals.length} {referrals.length === 1 ? 'doctor' : 'doctors'})
              </span>
            )}
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Sort By</option>
              <option>Amount (High to Low)</option>
              <option>Amount (Low to High)</option>
              <option>Name (A-Z)</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600">Doctor ID</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600">Doctor Name</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600">Contact Information</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600">Total Referrals</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600">Total Earned</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Users className="w-12 h-12 mb-3 text-gray-400" />
                      <p className="text-lg font-medium">No referrals found</p>
                      <p className="text-sm mt-1">
                        {searchTerm ? 'Try adjusting your search terms' : 'Referral data will appear here once doctors start making referrals'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                referrals.map((referral) => (
                  <React.Fragment key={referral.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-mono">
                        {referral.doctorId.substring(0, 8)}...
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-medium">
                        {referral.doctorName}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{referral.email}</span>
                          </div>
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                            {referral.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {referral.totalReferrals} {referral.totalReferrals === 1 ? 'Referral' : 'Referrals'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="text-xs sm:text-sm font-semibold text-green-600">
                          {formatCurrency(referral.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Yearly: {formatCurrency(referral.yearlyEarnings)} | Monthly: {formatCurrency(referral.monthlyEarnings)}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <button
                          onClick={() => toggleRowExpansion(referral.id)}
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                        >
                          {expandedRows[referral.id] ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              <span className="text-xs">Hide</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              <span className="text-xs">View</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedRows[referral.id] && (
                      <tr>
                        <td colSpan="6" className="px-4 sm:px-6 py-4 bg-gray-50">
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-gray-700 mb-3">
                              Referral Details ({referral.referralDetails?.length || 0} referred doctors):
                            </h4>
                            {!referral.referralDetails || referral.referralDetails.length === 0 ? (
                              <p className="text-sm text-gray-500 text-center py-4">No referral details available</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {referral.referralDetails.map((detail, idx) => (
                                  <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                    <div className="text-sm font-medium text-gray-900">
                                      {detail.referredDoctorName || 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 truncate">
                                      {detail.referredDoctorEmail || 'N/A'}
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        detail.planType === 'Yearly Plan' 
                                          ? 'bg-green-100 text-green-800' 
                                          : detail.planType === 'Monthly Plan'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {detail.planType}
                                      </span>
                                      <span className="text-sm font-semibold text-green-600">
                                        {formatCurrency(detail.amount)}
                                      </span>
                                    </div>
                                    {detail.registeredAt && (
                                      <div className="text-xs text-gray-500 mt-2">
                                        Registered: {new Date(detail.registeredAt).toLocaleDateString('en-IN', {
                                          day: '2-digit',
                                          month: 'short',
                                          year: 'numeric'
                                        })}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReferralAdminDashboard;