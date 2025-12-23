import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getFullImageUrl, handleModalImageError, categories } from './PhotoManagement'; // Adjust the import path as needed

const ActionButtons = ({ patientId, photos, onRemovePhoto, onViewProforma }) => {
  const [showPhotosModal, setShowPhotosModal] = useState(false);
  const [displayPhotos, setDisplayPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleViewPhotos = async () => {
    if (!patientId) {
      setError('Patient ID is required to view photos.');
      return;
    }
    setShowPhotosModal(true);
    await fetchPhotos();
  };

  const fetchPhotos = async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dentalchart/${patientId}/photos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || localStorage.getItem('token') || ''}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch photos');
      const data = await response.json();
      setDisplayPhotos(data.photos || []);
    } catch (err) {
    //  console.error('Error fetching photos:', err);
      setError(`Failed to load photos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = async (photoId) => {
    if (!patientId || !photoId) {
      setError('Patient ID and photo ID are required to remove a photo.');
      return;
    }
    try {
      await onRemovePhoto(photoId);
      setDisplayPhotos(prevPhotos => prevPhotos.filter(photo => photo._id !== photoId));
    } catch (err) {
     // console.error('Error removing photo:', err);
      setError(`Failed to remove photo: ${err.message}`);
    }
  };

  const handleCloseModal = () => {
    setShowPhotosModal(false);
    setError(null); // Clear error when closing modal
  };

  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || { label: 'General', color: 'bg-gray-500' };
  };

  useEffect(() => {
    if (showPhotosModal && patientId) {
      fetchPhotos();
    }
    if (showPhotosModal && photos) {
      setDisplayPhotos(photos);
    }
  }, [showPhotosModal, patientId, photos]);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <button 
          onClick={handleViewPhotos}
          className="w-full sm:w-auto px-8 py-3 bg-[#4264D0] cursor-pointer text-white rounded-lg font-semibold transition-all duration-200 transform shadow-lg hover:bg-[#3451B2]"
          disabled={!patientId}
        >
          View Photos
        </button>
        <button
          onClick={onViewProforma}
          className="w-full sm:w-auto px-8 py-3 border border-[#0EA5E9] text-[#0EA5E9] bg-white cursor-pointer rounded-lg font-semibold transition-all duration-200 transform hover:bg-[#0EA5E9] hover:text-white"
          disabled={!patientId}
        >
          View Proforma
        </button>
      </div>

      {showPhotosModal && (
        <div className="fixed  inset-0 bg-black/30 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">All Uploaded Photos</h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">Loading photos...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p className="text-lg">{error}</p>
                  {patientId && (
                    <button
                      onClick={fetchPhotos}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      Retry
                    </button>
                  )}
                </div>
              ) : displayPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {displayPhotos.map((photo) => (
                    <div
                      key={photo._id}
                      className="relative group bg-gray-50 rounded-lg overflow-hidden aspect-square"
                    >
                      <img
                        src={getFullImageUrl(photo.originalUrl || photo.url)}
                        alt={photo.originalName || `Photo ${photo._id}`}
                        className="w-full h-full object-cover cursor-pointer"
                        onError={(e) => {
                          const retryCount = parseInt(e.target.getAttribute('data-retry') || '0');
                          handleModalImageError(e, photo, retryCount);
                        }}
                        loading="lazy"
                      />
                      <div
                        className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs text-white ${
                          getCategoryInfo(photo.category).color
                        }`}
                      >
                        {getCategoryInfo(photo.category).label}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 flex justify-between items-center">
                        <div>
                          <p className="text-xs truncate">
                            {photo.originalName || 'Untitled'}
                          </p>
                          {photo.description && (
                            <p className="text-xs text-gray-300 truncate">
                              {photo.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemovePhoto(photo._id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium bg-red-100 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-200 transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg">No photos uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActionButtons;