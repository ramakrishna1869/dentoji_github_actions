//PatientTable.jsx
import React, { useState, useEffect } from "react";
import { Trash2, Upload, Search, X, CalendarDays, ChevronDown, Download } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import EditPatientModal from "./EditPatientModal";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// FilterBar Component
// Responsive FilterBar Component
const FilterBar = ({ search, setSearch, date, setDate, gender, setGender, ageRange, setAgeRange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen1, setIsOpen1] = useState(false);

  const options = ["Male", "Female", "Other"];
  const options1 = [
    { label: "0-18 years", value: "0-18" },
    { label: "19-35 years", value: "19-35" },
    { label: "36-50 years", value: "36-50" },
    { label: "51-65 years", value: "51-65" },
    { label: "65+ years", value: "65+" },
  ];

  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 mt-5 shadow-sm border border-gray-100 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {/* Search Input - Full width on mobile, spans 2 columns on larger screens */}
        <div className="relative sm:col-span-2 lg:col-span-2 xl:col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
          />
        </div>

        {/* Date Filter */}
        <div className="relative">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-gray-700 cursor-pointer focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
          />
        </div>

        {/* Gender Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex justify-between items-center rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-gray-700 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          >
            <span className="truncate">{gender || "Select gender"}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ml-2 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <>
              {/* Backdrop for mobile */}
              <div
                className="fixed inset-0 z-10 sm:hidden"
                onClick={() => setIsOpen(false)}
              />
              
              <ul className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden animate-fadeIn">
                {options.map((option) => (
                  <li
                    key={option}
                    onClick={() => {
                      setGender(option);
                      setIsOpen(false);
                    }}
                    className={`cursor-pointer px-3 sm:px-4 py-2 sm:py-2.5 text-sm hover:bg-blue-100 transition-colors ${
                      gender === option ? "bg-blue-50 font-semibold text-blue-600" : ""
                    }`}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Age Range Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen1(!isOpen1)}
            className="w-full flex justify-between items-center rounded-lg border border-gray-300 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-gray-700 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          >
            <span className="truncate">
              {ageRange
                ? options1.find((opt) => opt.value === ageRange)?.label
                : "Select age range"}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ml-2 ${
                isOpen1 ? "rotate-180" : ""
              }`}
            />
          </button>

          {isOpen1 && (
            <>
              {/* Backdrop for mobile */}
              <div
                className="fixed inset-0 z-10 sm:hidden"
                onClick={() => setIsOpen1(false)}
              />
              
              <ul className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden animate-fadeIn max-h-60 overflow-y-auto">
                {options1.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => {
                      setAgeRange(option.value);
                      setIsOpen1(false);
                    }}
                    className={`cursor-pointer px-3 sm:px-4 py-2 sm:py-2.5 text-sm hover:bg-blue-100 transition-colors ${
                      ageRange === option.value
                        ? "bg-blue-50 font-semibold text-blue-600"
                        : ""
                    }`}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      {/* Active Filters Display - Shows selected filters on mobile */}
      {(search || date || gender || ageRange) && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
          {search && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
              Search: {search}
              <X
                className="w-3 h-3 cursor-pointer hover:text-blue-900"
                onClick={() => setSearch("")}
              />
            </span>
          )}
          {date && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs">
              Date: {date}
              <X
                className="w-3 h-3 cursor-pointer hover:text-green-900"
                onClick={() => setDate("")}
              />
            </span>
          )}
          {gender && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs">
              Gender: {gender}
              <X
                className="w-3 h-3 cursor-pointer hover:text-purple-900"
                onClick={() => setGender("")}
              />
            </span>
          )}
          {ageRange && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs">
              Age: {options1.find((opt) => opt.value === ageRange)?.label}
              <X
                className="w-3 h-3 cursor-pointer hover:text-orange-900"
                onClick={() => setAgeRange("")}
              />
            </span>
          )}
        </div>
      )}
    </div>
  );
};

const PatientTable = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hospitalId, setHospitalId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [ageRangeFilter, setAgeRangeFilter] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);

  // Pagination
  const rowsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch patients with role-based filtering
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
      const role = decoded.role;
      setUserRole(role);
      const userId = decoded.id;

      let fetchedHospitalId = null;

      // First, try to get hospital ID from the token
      if (decoded.hospitalId) {
        // Handle if hospitalId in token is an object or string
        fetchedHospitalId = typeof decoded.hospitalId === 'object'
          ? decoded.hospitalId._id
          : decoded.hospitalId;
      } else {
        // If not in token, fetch from profile endpoint
        try {
          const profileResponse = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (role === "Admin" && profileResponse.data.hospital) {
            // Handle if hospital is a populated object or just an ID string
            fetchedHospitalId = typeof profileResponse.data.hospital === 'object'
              ? profileResponse.data.hospital._id
              : profileResponse.data.hospital;
          } else if (role === "Receptionist") {
            const receptionistData = profileResponse.data.receptionist;
            if (receptionistData && receptionistData.hospitalId) {
              // Handle if hospitalId is a populated object or just an ID string
              fetchedHospitalId = typeof receptionistData.hospitalId === 'object'
                ? receptionistData.hospitalId._id
                : receptionistData.hospitalId;
            } else {
             // console.error("Receptionist data or hospitalId not found in profile response");
            }
          }
        } catch (profileError) {
        //  console.error("Error fetching profile:", profileError);
          setError("Failed to fetch user profile. Please try logging in again.");
          setLoading(false);
          return;
        }
      }

      if (!fetchedHospitalId) {
       // console.error("No hospital ID found for user");
        if (role === "Admin") {
          setError("No hospital found. Please complete hospital setup by going to Hospital Form.");
        } else {
          setError("No hospital association found. Please contact your administrator.");
        }
        setLoading(false);
        return;
      }

      // Ensure fetchedHospitalId is a string
      fetchedHospitalId = String(fetchedHospitalId);
      
      setHospitalId(fetchedHospitalId);
    //  console.log("Fetched Hospital ID:", fetchedHospitalId);
      
      // Build the API URL based on user role
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/patients`;
    //  console.log("Fetching patients with URL:", url);
      
      const params = new URLSearchParams();
    //  console.log("User Role:", role);
      
      if (role === "Receptionist") {
        params.append("hospitalId", fetchedHospitalId);
       // console.log("Using Hospital ID for Receptionist:", fetchedHospitalId);
      } else if (role === "Admin") {
        params.append("adminId", userId);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }
     // console.log("Final Patient Fetch URL:", url);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
    //  console.log("Fetched Patients:", response.data);

      setPatients(response.data || []);
      setFilteredPatients(response.data || []);
    } catch (err) {
     // console.error("Error fetching data:", err);
      if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else {
        setError(
          err.response?.data?.message || "Failed to fetch patient records."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [navigate]);
  // Filter functionality useEffect
  useEffect(() => {
    let filtered = [...patients];

    // Search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((patient) => {
        const firstName = patient.firstName || '';
        const lastName = patient.lastName || '';
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        const primaryNumber = patient.primaryNumber || '';
        const patientId = patient.patientId || '';
        
        return fullName.includes(searchLower) ||
               firstName.toLowerCase().includes(searchLower) ||
               lastName.toLowerCase().includes(searchLower) ||
               primaryNumber.includes(searchTerm) ||
               patientId.toLowerCase().includes(searchLower);
      });
    }

    // Date filter (filter by last visit date)
    if (dateFilter) {
      filtered = filtered.filter((patient) => {
        if (!patient.lastVisit) return false;
        const visitDate = new Date(patient.lastVisit).toISOString().split('T')[0];
        return visitDate === dateFilter;
      });
    }

    // Gender filter
    if (genderFilter) {
      filtered = filtered.filter((patient) => 
        patient.gender && patient.gender.toLowerCase() === genderFilter.toLowerCase()
      );
    }

    // Age range filter
    if (ageRangeFilter) {
      filtered = filtered.filter((patient) => {
        const age = parseInt(patient.age);
        switch (ageRangeFilter) {
          case "0-18":
            return age >= 0 && age <= 18;
          case "19-35":
            return age >= 19 && age <= 35;
          case "36-50":
            return age >= 36 && age <= 50;
          case "51-65":
            return age >= 51 && age <= 65;
          case "65+":
            return age > 65;
          default:
            return true;
        }
      });
    }

    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [searchTerm, dateFilter, genderFilter, ageRangeFilter, patients]);

  // Patient row click handler
  const handleRowClick = async (patient) => {
    const patientId = patient._id;
    const patientHospitalId = hospitalId;
    
    if (!patientId) {
      //  console.error('❌ Missing patient ID:', patientId);
        alert('Patient ID not found. Cannot navigate to patient details.');
        return;
    }
    
    if (!patientHospitalId) {
      /*  console.error('❌ Missing hospital ID:', { 
            currentHospitalId: hospitalId 
        }); */
        alert('Hospital ID not found. Cannot navigate to patient details.');
        return;
    }

    localStorage.setItem('currentHospitalId', patientHospitalId);
    
    try {
        const token = localStorage.getItem('token');
        
        const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/patients/${patientHospitalId}/${patientId}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        const patientData = response.data;
        
        navigate(`/patientdata/${patientHospitalId}/${patientId}`, { 
            state: { 
                patient: {
                    ...patientData,
                    hospitalId: patientHospitalId
                }
            } 
        });
    } catch (error) {
        console.warn('⚠️ Could not fetch complete patient data, using existing data:', error);
        
        const patientWithHospitalId = {
            ...patient,
            hospitalId: patientHospitalId
        };
        
        navigate(`/patientdata/${patientHospitalId}/${patientId}`, { 
            state: { 
                patient: patientWithHospitalId
            } 
        });
    }
  };

  // const handleStatusChange = async (patientId, newStatus) => {
  //   try {
  //     console.log('🔄 Updating status:', { patientId, newStatus });
      
  //     // Validate status
  //     if (!['pending', 'completed'].includes(newStatus)) {
  //       toast.error('Invalid status value');
  //       return;
  //     }

  //     const response = await fetch(
  //       `${import.meta.env.VITE_BACKEND_URL}/api/patients/${patientId}/status`,
  //       {
  //         method: 'PATCH',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': `Bearer ${localStorage.getItem('token')}`,
  //         },
  //         body: JSON.stringify({ status: newStatus }),
  //       }
  //     );

  //     const data = await response.json();
  //     console.log('📥 Response:', data);

  //     if (!response.ok) {
  //       throw new Error(data.message || 'Failed to update status');
  //     }

  //     // Update local state
  //     setPatients(prev => prev.map(p => 
  //       p._id === patientId ? { ...p, status: newStatus } : p
  //     ));
      
  //     setFilteredPatients(prev => prev.map(p => 
  //       p._id === patientId ? { ...p, status: newStatus } : p
  //     ));

  //     toast.success('✅ Status updated successfully!');
      
  //   } catch (error) {
  //     console.error('❌ Status update error:', error);
  //     toast.error(error.message || 'Failed to update status');
  //   }
  // };

  const openEditModal = (patient) => {
    setSelectedPatient(patient);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedPatient(null);
    setIsEditModalOpen(false);
  };

  const handleUpdatePatient = (updatedPatient) => {
    setPatients((prev) =>
      prev.map((p) => (p._id === updatedPatient._id ? updatedPatient : p))
    );

    if (window.refreshPatientData) {
        window.refreshPatientData();
    }
    closeEditModal();
  };

  const openDeleteConfirm = (patient) => {
    setPatientToDelete(patient);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setPatientToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

const confirmDelete = async () => {
  if (!patientToDelete) return;

  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      toast.error("Authentication token not found. Please log in again.");
      return;
    }

    if (!hospitalId) {
      toast.error("Hospital ID not found. Please refresh the page.");
      return;
    }

   /* console.log('🗑️ Deleting patient:', {
      patientId: patientToDelete._id,
      hospitalId: hospitalId
    });*/

    // Make the delete request
    const response = await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/api/patients/${hospitalId}/${patientToDelete._id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

   // console.log('✅ Delete response:', response.data);

    // Check if deletion was successful
    if (response.status === 200 || response.status === 204) {
      // Immediately update local state
      setPatients((prev) => prev.filter((p) => p._id !== patientToDelete._id));
      setFilteredPatients((prev) => prev.filter((p) => p._id !== patientToDelete._id));
      
      //toast.success("✅ Patient deleted successfully!");
      
      // Optional: Refresh page after short delay to ensure sync
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      throw new Error("Unexpected response from server");
    }

  } catch (err) {
   // console.error("❌ Error deleting patient:", err);
    
    // Show specific error message
    if (err.response) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Failed to delete patient record.";
      toast.error(`❌ ${errorMessage}`);
      setError(errorMessage);
    } else if (err.request) {
      toast.error("❌ No response from server. Please check your connection.");
      setError("No response from server.");
    } else {
      toast.error(`❌ ${err.message || "Failed to delete patient"}`);
      setError(err.message);
    }
  } finally {
    closeDeleteConfirm();
  }
};
  // CSV Export function
  const exportToCSV = () => {
    const dataToExport = filteredPatients.map((p, index) => ({
      "Patient ID": p.patientId || "",
      Name: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
      Age: p.age || "",
      Gender: p.gender || "",
      Phone: p.primaryNumber || "",
      "Primary Issue": p.primaryDentalIssue || "",
     // Status: p.status || ""
    }));

    // Convert to CSV format
    const csvHeaders = Object.keys(dataToExport[0] || {}).join(',');
    const csvRows = dataToExport.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      ).join(',')
    );
    
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'patients.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const startIdx = (currentPage - 1) * rowsPerPage;
  const currentPatients = filteredPatients.slice(startIdx, startIdx + rowsPerPage);

  if (loading) return <div className="p-6">Loading...</div>;
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-medium mb-2">Error</div>
          <div className="text-red-600">{error}</div>
          {userRole === "Admin" && error.includes("hospital") && (
            <button
              onClick={() => navigate("/hospitalform")}
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 cursor-pointer"
            >
              Set Up Hospital
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[99.5%]">
      {/* Filter Bar */}
      <FilterBar
        search={searchTerm}
        setSearch={setSearchTerm}
        date={dateFilter}
        setDate={setDateFilter}
        gender={genderFilter}
        setGender={setGenderFilter}
        ageRange={ageRangeFilter}
        setAgeRange={setAgeRangeFilter}
      />

      <div className="bg-white rounded-2xl shadow p-6 w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold">Patient Records</h2>
          <button
            className="border border-gray-300 text-gray-800 px-5 py-2 rounded-lg cursor-pointer text-sm flex items-center gap-2 mr-5 bg-white hover:bg-gray-50"
            onClick={exportToCSV}
          >
            <Upload size={16} />
            Export
          </button>
        </div>

        {/* Results info */}
        {(searchTerm || dateFilter || genderFilter || ageRangeFilter) && (
          <div className="mb-4 text-sm text-gray-600">
            {filteredPatients.length > 0 
              ? `Found ${filteredPatients.length} patient${filteredPatients.length === 1 ? '' : 's'} matching your filters`
              : `No patients found matching your filters`
            }
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="border-b border-gray-200 text-gray-600 bg-gray-50">
              <tr className="bg-gray-50">
                {[
                  "S No",
                  "Name",
                  "Patient ID",
                  "Age",
                  "Gender",
                  "Phone",
                  "Primary Issue",
                 // "Status",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide text-left"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentPatients.length > 0 ? (
                currentPatients.map((p, index) => (
                  <tr
                    key={p._id || p.id}
                    className="border-b border-gray-100 last:border-none hover:bg-gray-50 h-16 cursor-pointer transition-colors duration-150"
                    onClick={() => handleRowClick(p)}
                  >
                    <td className="p-3">{startIdx + index + 1}</td>
                    <td className="p-3 font-medium">{`${p.firstName || ""} ${p.lastName || ""}`.trim() || "-"}</td>
                    <td className="p-3">{p.patientId || "-"}</td>
                    <td className="p-3">{p.age || "-"}</td>
                    <td className="p-3">{p.gender || "-"}</td>
                    <td className="p-3">{p.primaryNumber || "-"}</td>
                    <td className="p-3">{p.primaryDentalIssue || "-"}</td>
                    {/* <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={p.status || 'pending'}
                        onChange={(e) => handleStatusChange(p._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer border ${
                          (p.status || 'pending') === 'completed'
                            ? 'bg-green-100 text-green-700 border-green-300'
                            : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td> */}
                    <td className="p-3">
                      <div
                        className="flex items-center gap-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="text-green-500 hover:text-green-600 cursor-pointer transition-colors duration-150"
                          onClick={() => openEditModal(p)}
                        >
                          <FaEdit size={18} />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-600 cursor-pointer transition-colors duration-150"
                          onClick={() => openDeleteConfirm(p)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-gray-500">
                    {(searchTerm || dateFilter || genderFilter || ageRangeFilter) ? "No patients found matching your filters." : "No patients found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-4 gap-1 text-xs">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-1 rounded cursor-pointer ${
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
                className={`px-2 py-1 rounded cursor-pointer ${
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
              className={`p-1 rounded cursor-pointer ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              ▶
            </button>
          </div>
        )}

        {isEditModalOpen && (
          <EditPatientModal
            patient={selectedPatient}
            onClose={closeEditModal}
            onUpdate={handleUpdatePatient}
          />
        )}

        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this patient?
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
      </div>
    </div>
  );
};

export default PatientTable;