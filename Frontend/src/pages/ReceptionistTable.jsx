//Receptionist Table.jsx
import React, { useState, useEffect } from "react";
import { Trash2, Upload } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import * as XLSX from "../../node_modules/xlsx";
 
import { saveAs } from "file-saver";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
 
const ReceptionistTable = () => {
  const navigate = useNavigate();
  const [receptionists, setReceptionists] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReceptionist, setSelectedReceptionist] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isExportConfirmOpen, setIsExportConfirmOpen] = useState(false);
  const [receptionistToDelete, setReceptionistToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hospitalName, setHospitalName] = useState("");
  const [userRole, setUserRole] = useState(null);
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in.");
          setLoading(false);
          return;
        }
 
        const decoded = jwtDecode(token);
        // Normalize role to match expected format (capitalize first letter)
        const role = decoded.role ?
          decoded.role.charAt(0).toUpperCase() + decoded.role.slice(1).toLowerCase() :
          'Unknown';
        setUserRole(role);
 
        //console.log("User role:", role);
        //console.log("User ID:", decoded.id);
        //console.log("Hospital ID from token:", decoded.hospitalId);
 
        // Check if user has permission to access this page
        if (role !== 'Admin') {
          setError("Access denied. Only Admin users can view receptionist records.");
          setLoading(false);
          return;
        }
 
        // Fetch receptionists - backend handles filtering
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/receptionists/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
 
        const fetchedReceptionists = response.data || [];
        setReceptionists(fetchedReceptionists);
 
        // Set hospital name from the first receptionist (if available)
        if (fetchedReceptionists.length > 0 && fetchedReceptionists[0].hospital) {
          setHospitalName(fetchedReceptionists[0].hospital.name);
        } else {
          // Fallback: try to get hospital name from profile
          try {
            const profileResponse = await axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            setHospitalName(profileResponse.data.hospital?.name || "Unknown Hospital");
          } catch (profileError) {
           // console.error("Error fetching profile:", profileError);
            setHospitalName("Unknown Hospital");
          }
        }
 
        //console.log("Fetched receptionists:", fetchedReceptionists.length);
      } catch (err) {
       // console.error("Error fetching receptionists:", err);
        setError(
          err.response?.data?.message || "Failed to fetch receptionist records."
        );
      } finally {
        setLoading(false);
      }
    };
 
    fetchData();
  }, []);
 
  const handleRowClick = (receptionist) => {
    // Only allow navigation if user is admin
    if (userRole === 'Admin') {
      navigate("/receptionistdata", { state: { receptionist } });
    }
  };
 
  const openEditModal = (receptionist) => {
    // Only allow editing if user is admin
    if (userRole !== 'Admin') {
      alert("Access denied. Only Admin users can edit receptionist records.");
      return;
    }
    setSelectedReceptionist(receptionist);
    setIsEditModalOpen(true);
  };
 
  const closeEditModal = () => {
    setSelectedReceptionist(null);
    setIsEditModalOpen(false);
  };
 
  const handleUpdateReceptionist = (updatedReceptionist) => {
    setReceptionists((prev) =>
      prev.map((r) => (r._id === updatedReceptionist._id ? updatedReceptionist : r))
    );
    closeEditModal();
  };
 
  const openDeleteConfirm = (receptionist) => {
    // Only allow deletion if user is admin
    if (userRole !== 'Admin') {
      alert("Access denied. Only Admin users can delete receptionist records.");
      return;
    }
    setReceptionistToDelete(receptionist);
    setIsDeleteConfirmOpen(true);
  };
 
  const closeDeleteConfirm = () => {
    setReceptionistToDelete(null);
    setIsDeleteConfirmOpen(false);
  };
 
  const confirmDelete = async () => {
    if (!receptionistToDelete) return;
 
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/receptionists/${receptionistToDelete._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReceptionists((prev) => prev.filter((r) => r._id !== receptionistToDelete._id));
    } catch (err) {
     // console.error("Error deleting receptionist:", err);
      setError(
        err.response?.data?.message || "Failed to delete receptionist record."
      );
    } finally {
      closeDeleteConfirm();
    }
  };
 
  const openExportConfirm = () => {
    // Only allow export if user is admin
    if (userRole !== 'Admin') {
      alert("Access denied. Only Admin users can export receptionist data.");
      return;
    }
    setIsExportConfirmOpen(true);
  };
 
  const closeExportConfirm = () => {
    setIsExportConfirmOpen(false);
  };
 
  const confirmExport = () => {
    const dataToExport = receptionists.map((r) => ({
      "Receptionist ID": r._id,
      Name: r.name,
      Email: r.email,
      Hospital: r.hospital?.name || hospitalName,
      Role: r.role,
      "Created Date": r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"
    }));
 
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Receptionists");
 
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${hospitalName}_Receptionists.xlsx`);
 
    closeExportConfirm();
  };
 
  const rowsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(receptionists.length / rowsPerPage);
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const startIdx = (currentPage - 1) * rowsPerPage;
  const currentReceptionists = receptionists.slice(startIdx, startIdx + rowsPerPage);
 
  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
 
  // If user is not admin, show access denied message
  if (userRole && userRole !== 'Admin') {
    return (
      <div className="bg-white rounded-2xl shadow p-6 mt-6 w-full max-w-[99.5%]">
        <div className="text-center py-8">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-4">
              This page is only accessible to Admin users.
            </p>
            <p className="text-sm text-gray-500">
              Current role: <span className="font-medium text-blue-600">{userRole}</span>
            </p>
          </div>
          <button
            onClick={() => navigate('/patients')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
          >
            Go to Patient Management
          </button>
        </div>
      </div>
    );
  }
 
  return (
    <div className="bg-white rounded-2xl shadow p-6 mt-6 w-full max-w-[99.5%]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-base font-semibold">
            Receptionist List - {hospitalName}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {receptionists.length} receptionist{receptionists.length !== 1 ? 's' : ''} found
            {userRole && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {userRole} Access
              </span>
            )}
          </p>
        </div>
     
      </div>
 
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="border-b border-gray-200 text-gray-600 bg-gray-50">
            <tr>
              <th className="p-3 font-medium">Receptionist ID</th>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Hospital</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentReceptionists.map((r) => (
              <tr
                key={r._id}
                className={`border-b border-gray-100 last:border-none h-16 ${
                  userRole === 'Admin'
                    ? 'hover:bg-gray-50 cursor-pointer'
                    : 'hover:bg-gray-25'
                }`}
                onClick={() => handleRowClick(r)}
              >
                <td className="p-3 font-mono text-xs">{r._id}</td>
                <td className="p-3">{r.name || '-'}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">{r.hospital?.name || hospitalName}</td>
                <td className="p-3">
                  <div
                    className="flex items-center gap-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className={`transition-colors ${
                        userRole === 'Admin'
                          ? 'text-green-500 hover:text-green-600 cursor-pointer'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                      onClick={() => openEditModal(r)}
                      disabled={userRole !== 'Admin'}
                      title={userRole !== 'Admin' ? 'Admin access required' : 'Edit receptionist'}
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      className={`transition-colors ${
                        userRole === 'Admin'
                          ? 'text-red-500 hover:text-red-600 cursor-pointer'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                      onClick={() => openDeleteConfirm(r)}
                      disabled={userRole !== 'Admin'}
                      title={userRole !== 'Admin' ? 'Admin access required' : 'Delete receptionist'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
 
      {receptionists.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <p>No receptionists found for {hospitalName}.</p>
          <p className="text-sm mt-2">
            {userRole === "Admin" ? "Add receptionists to see them listed here." : "Contact your admin to add receptionists."}
          </p>
        </div>
      )}
 
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 gap-1 text-xs">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-1 rounded ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            ◀
          </button>
 
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              onClick={() => handlePageChange(idx + 1)}
              className={`px-2 py-1 rounded ${
                currentPage === idx + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {idx + 1}
            </button>
          ))}
 
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-1 rounded ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            ▶
          </button>
        </div>
      )}
 
      {/* Edit Modal */}
      {isEditModalOpen && userRole === 'Admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Edit Receptionist</h2>
            <p className="text-sm text-gray-600 mb-6">Edit functionality not implemented yet.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-sm hover:bg-gray-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && userRole === 'Admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong>{receptionistToDelete?.name}</strong>?
              <br />
              <span className="text-red-500 text-xs mt-2 block">This action cannot be undone.</span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteConfirm}
                className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-sm hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* Export Confirmation Modal */}
      {isExportConfirmOpen && userRole === 'Admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Export to Excel</h2>
            <p className="text-sm text-gray-600 mb-6">
              Export {receptionists.length} receptionist{receptionists.length !== 1 ? 's' : ''} from {hospitalName} to Excel?
              <br />
              <span className="text-blue-500 text-xs mt-2 block">This will download an Excel file with all receptionist data.</span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeExportConfirm}
                className="px-4 py-2 rounded-md border border-gray-300 bg-gray-100 text-sm hover:bg-gray-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmExport}
                className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 flex items-center gap-2 cursor-pointer"
              >
                <Upload size={16} />
                Export
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* Access Denied Toast for non-admin actions */}
      {userRole && userRole !== 'Admin' && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-orange-100 border border-orange-200 text-orange-800 px-4 py-2 rounded-lg shadow-lg text-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>Some features require Admin access</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default ReceptionistTable;