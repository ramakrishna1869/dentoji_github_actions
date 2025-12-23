// src/components/Host/Coupons/CouponsTable.jsx
import React, { useState } from 'react';
import { Eye, Trash2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CouponsModal from './CouponsModal';

const CouponsTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('Filter by Status');
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);


  const [couponsData] = useState([
    {
      id: 1,
      couponCode: "RWehw6",
      discount: "20%",
      applicableClinic: "Vision",
      doctorName: "Dr.Vanitha",
      expiryDate: "Jul 29,2025",
      status: "Active"
    },
    {
      id: 2,
      couponCode: "ER67yn",
      discount: "30%",
      applicableClinic: "Sam's eye",
      doctorName: "Dr.Samuel",
      expiryDate: "Jul 25,2025",
      status: "Active"
    },
    {
      id: 3,
      couponCode: "sjqRT6",
      discount: "10%",
      applicableClinic: "Saranya",
      doctorName: "Dr.Saranya",
      expiryDate: "Jul24,2025",
      status: "Inactive"
    },
    {
      id: 4,
      couponCode: "Agq5K",
      discount: "15%",
      applicableClinic: "Hi-Tech",
      doctorName: "Dr.Sivasi",
      expiryDate: "Jul24,2025",
      status: "Inactive"
    }
  ]);

  // Filter data based on search term and filter
  const filteredData = couponsData.filter(item => {
    const matchesSearch = !searchTerm || 
      item.couponCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.applicableClinic.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterBy === 'Filter by Status' || item.status === filterBy;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    if (status === 'Active') {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    return `${baseClasses} bg-red-100 text-red-800`;
  };

 const handleView = (coupon) => {
  setSelectedCoupon(coupon);
  setIsModalOpen(true);
};

const handleCloseModal = () => {
  setIsModalOpen(false);
  setSelectedCoupon(null);
};


  const handleDelete = (id) => {
    //console.log('Delete coupon:', id);
  };

  const handleAddNewCoupon = () => {
    navigate('/admin/add-new-coupon');
    //console.log('Add new coupon');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header with Search and Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Doctor/ Clinic Information</h2>
          
          <div className="flex items-center space-x-4">
            {/* Filter Dropdown */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white cursor-pointer"
            >
              <option value="Filter by Status">Filter by Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by code or name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              />
            </div>
            
            {/* Add New Coupon Button */}
            <button
              onClick={handleAddNewCoupon}
              className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium cursor-pointer"
            >
              + Add New Coupon
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Coupon Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discount (%)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applicable Clinic
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expiry Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.couponCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.discount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.applicableClinic}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.doctorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.expiryDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(row.status)}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                         onClick={() => handleView(row)}
                         className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded cursor-pointer"
                         title="View"
                         >
                           <Eye className="w-4 h-4" />
                        </button>
                        
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  {searchTerm ? `No results found for "${searchTerm}"` : 'No coupons available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

       {/* Coupons Modal */}
      <CouponsModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        couponData={selectedCoupon}
      />
    </div>
  );
};

export default CouponsTable;