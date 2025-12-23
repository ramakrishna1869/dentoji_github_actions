// UPDATED VERSION - Fixed referral amount display

import React, { useState, useEffect } from 'react';
import { Copy, Filter, Calendar, Users, UserCheck, Clock, TrendingUp, X, Loader2 } from 'lucide-react';

const DentalReferralScreen = () => {
  // State Management
  const [stats, setStats] = useState({
    totalSent: 0,
    registered: 0,
    pending: 0,
    successRate: '0%'
  });
  const [referralInfo, setReferralInfo] = useState({
    referralCode: '',
    referralLink: '',
    totalEarnings: 0
  });
  const [referralData, setReferralData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All Status',
    startDate: '',
    endDate: ''
  });
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // API Base URL
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  
  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchReferralList();
  }, [filters]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchReferralStats(),
        fetchReferralInfo(),
        fetchReferralList()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/referral/stats`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Stats response:', data);
      if (data.success) {
        setStats(data.stats);
      } else {
        console.error('Stats fetch failed:', data.message);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchReferralInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/referral/info`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Referral info response:', data);
      if (data.success) {
        setReferralInfo({
          referralCode: data.referralCode,
          referralLink: data.referralLink,
          totalEarnings: data.totalEarnings || 0
        });
        console.log('✅ Referral Link Generated:', data.referralLink);
      } else {
        console.error('Referral info fetch failed:', data.message);
      }
    } catch (error) {
      console.error('Error fetching referral info:', error);
    }
  };

  const fetchReferralList = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status !== 'All Status') {
        queryParams.append('status', filters.status);
      }
      if (filters.startDate) {
        queryParams.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        queryParams.append('endDate', filters.endDate);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/referral/list?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const data = await response.json();
      console.log('Referral list response:', data);
      if (data.success) {
        setReferralData(data.referrals);
      } else {
        console.error('Referral list fetch failed:', data.message);
      }
    } catch (error) {
      console.error('Error fetching referral list:', error);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteForm.email) {
      showNotification('Email is required', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/referral/invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inviteForm)
      });

      const data = await response.json();
      console.log('Invite response:', data);

      if (data.success) {
        showNotification('Invitation sent successfully!', 'success');
        setShowInviteModal(false);
        setInviteForm({ name: '', email: '', phone: '' });
        // Refresh data
        fetchAllData();
      } else {
        showNotification(data.message || 'Failed to send invitation', 'error');
      }
    } catch (error) {
      showNotification('Error sending invitation', 'error');
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard!', 'success');
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-blue-100 text-blue-800';
      case 'Registered': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to format amount from paise to rupees
  const formatAmount = (amountInPaise) => {
    if (!amountInPaise || amountInPaise === 0) return '-';
    return `₹${(amountInPaise / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Invite Doctor</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Name
                </label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter doctor's name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="doctor@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={inviteForm.phone}
                  onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvite}
                  disabled={submitting}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Invite'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Referrals Details</h1>
            <p className="text-gray-600">Refer other doctors to DentalX and earn rewards for every successful registration</p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            + Invite Doctor
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Total Sent</h3>
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalSent}</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Registered</h3>
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.registered}</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Pending</h3>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-gray-600">Success Rate</h3>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.successRate}</div>
          </div>
        </div>

        {/* Referral Tools Section */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              Referral Tools
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Your referral code</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={referralInfo.referralCode} 
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 font-mono"
                  />
                  <button 
                    onClick={() => copyToClipboard(referralInfo.referralCode)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">Your referral Link</label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={referralInfo.referralLink} 
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 text-sm"
                  />
                  <button 
                    onClick={() => copyToClipboard(referralInfo.referralLink)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">Total Earnings</div>
                <div className="text-2xl font-bold text-green-600">
                  ₹{(referralInfo.totalEarnings / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Referral Awards</h3>
            <ul className="space-y-3 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                ₹500 for Yearly Plan subscription
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                ₹200 for Monthly Plan subscription
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                No rewards for Free Trial
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Instant credit on successful registration
              </li>
            </ul>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-4 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option>All Status</option>
              <option>Pending</option>
              <option>Registered</option>
              <option>Accepted</option>
            </select>
            <input 
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Start Date"
            />
            <input 
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="End Date"
            />
            <button
              onClick={() => setFilters({ status: 'All Status', startDate: '', endDate: '' })}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Referral Information Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Referral Information</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Referral Code</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Doctor Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Contact Information</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Plan</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Date Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {referralData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No referrals found. Start inviting doctors!
                    </td>
                  </tr>
                ) : (
                  referralData.map((referral) => (
                    <tr key={referral.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 font-mono">
                        {referral.referralId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {referral.doctorName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>
                          <div>{referral.email}</div>
                          <div className="text-gray-500">{referral.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {referral.planType || referral.specialty || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                          {referral.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">
                        {formatAmount(referral.referralAmount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(referral.dateSent || referral.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DentalReferralScreen;