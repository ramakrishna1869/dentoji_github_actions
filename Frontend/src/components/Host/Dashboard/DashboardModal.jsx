// src/components/Host/Dashboard/DashboardModal.jsx
import React from 'react';
import { X } from 'lucide-react';

const DashboardModal = ({ isOpen, onClose, doctorData }) => {
  if (!isOpen) return null;

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  // Helper function to format amount
  const formatAmount = (amount, currency = '') => {
    if (!amount || amount === 0) return 'Free';
    const formattedAmount = (amount / 100).toLocaleString('en-IN'); // Convert from paise to rupees
    return `${formattedAmount} ${currency}`;
  };

  // Get current active subscription
  const getCurrentSubscription = () => {
    if (!doctorData?.subscriptions || doctorData.subscriptions.length === 0) {
      return null;
    }
    
    // Find active subscription or get the most recent one
    const activeSubscription = doctorData.subscriptions.find(sub => sub.status === 'active');
    if (activeSubscription) return activeSubscription;
    
    // If no active subscription, get the most recent one
    return doctorData.subscriptions.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
  };

  const currentSubscription = getCurrentSubscription();

  // Determine subscription status
  const getSubscriptionStatus = () => {
    if (!currentSubscription) return 'Inactive';
    
    const now = new Date();
    const endDate = new Date(currentSubscription.endDate);
    const startDate = new Date(currentSubscription.startDate);
    
    if (currentSubscription.status === 'active' && startDate <= now && endDate > now) {
      return 'Active';
    }
    return 'Inactive';
  };

  const data = {
    id: doctorData?.id || '-',
    doctorName: doctorData?.doctorName || '-',
    clinicName: doctorData?.clinicName || '-',
    email: doctorData?.email || '-',
    phoneNumber: doctorData?.phone || '-',
    website: '-', // Not available in current schema
    clinicAddress: doctorData?.clinicLocation || '',
    education: doctorData?.qualification || '-',
    subscriptionPlan: currentSubscription?.planType || 'None',
    discount: '-', // Not available in current schema
    amountPaid: formatAmount(currentSubscription?.amount),
    startDate: formatDate(currentSubscription?.startDate),
    endDate: formatDate(currentSubscription?.endDate),
    subscriptionStatus: getSubscriptionStatus()
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Doctor / Clinic Details</h2>
            <p className="text-sm text-gray-500 mt-1">Complete information about the clinic and doctor</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 5 Rows Layout */}
        <div className="p-6">
          {/* Row 1: ID, Doctor's Name, Clinic Name */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID
              </label>
              <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                {data.id}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor's Name
              </label>
              <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                {data.doctorName}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clinic Name
              </label>
              <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                {data.clinicName}
              </div>
            </div>
          </div>

          {/* Row 2: Email Address, Phone Number, Website (Optional) */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                {data.email}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                {data.phoneNumber}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website (Optional)
              </label>
              <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                {data.website}
              </div>
            </div>
          </div>

          {/* Row 3: Clinic Address, Education Qualification */}
          <div className="grid grid-cols-2 gap-75 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clinic Address
              </label>
              <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[540px] h-[40px] flex items-center" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                {data.clinicAddress}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education Qualification
              </label>
              <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                {data.education}
              </div>
            </div>
          </div>

          {/* Row 4: Subscription Plan, Discount / Promo Code, Amount Paid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription Plan
              </label>
              <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                {data.subscriptionPlan}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount / Promo Code
              </label>
              <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                {data.discount}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Paid
              </label>
              <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                {data.amountPaid}
              </div>
            </div>
          </div>

          {/* Row 5: Start Date, End Date, Subscription Status */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                {data.startDate}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                {data.endDate}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription Status
              </label>
              <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  data.subscriptionStatus === 'Active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {data.subscriptionStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription History Section (Optional) */}
          {doctorData?.subscriptions && doctorData.subscriptions.length > 1 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Subscription History</h3>
              <div className="max-h-32 overflow-y-auto">
                <div className="space-y-2">
                  {doctorData.subscriptions
                    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                    .map((sub, index) => (
                      <div key={index} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <span className="font-medium">{sub.planType}</span> - 
                        {formatDate(sub.startDate)} to {formatDate(sub.endDate)} - 
                        <span className={`ml-1 ${sub.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                          {sub.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardModal;