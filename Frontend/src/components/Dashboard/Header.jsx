import React, { useState, useEffect, useRef } from "react";
import { Search, User, X, ChevronRight, UserCircle2, Phone, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const Header = () => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState("");
  const [imageLoadError, setImageLoadError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Search state
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [hospitalId, setHospitalId] = useState(null);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Define searchable pages
  const searchablePages = [
    {
      title: "Dashboard",
      url: "/dashboard",
      description: "View analytics and statistics",
      category: "Main",
      keywords: ["home", "stats", "analytics", "overview"]
    },
    {
      title: "Patients",
      url: "/patients",
      description: "Manage patient records",
      category: "Main",
      keywords: ["patient", "records", "medical", "history"]
    },
    {
      title: "Add Patient",
      url: "/addpatient",
      description: "Register new patient",
      category: "Patients",
      keywords: ["new", "register", "add", "create"]
    },
    {
      title: "Appointments",
      url: "/appointments",
      description: "Schedule and manage appointments",
      category: "Main",
      keywords: ["schedule", "booking", "calendar", "appointments"]
    },
    {
      title: "Staff Management",
      url: "/staff",
      description: "Manage clinic staff",
      category: "Management",
      keywords: ["employees", "team", "doctors", "nurses"]
    },
    {
      title: "Lab Management",
      url: "/labmanagement",
      description: "Manage laboratory tests",
      category: "Management",
      keywords: ["lab", "tests", "reports", "diagnostics"]
    },
    {
      title: "Billing",
      url: "/billing",
      description: "Manage invoices and payments",
      category: "Finance",
      keywords: ["invoice", "payment", "charges", "bills"]
    },
    {
      title: "Finance",
      url: "/finance",
      description: "Financial reports and analytics",
      category: "Finance",
      keywords: ["revenue", "expenses", "financial", "reports"]
    },
    {
      title: "Consultant",
      url: "/consultant",
      description: "Doctor consultations",
      category: "Medical",
      keywords: ["doctor", "consultation", "diagnosis"]
    },
    {
      title: "Settings",
      url: "/settings",
      description: "Configure system settings",
      category: "System",
      keywords: ["config", "preferences", "setup"]
    },
    {
      title: "Profile",
      url: "/profile",
      description: "View and edit your profile",
      category: "Account",
      keywords: ["account", "user", "personal", "info"]
    },
    {
      title: "Pricing",
      url: "/pricing",
      description: "View pricing plans",
      category: "Account",
      keywords: ["subscription", "plans", "payment"]
    },
    {
      title: "Receptionist Table",
      url: "/receptionisttable",
      description: "Manage receptionists",
      category: "Management",
      keywords: ["reception", "desk", "front"]
    },
    {
      title: "Share & Referral",
      url: "/share",
      description: "Share and refer patients",
      category: "Communication",
      keywords: ["refer", "referral", "share"]
    },
    {
      title: "Permissions",
      url: "/permissions",
      description: "Manage user permissions (Admin only)",
      category: "System",
      keywords: ["access", "rights", "admin", "control"]
    }
  ];

  // Helper function to construct proper image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('blob:')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    
    return `${API_BASE_URL}/${imagePath}`;
  };

  // Get user initials for fallback
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Load user profile data and hospital ID
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }

        const decoded = jwtDecode(token);
        const role = decoded.role;
        const userId = decoded.id;

        // Get hospital ID
        let fetchedHospitalId = null;

        if (decoded.hospitalId) {
          fetchedHospitalId = decoded.hospitalId;
        } else {
          try {
            const profileResponse = await axios.get(
              `${API_BASE_URL}/api/auth/profile`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            
            if (role === "Admin" && profileResponse.data.hospital) {
              fetchedHospitalId = profileResponse.data.hospital._id;
            } else if (role === "Receptionist") {
              const receptionistData = profileResponse.data.receptionist;
              if (receptionistData && receptionistData.hospitalId) {
                fetchedHospitalId = receptionistData.hospitalId;
              }
            }
          } catch (profileError) {
           // console.error("Error fetching profile:", profileError);
          }
        }

        setHospitalId(fetchedHospitalId);

        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const userData = data.admin || data.receptionist || data.user || data;
          
          setUserName(userData.name || "");
          
          if (userData.profileImage) {
            const imageUrl = getImageUrl(userData.profileImage);
            setProfileImage(imageUrl);
            setImageLoadError(false);
          }
        } else if (response.status === 401) {
          localStorage.removeItem('token');
        } else {
          //console.error('Failed to load profile:', response.statusText);
        }
      } catch (error) {
       // console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Debounced search for both pages and patients
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setPatientSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      searchPages(query);
      searchPatients(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, hospitalId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search pages function
  const searchPages = (searchQuery) => {
    const lowerQuery = searchQuery.toLowerCase();
    
    const filtered = searchablePages.filter((page) => {
      const titleMatch = page.title.toLowerCase().includes(lowerQuery);
      const descMatch = page.description.toLowerCase().includes(lowerQuery);
      const categoryMatch = page.category.toLowerCase().includes(lowerQuery);
      const keywordMatch = page.keywords.some(keyword => 
        keyword.toLowerCase().includes(lowerQuery)
      );
      
      return titleMatch || descMatch || categoryMatch || keywordMatch;
    }).slice(0, 5);

    setSuggestions(filtered);
  };

  // Search patients function
  const searchPatients = async (searchQuery) => {
    if (!hospitalId) {
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const decoded = jwtDecode(token);
      const role = decoded.role;
      const userId = decoded.id;

      let url = `${API_BASE_URL}/api/patients`;
      const params = new URLSearchParams();

      if (role === "Receptionist") {
        params.append("hospitalId", hospitalId);
      } else if (role === "Admin") {
        params.append("adminId", userId);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const patients = response.data || [];
      const lowerQuery = searchQuery.toLowerCase();

      const filtered = patients.filter((patient) => {
        const firstName = patient.firstName || '';
        const lastName = patient.lastName || '';
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        const patientId = patient.patientId || '';
        const primaryNumber = patient.primaryNumber || '';
        
        return fullName.includes(lowerQuery) ||
               firstName.toLowerCase().includes(lowerQuery) ||
               lastName.toLowerCase().includes(lowerQuery) ||
               patientId.toLowerCase().includes(lowerQuery) ||
               primaryNumber.includes(searchQuery);
      }).slice(0, 5);

      setPatientSuggestions(filtered);
      setIsOpen(filtered.length > 0 || suggestions.length > 0);
    } catch (error) {
     // console.error("Error searching patients:", error);
      setPatientSuggestions([]);
    } finally {
      setIsLoading(false);
      setSelectedIndex(-1);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    const totalItems = suggestions.length + patientSuggestions.length;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < totalItems - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < suggestions.length) {
            handlePageClick(suggestions[selectedIndex]);
          } else {
            const patientIndex = selectedIndex - suggestions.length;
            handlePatientClick(patientSuggestions[patientIndex]);
          }
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle page suggestion click
  const handlePageClick = (page) => {
    navigate(page.url);
    setQuery("");
    setIsOpen(false);
    setSuggestions([]);
    setPatientSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // Handle patient click
  const handlePatientClick = async (patient) => {
    const patientId = patient._id;
    const patientHospitalId = hospitalId;
    
    if (!patientId || !patientHospitalId) {
     // console.error('Missing IDs:', { patientId, patientHospitalId });
      alert('Cannot navigate to patient details. Missing required information.');
      return;
    }
    
    localStorage.setItem('currentHospitalId', patientHospitalId);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/api/patients/${patientHospitalId}/${patientId}`,
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
      console.warn('Could not fetch complete patient data:', error);
      
      navigate(`/patientdata/${patientHospitalId}/${patientId}`, { 
        state: { 
          patient: {
            ...patient,
            hospitalId: patientHospitalId
          }
        } 
      });
    }

    // Clear search
    setQuery("");
    setIsOpen(false);
    setSuggestions([]);
    setPatientSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // Clear search
  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setPatientSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      Main: "bg-blue-100 text-blue-700",
      Patients: "bg-green-100 text-green-700",
      Management: "bg-purple-100 text-purple-700",
      Finance: "bg-yellow-100 text-yellow-700",
      Medical: "bg-red-100 text-red-700",
      Communication: "bg-indigo-100 text-indigo-700",
      System: "bg-gray-100 text-gray-700",
      Account: "bg-pink-100 text-pink-700"
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  // Handle image load error
  const handleImageError = () => {
    setImageLoadError(true);
  };

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoadError(false);
  };

  return (
    <div className="w-full px-3 sm:px-4 md:ml-16 lg:ml-20 xl:ml-7  ">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center gap-2 xl:mr-13  sm:gap-3 lg:gap-4 py-2 sm:py-3">
          {/* Smart Search Bar with Patient Search */}
          <div ref={searchRef} className="relative flex-1 max-w-3xl ">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => query && (suggestions.length > 0 || patientSuggestions.length > 0) && setIsOpen(true)}
                placeholder="Search patients, pages..."
                className="w-full py-2.5 sm:py-3 lg:py-3.5 pl-3 sm:pl-4 pr-16 sm:pr-20 bg-white rounded-lg sm:rounded-xl text-xs sm:text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              
              <div className="absolute right-2 sm:right-3 lg:right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1 sm:gap-2">
                {query && (
                  <button
                    onClick={handleClear}
                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                )}
                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
              </div>

              {isLoading && (
                <div className="absolute right-10 sm:right-12 top-1/2 transform -translate-y-1/2">
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Combined Suggestions Dropdown */}
            {isOpen && (suggestions.length > 0 || patientSuggestions.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-white rounded-lg sm:rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[70vh] sm:max-h-96 overflow-y-auto">
                <div className="p-1 sm:p-2">
                  {/* Patient Results Section */}
                  {patientSuggestions.length > 0 && (
                    <div className="mb-1 sm:mb-2">
                      <div className="text-[10px] sm:text-xs font-semibold text-gray-500 px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2">
                        <UserCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        Patients ({patientSuggestions.length})
                      </div>
                      
                      {patientSuggestions.map((patient, index) => (
                        <button
                          key={patient._id}
                          onClick={() => handlePatientClick(patient)}
                          className={`w-full text-left px-2 sm:px-3 py-2 sm:py-3 rounded-md sm:rounded-lg transition-all duration-150 flex items-center gap-2 sm:gap-3 group cursor-pointer ${
                            selectedIndex === index
                              ? "bg-green-50 border-l-2 sm:border-l-4 border-green-500"
                              : "hover:bg-gray-50"
                          }`}
                          onMouseEnter={() => setSelectedIndex(index)}
                        >
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <UserCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                              <span className="font-medium text-xs sm:text-sm text-gray-800 truncate">
                                {patient.firstName} {patient.lastName}
                              </span>
                              <span className="text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium flex-shrink-0">
                                Patient
                              </span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500">
                              <span className="flex items-center gap-0.5 sm:gap-1 truncate">
                                <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                <span className="truncate">{patient.primaryNumber}</span>
                              </span>
                              <span className="hidden xs:inline truncate">ID: {patient.patientId}</span>
                              {patient.age && <span className="hidden sm:inline">Age: {patient.age}</span>}
                            </div>
                          </div>
                          
                          <ChevronRight className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0 transition-transform ${
                            selectedIndex === index ? "transform translate-x-0.5 sm:translate-x-1 text-green-500" : ""
                          }`} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Page Results Section */}
                  {suggestions.length > 0 && (
                    <div>
                      {patientSuggestions.length > 0 && (
                        <div className="border-t border-gray-200 my-1 sm:my-2"></div>
                      )}
                      
                      <div className="text-[10px] sm:text-xs font-semibold text-gray-500 px-2 sm:px-3 py-1.5 sm:py-2">
                        Pages ({suggestions.length})
                      </div>
                      
                      {suggestions.map((page, index) => {
                        const actualIndex = index + patientSuggestions.length;
                        return (
                          <button
                            key={page.url}
                            onClick={() => handlePageClick(page)}
                            className={`w-full text-left px-2 sm:px-3 py-2 sm:py-3 rounded-md sm:rounded-lg transition-all duration-150 flex items-start gap-2 sm:gap-3 group cursor-pointer ${
                              selectedIndex === actualIndex
                                ? "bg-blue-50 border-l-2 sm:border-l-4 border-blue-500"
                                : "hover:bg-gray-50"
                            }`}
                            onMouseEnter={() => setSelectedIndex(actualIndex)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                                <span className="font-medium text-xs sm:text-sm text-gray-800 truncate">
                                  {page.title}
                                </span>
                                <span className={`text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${getCategoryColor(page.category)}`}>
                                  {page.category}
                                </span>
                              </div>
                              <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1">
                                {page.description}
                              </p>
                            </div>
                            
                            <ChevronRight className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0 transition-transform ${
                              selectedIndex === actualIndex ? "transform translate-x-0.5 sm:translate-x-1 text-blue-500" : ""
                            }`} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 px-2 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-500 border-t border-gray-200">
                  <span className="font-medium">Tip:</span> <span className="hidden xs:inline">Use ↑↓ arrows to navigate, Enter to select, Esc to close</span>
                  <span className="xs:hidden">Use arrows to navigate</span>
                </div>
              </div>
            )}

            {/* No Results */}
            {isOpen && query && suggestions.length === 0 && patientSuggestions.length === 0 && !isLoading && (
              <div className="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-3 sm:p-4 z-50">
                <div className="text-center">
                  <Search className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300 mx-auto mb-1 sm:mb-2" />
                  <p className="text-xs sm:text-sm text-gray-500">No results found for "{query}"</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">Try searching by patient name, ID, phone, or page name</p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Image */}
          <div
            onClick={() => navigate("/profile")}
            className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-full cursor-pointer relative overflow-hidden bg-blue-100 flex items-center justify-center text-blue-600 font-medium border-2 border-white shadow-sm hover:shadow-md transition-shadow flex-shrink-0"
          >
            {loading ? (
              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : profileImage && !imageLoadError ? (
              <img 
                src={profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            ) : (
              <span className="text-[10px] sm:text-xs lg:text-sm font-semibold">
                {userName ? getInitials(userName) : <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4" />}
              </span>
            )}
          </div>
        </header>
      </div>
    </div>
  );
};

export default Header;