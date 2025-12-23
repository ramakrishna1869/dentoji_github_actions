import React, { useState, useEffect } from 'react';
import { ChevronDown, Eye, Trash2, Search, RefreshCw, AlertCircle } from 'lucide-react';
import DashboardModal from './DashboardModal';

const DashboardTable = ({ searchTerm, sortBy, onSearch, onSortChange }) => {
  // State management
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 50
  });
  
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [localSortBy, setLocalSortBy] = useState('startDate');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loadingDoctorDetails, setLoadingDoctorDetails] = useState(false);

  // Use props or local state
  const activeSearchTerm = searchTerm !== undefined ? searchTerm : localSearchTerm;
  const activeSortBy = sortBy !== undefined ? sortBy : localSortBy;

  // Fetch dashboard data
  const fetchDashboardData = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('host_auth_token');
      const userType = localStorage.getItem('current_user_type');
      
      if (!token || userType !== 'host') {
        setError('Authentication required. Please login as host.');
        setLoading(false);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy: activeSortBy,
        sortOrder: 'desc'
      });

      // Add search term if exists
      if (activeSearchTerm && activeSearchTerm.trim()) {
        params.append('search', activeSearchTerm.trim());
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/host/dashboard?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please login again.');
          setTimeout(() => {
            window.location.href = '/host/login';
          }, 2000);
        } else {
          throw new Error(result.message || 'Failed to fetch dashboard data');
        }
        return;
      }

      if (result.success) {
        setTableData(result.data || []);
        setPagination(result.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalRecords: 0,
          limit: 50
        });
        setCurrentPage(page);
      } else {
        throw new Error(result.message || 'Failed to load data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctor details for modal - FIXED VERSION
  const fetchDoctorDetails = async (doctorId) => {
    try {
      setLoadingDoctorDetails(true);
      
      const token = localStorage.getItem('host_auth_token');
      
      if (!token) {
        alert('Authentication required. Please login again.');
        return null;
      }

      console.log('Fetching doctor details for ID:', doctorId);
      
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/host/dashboard/doctor/${doctorId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();
      
      console.log('Doctor details response:', result);

      if (!response.ok) {
        if (response.status === 401) {
          alert('Session expired. Please login again.');
          window.location.href = '/host/login';
          return null;
        }
        throw new Error(result.message || `Failed to fetch doctor details (${response.status})`);
      }

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Invalid response from server');
      }
    } catch (err) {
      console.error('Error fetching doctor details:', err);
      alert('Failed to load doctor details: ' + err.message);
      return null;
    } finally {
      setLoadingDoctorDetails(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDashboardData(1);
  }, []);

  // Refetch when search or sort changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchDashboardData(1);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [activeSearchTerm, activeSortBy]);

  // Handle local search change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle local sort change
  const handleSortChange = (e) => {
    const value = e.target.value;
    setLocalSortBy(value);
    if (onSortChange) {
      onSortChange(value);
    }
  };

  // Handle view doctor
  const handleView = async (doctorData) => {
    console.log('Viewing doctor:', doctorData);
    const details = await fetchDoctorDetails(doctorData.id);
    if (details) {
      setSelectedDoctor(details);
      setIsModalOpen(true);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  // Handle delete doctor - FIXED VERSION
  const handleDelete = async (doctorId) => {
    if (!confirm('Are you sure you want to delete this doctor and all associated data? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('host_auth_token');
      
      if (!token) {
        alert('Authentication required. Please login again.');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/host/dashboard/doctor/${doctorId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          alert('Session expired. Please login again.');
          window.location.href = '/host/login';
          return;
        }
        throw new Error(result.message || 'Failed to delete doctor');
      }

      if (result.success) {
        alert('Doctor deleted successfully');
        fetchDashboardData(currentPage);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('Error deleting doctor:', err);
      alert('Failed to delete doctor: ' + err.message);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchDashboardData(newPage);
    }
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    if (status === 'Active') {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    return `${baseClasses} bg-red-100 text-red-800`;
  };

  // Loading state
  if (loading && tableData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Doctor/ Clinic Information</h2>
            {pagination.totalRecords > 0 && (
              <span className="text-sm text-gray-500">
                ({pagination.totalRecords} total)
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={activeSortBy}
                onChange={handleSortChange}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                <option value="startDate">START DATE (Latest)</option>
                <option value="doctorName">Doctor Name (A-Z)</option>
                <option value="clinicName">Clinic Name (A-Z)</option>
                <option value="status">Status</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
            
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Doctor/Clinic name"
                value={activeSearchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-4 py-2.5 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
              />
            </div>

            {/* Refresh button */}
            <button
              onClick={() => fetchDashboardData(currentPage)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                S.No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor's Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clinic Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                START DATE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.length > 0 ? (
              tableData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.sno}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.doctorName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.clinicName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(row.status)}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.lastAccess || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(row)}
                        disabled={loadingDoctorDetails}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title="View Details"
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
                  {activeSearchTerm 
                    ? `No results found for "${activeSearchTerm}"` 
                    : 'No doctors/clinics found in the system'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of{' '}
            {pagination.totalRecords} results
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {[...Array(pagination.totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                if (
                  pageNum === 1 ||
                  pageNum === pagination.totalPages ||
                  (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm cursor-pointer ${
                        pageNum === pagination.currentPage
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === pagination.currentPage - 2 ||
                  pageNum === pagination.currentPage + 2
                ) {
                  return <span key={pageNum} className="px-2">...</span>;
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Modal */}
      <DashboardModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        doctorData={selectedDoctor}
      />
    </div>
  );
};

export default DashboardTable;