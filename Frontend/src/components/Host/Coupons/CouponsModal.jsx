// src/components/Host/Coupons/CouponsModal.jsx
import React from 'react';
import { X } from 'lucide-react';

const CouponsModal = ({ isOpen, onClose, couponData }) => {
  if (!isOpen || !couponData) return null;

  const handleDeactivate = () => {
    //console.log('Deactivate coupon:', couponData.id);
    // Add deactivate logic here
  };

  const handleEdit = () => {
    //console.log('Edit coupon:', couponData.id);
    // Add edit logic here
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      //console.log('Delete coupon:', couponData.id);
      // Add delete logic here
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full">
        {/* Header */}
        <div className="bg-white  px-8 py-6 flex items-start justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Coupon Details</h2>
            <p className="text-sm text-gray-500">View the coupon's current details and status.</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-6">
          {/* First Section - 2 rows */}
          <div className="space-y-5">
            {/* Row 1 */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code
                </label>
                <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-900">
                  {couponData.couponCode}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount (%)
                </label>
                <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-900">
                  {couponData.discount}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinic's Name
                </label>
                <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-900">
                  {couponData.applicableClinic}
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-900">
                  {couponData.startDate || '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-900">
                  {couponData.expiryDate}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="px-4 py-2.5 bg-gray-50 rounded-lg">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    couponData.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {couponData.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Second Section Heading */}
          <div className="mt-8">
            <h3 className="text-base font-semibold text-gray-900 mb-5">Doctor / Clinic Information</h3>
            
            {/* Row 3 */}
            <div className="grid grid-cols-3 gap-6 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Name
                </label>
                <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-900">
                  {couponData.doctorName}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinic Name
                </label>
                <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-900">
                  {couponData.clinicName || couponData.applicableClinic}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-900">
                  {couponData.email || '-'}
                </div>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-900">
                  {couponData.phoneNumber || '-'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usage Count
                </label>
                <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-900">
                  {couponData.usageCount || '0'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Usage Limit
                </label>
                <div className="px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-900">
                  {couponData.maxUsage || 'Unlimited'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="bg-white px-8 py-5 border-t border-gray-200 flex items-center justify-end space-x-3 rounded-b-2xl">
          <button
            onClick={handleDelete}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer"
          >
            Delete
          </button>
          <button
            onClick={handleEdit}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer"
          >
            Edit Coupon
          </button>
          <button
            onClick={handleDeactivate}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
          >
            Deactivate
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponsModal;