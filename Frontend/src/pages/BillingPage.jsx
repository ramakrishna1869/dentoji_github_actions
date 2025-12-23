//BillingPage
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Receipt, CreditCard, Calendar, CheckCircle, XCircle, Clock, AlertCircle, FileText, DollarSign } from 'lucide-react';
import { useNavigate } from "react-router-dom";
export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
const navigate = useNavigate();
  useEffect(() => {
    loadBillingData();
  }, []);

const loadBillingData = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
     // console.error('No token found');
      return;
    }

    //console.log('🔄 Loading billing data...');

    // Use the detailed subscription info endpoint instead
    const response = await fetch(`${API_BASE_URL}/api/payments/current-plan`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    //console.log('📡 Billing API response status:', response.status);

    if (response.ok) {
      const result = await response.json();
      //console.log('✅ Billing data received:', result);
      
      if (result.success && result.data) {
        // Transform the data to match our component structure
        const transformedData = {
          currentSubscription: result.data.subscriptionStatus,
          paymentHistory: result.data.latestPayment ? [result.data.latestPayment] : [],
          paymentSummary: {
            totalTransactions: 1,
            successfulPayments: result.data.latestPayment?.status === 'paid' ? 1 : 0,
            failedPayments: 0,
            totalSpent: result.data.latestPayment?.amount || 0
          },
          subscriptionHistory: []
        };
        
        setBillingData(transformedData);
      }
    } else {
      const errorText = await response.text();
     // console.error('❌ Failed to load billing data:', response.status, errorText);
    }
  } catch (error) {
  //  console.error('❌ Error loading billing data:', error);
  } finally {
    setLoading(false);
  }
};

const handleBack = () => {
  navigate("/profile?tab=Subscription"); // correct path
};
  const getStatusBadge = (status) => {
    const statusMap = {
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Paid' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Cancelled' },
      created: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Created' },
    };

    const statusInfo = statusMap[status?.toLowerCase()] || statusMap.pending;
    const Icon = statusInfo.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        <Icon className="w-3 h-3" />
        {statusInfo.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    const rupees = amount / 100;
    return `₹${rupees.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const downloadInvoice = (payment) => {
    const invoiceContent = `
DENTOJI - INVOICE
=====================================
Invoice ID: ${payment.receipt || payment.orderId}
Date: ${formatDate(payment.createdAt)}
Status: ${payment.status}

BILLING DETAILS
-------------------------------------
Plan: ${payment.planType}
Amount: ${formatCurrency(payment.amount)}
Payment Method: ${payment.paymentMethod || '-'}

Payment ID: ${payment.razorpayOrderId || '-'}
Order ID: ${payment.orderId}

Thank you for your business!
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${payment.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const filterPayments = (payments) => {
    if (!payments) return [];
    if (activeFilter === 'all') return payments;
    return payments.filter(p => p.status.toLowerCase() === activeFilter);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  const currentSub = billingData?.currentSubscription;
  const payments = billingData?.paymentHistory || [];
  const filteredPayments = filterPayments(payments);
return (
  <div className="p-3 sm:p-6 bg-gray-100 min-h-screen">
    {/* Header */}
    <div className="bg-white shadow-sm rounded-lg mb-4 sm:mb-6 p-4 sm:p-6">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <ArrowLeft
          size={18}
          className="text-gray-600 cursor-pointer hover:text-gray-800 transition-colors flex-shrink-0 sm:w-5 sm:h-5"
          onClick={handleBack}
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Billing & Payments</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">Manage your subscription and payment history</p>
        </div>
      </div>
    </div>

    {/* Current Subscription Summary */}
    {currentSub?.hasActiveSubscription && (
      <div className="bg-[#4264D0] rounded-lg shadow-sm mb-4 sm:mb-6 p-4 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0">
          <div className="w-full sm:w-auto">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <h2 className="text-base sm:text-lg font-semibold">Current Subscription</h2>
            </div>
            <p className="text-xl sm:text-2xl font-bold mb-1 break-words">{currentSub.subscription.planType}</p>
            <p className="text-sm sm:text-base text-blue-100 break-words">
              {currentSub.subscription.daysRemaining} days remaining • 
              Expires on {formatDate(currentSub.subscription.endDate)}
            </p>
          </div>
          <div className="text-left sm:text-right w-full sm:w-auto">
            <p className="text-xs sm:text-sm text-blue-100 mb-1">Amount Paid</p>
            <p className="text-xl sm:text-2xl font-bold">{formatCurrency(currentSub.subscription.amount)}</p>
          </div>
        </div>
      </div>
    )}

    {/* Payment Summary */}
    {billingData?.paymentSummary && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Total Transactions</p>
              <p className="text-base sm:text-xl font-bold text-gray-900">{billingData.paymentSummary.totalTransactions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Successful</p>
              <p className="text-base sm:text-xl font-bold text-gray-900">{billingData.paymentSummary.successfulPayments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Failed</p>
              <p className="text-base sm:text-xl font-bold text-gray-900">{billingData.paymentSummary.failedPayments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 truncate">Total Spent</p>
              <p className="text-base sm:text-xl font-bold text-gray-900 truncate">{formatCurrency(billingData.paymentSummary.totalSpent)}</p>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Payment History */}
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Payment History</h3>
        
        {/* Filter Buttons */}
        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 -mx-1 px-1">
          {['all', 'paid', 'completed', 'pending', 'failed'].map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer ${
                activeFilter === filter
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <Receipt className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
          <p className="text-sm sm:text-base text-gray-500">No payment records found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment, index) => (
            <div
              key={payment.id || index}
              className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 w-full min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{payment.planType}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">Order ID: {payment.orderId}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 ml-10 sm:ml-13">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{formatDate(payment.createdAt)}</span>
                    </span>
                    {payment.paymentMethod && (
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{payment.paymentMethod}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="text-left sm:text-right">
                    <p className="text-base sm:text-lg font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                    {getStatusBadge(payment.status)}
                  </div>
                  
                  {(payment.status === 'paid' || payment.status === 'completed') && (
                    <button
                      onClick={() => downloadInvoice(payment)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0 cursor-pointer"
                      title="Download Invoice"
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              </div>

              {payment.receipt && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 break-all">Receipt: {payment.receipt}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Subscription History */}
    {billingData?.subscriptionHistory && billingData.subscriptionHistory.length > 0 && (
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mt-4 sm:mt-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Subscription History</h3>
        <div className="space-y-3">
          {billingData.subscriptionHistory.map((sub, index) => (
            <div
              key={sub.id || index}
              className="border border-gray-200 rounded-lg p-3 sm:p-4"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                <div className="w-full sm:w-auto min-w-0 flex-1">
                  <h4 className="font-semibold text-sm sm:text-base text-gray-900 break-words">{sub.planType}</h4>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                    {formatDate(sub.startDate)} - {formatDate(sub.endDate)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Duration: {sub.duration} days
                  </p>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto flex items-center justify-between sm:block">
                  <p className="text-base sm:text-lg font-bold text-gray-900">{formatCurrency(sub.amount)}</p>
                  <div className="sm:mt-2">
                    {getStatusBadge(sub.status)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);
}