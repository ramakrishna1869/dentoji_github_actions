//Teethset.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import DentalSVGChart from './Teethset/DentalSVGChart';
import ToothModal from './Teethset/ToothModal';
import ColorLegend, { dentalIssues } from './Teethset/ColorLegend';
import ChartTypeToggle from './Teethset/ChartTypeToggle';
import ProformaModal from './Teethset/ProformaModal';
import CommentSystem from './Teethset/CommentSystem';
import IssuesSummary from './Teethset/IssuesSummary';
import ActionButtons from './Teethset/ActionButtons';
import { PhotoModal, EditPhotoModal } from './Teethset/PhotoModals';

const DentalChart = ({ patientId: propPatientId, requireAuth = false }) => {
    const navigate = useNavigate();
    const { patientId: paramPatientId, hospitalId } = useParams();

    // Use patientId from props first, then from params
    const patientId = propPatientId || paramPatientId;

    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Chart state
    const [isAdult, setIsAdult] = useState(true);
    const [toothIssues, setToothIssues] = useState({});
    const [notes, setNotes] = useState({});

    // Modal states
    const [showToothModal, setShowToothModal] = useState(false);
    const [showProformaModal, setShowProformaModal] = useState(false);
    const [currentTooth, setCurrentTooth] = useState(null);

    // Proforma data
    const [proformaData, setProformaData] = useState({
        fullName: '',
        age: '',
        gender: '',
        medicalHistory: '',
        chiefComplaint: '',
        clinicalFeatures: '',
         investigationComment: '',  // ADD THIS LINE
        diagnosis: ''
    });

    // Photo upload states
    const [photos, setPhotos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('general');
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [editingPhoto, setEditingPhoto] = useState(null);

    // Comment states
    const [comments, setComments] = useState([]);
    const [nextCommentId, setNextCommentId] = useState(1);
    const [nextMessageId, setNextMessageId] = useState(1);
    const [isAddingComment, setIsAddingComment] = useState(false);
    const [draggingCommentId, setDraggingCommentId] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [currentCommentId, setCurrentCommentId] = useState(null);
    const [newCommentText, setNewCommentText] = useState('');

    // Patient data states
    const [patientData, setPatientData] = useState(null);
    const [loadingPatient, setLoadingPatient] = useState(false);

    // Refs
    const containerRef = useRef(null);
    const initialLoadRef = useRef(false);

    // API helper functions
    const getAuthHeaders = () => {
        const headers = {
            'Content-Type': 'application/json'
        };

        const token = localStorage.getItem('authToken') ||
            sessionStorage.getItem('authToken') ||
            localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    };

    // Handle input change for proforma data
    const handleInputChange = (field, value) => {
        setProformaData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Simplified response handler
    const handleApiResponse = async (response, operation = 'operation') => {
        if (!response.ok) {
            let errorMessage = `${operation} failed: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
                console.warn('Could not parse error response');
            }
            throw new Error(errorMessage);
        }

        try {
            return await response.json();
        } catch (parseError) {
          //  console.error('Failed to parse JSON response:', parseError);
            throw new Error('Invalid response from server. Please try again.');
        }
    };

    // FIXED: Improved saveChartData function with better validation and error handling
    const saveChartData = async (
        updatedToothIssues = toothIssues,
        updatedNotes = notes,
        updatedIsAdult = isAdult,
        updatedProforma = proformaData,
        updatedComments = comments
    ) => {
        try {
            //console.log('[saveChartData] Starting save process...');
            //console.log('[saveChartData] Patient ID:', patientId);
            
            // Validate required data
            if (!patientId) {
                throw new Error('Patient ID is required');
            }

            // Sanitize and validate the payload
            const payload = {
                isAdult: Boolean(updatedIsAdult),
                toothIssues: {},
                notes: {},
                comments: Array.isArray(updatedComments) ? updatedComments : []
            };

            // Clean up tooth issues - only include valid entries
            if (updatedToothIssues && typeof updatedToothIssues === 'object') {
                Object.entries(updatedToothIssues).forEach(([toothId, issues]) => {
                    if (Array.isArray(issues) && issues.length > 0) {
                        // Filter out any invalid issue types
                        const validIssues = issues.filter(issue => 
                            typeof issue === 'string' && 
                            ['cavity', 'gumDisease', 'filling', 'missing', 'rootCanal', 'other'].includes(issue)
                        );
                        if (validIssues.length > 0) {
                            payload.toothIssues[toothId] = validIssues;
                        }
                    }
                });
            }

            // Clean up notes - only include non-empty strings
            if (updatedNotes && typeof updatedNotes === 'object') {
                Object.entries(updatedNotes).forEach(([toothId, note]) => {
                    if (typeof note === 'string' && note.trim()) {
                        payload.notes[toothId] = note.trim();
                    }
                });
            }

            // Include proforma data if it has content
            if (updatedProforma && typeof updatedProforma === 'object') {
                const hasContent = Object.values(updatedProforma).some(value => 
                    typeof value === 'string' && value.trim()
                );
                
                if (hasContent) {
                    payload.proformaData = {
                        fullName: (updatedProforma.fullName || '').toString().trim(),
                        age: (updatedProforma.age || '').toString().trim(),
                        gender: (updatedProforma.gender || '').toString().trim(),
                        medicalHistory: (updatedProforma.medicalHistory || '').toString().trim(),
                        chiefComplaint: (updatedProforma.chiefComplaint || '').toString().trim(),
                        clinicalFeatures: (updatedProforma.clinicalFeatures || '').toString().trim(),
                        investigationComment: (updatedProforma.investigationComment || '').toString().trim(),  // ADD THIS LINE
                        diagnosis: (updatedProforma.diagnosis || '').toString().trim()
                    };
                }
            }

            // Include hospital ID if available
            if (hospitalId) {
                payload.hospitalId = hospitalId;
            }

            //console.log('[saveChartData] Clean payload:', JSON.stringify(payload, null, 2));

            // Make the API request with improved error handling
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/dentalchart/${patientId}`,
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(payload)
                }
            );

            //console.log('[saveChartData] Response status:', response.status);
            //console.log('[saveChartData] Response ok:', response.ok);

            // Handle non-200 responses
            if (!response.ok) {
                let errorMessage = `Save failed: ${response.status} ${response.statusText}`;
                let errorDetails = null;
                
                try {
                    const errorData = await response.json();
                   // console.error('[saveChartData] Error response:', errorData);
                    errorDetails = errorData;
                    
                    // Use the most specific error message available
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.error) {
                        errorMessage = errorData.error;
                    } else if (errorData.details) {
                        errorMessage = errorData.details;
                    }
                } catch (parseError) {
                    console.warn('[saveChartData] Could not parse error response:', parseError);
                    try {
                        const errorText = await response.text();
                       // console.error('[saveChartData] Error response text:', errorText);
                        if (errorText) errorMessage = errorText;
                    } catch (textError) {
                        console.warn('[saveChartData] Could not get error text:', textError);
                    }
                }
                
                // Create detailed error for debugging
                const error = new Error(errorMessage);
                error.status = response.status;
                error.statusText = response.statusText;
                error.details = errorDetails;
                throw error;
            }

            // Parse successful response
            let data;
            try {
                data = await response.json();
                //console.log('[saveChartData] Success response:', data);
            } catch (parseError) {
               // console.error('[saveChartData] Failed to parse success response:', parseError);
                throw new Error('Invalid response from server. Please try again.');
            }
            
            // Check for success flag in response
            if (data.success === false) {
                const errorMessage = data.message || data.error || 'Backend returned success: false';
                const error = new Error(errorMessage);
                error.backendResponse = data;
                throw error;
            }
            
            //console.log('[saveChartData] Chart saved successfully');
            return data;

        } catch (err) {
           // console.error('[saveChartData] Error saving dental chart:', err);
          /* console.error('[saveChartData] Error details:', {
                message: err.message,
                status: err.status,
                statusText: err.statusText,
                details: err.details,
                stack: err.stack
            });*/
            
            // Re-throw with user-friendly message
            let userMessage = 'Failed to save dental chart';
            
            if (err.message.includes('Failed to fetch')) {
                userMessage = 'Unable to connect to server. Please check your internet connection and try again.';
            } else if (err.status === 400) {
                userMessage = err.message || 'Invalid data provided. Please check your entries and try again.';
            } else if (err.status === 401) {
                userMessage = 'Authentication failed. Please log in again.';
            } else if (err.status === 403) {
                userMessage = 'You do not have permission to perform this action.';
            } else if (err.status === 404) {
                userMessage = 'Patient record not found.';
            } else if (err.status >= 500) {
                userMessage = 'Server error. Please try again later.';
            } else if (err.message) {
                userMessage = err.message;
            }
            
            const newError = new Error(userMessage);
            newError.originalError = err;
            throw newError;
        }
    };

    // Load patient data from multiple possible endpoints
    const loadPatientData = useCallback(async () => {
        if (!patientId) return;

        try {
            setLoadingPatient(true);
            //console.log(`[DentalChart] Loading patient data for: ${patientId}`);

            const possibleEndpoints = [
                `${import.meta.env.VITE_BACKEND_URL}/api/dentalchart/${patientId}/patient`,
                hospitalId ? `${import.meta.env.VITE_BACKEND_URL}/api/patients/${hospitalId}/${patientId}` : null,
                `${import.meta.env.VITE_BACKEND_URL}/api/patients/${patientId}`,
                `${import.meta.env.VITE_BACKEND_URL}/api/patients/patient/${patientId}`
            ].filter(Boolean);

            let patientData = null;
            let lastError = null;

            for (const endpoint of possibleEndpoints) {
                try {
                    //console.log(`[DentalChart] Trying endpoint: ${endpoint}`);

                    const response = await fetch(endpoint, {
                        method: 'GET',
                        headers: getAuthHeaders()
                    });

                    if (response.ok) {
                        const data = await handleApiResponse(response, 'Load patient data');

                        if (data.success && data.patient) {
                            patientData = data.patient;
                        } else if (data.success && data.data) {
                            patientData = data.data;
                        } else if (data.patient) {
                            patientData = data.patient;
                        } else if (data.data) {
                            patientData = data.data;
                        } else if (data._id || data.patientId) {
                            patientData = data;
                        }

                        if (patientData) {
                            //console.log('[DentalChart] Patient data loaded from:', endpoint, patientData);
                            break;
                        }
                    }
                } catch (err) {
                    //console.log(`[DentalChart] Endpoint ${endpoint} failed:`, err.message);
                    lastError = err;
                    continue;
                }
            }

            if (patientData) {
                const normalizedPatientData = {
                    _id: patientData._id || patientData.id,
                    patientId: patientData.patientId || patientData._id,
                    firstName: patientData.firstName || patientData.first_name || '',
                    lastName: patientData.lastName || patientData.last_name || '',
                    age: patientData.age || '',
                    gender: patientData.gender || '',
                    phone: patientData.phone || patientData.phoneNumber || '',
                    email: patientData.email || '',
                    medicalHistory: patientData.medicalHistory || patientData.medical_history || '',
                    address: patientData.address || '',
                    dateOfBirth: patientData.dateOfBirth || patientData.dob || '',
                    ...patientData
                };

                setPatientData(normalizedPatientData);
                //console.log('[DentalChart] Patient data set:', normalizedPatientData);
            } else {
                console.warn('[DentalChart] No patient data found from any endpoint');
            }
        } catch (err) {
            console.warn('[DentalChart] Could not load patient data:', err.message);
            setPatientData(null);
        } finally {
            setLoadingPatient(false);
        }
    }, [patientId, hospitalId]);

    // Load dental chart data from backend
    const loadDentalChart = useCallback(async () => {
        if (!patientId) {
            setError('Patient ID is required');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            //console.log(`[DentalChart] Loading chart for patient: ${patientId}`);

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/dentalchart/${patientId}`,
                {
                    method: 'GET',
                    headers: getAuthHeaders()
                }
            );

            const data = await handleApiResponse(response, 'Load chart');

            //console.log('[DentalChart] Chart loaded successfully:', data);

            if (data.success && data.data) {
                const chartData = data.data;

                setIsAdult(chartData.isAdult !== undefined ? chartData.isAdult : true);
                setToothIssues(chartData.toothIssues || {});
                setNotes(chartData.notes || {});
                setComments(chartData.comments || []);

                if (chartData.proformaData) {
                    setProformaData({
                        fullName: chartData.proformaData.fullName || '',
                        age: chartData.proformaData.age || '',
                        gender: chartData.proformaData.gender || '',
                        medicalHistory: chartData.proformaData.medicalHistory || '',
                        chiefComplaint: chartData.proformaData.chiefComplaint || '',
                        clinicalFeatures: chartData.proformaData.clinicalFeatures || '',
                        investigationComment: chartData.proformaData.investigationComment || '',  // ADD THIS LINE
                        diagnosis: chartData.proformaData.diagnosis || ''
                    });
                } else {
                    setProformaData({
                        fullName: '',
                        age: '',
                        gender: '',
                        medicalHistory: '',
                        chiefComplaint: '',
                        clinicalFeatures: '',
                        investigationComment: '',  // ADD THIS LINE
                        diagnosis: ''
                    });
                }

                setPhotos(chartData.photos || []);

                if (chartData.comments && chartData.comments.length > 0) {
                    const maxCommentId = Math.max(...chartData.comments.map(c => c.id || 0));
                    setNextCommentId(maxCommentId + 1);
                }

                //console.log('[DentalChart] State updated successfully');
            } else {
                //console.log('[DentalChart] No chart found, using default data');
                setIsAdult(true);
                setToothIssues({});
                setNotes({});
                setComments([]);
                setProformaData({
                    fullName: '',
                    age: '',
                    gender: '',
                    medicalHistory: '',
                    chiefComplaint: '',
                    clinicalFeatures: '',
                    diagnosis: ''
                });
                setPhotos([]);
            }

            initialLoadRef.current = true;
        } catch (err) {
           // console.error('[DentalChart] Error loading dental chart:', err);

            if (err.message.includes('Failed to fetch')) {
                setError('Unable to connect to server. Please check your connection and try again.');
            } else {
                setError(err.message || 'Failed to load dental chart. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    // Load photos from backend
    const loadPhotos = useCallback(async () => {
        if (!patientId) return;

        try {
            //console.log(`[DentalChart] Loading photos for patient: ${patientId}`);

            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/dentalchart/${patientId}/photos`,
                {
                    method: 'GET',
                    headers: getAuthHeaders()
                }
            );

            const data = await handleApiResponse(response, 'Load photos');

            if (data.success) {
                setPhotos(data.photos || []);
            }
        } catch (err) {
           // console.error('[DentalChart] Error loading photos:', err);
            setPhotos([]);
        }
    }, [patientId]);

    // Load data on component mount
    useEffect(() => {
        if (patientId && !initialLoadRef.current) {
            Promise.all([
                loadPatientData(),
                loadDentalChart(),
                loadPhotos()
            ]).catch(err => {
               // console.error('[DentalChart] Error loading initial data:', err);
            });
        } else if (!patientId) {
            console.warn('[DentalChart] No patient ID provided');
            setError('Patient ID is required');
            setLoading(false);
        }
    }, [patientId, loadDentalChart, loadPhotos, loadPatientData]);

    // Photo management functions
   // FIXED: Upload function with better error handling and debugging
const uploadFiles = async (files) => {
    if (!patientId) {
        setError('Patient ID is required for photo upload');
        return;
    }

    if (!hospitalId) {
        console.warn('[uploadFiles] No hospital ID available, proceeding without it');
    }

    setUploading(true);

    try {
        //console.log(`[uploadFiles] Starting upload of ${files.length} files for patient: ${patientId}`);
        //console.log(`[uploadFiles] Backend URL: ${import.meta.env.VITE_BACKEND_URL}`);
        //console.log(`[uploadFiles] Selected category: ${selectedCategory}`);

        const formData = new FormData();
        
        // Append files with correct field name
        files.forEach((file, index) => {
           /* console.log(`[uploadFiles] Adding file ${index + 1}:`, {
                name: file.name,
                size: file.size,
                type: file.type
            });*/
            formData.append('photos', file); // This matches the backend route array field name
        });
        
        formData.append('category', selectedCategory);
        
        // Add hospital ID if available
        if (hospitalId) {
            formData.append('hospitalId', hospitalId);
        }

        // Construct the correct URL
        const uploadUrl = `${import.meta.env.VITE_BACKEND_URL}/api/dentalchart/${patientId}/upload-photos`;
        //console.log(`[uploadFiles] Upload URL: ${uploadUrl}`);

        // Make the request WITHOUT Content-Type header (let browser set it for FormData)
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
            // DON'T set Content-Type header for FormData - browser sets it automatically with boundary
        });

        //console.log(`[uploadFiles] Response status: ${response.status}`);
        //console.log(`[uploadFiles] Response ok: ${response.ok}`);

        // Get response text first to debug
        const responseText = await response.text();
        //console.log(`[uploadFiles] Response text:`, responseText);

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
          //  console.error(`[uploadFiles] Failed to parse response as JSON:`, parseError);
          //  console.error(`[uploadFiles] Raw response:`, responseText);
            throw new Error(`Invalid response from server: ${responseText.substring(0, 200)}`);
        }

        if (!response.ok) {
         //   console.error(`[uploadFiles] Upload failed with status ${response.status}:`, data);
            throw new Error(data.message || data.error || `Upload failed: ${response.status} ${response.statusText}`);
        }

        if (data.success && data.photos) {
            //console.log(`[uploadFiles] Upload successful:`, data);
            setPhotos(prev => [...prev, ...data.photos]);
            
            // Show success message if there were any errors with individual files
            if (data.errors && data.errors.length > 0) {
                console.warn(`[uploadFiles] Some files had issues:`, data.errors);
                setError(`Uploaded ${data.photos.length} photos, but ${data.errors.length} files had issues.`);
                // Clear error after 5 seconds
                setTimeout(() => setError(null), 5000);
            }
        } else {
          //  console.error(`[uploadFiles] Unexpected response structure:`, data);
            throw new Error(data.message || 'Unexpected response from server');
        }
    } catch (error) {
      //  console.error('[uploadFiles] Upload failed:', error);
        
        // Provide user-friendly error messages
        let errorMessage = 'Failed to upload photos. ';
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Please check your internet connection and try again.';
        } else if (error.message.includes('413')) {
            errorMessage += 'Files are too large. Maximum size is 10MB per file.';
        } else if (error.message.includes('400')) {
            errorMessage += 'Invalid file format. Only image files are allowed.';
        } else if (error.message.includes('500')) {
            errorMessage += 'Server error. Please try again later.';
        } else {
            errorMessage += error.message || 'Unknown error occurred.';
        }
        
        setError(errorMessage);
        
        // Clear error after 10 seconds for non-critical errors
        setTimeout(() => setError(null), 10000);
    } finally {
        setUploading(false);
    }
};

    const removePhoto = async (photoId) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/dentalchart/${patientId}/photo/${photoId}`,
                {
                    method: 'DELETE',
                    headers: getAuthHeaders()
                }
            );

            const data = await handleApiResponse(response, 'Remove photo');

            if (data.success) {
                setPhotos(prev => prev.filter(photo => photo._id !== photoId));
            }
        } catch (error) {
           // console.error('[DentalChart] Error removing photo:', error);
            setError('Failed to remove photo');
        }
    };

    const updatePhoto = async (photoId, metadata) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/dentalchart/${patientId}/photo/${photoId}`,
                {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify(metadata)
                }
            );

            const data = await handleApiResponse(response, 'Update photo');

            if (data.success) {
                setPhotos(prev => prev.map(photo =>
                    photo._id === photoId ? { ...photo, ...metadata } : photo
                ));
            }
        } catch (error) {
           // console.error('[DentalChart] Error updating photo:', error);
            setError('Failed to update photo');
        }
    };

    const handleViewPhoto = (photo) => {
        setSelectedPhoto(photo);
        setShowPhotoModal(true);
    };

    const handleEditPhoto = (photo) => {
        setEditingPhoto(photo);
    };

    const getPatientId = () => {
    const id = propPatientId || paramPatientId;
    //console.log('[getPatientId] Returning:', id);
    return id;
};
    
const getHospitalId = () => {
    //console.log('[getHospitalId] hospitalId from params:', hospitalId);
    //console.log('[getHospitalId] typeof hospitalId:', typeof hospitalId);
    
    // First priority: hospitalId from useParams (if it's a valid ObjectId string)
    if (hospitalId && 
        typeof hospitalId === 'string' && 
        hospitalId !== 'undefined' && 
        hospitalId !== '[object Object]' &&
        hospitalId !== '[object%20Object]' &&
        hospitalId !== 'patient' &&
        hospitalId.trim() !== '' &&
        hospitalId.match(/^[0-9a-fA-F]{24}$/)) {
        //console.log('[getHospitalId] Using valid hospitalId from params:', hospitalId);
        return hospitalId.trim();
    }
    
    // Second priority: Extract from current URL
    const pathname = window.location.pathname;
    //console.log('[getHospitalId] Current pathname:', pathname);
    
    // Pattern: /patientdata/{hospitalId}/{patientId}
    const patientDataMatch = pathname.match(/\/patientdata\/([^\/]+)\/([^\/]+)/);
    if (patientDataMatch && patientDataMatch[1]) {
        const extractedHospitalId = patientDataMatch[1];
        if (extractedHospitalId !== 'undefined' && 
            extractedHospitalId !== 'patient' &&
            extractedHospitalId !== '[object Object]' &&
            extractedHospitalId !== '[object%20Object]' &&
            extractedHospitalId.match(/^[0-9a-fA-F]{24}$/)) {
            //console.log('[getHospitalId] Extracted valid hospitalId from URL:', extractedHospitalId);
            return extractedHospitalId;
        }
    }
    
    // Third priority: Check localStorage with validation
    const storedHospitalId = localStorage.getItem('currentHospitalId');
    if (storedHospitalId && 
        storedHospitalId !== 'undefined' && 
        storedHospitalId !== 'patient' &&
        storedHospitalId !== '[object Object]' &&
        storedHospitalId !== '[object%20Object]' &&
        storedHospitalId.trim() !== '' &&
        storedHospitalId.match(/^[0-9a-fA-F]{24}$/)) {
        //console.log('[getHospitalId] Using valid stored hospitalId:', storedHospitalId);
        return storedHospitalId.trim();
    }
    
    console.warn('[getHospitalId] No valid hospitalId found, returning null');
    return null;
};
    // Tooth management functions
    const getToothTypeName = (toothId, isAdult) => {
        if (isAdult) {
            const toothTypeMap = {
                11: 'Central Incisor', 12: 'Lateral Incisor', 13: 'Canine', 14: 'First Premolar', 15: 'Second Premolar',
                16: 'First Molar', 17: 'Second Molar', 18: 'Third Molar',
                21: 'Central Incisor', 22: 'Lateral Incisor', 23: 'Canine', 24: 'First Premolar', 25: 'Second Premolar',
                26: 'First Molar', 27: 'Second Molar', 28: 'Third Molar',
                31: 'Central Incisor', 32: 'Lateral Incisor', 33: 'Canine', 34: 'First Premolar', 35: 'Second Premolar',
                36: 'First Molar', 37: 'Second Molar', 38: 'Third Molar',
                41: 'Central Incisor', 42: 'Lateral Incisor', 43: 'Canine', 44: 'First Premolar', 45: 'Second Premolar',
                46: 'First Molar', 47: 'Second Molar', 48: 'Third Molar'
            };
            return toothTypeMap[toothId] || 'Tooth';
        } else {
            const childToothTypeMap = {
                A: 'Central Incisor', B: 'Lateral Incisor', C: 'Canine', D: 'First Molar', E: 'Second Molar',
                F: 'Second Molar', G: 'First Molar', H: 'Canine', I: 'Lateral Incisor', J: 'Central Incisor',
                K: 'Central Incisor', L: 'Lateral Incisor', M: 'Canine', N: 'First Molar', O: 'Second Molar',
                P: 'Second Molar', Q: 'First Molar', R: 'Canine', S: 'Lateral Incisor', T: 'Central Incisor'
            };
            return childToothTypeMap[toothId] || 'Tooth';
        }
    };

    const getToothColor = (toothId) => {
        const issues = toothIssues[toothId];
        if (issues && issues.length > 0) {
            return dentalIssues[issues[0]].color;
        }
        return "url(#healthy-gradient)";
    };

    const hasIssues = (toothId) => {
        return toothIssues[toothId] && toothIssues[toothId].length > 0;
    };

    const handleChartToggle = async (adultMode) => {
        try {
            setIsAdult(adultMode);
            await saveChartData(toothIssues, notes, adultMode, proformaData, comments);
        } catch (err) {
          //  console.error('Error saving chart type change:', err);
            setError('Failed to update chart type. Please try again.');
            setIsAdult(!adultMode); // Revert change
        }
    };

  const handleToothClick = (toothId) => {
    if (isAddingComment) {
        // In comment mode, attach comment to tooth instead of opening modal
        handleToothCommentAttachment(toothId);
    } else {
        // Normal mode, open tooth modal
        setCurrentTooth(toothId);
        setShowToothModal(true);
    }
};

    const handleToothModalSave = async (toothId, note) => {
        try {
            const updatedNotes = { ...notes };
            if (note.trim()) {
                updatedNotes[toothId] = note;
            } else if (updatedNotes[toothId]) {
                delete updatedNotes[toothId];
            }
            
            await saveChartData(toothIssues, updatedNotes, isAdult, proformaData, comments);
            setNotes(updatedNotes);
            setShowToothModal(false);
            setCurrentTooth(null);
        } catch (err) {
          //  console.error('Error saving note:', err);
            setError('Failed to save note. Please try again.');
        }
    };

    const handleToothModalCancel = () => {
        setShowToothModal(false);
        setCurrentTooth(null);
    };

    // FIXED: handleIssueSelect with proper error handling and state reversion
    const handleIssueSelect = async (issueType) => {
        try {
            //console.log('[handleIssueSelect] Selecting issue:', issueType, 'for tooth:', currentTooth);
            
            const newToothIssues = { ...toothIssues };
            const currentIssues = newToothIssues[currentTooth] || [];

            if (issueType === null) {
                // Remove all issues for this tooth
                delete newToothIssues[currentTooth];
                //console.log('[handleIssueSelect] Removed all issues for tooth:', currentTooth);
            } else {
                const issueIndex = currentIssues.indexOf(issueType);
                if (issueIndex > -1) {
                    // Remove this specific issue
                    const updatedIssues = currentIssues.filter(issue => issue !== issueType);
                    if (updatedIssues.length === 0) {
                        delete newToothIssues[currentTooth];
                    } else {
                        newToothIssues[currentTooth] = updatedIssues;
                    }
                    //console.log('[handleIssueSelect] Removed issue:', issueType, 'from tooth:', currentTooth);
                } else {
                    // Add this issue
                    newToothIssues[currentTooth] = [...currentIssues, issueType];
                    //console.log('[handleIssueSelect] Added issue:', issueType, 'to tooth:', currentTooth);
                }
            }

            // Update local state immediately for better UX
            setToothIssues(newToothIssues);
            
            // Save to backend with error handling
            try {
                await saveChartData(newToothIssues, notes, isAdult, proformaData, comments);
                //console.log('[handleIssueSelect] Successfully saved tooth issues to backend');
            } catch (saveError) {
                // Revert the local state change on error
                setToothIssues(toothIssues);
                throw saveError; // Re-throw to be caught by outer try-catch
            }
            
        } catch (err) {
         //   console.error('[handleIssueSelect] Error saving tooth issue:', err);
            
            // Show user-friendly error message
            const errorMessage = err.message || 'Failed to save tooth issue';
            
            // Set a temporary error state that clears after a few seconds
            setError(errorMessage);
            setTimeout(() => setError(null), 5000);
        }
    };

    const removeIssue = async (toothId, issueType) => {
        try {
            const newToothIssues = { ...toothIssues };
            const currentIssues = newToothIssues[toothId] || [];
            const updatedIssues = currentIssues.filter(issue => issue !== issueType);

            if (updatedIssues.length === 0) {
                delete newToothIssues[toothId];
            } else {
                newToothIssues[toothId] = updatedIssues;
            }
            
            await saveChartData(newToothIssues, notes, isAdult, proformaData, comments);
            setToothIssues(newToothIssues);
        } catch (err) {
          //  console.error('Error removing issue:', err);
            setError('Failed to remove issue. Please try again.');
        }
    };


const handleProformaOpen = async () => {
    //console.log('[DentalChart] Opening proforma with patient data:', patientData);
    
    // Generate chief complaint from tooth issues
    const generateChiefComplaint = () => {
        if (Object.keys(toothIssues).length === 0) {
            return 'No issues identified';
        }

        const complaints = [];
        Object.entries(toothIssues).forEach(([toothId, issues]) => {
            issues.forEach(issueType => {
                const issueLabel = dentalIssues[issueType]?.label || issueType;
                complaints.push(`${toothId} ${issueLabel}`);
            });
        });

        return complaints.join(', ');
    };

    // Set chief complaint based on current tooth issues
    setProformaData(prev => ({
        ...prev,
        chiefComplaint: generateChiefComplaint()
    }));

    setShowProformaModal(true);
};

    const handleProformaNext = async () => {
        try {
            await saveChartData(toothIssues, notes, isAdult, proformaData, comments);
            //console.log('Proforma saved and moving to next step');
            setShowProformaModal(false);
        } catch (err) {
          //  console.error('Error saving proforma:', err);
            setError('Failed to save proforma. Please try again.');
        }
    };

    const handleFileSelect = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            await uploadFiles(files);
        }
        event.target.value = '';
    };

    const handleClearError = () => {
        setError(null);
    };

    // Comment system handlers
    const getContainerCoordinates = (e) => {
        const container = containerRef.current;
        if (!container) return { x: 0, y: 0 };
        const rect = container.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleContainerClick = (e) => {
        if (isAddingComment && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.closest('.comment-icon') && !e.target.closest('.ignore-click')) {
            const { x, y } = getContainerCoordinates(e);
            const newId = nextCommentId;
            const newComments = [...comments, { id: newId, x, y, messages: [] }];
            setComments(newComments);
            setNextCommentId(newId + 1);
            setCurrentCommentId(newId);
            setShowCommentModal(true);
            setIsAddingComment(false);
            setNewCommentText('');
            
            // Save comments to backend
            saveChartData(toothIssues, notes, isAdult, proformaData, newComments).catch(err => {
               // console.error('Error saving new comment:', err);
                setError('Failed to save comment. Please try again.');
            });
        }
    };

    const handleCommentDown = (e, id) => {
        e.stopPropagation();
        e.preventDefault();
        setDraggingCommentId(id);
        const { x, y } = getContainerCoordinates(e);
        const comment = comments.find(c => c.id === id);
        setDragOffset({ x: x - comment.x, y: y - comment.y });
        const startClient = { x: e.clientX, y: e.clientY };

        const handleMove = (ev) => {
            const { x, y } = getContainerCoordinates(ev);
            const newX = x - dragOffset.x;
            const newY = y - dragOffset.y;
            const updatedComments = comments.map(c => c.id === id ? { ...c, x: newX, y: newY } : c);
            setComments(updatedComments);
        };

        const handleUp = async (ev) => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);
            const dx = ev.clientX - startClient.x;
            const dy = ev.clientY - startClient.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 5) {
                handleCommentClick(id);
            }
            setDraggingCommentId(null);
            
            // Save updated comment positions
            try {
                await saveChartData(toothIssues, notes, isAdult, proformaData, comments);
            } catch (err) {
               // console.error('Error saving comment position:', err);
                setError('Failed to update comment position.');
            }
        };

        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
    };

    const handleCommentClick = (id) => {
        setCurrentCommentId(id);
        setShowCommentModal(true);
        setNewCommentText('');
    };

    const addMessage = async () => {
        if (!newCommentText.trim()) return;
        
        const newMsgId = nextMessageId;
        const updatedComments = comments.map(c => c.id === currentCommentId ? {
            ...c,
            messages: [...c.messages, { msgId: newMsgId, text: newCommentText, time: 'Just now' }]
        } : c);
        
        setComments(updatedComments);
        setNextMessageId(newMsgId + 1);
        setNewCommentText('');
        
        // Save to backend
        try {
            await saveChartData(toothIssues, notes, isAdult, proformaData, updatedComments);
        } catch (err) {
          //  console.error('Error saving comment message:', err);
            setError('Failed to save comment message.');
        }
    };

    const deleteMessage = async (commentId, msgId) => {
        const updatedComments = comments.map(c => c.id === commentId ? {
            ...c,
            messages: c.messages.filter(m => m.msgId !== msgId)
        } : c);
        
        setComments(updatedComments);
        
        // Save to backend
        try {
            await saveChartData(toothIssues, notes, isAdult, proformaData, updatedComments);
        } catch (err) {
           // console.error('Error deleting comment message:', err);
            setError('Failed to delete comment message.');
        }
    };

    const handleCloseCommentModal = async () => {
        setShowCommentModal(false);
        setCurrentCommentId(null);
        setNewCommentText('');
        
        const updatedComments = comments.filter(c => c.messages.length > 0 || c.id !== currentCommentId);
        setComments(updatedComments);
        
        // Save to backend
        try {
            await saveChartData(toothIssues, notes, isAdult, proformaData, updatedComments);
        } catch (err) {
           // console.error('Error saving comments:', err);
            setError('Failed to save comments.');
        }
    };

    const customCursor = isAddingComment ? `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" style="font-size: 30px"><text y="24" fill="blue">🦷</text></svg>') 16 16, auto` : 'default';

    // Show loading state   
    if (loading) {
        return (
            <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dental chart...</p>
                    {loadingPatient && (
                        <p className="text-xs text-blue-500 mt-1">Loading patient data...</p>
                    )}
                </div>
            </div>
        );
    }

    // Error state
    if (error && !initialLoadRef.current) {
        return (
            <div className="min-h-screen p-6 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                        <h3 className="text-red-600 font-medium text-lg mb-2">Error Loading Dental Chart</h3>
                        <p className="text-red-500 text-sm mb-4">{error}</p>
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    handleClearError();
                                    loadDentalChart();
                                    loadPatientData();
                                }}
                                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                            >
                                Retry Loading
                            </button>
                            <button
                                onClick={handleClearError}
                                className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
                            >
                                Continue Without Loading
                            </button>
                        </div>
                        <div className="mt-4 text-xs text-gray-500 space-y-1">
                            <p>Patient ID: {patientId}</p>
                            <p>API: {import.meta.env.VITE_BACKEND_URL}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
return (
    <div
        ref={containerRef}
        className="min-h-screen p-3 sm:p-4 lg:p-6 bg-gray-50 relative"
        style={{ cursor: customCursor }}
        onClick={handleContainerClick}
    >
        <div className="max-w-8xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8">
                {/* Error Banner (for non-critical errors) */}
                {error && initialLoadRef.current && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-red-600 text-xs sm:text-sm flex-1">{error}</p>
                            <button
                                onClick={handleClearError}
                                className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {/* Patient Data Loading Status */}
                {loadingPatient && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <p className="text-blue-600 text-xs sm:text-sm">Loading patient information...</p>
                        </div>
                    </div>
                )}

                {/* Header with Adult/Child Toggle, Chart, and Legend */}
                <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start mb-6 sm:mb-8 space-y-4 lg:space-y-0 lg:space-x-6">
                    <ChartTypeToggle
                        isAdult={isAdult}
                        onToggle={handleChartToggle}
                    />

                    <DentalSVGChart
                        isAdult={isAdult}
                        toothIssues={toothIssues}
                        onToothClick={handleToothClick}
                        getToothColor={getToothColor}
                        hasIssues={hasIssues}
                    />

                    <ColorLegend
                        isAddingComment={isAddingComment}
                        onToggleComment={() => setIsAddingComment(prev => !prev)}
                    />
                </div>

                {/* Action Buttons */}
                <ActionButtons
                    patientId={patientId}
                    photos={photos}
                    onRemovePhoto={removePhoto}
                    onViewProforma={handleProformaOpen}
                />

                {/* Issues Summary */}
                <IssuesSummary
                    toothIssues={toothIssues}
                    onRemoveIssue={removeIssue}
                    onEditTooth={handleToothClick}
                />
            </div>
        </div>

        {/* Comment System */}
        <CommentSystem
            comments={comments}
            isAddingComment={isAddingComment}
            draggingCommentId={draggingCommentId}
            currentCommentId={currentCommentId}
            newCommentText={newCommentText}
            showCommentModal={showCommentModal}
            onContainerClick={handleContainerClick}
            onCommentDown={handleCommentDown}
            onCommentClick={handleCommentClick}
            onAddMessage={addMessage}
            onDeleteMessage={deleteMessage}
            onCloseModal={handleCloseCommentModal}
            setNewCommentText={setNewCommentText}
        />

        {/* Tooth Modal */}
        <ToothModal
            show={showToothModal}
            currentTooth={currentTooth}
            isAdult={isAdult}
            toothIssues={toothIssues}
            notes={notes}
            onSave={handleToothModalSave}
            onCancel={handleToothModalCancel}
            onIssueSelect={handleIssueSelect}
            getToothTypeName={getToothTypeName}
            patientId={patientId}
        />

        {/* Proforma Modal */}
        <ProformaModal
            show={showProformaModal}
            proformaData={proformaData}
            onInputChange={handleInputChange}
            onClose={() => setShowProformaModal(false)}
            onNext={handleProformaNext}
            // Photo management props
            photos={photos}
            uploading={uploading}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            viewMode={viewMode}
            setViewMode={setViewMode}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            onFileSelect={handleFileSelect}
            onRemovePhoto={removePhoto}
            onViewPhoto={handleViewPhoto}
            onEditPhoto={handleEditPhoto}
            getPatientId={getPatientId}
            getHospitalId={getHospitalId}
            // Patient data for auto-fill
            patientData={null}
        />

        {/* Photo Modals */}
        <PhotoModal
            photo={selectedPhoto}
            onClose={() => {
                setShowPhotoModal(false);
                setSelectedPhoto(null);
            }}
            show={showPhotoModal}
        />

        <EditPhotoModal
            photo={editingPhoto}
            onSave={(photoId, metadata) => updatePhoto(photoId, metadata)}
            onClose={() => setEditingPhoto(null)}
            show={!!editingPhoto}
        />
    </div>
);
};

export default DentalChart;