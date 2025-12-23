// src/components/Host/FreeTrail/FreeTrailModal.jsx
import React from 'react';
import { X } from 'lucide-react';

const FreeTrailModal = ({ isOpen, onClose, doctorData, activeTab }) => {
  if (!isOpen) return null;

  // Default data for trials
  const defaultTrialData = {
    id: 'D001',
    doctorName: 'Dr.Venitha',
    currentPlan: 'Free Trial',
    email: 'arjundevaraj@gmail.com',
    phoneNumber: '+91 78954 12542',
    website: 'www.vision.com',
    clinicAddress: 'Madhapur, Hyderabad - 500121',
    education: 'MBBS',
    planType: 'Free Trial',
    patientsAdded: '97',
    paymentAmount: '2599 INR',
    trialStartDate: '12/07/2025',
    trialEndDate: '12/07/2025',
    subscriptionStatus: 'Active'
  };

  // Default data for subscriptions
  const defaultSubscriptionData = {
    id: 'D001',
    doctorName: 'Dr.Vanitha',
    currentPlan: 'Monthly',
    email: 'arjundevaraj@gmail.com',
    phoneNumber: '+91 78954 12542',
    website: 'www.vision.com',
    clinicAddress: 'Madhapur, Hyderabad - 500121',
    education: 'MBBS',
    subscriptionPlan: 'Monthly',
    discount: 'none',
    amountPaid: '2599 INR',
    startDate: '12/07/2025',
    endDate: '12/07/2025',
    subscriptionStatus: 'Active'
  };

  const data = doctorData || (activeTab === 'trials' ? defaultTrialData : defaultSubscriptionData);

  const renderTrialContent = () => (
    <div className="space-y-6">
      {/* Row 1: ID, Doctor's Name, Clinic Name */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ID</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.id}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Doctor's Name</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.doctorName}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            Vision
          </div>
        </div>
      </div>

      {/* Row 2: Email, Phone, Website */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.email}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.phoneNumber}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website (Optional)</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
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

      {/* Row 4: Plan Type, Patients Added, Payment Amount */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Plan Type</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.planType}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Patients Added</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.patientsAdded}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.paymentAmount}
          </div>
        </div>
      </div>

      {/* Row 5: Trial Start Date, Trial End Date, Subscription Status */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trial Start Date</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.trialStartDate}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trial End Date</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.trialEndDate}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Status</label>
          <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
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
    </div>
  );

  const renderSubscriptionContent = () => (
    <div className="space-y-6">
      {/* Row 1: ID, Doctor's Name, Clinic Name */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ID</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.id}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Doctor's Name</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.doctorName}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            Vision
          </div>
        </div>
      </div>

      {/* Row 2: Email, Phone, Website */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.email}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.phoneNumber}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website (Optional)</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.website}
          </div>
        </div>
      </div>

      {/* Row 3: Clinic Address, Education */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Address</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[540px] h-[40px] flex items-center">
            {data.clinicAddress}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Education Qualification</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.education}
          </div>
        </div>
      </div>

      {/* Row 4: Subscription Plan, Discount, Amount Paid */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Plan</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.subscriptionPlan}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Discount / Promo Code</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.discount}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.amountPaid}
          </div>
        </div>
      </div>

      {/* Row 5: Start Date, End Date, Subscription Status */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.startDate}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
          <div className="text-sm text-gray-900 bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
            {data.endDate}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subscription Status</label>
          <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 w-[251px] h-[40px] flex items-center">
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
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === 'trials' ? 'Subscription Details' : 'Subscription Details'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              View the clinic's {activeTab === 'trials' ? 'trial' : 'subscription'} plan, type, and status.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === 'trials' ? renderTrialContent() : renderSubscriptionContent()}
        </div>
      </div>
    </div>
  );
};

export default FreeTrailModal;