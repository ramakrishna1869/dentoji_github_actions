import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const categories = [
    { value: 'general', label: 'General', color: 'bg-gray-500' },
    { value: 'before-treatment', label: 'Before Treatment', color: 'bg-red-500' },
    { value: 'during-treatment', label: 'During Treatment', color: 'bg-yellow-500' },
    { value: 'after-treatment', label: 'After Treatment', color: 'bg-green-500' },
    { value: 'x-ray', label: 'X-Ray', color: 'bg-purple-500' },
    { value: 'intraoral', label: 'Intraoral', color: 'bg-blue-500' },
    { value: 'extraoral', label: 'Extraoral', color: 'bg-indigo-500' },
    { value: 'smile', label: 'Smile', color: 'bg-pink-500' },
    { value: 'consultation', label: 'Consultation', color: 'bg-orange-500' }
];

const PhotoModal = ({ photo, onClose, show }) => {
    if (!show || !photo) return null;

    const getCategoryInfo = (categoryValue) => {
        return categories.find(cat => cat.value === categoryValue) || { label: 'General', color: 'bg-gray-500' };
    };

    // FIXED: Enhanced image URL construction for modal
    const getFullImageUrl = (photoUrl) => {
        if (!photoUrl) {
            console.warn('No photo URL provided');
            return '';
        }

        const backendUrl = import.meta.env.VITE_BACKEND_URL ;

        // If it's already a full URL, return as is
        if (photoUrl.startsWith('http')) {
            //console.log('Full URL detected:', photoUrl);
            return photoUrl;
        }

        // Handle different URL formats from your data structure
        let normalizedUrl = photoUrl;
        
        // If URL starts with /uploads/, use it directly
        if (photoUrl.startsWith('/uploads/')) {
            normalizedUrl = photoUrl;
        } 
        // If it's just a filename, construct the full path
        else if (!photoUrl.includes('/')) {
            normalizedUrl = `/uploads/dental-photos/${photoUrl}`;
        }
        // If it starts with dental-, it might be a filename
        else if (photoUrl.includes('dental-')) {
            normalizedUrl = `/uploads/dental-photos/${photoUrl.split('/').pop()}`;
        }

        const fullUrl = `${backendUrl}${normalizedUrl}`;
        //console.log('Modal - Constructed image URL:', fullUrl);
        return fullUrl;
    };

    // FIXED: Enhanced error handling for modal images with better retry logic
    const handleModalImageError = (e, photo, retryCount = 0) => {
       // console.error(`Modal image failed to load (attempt ${retryCount + 1}):`, e.target.src);
        
        const backendUrl = import.meta.env.VITE_BACKEND_URL ;
        
        if (retryCount === 0) {
            // First retry: try with /dental-photos/ path
            const filename = photo.originalUrl ? photo.originalUrl.split('/').pop() : '';
            const retryUrl = `${backendUrl}/uploads/dental-photos/${filename}`;
            //console.log('Modal Retry 1 - trying dental-photos path:', retryUrl);
            e.target.src = retryUrl;
            e.target.setAttribute('data-retry', '1');
        } else if (retryCount === 1) {
            // Second retry: try direct uploads path
            const filename = photo.originalUrl ? photo.originalUrl.split('/').pop() : '';
            const retryUrl = `${backendUrl}/uploads/${filename}`;
            //console.log('Modal Retry 2 - trying uploads root:', retryUrl);
            e.target.src = retryUrl;
            e.target.setAttribute('data-retry', '2');
        } else if (retryCount === 2) {
            // Third retry: try the original URL as stored
            const retryUrl = `${backendUrl}${photo.originalUrl || photo.url}`;
            //console.log('Modal Retry 3 - trying original URL:', retryUrl);
            e.target.src = retryUrl;
            e.target.setAttribute('data-retry', '3');
        } else {
            // Final fallback: show placeholder
           // console.error('Modal: All image load attempts failed for:', photo.originalUrl || photo.url);
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTIwTDI2MCAyMDBIMTQwTDIwMCAxMjBaIiBmaWxsPSIjOUI5Q0E0Ii8+CjxwYXRoIGQ9Ik0yMDAgMjQwQzIyMC45MTQgMjQwIDIzOCAyMjIuOTE0IDIzOCAyMDJDMjM4IDE4MS4wODYgMjIwLjkxNCAxNjQgMjAwIDE2NEMxNzkuMDg2IDE2NCAxNjIgMTgxLjA4NiAxNjIgMjAyQzE2MiAyMjIuOTE0IDE3OS4wODYgMjQwIDIwMCAyNDBaIiBmaWxsPSIjOUI5Q0E0Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5Q0E0IiBmb250LXNpemU9IjE0Ij5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPgo=';
            e.target.alt = 'Image failed to load';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-75 flex items-center justify-center z-50 p-4">
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
                        {/* Debug info for development */}
                       
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
           // console.error('Failed to save photo:', error);
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

export { PhotoModal, EditPhotoModal, categories };