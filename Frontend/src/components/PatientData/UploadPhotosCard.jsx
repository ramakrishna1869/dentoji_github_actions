import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  X, 
  Upload, 
  Eye, 
  Download, 
  Edit3, 
  Tag, 
  Calendar,
  FileText,
  Filter,
  Grid,
  List,
  Search
} from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import { useParams } from 'react-router-dom'; // Add this import

export default function EnhancedUploadPhotosCard({ patientData, onPhotosUpdate }) {
  const { hospitalId: urlHospitalId, patientId: urlPatientId } = useParams(); // Get from URL
  const fileInputRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [viewMode, setViewMode] = useState('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hospitalId, setHospitalId] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Photo categories
  const categories = [
    // { value: 'general', label: 'General', color: 'bg-gray-500' },
    { value: 'before-treatment', label: 'Before Treatment', color: 'bg-red-500' },
    { value: 'during-treatment', label: 'During Treatment', color: 'bg-yellow-500' },
    { value: 'after-treatment', label: 'After Treatment', color: 'bg-green-500' },
    // { value: 'x-ray', label: 'X-Ray', color: 'bg-purple-500' },
    // { value: 'intraoral', label: 'Intraoral', color: 'bg-blue-500' },
    // { value: 'extraoral', label: 'Extraoral', color: 'bg-indigo-500' },
    // { value: 'smile', label: 'Smile', color: 'bg-pink-500' },
    // { value: 'consultation', label: 'Consultation', color: 'bg-orange-500' }
  ];

  // Initialize hospital ID and user data from token and patientData
  useEffect(() => {
    const initializeUserData = () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decoded = jwtDecode(token);
          setUserRole(decoded.role);
          
          // Set hospital ID from token first, then from patient data if available
          if (decoded.hospitalId) {
            setHospitalId(decoded.hospitalId);
          } else if (patientData?.hospitalId) {
            setHospitalId(patientData.hospitalId);
          }
        }
      } catch (error) {
       // console.error('Error initializing user data:', error);
      }
    };

    initializeUserData();
  }, [patientData]);

  // Helper function to get patient ID - handles multiple possible field names
  const getPatientId = () => {
    if (!patientData) {
      // console.warn('patientData is null or undefined');
      return urlPatientId || null; // Fallback to URL param
    }
    
    // Based on your data structure, use _id as the primary patient ID
    // Also try URL param as fallback
    return patientData._id || urlPatientId;
  };

  // Helper function to get hospital ID
  const getHospitalId = () => {
    // Try multiple sources: URL params, patient data, token state
    return urlHospitalId || patientData?.hospitalId || hospitalId;
  };

  // Load existing photos on component mount and when dependencies change
  useEffect(() => {
    const currentHospitalId = getHospitalId();
    const currentPatientId = getPatientId();
    
    /*console.log('Effect triggered with:', {
      hospitalId: currentHospitalId,
      patientId: currentPatientId,
      patientData
    });*/
    
    if (currentHospitalId && currentPatientId) {
      loadPhotos();
    }
  }, [patientData, hospitalId]); // Added hospitalId as dependency

  // Load photos from backend
  const loadPhotos = async () => {
    const currentHospitalId = getHospitalId();
    const currentPatientId = getPatientId();
    
    /*console.log('Loading photos with:', {
      hospitalId: currentHospitalId,
      patientId: currentPatientId
    });*/
    
    if (!currentHospitalId || !currentPatientId) {
      console.warn('Missing hospitalId or patientId for loading photos');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/patients/${currentHospitalId}/${currentPatientId}/photos`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      //console.log("Photos response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        //console.log("Photos data:", data);
        setPhotos(data.photos || []);
      } else {
       // console.error('Failed to load photos:', response.status, await response.text());
      }
    } catch (error) {
     // console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    handleFiles(files);
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  };

  // Process selected files
  const handleFiles = async (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      alert('Please select valid image files.');
      return;
    }

    const currentHospitalId = getHospitalId();
    const currentPatientId = getPatientId();

    // Debug logging
    //console.log('handleFiles - Patient data:', patientData);
    //console.log('handleFiles - Hospital ID:', currentHospitalId);
    //console.log('handleFiles - Patient ID:', currentPatientId);

    if (!currentHospitalId || !currentPatientId) {
      alert('Patient or hospital information is missing. Please refresh the page and try again.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      
      imageFiles.forEach(file => {
        formData.append('photos', file);
      });
      
      formData.append('category', selectedCategory);
      formData.append('patientId', currentPatientId);
      formData.append('hospitalId', currentHospitalId);
      
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/patients/${currentHospitalId}/${currentPatientId}/photos`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (response.ok) {
        const result = await response.json();
        //console.log('Upload successful:', result);
        
        // Reload photos from server to get updated list
        await loadPhotos();
        
        if (onPhotosUpdate) {
          onPhotosUpdate(result.photos);
        }
        
        // Reset form
        fileInputRef.current.value = '';
        alert(`Successfully uploaded ${result.photos.length} photos!`);
        
      } else {
        const error = await response.json();
       // console.error('Upload failed:', error);
        throw new Error(error.message || 'Upload failed');
      }

    } catch (error) {
    //  console.error('Error uploading photos:', error);
      alert(`Error uploading photos: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Remove photo
  const removePhoto = async (photoId) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    const currentHospitalId = getHospitalId();
    const currentPatientId = getPatientId();
    
    if (!currentHospitalId || !currentPatientId) {
      alert('Missing patient or hospital information');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/patients/${currentHospitalId}/${currentPatientId}/photos/${photoId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        // Reload photos
        await loadPhotos();
        alert('Photo deleted successfully!');
      } else {
        throw new Error('Failed to delete photo');
      }
    } catch (error) {
     // console.error('Error deleting photo:', error);
      alert('Error deleting photo. Please try again.');
    }
  };

  // Update photo metadata
  const updatePhoto = async (photoId, metadata) => {
    const currentHospitalId = getHospitalId();
    const currentPatientId = getPatientId();
    
    if (!currentHospitalId || !currentPatientId) {
      alert('Missing patient or hospital information');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/patients/${currentHospitalId}/${currentPatientId}/photos/${photoId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(metadata)
        }
      );
      
      if (response.ok) {
        await loadPhotos();
        setEditingPhoto(null);
        alert('Photo updated successfully!');
      } else {
        throw new Error('Failed to update photo');
      }
    } catch (error) {
     // console.error('Error updating photo:', error);
      alert('Error updating photo. Please try again.');
    }
  };

  // Filter photos based on category and search
  const filteredPhotos = photos.filter(photo => {
    const matchesCategory = filterCategory === 'all' || photo.category === filterCategory;
    const matchesSearch = !searchTerm || 
      photo.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Get category info
  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || categories[0];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="font-semibold flex items-center text-gray-800 text-lg">
          <Camera className="w-6 h-6 mr-2 text-blue-500" />
          Dental Photos
          {photos.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
              {photos.length}
            </span>
          )}
        </h3>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <button 
            onClick={handleUploadClick}
            disabled={uploading || !getPatientId() || !getHospitalId()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Photos
              </>
            )}
          </button>
        </div>
      </div>

      {/* Debug Info - Enhanced */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs space-y-1">
          <div><strong>Debug Info:</strong></div>
          <div>Hospital ID: <code>{getHospitalId() || 'Missing'}</code></div>
          <div>Patient ID: <code>{getPatientId() || 'Missing'}</code></div>
          <div>Patient Data Keys: <code>{patientData ? Object.keys(patientData).join(', ') : 'No patient data'}</code></div>
          <div>URL Hospital ID: <code>{urlHospitalId || 'Not available'}</code></div>
          <div>URL Patient ID: <code>{urlPatientId || 'Not available'}</code></div>
          <div>User Role: <code>{userRole || 'Not set'}</code></div>
          <div>Photos Count: <code>{photos.length}</code></div>
        </div>
      )} */}

      {/* Warning for missing data */}
      {(!getPatientId() || !getHospitalId()) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center text-red-700">
            <X className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              Missing required data: {!getPatientId() && 'Patient ID'} {!getHospitalId() && 'Hospital ID'}
            </span>
          </div>
          <p className="text-red-600 text-xs mt-1">
            Photo upload is disabled. Please ensure you're accessing this from a valid patient page.
          </p>
        </div>
      )}

      {/* Upload Controls */}
      <div className="mb-6">
        {/* Category Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Drag and drop area */}
        <div
        onClick={handleUploadClick}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${(!getPatientId() || !getHospitalId()) ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop images here, or{' '}
            <button 
              className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              disabled={!getPatientId() || !getHospitalId()}
            >
              click to browse
            </button>
          </p>
          <p className="text-xs text-gray-500">
            Supports: JPG, PNG, GIF, WebP, BMP, TIFF (Max 10MB per file)
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      {photos.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading photos...</p>
        </div>
      )}

      {/* Photos Display */}
      {!loading && (
        <>
          {filteredPhotos.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'space-y-3'
            }>
              {filteredPhotos.map((photo, idx) => (
                <div 
                  key={photo._id || idx} 
                  className={`
                    relative group bg-gray-50 rounded-lg overflow-hidden
                    ${viewMode === 'grid' ? 'aspect-square' : 'flex items-center p-3'}
                  `}
                >
                  {viewMode === 'grid' ? (
                    // Grid View
                    <>
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}${photo.url}`}
                        alt={photo.originalName}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => {
                          setSelectedPhoto(photo);
                          setShowPhotoModal(true);
                        }}
                      />
                      
                      {/* Category Badge */}
                      <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs text-white ${getCategoryInfo(photo.category).color}`}>
                        {getCategoryInfo(photo.category).label}
                      </div>
                      
                      {/* Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => {
                            setSelectedPhoto(photo);
                            setShowPhotoModal(true);
                          }}
                          className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingPhoto(photo)}
                          className="bg-green-500 text-white rounded-full p-1 hover:bg-green-600 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removePhoto(photo._id)}
                          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {/* Photo Info */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
                        <p className="text-xs truncate">{photo.originalName}</p>
                        {photo.description && (
                          <p className="text-xs text-gray-300 truncate">{photo.description}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    // List View
                    <>
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL}${photo.url}`}
                        alt={photo.originalName}
                        className="w-16 h-16 object-cover rounded cursor-pointer mr-4"
                        onClick={() => {
                          setSelectedPhoto(photo);
                          setShowPhotoModal(true);
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {photo.originalName}
                        </h4>
                        {photo.description && (
                          <p className="text-sm text-gray-600 truncate">{photo.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs text-white ${getCategoryInfo(photo.category).color}`}>
                            {getCategoryInfo(photo.category).label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(photo.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4">
                        <button
                          onClick={() => {
                            setSelectedPhoto(photo);
                            setShowPhotoModal(true);
                          }}
                          className="bg-blue-500 text-white rounded p-1 hover:bg-blue-600 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingPhoto(photo)}
                          className="bg-green-500 text-white rounded p-1 hover:bg-green-600 cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removePhoto(photo._id)}
                          className="bg-red-500 text-white rounded p-1 hover:bg-red-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              {searchTerm || filterCategory !== 'all' ? (
                <>
                  <p className="text-lg mb-2">No photos found</p>
                  <p className="text-sm">Try adjusting your search or filter criteria</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterCategory('all');
                    }}
                    className="mt-3 text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
                  >
                    Clear filters
                  </button>
                </>
              ) : (
                <>
                  <p className="text-lg mb-2">No photos uploaded yet</p>
                  <p className="text-sm text-gray-400">
                    {(!getPatientId() || !getHospitalId()) 
                      ? "Missing patient or hospital information"
                      : "Click the upload button to add dental photos"
                    }
                  </p>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Photo Modal */}
      {showPhotoModal && selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => {
            setShowPhotoModal(false);
            setSelectedPhoto(null);
          }}
          categories={categories}
        />
      )}

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <EditPhotoModal
          photo={editingPhoto}
          categories={categories}
          onSave={(photoId, metadata) => updatePhoto(photoId, metadata)}
          onClose={() => setEditingPhoto(null)}
        />
      )}
    </div>
  );
}

// Photo Modal Component
function PhotoModal({ photo, onClose, categories }) {
  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || categories[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{photo.originalName}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-80px)]">
          {/* Image */}
          <div className="flex-1 flex items-center justify-center bg-gray-100 min-h-96">
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}${photo.url}`}
              alt={photo.originalName}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* Details */}
          <div className="lg:w-80 p-4 border-l overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <div className={`inline-block px-3 py-1 rounded-full text-sm text-white mt-1 ${getCategoryInfo(photo.category).color}`}>
                  {getCategoryInfo(photo.category).label}
                </div>
              </div>
              
              {photo.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-sm text-gray-600 mt-1">{photo.description}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-700">Upload Date</label>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(photo.uploadedAt).toLocaleString()}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">File Size</label>
                <p className="text-sm text-gray-600 mt-1">
                  {(photo.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              
              {photo.uploadedBy && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Uploaded By</label>
                  <p className="text-sm text-gray-600 mt-1">
                    {photo.uploadedBy.firstName} {photo.uploadedBy.lastName}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Photo Modal Component
function EditPhotoModal({ photo, categories, onSave, onClose }) {
  const [description, setDescription] = useState(photo.description || '');
  const [category, setCategory] = useState(photo.category || 'general');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(photo._id, { description, category });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Edit Photo</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a description for this photo..."
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}