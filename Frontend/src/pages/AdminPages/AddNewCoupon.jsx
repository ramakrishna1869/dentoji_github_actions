// src/pages/AdminPages/AddNewCoupon.jsx
import React, { useState,useRef } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const AddNewCoupon = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    couponName: '',
    couponCode: '',
    discountType: '',
    discountValue: '',
    applicableFor: '',
    selectDoctorClinic: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
    termsConditions: '',
    attachments: '',
    offerDescription: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    navigate('/admin/coupons');
  };

  const handleEditSave = () => {
    //console.log('Edit & Save:', formData);
    // Handle edit and save logic
  };

  const handleSendNow = () => {
    //console.log('Send Now:', formData);
    // Handle send now logic
    navigate('/admin/coupons');
  };

  const handleGoBack = () => {
    navigate('/admin/coupons');
  };

  const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file) {
    setSelectedFile(file);
  }
};

const handleUploadClick = () => {
  fileInputRef.current?.click();
};

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white">
        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <button
            onClick={handleGoBack}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 cursor-pointer" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Add New Coupon</h1>
            <p className="text-sm text-gray-500">Create a new patient record with complete information</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <div className="max-w-full">
            {/* Row 1: Coupon Name, Coupon Code, Discount Type */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Name*
                </label>
                <input
                  type="text"
                  name="couponName"
                  value={formData.couponName}
                  onChange={handleInputChange}
                  placeholder="Enter Coupon Name"
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  style={{ width: '358px', height: '40px' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code*
                </label>
                <input
                  type="text"
                  name="couponCode"
                  value={formData.couponCode}
                  onChange={handleInputChange}
                  placeholder="Enter Coupon Code"
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  style={{ width: '358px', height: '40px' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type*
                </label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white cursor-pointer"
                  style={{ width: '358px', height: '40px' }}
                >
                  <option value="">Select Discount Type</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
            </div>

            {/* Row 2: Discount Value, Applicable For, Select Doctor/Clinic */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Value*
                </label>
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  placeholder="Enter Discount Value"
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  style={{ width: '358px', height: '40px' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 ">
                  Applicable For*
                </label>
                <select
                  name="applicableFor"
                  value={formData.applicableFor}
                  onChange={handleInputChange}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white cursor-pointer"
                  style={{ width: '358px', height: '40px' }}
                >
                  <option value="">Select Gender</option>
                  <option value="all">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Doctor/Clinic*
                </label>
                <select
                  name="selectDoctorClinic"
                  value={formData.selectDoctorClinic}
                  onChange={handleInputChange}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white cursor-pointer"
                  style={{ width: '358px', height: '40px' }}
                >
                  <option value="">Select Doctor/Clinic</option>
                  <option value="vision">Vision - Dr.Vanitha</option>
                  <option value="sams">Sam's eye - Dr.Samuel</option>
                  <option value="saranya">Saranya - Dr.Saranya</option>
                  <option value="hitech">Hi-Tech - Dr.Sivasi</option>
                </select>
              </div>
            </div>

            {/* Row 3: Usage Limit, Start Date, End Date */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usage Limit (Optional)
                </label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  placeholder="00"
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  style={{ width: '358px', height: '40px' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date*
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  style={{ width: '358px', height: '40px' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date*
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm "
                  style={{ width: '358px', height: '40px' }}
                />
              </div>
            </div>

            {/* Row 4: Terms & Conditions, Terms Document Upload, Attachments/Media */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usage Limit (Optional)
                </label>
                <input
                  type="text"
                  name="termsConditions"
                  value={formData.termsConditions}
                  onChange={handleInputChange}
                  placeholder="Read Terms & Conditions"
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  style={{ width: '358px', height: '40px' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Terms & Conditions Document Upload
                </label>
                <input
                  type="text"
                  name="attachments"
                  value={formData.attachments}
                  onChange={handleInputChange}
                  placeholder="Read Terms & Conditions"
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  style={{ width: '358px', height: '40px' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments or Media
                </label>
               <div 
  onClick={handleUploadClick}
  className="border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-400 transition-colors cursor-pointer flex items-center justify-center"
  style={{ width: '358px', height: '40px' }}
>
  <div className="flex items-center space-x-2 text-gray-500">
    <Upload className="w-4 h-4" />
    <span className="text-sm">
      {selectedFile ? selectedFile.name : 'Upload Media'}
    </span>
  </div>
</div>
<input
  ref={fileInputRef}
  type="file"
  onChange={handleFileSelect}
  accept="image/*,video/*,.pdf,.doc,.docx"
  className="hidden"
/>
              </div>
            </div>

            {/* Row 5: Offer Description - Full Width */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offer Description (Optional)
              </label>
              <textarea
                name="offerDescription"
                value={formData.offerDescription}
                onChange={handleInputChange}
                placeholder="Enter Offer Description"
                className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                style={{ width: '1270px', height: '194px' }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancel}
                className="px-6 py-2.5 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-6 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium cursor-pointer"
              >
                Edit & Save
              </button>
              <button
                onClick={handleSendNow}
                className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium cursor-pointer"
              >
                Send Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewCoupon;