import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Search,
  Grid,
  List,
  Eye,
  Edit3,
  X,
  Camera,
} from 'lucide-react';

const categories = [
  // { value: 'general', label: 'General', color: 'bg-gray-500' },
  // { value: 'before-treatment', label: 'Before Treatment', color: 'bg-red-500' },
  // { value: 'during-treatment', label: 'During Treatment', color: 'bg-yellow-500' },
  // { value: 'after-treatment', label: 'After Treatment', color: 'bg-green-500' },
  { value: 'x-ray', label: 'X-Ray', color: 'bg-purple-500' },
  { value: 'intraoral', label: 'Intraoral', color: 'bg-blue-500' },
  { value: 'extraoral', label: 'Extraoral', color: 'bg-indigo-500' },
  { value: 'smile', label: 'Smile', color: 'bg-pink-500' },
  { value: 'consultation', label: 'Consultation', color: 'bg-orange-500' },
];

// Move these functions outside of any component to make them globally available in the module
const getFullImageUrl = (photoUrl) => {
  if (!photoUrl) {
    console.warn('No photo URL provided');
    return '';
  }

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // If it's already a full URL, return as is
  if (photoUrl.startsWith('http')) {
    return photoUrl;
  }

  // Handle simple filename (e.g., '1.jpg')
  if (!photoUrl.includes('/') && photoUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return `${backendUrl}/uploads/dental-photos/${photoUrl}`;
  }

  // Default to original path if it starts with /uploads/
  if (photoUrl.startsWith('/uploads/')) {
    return `${backendUrl}${photoUrl}`;
  }

  // Fallback to constructing from filename
  const filename = photoUrl.split('/').pop();
  return `${backendUrl}/uploads/dental-photos/${filename}`;
};

const handleModalImageError = (e, photo, retryCount = 0) => {
 // console.error(`Modal image failed to load (attempt ${retryCount + 1}):`, e.target.src);
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL ;
  
  if (retryCount === 0) {
    const filename = photo.originalUrl ? photo.originalUrl.split('/').pop() : '';
    const retryUrl = `${backendUrl}/uploads/dental-photos/${filename}`;
    e.target.src = retryUrl;
    e.target.setAttribute('data-retry', '1');
  } else if (retryCount === 1) {
    const filename = photo.originalUrl ? photo.originalUrl.split('/').pop() : '';
    const retryUrl = `${backendUrl}/uploads/${filename}`;
    e.target.src = retryUrl;
    e.target.setAttribute('data-retry', '2');
  } else if (retryCount === 2) {
    const retryUrl = `${backendUrl}${photo.originalUrl || photo.url}`;
    e.target.src = retryUrl;
    e.target.setAttribute('data-retry', '3');
  } else {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTIwTDI2MCAyMDBIMTQwTDIwMCAxMjBaIiBmaWxsPSIjOUI5Q0E0Ii8+CjxwYXRoIGQ9Ik0yMDAgMjQwQzIyMC45MTQgMjQwIDIzOCAyMjIuOTE0IDIzOCAyMDJDMjM4IDE4MS4wODYgMjIwLjkxNCAxNjQgMjAwIDE2NEMxNzkuMDg2IDE2NCAxNjIgMTgxLjA4NiAxNjIgMjAyQzE2MiAyMjIuOTE0IDE3OS4wODYgMjQwIDIwMCAyNDBaIiBmaWxsPSIjOUI5Q0E0Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5Q0E0IiBmb250LXNpemU9IjE0Ij5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPgo=';
    e.target.alt = 'Image failed to load';
  }
};

const PhotoModal = ({ photo, onClose, show }) => {
  if (!show || !photo) return null;

  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || { label: 'General', color: 'bg-gray-500' };
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-75 flex items-center justify-center z-50 p-4 ">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">{photo.originalName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <img
            src={getFullImageUrl(photo.originalUrl || photo.url)}
            alt={photo.originalName}
            className="w-full h-auto max-h-96 object-contain rounded"
            onError={(e) => {
              const retryCount = parseInt(e.target.getAttribute('data-retry') || '0');
              handleModalImageError(e, photo, retryCount);
            }}
            loading="lazy"
          />
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full text-xs text-white ${getCategoryInfo(photo.category).color}`}>
                {getCategoryInfo(photo.category).label}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(photo.uploadedAt).toLocaleDateString()}
              </span>
            </div>
            {photo.description && (
              <p className="text-gray-700">{photo.description}</p>
            )}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                <strong>Debug:</strong>
                <br />Original URL: {photo.originalUrl || photo.url}
                <br />Processed URL: {getFullImageUrl(photo.originalUrl || photo.url)}
                <br />Backend URL: {import.meta.env.VITE_BACKEND_URL}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditPhotoModal = ({ photo, onSave, onClose, show }) => {
  const [description, setDescription] = useState(photo?.description || '');
  const [category, setCategory] = useState(photo?.category || 'general');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (photo) {
      setDescription(photo.description || '');
      setCategory(photo.category || 'general');
    }
  }, [photo]);

  if (!show || !photo) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(photo._id, { description, category });
      onClose();
    } catch (error) {
      //console.error('Failed to save photo:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Edit Photo</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Add a description..."
            />
          </div>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PhotoManagement = ({
  photos = [],
  uploading,
  selectedCategory,
  setSelectedCategory,
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  onUploadClick,
  onFileSelect,
  onRemovePhoto,
  onViewPhoto,
  onEditPhoto,
  getPatientId,
  getHospitalId,
}) => {
  const fileInputRef = useRef(null);

  const getCategoryInfo = (categoryValue) =>
    categories.find((cat) => cat.value === categoryValue) || {
      label: 'General',
      color: 'bg-gray-500',
    };

  const filteredPhotos = photos.filter((photo) => {
    const matchesSearch =
      (photo.originalName || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (photo.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || photo.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          {photos.length > 0 && (
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
          )}

          <button
            onClick={() => {
              if (onUploadClick) onUploadClick();
              fileInputRef.current?.click();
            }}
            disabled={uploading || !getPatientId() || !getHospitalId()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin cursor-pointer"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 " /> 
              </>
            )}
          </button>
        </div>
      </div>

      {(!getPatientId() || !getHospitalId()) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <div className="flex items-center text-red-700">
            <X className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              Missing required data: {!getPatientId() && 'Patient ID'}{' '}
              {!getHospitalId() && 'Hospital ID'}
            </span>
          </div>
          <p className="text-red-600 text-xs mt-1">
            Photo upload is disabled. Please ensure you're on a valid patient
            page.
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={onFileSelect}
        className="hidden"
      />

      {photos.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {filteredPhotos.length > 0 ? (
        <div
          className={
            viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-3'
          }
        >
          {filteredPhotos.map((photo, idx) => (
            <div
              key={photo._id || idx}
              className={`relative group bg-gray-50 rounded-lg overflow-hidden ${
                viewMode === 'grid'
                  ? 'aspect-square'
                  : 'flex items-center gap-4 p-3'
              }`}
            >
              {viewMode === 'grid' ? (
                <>
                  <img
                    src={getFullImageUrl(photo.url || photo.originalUrl)}
                    alt={photo.originalName || 'Photo'}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => onViewPhoto(photo)}
                    onError={(e) => {
                      const retryCount = parseInt(e.target.getAttribute('data-retry') || '0');
                      handleModalImageError(e, photo, retryCount);
                    }}
                  />
                  <div
                    className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs text-white ${
                      getCategoryInfo(photo.category).color
                    }`}
                  >
                    {getCategoryInfo(photo.category).label}
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => onViewPhoto(photo)}
                      className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onEditPhoto(photo)}
                      className="bg-green-500 text-white rounded-full p-1 hover:bg-green-600 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onRemovePhoto(photo._id)}
                      className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
                    <p className="text-xs truncate">
                      {photo.originalName || 'Untitled'}
                    </p>
                    {photo.description && (
                      <p className="text-xs text-gray-300 truncate">
                        {photo.description}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={getFullImageUrl(photo.url || photo.originalUrl)}
                    alt={photo.originalName || 'Photo'}
                    className="w-20 h-20 object-cover rounded cursor-pointer"
                    onClick={() => onViewPhoto(photo)}
                    onError={(e) => {
                      const retryCount = parseInt(e.target.getAttribute('data-retry') || '0');
                      handleModalImageError(e, photo, retryCount);
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {photo.originalName || 'Untitled'}
                    </h4>
                    {photo.description && (
                      <p className="text-sm text-gray-600 truncate">
                        {photo.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs text-white ${
                          getCategoryInfo(photo.category).color
                        }`}
                      >
                        {getCategoryInfo(photo.category).label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {photo.uploadedAt
                          ? new Date(photo.uploadedAt).toLocaleDateString()
                          : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <button
                      onClick={() => onViewPhoto(photo)}
                      className="bg-blue-500 text-white rounded p-1 hover:bg-blue-600 cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditPhoto(photo)}
                      className="bg-green-500 text-white rounded p-1 hover:bg-green-600 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemovePhoto(photo._id)}
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
        <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg  ">
          <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          {searchTerm || filterCategory !== 'all' ? (
            <>
              <p className="text-lg mb-2">No photos found</p>
              <p className="text-sm">
                Try adjusting your search or filter criteria
              </p>
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
              <p className="text-lg">No photos uploaded yet</p>
              <p className="text-sm text-gray-400">
                {!getPatientId() || !getHospitalId()
                  ? 'Missing patient or hospital information'
                  : 'Click the upload button above to add dental photos'}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Export the functions explicitly
export { 
  PhotoModal, 
  EditPhotoModal, 
  PhotoManagement, 
  categories, 
  getFullImageUrl, 
  handleModalImageError 
};
export default PhotoManagement;