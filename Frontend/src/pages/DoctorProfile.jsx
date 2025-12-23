import React, { useState, useEffect, useRef, memo } from "react";
import { Edit, UserPlus, Calendar, Users, Gift, ArrowLeft, Save, X, Camera, Upload, Trash2, User, Crown, CheckCircle, Clock,Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { MapPin,Phone } from "lucide-react";


// ActionCard Component
function ActionCard({ icon, label, onClick, isRestricted }) {
    return (
        <button
            onClick={onClick}
            disabled={isRestricted}
            className={`flex flex-col items-center gap-3 p-6 border border-gray-200 rounded-xl transition-all duration-200 group relative ${
                isRestricted 
                    ? 'bg-gray-100 cursor-not-allowed opacity-60' 
                    : 'bg-white hover:bg-gray-50 hover:border-gray-300 cursor-pointer'
            }`}
        >
            {isRestricted && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                    <Lock className="w-3.5 h-3.5" />
                </div>
            )}
            <div className={`transition-colors ${isRestricted ? 'text-gray-400' : 'text-blue-500 group-hover:text-blue-600'}`}>
                {icon}
            </div>
            <span className={`text-sm font-medium text-center leading-tight ${isRestricted ? 'text-gray-400' : 'text-gray-700'}`}>
                {label}
            </span>
        </button>
    );
}


export default function DoctorProfile() {
    const location = useLocation();
const queryParams = new URLSearchParams(location.search);
const defaultTab = queryParams.get("tab") || "Overview";

const [activeTab, setActiveTab] = React.useState(defaultTab);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const [imageLoadError, setImageLoadError] = useState(false);
    const [userRole, setUserRole] = useState('Admin');
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);

    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Form data state
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        email: "",
        phone: "",
        specialization: "",
        qualification: "",
        location: "",
        bio: "",
        profileImage: "",
        role: "",
        hospitalId: ""
    });

    const [originalFormData, setOriginalFormData] = useState({ ...formData });
    const [hospitalData, setHospitalData] = useState(null);

    // API base URL - adjust this to your backend URL
    const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}`;

    // Helper function to construct proper image URLs
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        
        //console.log('🖼️ Processing image path:', imagePath);
        
        // If it's already a full URL, return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('blob:')) {
            //console.log('✅ Using full URL:', imagePath);
            return imagePath;
        }
        
        // Remove any leading slash to avoid double slashes
        const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        const finalUrl = `${API_BASE_URL}/${cleanPath}`;
        
        //console.log('🔗 Constructed URL:', finalUrl);
        return finalUrl;
    };

    // Update the image loading functions
    const handleImageError = (e) => {
        //console.log('❌ Image failed to load:', e.target.src);
        //console.log('🔍 Trying alternative URL construction...');
        
        // Try alternative URL construction
        const currentSrc = e.target.src;
        const originalPath = formData.profileImage;
        
        // If this is the first failure, try without the leading slash
        if (originalPath && originalPath.startsWith('/uploads/')) {
            const altUrl = `${API_BASE_URL}${originalPath}`;
            if (currentSrc !== altUrl) {
                //console.log('🔄 Retrying with alternative URL:', altUrl);
                e.target.src = altUrl;
                return;
            }
        }
        
        // If still failing, try with direct uploads path
        if (originalPath && originalPath.includes('uploads/profiles/')) {
            const filename = originalPath.split('/').pop();
            const directUrl = `${API_BASE_URL}/uploads/profiles/${filename}`;
            if (currentSrc !== directUrl) {
                //console.log('🔄 Retrying with direct URL:', directUrl);
                e.target.src = directUrl;
                return;
            }
        }
        
        // All attempts failed, show fallback
        //console.log('❌ All image load attempts failed, showing fallback');
        setImageLoadError(true);
        e.target.style.display = 'none';
        
        // Show the fallback initial
        const fallback = e.target.parentNode.querySelector('.fallback-initial');
        if (fallback) {
            fallback.style.display = 'flex';
        }
    };

    // Add a test function to check image accessibility
    const testImageUrl = async (url) => {
        try {
            //console.log('🧪 Testing image URL:', url);
            const response = await fetch(url, { method: 'HEAD' });
            //console.log('📡 Image test response:', response.status);
            return response.ok;
        } catch (error) {
          //  console.error('❌ Image test failed:', error);
            return false;
        }
    };

    // Load profile function
    const loadProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
              //  console.error('No token found - user needs to login');
                alert('Please login to access your profile');
                return;
            }

            //console.log('🔄 Loading profile with token:', token.substring(0, 20) + '...');

            const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            //console.log('📡 Profile API response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                //console.log('✅ Profile data received:', data);
                
                // Extract user data based on response structure
                const userData = data.admin || data.receptionist || data.user || data;
                const hospital = data.hospital;
                
                //console.log('👤 User data extracted:', userData);
                //console.log('🏥 Hospital data extracted:', hospital);
                
                const profileData = {
                    id: userData._id || userData.id || "",
                    name: userData.name || "",
                    email: userData.email || "",
                    phone: userData.phone || userData.primaryNumber || "",
                    specialization: userData.specialization || "",
                    qualification: userData.qualification || "",
                    location: userData.location || "",
                    bio: userData.bio || "",
                    profileImage: userData.profileImage || "",
                    role: userData.role || "Admin",
                    hospitalId: userData.hospitalId || ""
                };
                
                //console.log('📝 Final profile data:', profileData);
                
                setFormData(profileData);
                setOriginalFormData(profileData);
                setUserRole(userData.role || "Admin");
                
                // Set hospital data if available
                if (hospital) {
                    setHospitalData(hospital);
                    //console.log('🏥 Hospital data set:', hospital);
                }
                
                // Handle profile image with better error handling
                if (userData.profileImage) {
                    //console.log('🖼️ Processing profile image:', userData.profileImage);
                    
                    const imageUrl = getImageUrl(userData.profileImage);
                    //console.log('🔗 Final image URL:', imageUrl);
                    
                    // Test if the image URL is accessible
                    const isAccessible = await testImageUrl(imageUrl);
                    if (isAccessible) {
                        setProfileImagePreview(imageUrl);
                        setImageLoadError(false);
                        //console.log('✅ Profile image URL verified and set');
                    } else {
                        //console.log('❌ Profile image URL not accessible, will show fallback');
                        setProfileImagePreview(null);
                        setImageLoadError(true);
                    }
                } else {
                    //console.log('ℹ️ No profile image found');
                    setProfileImagePreview(null);
                    setImageLoadError(false);
                }
            } else if (response.status === 401) {
               // console.error('❌ Token expired or invalid');
                localStorage.removeItem('token');
                alert('Session expired. Please login again.');
            } else {
                const errorText = await response.text();
               // console.error('❌ Failed to load profile:', response.statusText, errorText);
                alert('Failed to load profile: ' + (response.statusText || 'Unknown error'));
            }
        } catch (error) {
          //  console.error('❌ Error loading profile:', error);
            alert('Network error while loading profile. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    // Load profile data on component mount
    useEffect(() => {
        loadProfile();
        loadSubscriptionData();
    }, []);

    // Load subscription data
    const loadSubscriptionData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
              //  console.error('No token found');
                setSubscriptionData(null);
                return;
            }

            //console.log('🔄 Loading subscription data...');

            const response = await fetch(`${API_BASE_URL}/api/payments/subscription-status`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            //console.log('📡 Subscription API response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                //console.log('✅ Subscription data received:', data);
                
                if (data.hasActiveSubscription && data.subscription) {
                    const sub = data.subscription;
                    
                    // Map the API response to your component's expected format
                    const formattedSubscription = {
                        planName: sub.planType,
                        status: sub.status,
                        validUntil: new Date(sub.endDate).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }),
                        features: formatFeatures(sub.features),
                        daysLeft: sub.daysRemaining,
                        isExpiringSoon: sub.isExpiringSoon,
                        startDate: sub.startDate,
                        endDate: sub.endDate,
                        amount: sub.amount,
                        planDetails: sub
                    };
                    
                    setSubscriptionData(formattedSubscription);
                    //console.log('✅ Subscription data formatted and set:', formattedSubscription);
                } else {
                    //console.log('ℹ️ No active subscription found');
                    setSubscriptionData(null);
                }
            } else if (response.status === 401) {
              //  console.error('❌ Token expired or invalid');
                localStorage.removeItem('token');
                setSubscriptionData(null);
            } else {
                const errorText = await response.text();
              //  console.error('❌ Failed to load subscription:', errorText);
                setSubscriptionData(null);
            }
        } catch (error) {
         //   console.error('❌ Error loading subscription data:', error);
            setSubscriptionData(null);
        }
    };

    const formatFeatures = (features) => {
        if (!features) return [];
        
        const featureList = [];
        
        if (features.maxPatients) {
            featureList.push(features.maxPatients === -1 ? 
                'Unlimited Patients' : 
                `Up to ${features.maxPatients} Patients`
            );
        }
        
        if (features.hasAdvancedReporting) {
            featureList.push('Advanced Analytics & Reporting');
        }
        
        if (features.hasPrioritySupport) {
            featureList.push('Priority Support');
        }
        
        if (features.hasApiAccess) {
            featureList.push('API Access');
        }
        
        if (features.hasWhiteLabel) {
            featureList.push('Custom Branding');
        }
        
        // Add default features
        featureList.push('Appointment Scheduling');
        featureList.push('Patient Records Management');
        featureList.push('Multi-device Sync');
        
        return featureList;
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    // Handle image load success
    const handleImageLoad = (e) => {
        //console.log('✅ Image loaded successfully:', e.target.src);
        setImageLoadError(false);
        // Hide the fallback initial
        const fallback = e.target.parentNode.querySelector('.fallback-initial');
        if (fallback) {
            fallback.style.display = 'none';
        }
    };

    // Update profile with better error handling
    const updateProfile = async (profileData) => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            //console.log('🔄 Updating profile with data:', profileData);

            // Create proper update payload
            const updatePayload = {
                name: profileData.name || "",
                qualification: profileData.qualification || "",
                phone: profileData.phone || "",
                specialization: profileData.specialization || "",
                location: profileData.location || "",
                bio: profileData.bio || "",
                primaryNumber: profileData.phone || "",
            };

            //console.log('📤 Final update payload:', updatePayload);

            const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatePayload),
            });

            //console.log('📡 Update response status:', response.status);
            
            const responseText = await response.text();
            //console.log('📡 Raw response:', responseText);

            if (!response.ok) {
                let errorMessage = 'Failed to update profile';
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                   // console.error('❌ Server error details:', errorData);
                } catch {
                    errorMessage = responseText || `HTTP ${response.status}: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            let data;
            try {
                data = JSON.parse(responseText);
            } catch {
                data = { message: 'Profile updated successfully' };
            }
            
            //console.log('✅ Profile updated successfully:', data);
            
            await loadProfile();
            
            return data;
        } catch (error) {
          //  console.error('❌ Error updating profile:', error);
            throw error;
        }
    };

    // Upload profile image
    const uploadProfileImage = async (file) => {
        try {
            setUploadingImage(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            //console.log('🖼️ Uploading image:', file.name, file.size, 'bytes');

            const formDataObj = new FormData();
            formDataObj.append('profileImage', file);

            const response = await fetch(`${API_BASE_URL}/api/auth/profile/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formDataObj,
            });

            //console.log('📡 Image upload response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
              //  console.error('Upload error response:', errorText);
                let errorMessage = 'Failed to upload image';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch {
                data = { profileImage: URL.createObjectURL(file) };
            }
            
            //console.log('✅ Image uploaded successfully:', data);
            
            const newProfileImage = data.profileImage || data.user?.profileImage || URL.createObjectURL(file);
            
            setFormData(prev => ({ ...prev, profileImage: newProfileImage }));
            const imageUrl = getImageUrl(newProfileImage);
            setProfileImagePreview(imageUrl);
            setImageLoadError(false);
            //console.log('🖼️ Profile image updated in state:', imageUrl);
            
            return data;
        } catch (error) {
          //  console.error('❌ Error uploading image:', error);
            throw error;
        } finally {
            setUploadingImage(false);
        }
    };

    // Delete profile image
    const deleteProfileImage = async () => {
        try {
            setUploadingImage(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            //console.log('🗑️ Deleting profile image...');

            const response = await fetch(`${API_BASE_URL}/api/auth/profile/image`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            //console.log('📡 Delete image response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Failed to delete image';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            //console.log('✅ Image deleted successfully');
            
            setFormData(prev => ({ ...prev, profileImage: "" }));
            setProfileImagePreview(null);
            setImageLoadError(false);
            
            return { message: 'Image deleted successfully' };
        } catch (error) {
          //  console.error('❌ Error deleting image:', error);
            throw error;
        } finally {
            setUploadingImage(false);
        }
    };

    // Handle file selection
    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        try {
            await uploadProfileImage(file);
            alert('Profile image uploaded successfully!');
        } catch (error) {
            alert('Failed to upload image: ' + error.message);
        }
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Handle delete image
    const handleDeleteImage = async () => {
        if (window.confirm('Are you sure you want to delete your profile image?')) {
            try {
                await deleteProfileImage();
                alert('Profile image deleted successfully!');
            } catch (error) {
                alert('Failed to delete image: ' + error.message);
            }
        }
    };

    const handleEdit = () => {
        setOriginalFormData({ ...formData });
        setIsEditing(true);
        //console.log('📝 Edit mode enabled');
    };

const handleSave = async () => {
  try {
    setLoading(true);
    //console.log('💾 Saving profile changes...', formData);
    
    if (!formData.name || formData.name.trim() === '') {
      alert('Name is required');
      return;
    }

    await updateProfile(formData);
   setIsSaveConfirmOpen(true);
setIsEditing(false); // ✅ show success popup

  } catch (error) {
   // console.error('❌ Update error:', error);
    alert('Failed to update profile: ' + error.message);
  } finally {
    setLoading(false);
  }
};


    const handleCancel = () => {
        setFormData({ ...originalFormData });
        setIsEditing(false);
        //console.log('❌ Edit cancelled, reverted changes');
    };

    const handleNavigate = (path) => {
        //console.log(`🔄 Navigating to: ${path}`);
        navigate(path);
    };

    // FIXED: Optimized input change handler
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

  const renderEditButton = () => {
  if (activeTab !== "Personal Info") return null;

  return (
    <>
      {isEditing ? (
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            onClick={handleCancel}
            disabled={loading}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      ) : (
        <button
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          onClick={handleEdit}
        >
          <Edit size={16} /> Edit Profile
        </button>
      )}

      {/* ✅ Popup for Save Confirmation */}
      {isSaveConfirmOpen && (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
  <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm transform transition-all duration-300 scale-100">
    <div className="flex flex-col items-center text-center">
      {/* Success Icon */}
      <div className="bg-green-100 text-green-600 rounded-full p-3 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Heading */}
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Profile Updated Successfully
      </h2>

      {/* Message */}
      <p className="text-gray-600 text-sm mb-6">
        Your changes have been saved. You can continue exploring your dashboard.
      </p>

      {/* Action Button */}
      <button
        onClick={() => setIsSaveConfirmOpen(false)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
      >
        Got it
      </button>
    </div>
  </div>
</div>

      )}
    </>
  );
};

    if (loading && !formData.name) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 sm:p-6 bg-gray-100 min-h-screen">
            <div className="bg-white shadow-sm rounded-lg mb-4 sm:mb-6">
                <div className="flex items-center justify-between p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <ArrowLeft
                            size={18}
                            className="text-gray-600 cursor-pointer hover:text-gray-800 transition-colors flex-shrink-0 sm:w-5 sm:h-5"
                            onClick={handleBackClick}
                        />
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Doctor Profile</h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">
                                Manage your professional information • Role: {userRole}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
                        {renderEditButton()}
                    </div>
                </div>

                <div className="border-b border-gray-200 bg-gray-50 overflow-x-auto">
                    <div className="flex justify-between items-start mx-auto w-full min-w-max sm:min-w-0">
                        <button
                            onClick={() => setActiveTab("Overview")}
                            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors relative ml-4 sm:ml-10 cursor-pointer whitespace-nowrap ${
                                activeTab === "Overview"
                                    ? "text-blue-600"
                                    : "text-gray-600 hover:text-gray-800"
                            }`}
                        >
                            Overview
                            {activeTab === "Overview" && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab("Personal Info")}
                            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors relative cursor-pointer whitespace-nowrap ${
                                activeTab === "Personal Info"
                                    ? "text-blue-600"
                                    : "text-gray-600 hover:text-gray-800"
                            }`}
                        >
                            Personal Info
                            {activeTab === "Personal Info" && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab("Subscription")}
                            className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors relative mr-4 sm:mr-10 cursor-pointer whitespace-nowrap ${
                                activeTab === "Subscription"
                                    ? "text-blue-600"
                                    : "text-gray-600 hover:text-gray-800"
                            }`}
                        >
                            Subscription
                            {activeTab === "Subscription" && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div>
                {activeTab === "Overview" && (
                    <OverviewTab 
                        navigate={handleNavigate} 
                        formData={formData} 
                        hospitalData={hospitalData}
                        profileImagePreview={profileImagePreview}
                        imageLoadError={imageLoadError}
                        handleImageError={handleImageError}
                        handleImageLoad={handleImageLoad}
                    />
                )}
                {activeTab === "Personal Info" && (
                    <PersonalInfoTab
                        formData={formData}
                        handleInputChange={handleInputChange}
                        isEditing={isEditing}
                        profileImagePreview={profileImagePreview}
                        handleFileSelect={handleFileSelect}
                        handleDeleteImage={handleDeleteImage}
                        uploadingImage={uploadingImage}
                        fileInputRef={fileInputRef}
                        imageLoadError={imageLoadError}
                        handleImageError={handleImageError}
                        handleImageLoad={handleImageLoad}
                    />
                )}
                {activeTab === "Subscription" && (
                    <SubscriptionTab 
                        subscriptionData={subscriptionData}
                        navigate={handleNavigate}
                    />
                )}
            </div>
        </div>
    );
}

function OverviewTab({ navigate, formData, hospitalData, profileImagePreview, imageLoadError, handleImageError, handleImageLoad }) {
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [loadingSubscription, setLoadingSubscription] = useState(true);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [restrictedFeature, setRestrictedFeature] = useState('');
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };
    const UpgradeModal = ({ isVisible, onClose, feature, currentPlan, navigate }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 border-2 border-yellow-100">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Crown className="w-10 h-10 text-white" />
                    </div>

                    <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4">
                        Upgrade Required
                    </h2>

                    <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Current Plan: {currentPlan}
                    </div>

                    <p className="text-gray-700 font-medium mb-3">
                        This feature requires:
                    </p>
                    <p className="text-lg font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg mb-4">
                        {feature}
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Upgrade your plan to unlock this feature and many more!
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                navigate('/pricing');
                            }}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-colors shadow-lg"
                        >
                            View Pricing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

    // Fetch subscription data
    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoadingSubscription(false);
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/api/patients/subscription-features`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                const data = await response.json();
                
                if (data.success && data.hasSubscription) {
                    setSubscriptionData(data.subscription);
                }
            } catch (error) {
               // console.error('Failed to fetch subscription:', error);
            } finally {
                setLoadingSubscription(false);
            }
        };

        fetchSubscription();
    }, []);

    // Check if plan is basic
    const isBasicPlan = subscriptionData?.planType?.toLowerCase() === 'basic plan';

    const handleRestrictedClick = (featureName) => {
        setRestrictedFeature(featureName);
        setShowUpgradeModal(true);
    };

    const handleActionClick = (path, featureName, isRestricted) => {
        if (isRestricted) {
            handleRestrictedClick(`${featureName} (Requires Monthly or Yearly Plan)`);
        } else {
            navigate(path);
        }
    };

    return (
        <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-100 flex items-center justify-center text-lg sm:text-xl font-bold text-blue-600 flex-shrink-0 overflow-hidden relative">
                        {profileImagePreview && !imageLoadError && (
                            <img 
                                src={profileImagePreview} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                                onLoad={handleImageLoad}
                            />
                        )}
                        <div className={`fallback-initial w-full h-full flex items-center justify-center absolute inset-0 ${profileImagePreview && !imageLoadError ? 'hidden' : 'flex'}`}>
                            {getInitials(formData.name)}
                        </div>
                    </div>
                    <div className="flex-1 w-full min-w-0">
                        <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-2 sm:gap-0">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 truncate">
                                    {formData.name || "User Name"}
                                </h2>
                                <p className="text-sm sm:text-base text-gray-600 mb-1 truncate">
                                    {formData.specialization || "General Practice"}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500 break-all">{formData.email}</p>
                                {formData.qualification && (
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                        {formData.qualification}
                                    </p>
                                )}
                                {formData.phone && (
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-1 truncate">
                                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                                        {formData.phone}
                                    </p>
                                )}
                                {formData.location && (
                                    <p className="text-xs sm:text-sm text-gray-500 mt-1 flex items-center gap-1 truncate">
                                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                                        {formData.location}
                                    </p>
                                )}
                            </div>
                            <span className="px-2.5 sm:px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium whitespace-nowrap flex-shrink-0 mr-5">
                                {formData.role} Member
                            </span>
                        </div>
                        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                            {formData.bio || "No bio available. Click 'Edit Profile' to add your professional information."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
                
                {loadingSubscription ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                        <ActionCard
                            icon={<UserPlus size={20} className="sm:w-6 sm:h-6" />}
                            label="Add New Patient"
                            onClick={() => handleActionClick("/addpatient", "Add Patient", false)}
                            isRestricted={false}
                        />
                        
                        <ActionCard
                            icon={<Calendar size={20} className="sm:w-6 sm:h-6" />}
                            label="View Appointments"
                            onClick={() => handleActionClick("/appointments", "View Appointments", isBasicPlan)}
                            isRestricted={isBasicPlan}
                        />
                        
                        <ActionCard
                            icon={<Users size={20} className="sm:w-6 sm:h-6" />}
                            label="Manage Staff"
                            onClick={() => handleActionClick("/staff", "Manage Staff", isBasicPlan)}
                            isRestricted={isBasicPlan}
                        />
                        
                        <ActionCard
                            icon={<Gift size={20} className="sm:w-6 sm:h-6" />}
                            label="Refers & Earn"
                            onClick={() => handleActionClick("/share", "Refers & Earn", false)}
                            isRestricted={false}
                        />
                    </div>
                )}
            </div>
            
            {/* Upgrade Modal */}
            <UpgradeModal
                isVisible={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                feature={restrictedFeature}
                currentPlan={subscriptionData?.planType || 'Basic Plan'}
                navigate={navigate}
            />
        </div>
    );
}


const PersonalInfoTab = memo(function PersonalInfoTab({ 
    formData, 
    handleInputChange, 
    isEditing, 
    profileImagePreview, 
    handleFileSelect, 
    handleDeleteImage, 
    uploadingImage, 
    fileInputRef,
    imageLoadError,
    handleImageError,
    handleImageLoad
}) {
    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="flex justify-center">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 w-full">
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6">Personal Information</h3>
                
                <div className="flex flex-col items-center mb-6 sm:mb-8">
                    <div className="relative">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-100 flex items-center justify-center text-xl sm:text-2xl font-bold text-blue-600 overflow-hidden border-4 border-white shadow-lg relative">
                            {profileImagePreview && !imageLoadError && (
                                <img 
                                    src={profileImagePreview} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                    onError={handleImageError}
                                    onLoad={handleImageLoad}
                                />
                            )}
                            <div className={`fallback-initial w-full h-full flex items-center justify-center absolute inset-0 ${profileImagePreview && !imageLoadError ? 'hidden' : 'flex'}`}>
                                {getInitials(formData.name)}
                            </div>
                        </div>
                        
                        {isEditing && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-1.5 sm:p-2 rounded-full shadow-lg transition-colors disabled:opacity-50 cursor-pointer"
                                title="Upload new image"
                            >
                                {uploadingImage ? (
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Camera size={14} className="sm:w-4 sm:h-4" />
                                )}
                            </button>
                        )}
                    </div>
                    
                    {isEditing && (
                        <div className="flex gap-2 mt-3 sm:mt-4">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingImage}
                                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                <Upload size={12} className="sm:w-3.5 sm:h-3.5" />
                                Upload Image
                            </button>
                            
                            {profileImagePreview && (
                                <button
                                    onClick={handleDeleteImage}
                                    disabled={uploadingImage}
                                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                                    Remove
                                </button>
                            )}
                        </div>
                    )}
                    
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        className="hidden"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {[
                        { label: "Full Name", name: "name", placeholder: "e.g. Dr. John Smith" },
                        { label: "Email", name: "email", placeholder: "e.g. john.smith@email.com", disabled: true },
                        { label: "Phone", name: "phone", placeholder: "e.g. 9876543210" },
                        { label: "Specialization", name: "specialization", placeholder: "e.g. General Practice" },
                        { label: "Qualification", name: "qualification", placeholder: "e.g. MBBS, MD" },
                        { label: "Location", name: "location", placeholder: "e.g. City, State" },
                    ].map((field) => (
                        <div key={field.name}>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                                {field.label}
                                {field.disabled && <span className="text-gray-400 ml-1">(Read-only)</span>}
                            </label>
                         <input
                              type="text"
                               name={field.name}
                              value={formData[field.name] || ""}
                              onChange={(e) => {
                            // If it's the phone field, restrict to 10 digits only
                           if (field.name === "phone") {
                               const value = e.target.value.replace(/\D/g, ""); // Remove non-digits
                           if (value.length <= 10) {
                            handleInputChange({ target: { name: field.name, value } });
                                    }
                         } else {
                               handleInputChange(e);
                                  }
                            }}
                          placeholder={field.placeholder}
                         disabled={!isEditing || field.disabled}
                          maxLength={field.name === "phone" ? 10 : undefined}
                         className={`w-full border rounded-lg px-3 py-2 sm:py-2.5 text-xs sm:text-sm transition-colors ${
                        isEditing && !field.disabled
                     ? "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                     : "bg-gray-50 border-gray-200 text-gray-600"
                         } focus:outline-none`}
                         />

                        </div>
                    ))}
                    <div className="sm:col-span-2">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio || ""}
                            onChange={handleInputChange}
                            placeholder="Tell us about yourself and your practice..."
                            disabled={!isEditing}
                            rows={4}
                            className={`w-full border rounded-lg px-3 py-2 sm:py-2.5 text-xs sm:text-sm transition-colors resize-none ${
                                isEditing
                                    ? "bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                    : "bg-gray-50 border-gray-200 text-gray-600"
                            } focus:outline-none`}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

function SubscriptionTab({ subscriptionData, navigate }) {
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'trial':
                return 'bg-blue-100 text-blue-800';
            case 'expired':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />;
            case 'trial':
                return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />;
            case 'expired':
                return <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />;
            default:
                return <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />;
        }
    };

    const getPlanDisplayName = (planName) => {
        const planMap = {
            'Free Trial': '3-Day Free Trial',
            'Monthly Plan': 'Professional Monthly',
            'Yearly Plan': 'Enterprise Yearly'
        };
        return planMap[planName] || planName;
    };

    if (!subscriptionData) {
        return (
            <div className="flex justify-center">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 w-full max-w-2xl text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-4">
                        Subscribe to unlock advanced features and grow your practice with powerful tools.
                    </p>
                    <button
                        onClick={() => navigate('/pricing')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base cursor-pointer"
                    >
                        View Pricing Plans
                    </button>
                </div>
            </div>
        );
    }

    const daysLeftPercentage = subscriptionData.planName === 'Free Trial' 
        ? (subscriptionData.daysLeft / 7) * 100
        : subscriptionData.planName === 'Monthly Plan'
        ? (subscriptionData.daysLeft / 30) * 100
        : (subscriptionData.daysLeft / 365) * 100;

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Current Subscription</h3>
                            <p className="text-xs sm:text-sm text-gray-600">Your active plan details</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        {getStatusIcon(subscriptionData.status)}
                        <span className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscriptionData.status)}`}>
                            {subscriptionData.status === 'active' ? 'Active' : 
                             subscriptionData.status === 'trial' ? 'Free Trial' : 'Expired'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                    <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold text-gray-900 break-words">
                            {getPlanDisplayName(subscriptionData.planName)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">Current Plan</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className={`text-lg sm:text-2xl font-bold ${subscriptionData.isExpiringSoon ? 'text-orange-600' : 'text-blue-600'}`}>
                            {subscriptionData.daysLeft}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">Days Remaining</div>
                        {subscriptionData.isExpiringSoon && (
                            <div className="text-xs text-orange-600 mt-1">⚠️ Expiring Soon</div>
                        )}
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold text-gray-900">
                            {subscriptionData.validUntil}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">Valid Until</div>
                    </div>
                </div>

                <div className="mt-4 sm:mt-6">
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                        <span>Time Used</span>
                        <span>{Math.round(100 - daysLeftPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className={`h-2 rounded-full transition-all ${
                                subscriptionData.isExpiringSoon ? 'bg-orange-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.round(100 - daysLeftPercentage)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                        onClick={() => navigate('/pricing')}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base cursor-pointer"
                    >
                        {subscriptionData.planName === 'Free Trial' ? 'Upgrade Plan' : 'Change Plan'}
                    </button>
                    <button
                        onClick={() => navigate('/billing')}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base cursor-pointer"
                    >
                        View Billing
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Plan Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {subscriptionData.features && subscriptionData.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 sm:gap-3">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-700">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Usage Statistics</h4>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    Track your usage across various features and services
                </p>
                <div className="space-y-3 sm:space-y-4">
                    <div>
                        <div className="flex justify-between text-xs sm:text-sm mb-2">
                            <span className="text-gray-600">Patients Added</span>
                           
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}