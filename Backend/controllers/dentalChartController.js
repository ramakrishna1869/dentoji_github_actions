// controllers/dentalChartController.js - FIXED VERSION
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import DentalChart from '../models/DentalChart.js';
// Import Patient model if it exists
 import Patient from '../models/Patient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to safely convert Map/Object data
const safeMapConversion = (data) => {
  if (!data) return {};
  if (data instanceof Map) return Object.fromEntries(data);
  if (typeof data === 'object') return data;
  return {};
};

// Helper function to format chart data consistently
const formatChartData = (chart) => {
  return {
    _id: chart._id,
    patientId: chart.patientId,
    hospitalId: chart.hospitalId || null,
    isAdult: Boolean(chart.isAdult),
    toothIssues: safeMapConversion(chart.toothIssues),
    notes: safeMapConversion(chart.notes),
    comments: Array.isArray(chart.comments) ? chart.comments : [],
    proformaData: chart.proformaData || {
      fullName: '',
      age: '',
      gender: '',
      medicalHistory: '',
      chiefComplaint: '',
      clinicalFeatures: '',
      investigationComment: '',
      diagnosis: ''
    },
    photos: Array.isArray(chart.photos) ? chart.photos : [],
    createdAt: chart.createdAt,
    updatedAt: chart.updatedAt
  };
};

/**
 * Get dental chart by patient ID
 */
export const getDentalChart = async (req, res) => {
  try {
    const { patientId } = req.params;
   
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    //console.log(`[getDentalChart] Fetching chart for patient: ${patientId}`);

    const chart = await DentalChart.findOne({ patientId });
   
    if (!chart) {
      //console.log(`[getDentalChart] No chart found for patient: ${patientId}, returning default`);
      return res.json({
        success: true,
        data: {
          patientId,
          hospitalId: null,
          isAdult: true,
          toothIssues: {},
          notes: {},
          comments: [],
          proformaData: {
            fullName: '',
            age: '',
            gender: '',
            medicalHistory: '',
            chiefComplaint: '',
            clinicalFeatures: '',
            investigationComment: '',
            diagnosis: ''
          },
          photos: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }

    const chartData = formatChartData(chart);
    //console.log(`[getDentalChart] Chart found and formatted for patient: ${patientId}`);
   
    res.json({
      success: true,
      data: chartData
    });

  } catch (error) {
    console.error('[getDentalChart] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dental chart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


export const getProformaData = async (req, res) => {
  try {
    const { patientId } = req.params;
   
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    //console.log(`[getProformaData] Fetching proforma data for patient: ${patientId}`);

    const chart = await DentalChart.findOne({ patientId });
   
    if (!chart) {
      const defaultProforma = {
        fullName: '',
        age: '',
        gender: '',
        medicalHistory: '',
        chiefComplaint: '',
        clinicalFeatures: '',
        investigationComment: '',
        diagnosis: ''
      };
     
      return res.json({
        success: true,
        data: defaultProforma,
        message: 'No existing proforma data found - returning defaults'
      });
    }

    // Ensure proforma data has all required fields including investigation comment
    const proformaData = {
      fullName: chart.proformaData?.fullName || '',
      age: chart.proformaData?.age || '',
      gender: chart.proformaData?.gender || '',
      medicalHistory: chart.proformaData?.medicalHistory || '',
      chiefComplaint: chart.proformaData?.chiefComplaint || '',
      clinicalFeatures: chart.proformaData?.clinicalFeatures || '',
      investigationComment: chart.proformaData?.investigationComment || '',
      diagnosis: chart.proformaData?.diagnosis || ''
    };

    //console.log(`[getProformaData] Proforma data found for patient: ${patientId}`, proformaData);
   
    res.json({
      success: true,
      data: proformaData,
      message: 'Proforma data retrieved successfully'
    });

  } catch (error) {
    console.error('[getProformaData] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proforma data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Save investigation comment specifically
 */
export const saveInvestigationComment = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { investigationComment } = req.body;
   
    //console.log(`[saveInvestigationComment] Request received for patient: ${patientId}`);
    //console.log(`[saveInvestigationComment] Investigation comment:`, investigationComment);
   
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    // Validate and sanitize investigation comment
    const sanitizedComment = (investigationComment || '').toString().trim();

    let chart = await DentalChart.findOne({ patientId });
   
    if (!chart) {
      //console.log(`[saveInvestigationComment] Creating new chart for patient: ${patientId}`);
     
      chart = new DentalChart({
        patientId,
        hospitalId: null,
        isAdult: true,
        toothIssues: new Map(),
        notes: new Map(),
        comments: [],
        proformaData: {
          fullName: '',
          age: '',
          gender: '',
          medicalHistory: '',
          chiefComplaint: '',
          clinicalFeatures: '',
          investigationComment: sanitizedComment,
          diagnosis: ''
        },
        photos: []
      });
    } else {
      //console.log(`[saveInvestigationComment] Updating existing chart for patient: ${patientId}`);
     
      const currentProforma = chart.proformaData ?
        (typeof chart.proformaData.toObject === 'function' ? chart.proformaData.toObject() : chart.proformaData) : {};
     
      chart.proformaData = {
        ...currentProforma,
        investigationComment: sanitizedComment
      };
      chart.updatedAt = new Date();
    }

    //console.log(`[saveInvestigationComment] About to save investigation comment:`, sanitizedComment);

    await chart.save();
    //console.log(`[saveInvestigationComment] Investigation comment saved successfully for patient: ${patientId}`);
   
    res.json({
      success: true,
      message: 'Investigation comment saved successfully',
      data: {
        investigationComment: sanitizedComment
      }
    });

  } catch (error) {
    console.error('[saveInvestigationComment] Detailed error:', error);
   
    let errorMessage = 'Failed to save investigation comment';
    if (error.name === 'ValidationError') {
      errorMessage = `Validation error: ${error.message}`;
    } else if (error.name === 'CastError') {
      errorMessage = `Data type error: ${error.message}`;
    }
   
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    });
  }
};

/**
 * Get investigation comment specifically
 */
export const getInvestigationComment = async (req, res) => {
  try {
    const { patientId } = req.params;
   
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    //console.log(`[getInvestigationComment] Fetching investigation comment for patient: ${patientId}`);

    const chart = await DentalChart.findOne({ patientId });
   
    const investigationComment = chart?.proformaData?.investigationComment || '';

    //console.log(`[getInvestigationComment] Investigation comment found for patient: ${patientId}`, investigationComment);
   
    res.json({
      success: true,
      data: {
        investigationComment
      },
      message: 'Investigation comment retrieved successfully'
    });

  } catch (error) {
    console.error('[getInvestigationComment] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investigation comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get patient basic info
 */
export const getPatientBasicInfo = async (req, res) => {
  try {
    const { patientId } = req.params;
   
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    //console.log(`[getPatientBasicInfo] Fetching basic info for patient: ${patientId}`);
   
    // First try to get from dental chart proforma data
    const chart = await DentalChart.findOne({ patientId });
   
    if (chart && chart.proformaData) {
      const proformaData = chart.proformaData;
     
      // If we have meaningful data in proforma, use it
      if (proformaData.fullName || proformaData.age || proformaData.gender) {
        const basicInfo = {
          _id: patientId,
          firstName: proformaData.fullName ? proformaData.fullName.split(' ')[0] : '',
          lastName: proformaData.fullName ? proformaData.fullName.split(' ').slice(1).join(' ') : '',
          fullName: proformaData.fullName || '',
          age: proformaData.age || '',
          gender: proformaData.gender || '',
          medicalHistory: proformaData.medicalHistory || ''
        };

        //console.log(`[getPatientBasicInfo] Basic info retrieved from proforma for: ${patientId}`);
       
        return res.json({
          success: true,
          patient: basicInfo,
          message: 'Basic patient info retrieved from proforma data'
        });
      }
    }

    //console.log(`[getPatientBasicInfo] No patient data found for: ${patientId}`);
   
    return res.json({
      success: true,
      patient: null,
      message: 'No existing patient data found'
    });

  } catch (error) {
    console.error('[getPatientBasicInfo] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient basic info',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get patient data (if separate Patient model exists)
 */
export const getPatientData = async (req, res) => {
  try {
    const { patientId } = req.params;
   
    //console.log(`[DentalChart Controller] Fetching patient data for: ${patientId}`);
   
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    // Uncomment and modify this section if you have a Patient model
    /*
    // Import Patient model at the top: import Patient from '../models/Patient.js';
   
    let patient = null;
   
    // First try by _id (MongoDB ObjectId)
    if (patientId.match(/^[0-9a-fA-F]{24}$/)) {
      patient = await Patient.findById(patientId);
    }
   
    // If not found, try by patientId field
    if (!patient) {
      patient = await Patient.findOne({ patientId: patientId });
    }
   
    // If still not found, try other possible fields
    if (!patient) {
      patient = await Patient.findOne({
        $or: [
          { patientNumber: patientId },
          { id: patientId }
        ]
      });
    }

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
        searchedId: patientId
      });
    }

    //console.log(`[DentalChart Controller] Patient found:`, {
      id: patient._id,
      name: `${patient.firstName} ${patient.lastName}`
    });

    // Return normalized patient data
    res.status(200).json({
      success: true,
      patient: {
        _id: patient._id,
        patientId: patient.patientId || patient._id,
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        age: patient.age || '',
        gender: patient.gender || '',
        phone: patient.phone || patient.phoneNumber || '',
        email: patient.email || '',
        medicalHistory: patient.medicalHistory || patient.medical_history || '',
        address: patient.address || '',
        dateOfBirth: patient.dateOfBirth || patient.dob || '',
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
        hospitalId: patient.hospitalId
      }
    });
    */

    // Temporary fallback - return patient data from dental chart if no Patient model
    const chart = await DentalChart.findOne({ patientId });
   
    if (chart && chart.proformaData) {
      const proformaData = chart.proformaData;
     
      return res.status(200).json({
        success: true,
        patient: {
          _id: patientId,
          patientId: patientId,
          firstName: proformaData.fullName ? proformaData.fullName.split(' ')[0] : '',
          lastName: proformaData.fullName ? proformaData.fullName.split(' ').slice(1).join(' ') : '',
          fullName: proformaData.fullName || '',
          age: proformaData.age || '',
          gender: proformaData.gender || '',
          medicalHistory: proformaData.medicalHistory || '',
          hospitalId: chart.hospitalId
        }
      });
    }

    return res.status(404).json({
      success: false,
      message: 'Patient not found',
      searchedId: patientId
    });

  } catch (error) {
    console.error('[DentalChart Controller] Error fetching patient data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Upload single photo
 */
export const uploadPhoto = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { category = 'general' } = req.body;
    const file = req.file;
   
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    //console.log(`[uploadPhoto] Uploading photo for patient: ${patientId}`);

    const validCategories = ['general', 'before-treatment', 'during-treatment', 'after-treatment', 'x-ray', 'intraoral', 'extraoral', 'smile', 'consultation'];
    const photoCategory = validCategories.includes(category) ? category : 'general';

    // Consistent URL generation
    const photoUrl = `/uploads/dental-photos/${file.filename}`;
   
    const newPhoto = {
      _id: new mongoose.Types.ObjectId(),
      url: photoUrl,
      originalName: file.originalname,
      category: photoCategory,
      description: '',
      uploadedAt: new Date(),
      size: file.size,
      type: file.mimetype
    };

    let chart = await DentalChart.findOne({ patientId });
   
    if (!chart) {
      chart = new DentalChart({
        patientId,
        isAdult: true,
        toothIssues: new Map(),
        notes: new Map(),
        comments: [],
        proformaData: {},
        photos: [newPhoto]
      });
    } else {
      if (!Array.isArray(chart.photos)) {
        chart.photos = [];
      }
      chart.photos.push(newPhoto);
      chart.updatedAt = new Date();
    }

    await chart.save();
    //console.log(`[uploadPhoto] Photo uploaded successfully for patient: ${patientId}`);

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      photo: newPhoto
    });

  } catch (error) {
    console.error('[uploadPhoto] Error:', error);
   
    // Clean up uploaded file on error
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.warn('[uploadPhoto] Failed to cleanup file:', unlinkError.message);
      }
    }
   
    res.status(500).json({
      success: false,
      message: 'Failed to upload photo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Upload multiple photos
 */
export const uploadMultiplePhotos = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { category = 'general', hospitalId } = req.body;
    const files = req.files;
   
    /*console.log(`[uploadMultiplePhotos] Request received:`, {
      patientId,
      category,
      hospitalId,
      filesCount: files ? files.length : 0,
      bodyKeys: Object.keys(req.body)
    });*/
   
    if (!patientId) {
      console.error(`[uploadMultiplePhotos] Missing patient ID`);
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    // Validate patientId format
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      console.error(`[uploadMultiplePhotos] Invalid patient ID format: ${patientId}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID format'
      });
    }

    if (!files || files.length === 0) {
      console.error(`[uploadMultiplePhotos] No files in request`);
      return res.status(400).json({
        success: false,
        message: 'No files uploaded. Please select at least one image file.'
      });
    }

    /*console.log(`[uploadMultiplePhotos] Processing ${files.length} files:`,
      files.map(f => ({ name: f.originalname, size: f.size, type: f.mimetype }))
    );*/

    const validCategories = ['general', 'before-treatment', 'during-treatment', 'after-treatment', 'x-ray', 'intraoral', 'extraoral', 'smile', 'consultation'];
    const photoCategory = validCategories.includes(category) ? category : 'general';

    const uploadedPhotos = [];
    const errors = [];
   
    for (const file of files) {
      try {
        //console.log(`[uploadMultiplePhotos] Processing file: ${file.originalname}`);
       
        // Validate file type
        if (!file.mimetype.startsWith('image/')) {
          throw new Error(`Invalid file type: ${file.mimetype}. Only images are allowed.`);
        }
       
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 10MB.`);
        }
       
        // Generate consistent URL path
        const photoUrl = `/uploads/dental-photos/${file.filename}`;
       
        const newPhoto = {
          _id: new mongoose.Types.ObjectId(),
          url: photoUrl,
          originalUrl: photoUrl,
          filename: file.filename,
          originalName: file.originalname,
          category: photoCategory,
          description: '',
          uploadedAt: new Date(),
          uploadDate: new Date(),
          size: file.size,
          type: file.mimetype
        };

        uploadedPhotos.push(newPhoto);
        //console.log(`[uploadMultiplePhotos] File processed successfully: ${file.originalname}`);
       
      } catch (fileError) {
        console.error(`[uploadMultiplePhotos] Error processing file ${file.originalname}:`, fileError);
        errors.push({
          filename: file.originalname,
          error: fileError.message
        });
       
        // Clean up failed file
        try {
          if (file.path) {
            await fs.unlink(file.path);
          }
        } catch (cleanupError) {
          console.warn(`[uploadMultiplePhotos] Failed to cleanup file ${file.originalname}:`, cleanupError);
        }
      }
    }

    if (uploadedPhotos.length === 0) {
      console.error(`[uploadMultiplePhotos] No valid photos processed`);
      return res.status(400).json({
        success: false,
        message: 'No valid photos could be processed',
        errors
      });
    }

    // Find or create dental chart
    let chart = await DentalChart.findOne({ patientId });
   
    if (!chart) {
      //console.log(`[uploadMultiplePhotos] Creating new chart for patient: ${patientId}`);
      chart = new DentalChart({
        patientId,
        hospitalId: hospitalId || null,
        isAdult: true,
        toothIssues: new Map(),
        notes: new Map(),
        comments: [],
        proformaData: {
          fullName: '',
          age: '',
          gender: '',
          medicalHistory: '',
          chiefComplaint: '',
          clinicalFeatures: '',
          investigationComment: '',
          diagnosis: ''
        },
        photos: uploadedPhotos
      });
    } else {
      //console.log(`[uploadMultiplePhotos] Updating existing chart for patient: ${patientId}`);
      if (!Array.isArray(chart.photos)) {
        chart.photos = [];
      }
      chart.photos.push(...uploadedPhotos);
     
      if (hospitalId) {
        chart.hospitalId = hospitalId;
      }
      chart.updatedAt = new Date();
    }

    // Save chart
    try {
      await chart.save();
      //console.log(`[uploadMultiplePhotos] Chart saved successfully with ${uploadedPhotos.length} new photos`);
    } catch (saveError) {
      console.error(`[uploadMultiplePhotos] Error saving chart:`, saveError);
     
      // Clean up uploaded files on save error
      for (const photo of uploadedPhotos) {
        try {
          const filePath = path.join(__dirname, '..', photo.url);
          await fs.unlink(filePath);
        } catch (cleanupError) {
          console.warn(`[uploadMultiplePhotos] Failed to cleanup photo file:`, cleanupError);
        }
      }
     
      throw new Error(`Failed to save photos to database: ${saveError.message}`);
    }
   
    const responseMessage = errors.length > 0
      ? `${uploadedPhotos.length} photos uploaded successfully, ${errors.length} files had issues`
      : `${uploadedPhotos.length} photos uploaded successfully`;
   
    //console.log(`[uploadMultiplePhotos] Upload completed: ${responseMessage}`);
   
    res.status(200).json({
      success: true,
      message: responseMessage,
      photos: uploadedPhotos,
      errors: errors.length > 0 ? errors : undefined,
      totalUploaded: uploadedPhotos.length,
      totalErrors: errors.length
    });
   
  } catch (error) {
    console.error('[uploadMultiplePhotos] Unexpected error:', error);
   
    // Clean up any uploaded files on unexpected error
    if (req.files) {
      for (const file of req.files) {
        try {
          if (file.path) {
            await fs.unlink(file.path);
            //console.log(`[uploadMultiplePhotos] Cleaned up file: ${file.path}`);
          }
        } catch (cleanupError) {
          console.warn(`[uploadMultiplePhotos] Failed to cleanup file:`, cleanupError);
        }
      }
    }
   
    // Determine appropriate error message and status code
    let statusCode = 500;
    let errorMessage = 'Failed to upload photos';
   
    if (error.message.includes('Invalid patient ID')) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message.includes('No files uploaded')) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message.includes('File too large')) {
      statusCode = 413;
      errorMessage = 'One or more files are too large. Maximum size is 10MB per file.';
    } else if (error.message.includes('Invalid file type')) {
      statusCode = 415;
      errorMessage = 'Invalid file type. Only image files are allowed.';
    } else if (error.message.includes('Failed to save')) {
      statusCode = 500;
      errorMessage = 'Database error while saving photos. Please try again.';
    }
   
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    });
  }
};

/**
 * Get all photos for a patient
 */
export const getPhotos = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { category } = req.query;
   
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    //console.log(`[getPhotos] Fetching photos for patient: ${patientId}`);

    const chart = await DentalChart.findOne({ patientId });
   
    if (!chart) {
      return res.json({
        success: true,
        photos: []
      });
    }

    let photos = Array.isArray(chart.photos) ? chart.photos : [];
   
    // Filter by category if specified
    if (category && category !== 'all') {
      const validCategories = ['general', 'before-treatment', 'during-treatment', 'after-treatment', 'x-ray', 'intraoral', 'extraoral', 'smile', 'consultation'];
      if (validCategories.includes(category)) {
        photos = photos.filter(photo => photo.category === category);
      }
    }

    // Sort photos by upload date (newest first)
    photos = photos.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    //console.log(`[getPhotos] Found ${photos.length} photos for patient: ${patientId}`);

    res.json({
      success: true,
      photos
    });

  } catch (error) {
    console.error('[getPhotos] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch photos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update photo metadata
 */
export const updatePhoto = async (req, res) => {
  try {
    const { patientId, photoId } = req.params;
    const { description, category } = req.body;
   
    if (!patientId || !photoId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and Photo ID are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(photoId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid photo ID format'
      });
    }

    //console.log(`[updatePhoto] Updating photo ${photoId} for patient: ${patientId}`);

    const chart = await DentalChart.findOne({ patientId });
   
    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Dental chart not found'
      });
    }

    const photo = chart.photos?.find(p => p._id.toString() === photoId);
   
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Update photo metadata
    if (description !== undefined) {
      photo.description = String(description).substring(0, 500);
    }
   
    if (category !== undefined) {
      const validCategories = ['general', 'before-treatment', 'during-treatment', 'after-treatment', 'x-ray', 'intraoral', 'extraoral', 'smile', 'consultation'];
      if (validCategories.includes(category)) {
        photo.category = category;
      } else {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
        });
      }
    }

    chart.updatedAt = new Date();
    await chart.save();

    //console.log(`[updatePhoto] Photo ${photoId} updated successfully for patient: ${patientId}`);

    res.json({
      success: true,
      message: 'Photo updated successfully',
      photo
    });

  } catch (error) {
    console.error('[updatePhoto] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update photo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Remove photo from dental chart
 */
export const removePhoto = async (req, res) => {
  try {
    const { patientId, photoId } = req.params;
   
    if (!patientId || !photoId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and Photo ID are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(photoId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid photo ID format'
      });
    }

    //console.log(`[removePhoto] Removing photo ${photoId} for patient: ${patientId}`);

    const chart = await DentalChart.findOne({ patientId });
   
    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Dental chart not found'
      });
    }

    const photoIndex = chart.photos?.findIndex(photo => photo._id.toString() === photoId);
   
    if (photoIndex === -1 || photoIndex === undefined) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    const photo = chart.photos[photoIndex];
   
    // Delete the physical file
    if (photo.url?.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', photo.url);
      try {
        await fs.unlink(filePath);
        //console.log(`[removePhoto] Physical file deleted: ${filePath}`);
      } catch (fileError) {
        console.warn('[removePhoto] File not found or already deleted:', fileError.message);
      }
    }

    // Remove photo from array
    chart.photos.splice(photoIndex, 1);
    chart.updatedAt = new Date();
   
    await chart.save();

    //console.log(`[removePhoto] Photo ${photoId} removed successfully for patient: ${patientId}`);

    res.json({
      success: true,
      message: 'Photo removed successfully'
    });

  } catch (error) {
    console.error('[removePhoto] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove photo',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete entire dental chart
 */
export const deleteDentalChart = async (req, res) => {
  try {
    const { patientId } = req.params;
   
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    //console.log(`[deleteDentalChart] Deleting chart for patient: ${patientId}`);

    const chart = await DentalChart.findOne({ patientId });
   
    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Dental chart not found'
      });
    }

    // Delete all associated photos from filesystem
    if (Array.isArray(chart.photos) && chart.photos.length > 0) {
      for (const photo of chart.photos) {
        if (photo.url?.startsWith('/uploads/')) {
          const filePath = path.join(__dirname, '..', photo.url);
          try {
            await fs.unlink(filePath);
            //console.log(`[deleteDentalChart] Deleted photo file: ${filePath}`);
          } catch (fileError) {
            console.warn('[deleteDentalChart] File not found or already deleted:', fileError.message);
          }
        }
      }
    }

    await DentalChart.findOneAndDelete({ patientId });

    //console.log(`[deleteDentalChart] Chart deleted successfully for patient: ${patientId}`);

    res.json({
      success: true,
      message: 'Dental chart deleted successfully'
    });

  } catch (error) {
    console.error('[deleteDentalChart] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete dental chart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Print proforma with patient details
 */
export const printProforma = async (req, res) => {
  try {
    const { patientId } = req.params;
   
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    //console.log(`[printProforma] Generating proforma for patient: ${patientId}`);

    const chart = await DentalChart.findOne({ patientId });
   
    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Dental chart not found'
      });
    }

    const chartData = formatChartData(chart);
   
    const summary = {
      totalIssues: Object.values(chartData.toothIssues).reduce((total, issues) => total + issues.length, 0),
      affectedTeeth: Object.keys(chartData.toothIssues).length,
      totalPhotos: chartData.photos.length,
      totalComments: chartData.comments.length,
      totalNotes: Object.keys(chartData.notes).length,
      chartType: chartData.isAdult ? 'Adult' : 'Child'
    };

    //console.log(`[printProforma] Proforma generated for patient: ${patientId}`);

    res.json({
      success: true,
      data: {
        ...chartData,
        summary
      },
      message: 'Proforma data retrieved successfully'
    });

  } catch (error) {
    console.error('[printProforma] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proforma data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get chart statistics
 */
export const getChartStatistics = async (req, res) => {
  try {
    const { patientId } = req.params;
   
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    //console.log(`[getChartStatistics] Getting statistics for patient: ${patientId}`);

    const chart = await DentalChart.findOne({ patientId });
   
    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Dental chart not found'
      });
    }

    const chartData = formatChartData(chart);
   
    const stats = {
      totalTeeth: chartData.isAdult ? 32 : 20,
      affectedTeeth: Object.keys(chartData.toothIssues).length,
      healthyTeeth: (chartData.isAdult ? 32 : 20) - Object.keys(chartData.toothIssues).length,
      totalIssues: Object.values(chartData.toothIssues).reduce((total, issues) => total + issues.length, 0),
      issueBreakdown: {},
      totalPhotos: chartData.photos.length,
      photosByCategory: {},
      totalComments: chartData.comments.length,
      totalNotes: Object.keys(chartData.notes).length,
      lastUpdated: chartData.updatedAt,
      createdAt: chartData.createdAt
    };

    // Calculate issue breakdown
    Object.values(chartData.toothIssues).forEach(issues => {
      issues.forEach(issue => {
        stats.issueBreakdown[issue] = (stats.issueBreakdown[issue] || 0) + 1;
      });
    });

    // Calculate photos by category
    chartData.photos.forEach(photo => {
      const category = photo.category || 'general';
      stats.photosByCategory[category] = (stats.photosByCategory[category] || 0) + 1;
    });

    //console.log(`[getChartStatistics] Statistics calculated for patient: ${patientId}`);

    res.json({
      success: true,
      statistics: stats
    });

  } catch (error) {
    console.error('[getChartStatistics] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chart statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Generate proforma report
 */
export const generateProformaReport = async (req, res) => {
  try {
    const { patientId } = req.params;
   
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    //console.log(`[generateProformaReport] Generating report for patient: ${patientId}`);

    const chart = await DentalChart.findOne({ patientId });
   
    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Dental chart not found'
      });
    }

    const chartData = formatChartData(chart);
   
    // Generate comprehensive report
    const report = {
      patientInfo: chartData.proformaData,
      chartSummary: {
        totalIssues: Object.values(chartData.toothIssues).reduce((total, issues) => total + issues.length, 0),
        affectedTeeth: Object.keys(chartData.toothIssues).length,
        totalPhotos: chartData.photos.length,
        totalComments: chartData.comments.length,
        chartType: chartData.isAdult ? 'Adult' : 'Child'
      },
      photos: chartData.photos,
      toothIssues: chartData.toothIssues,
      notes: chartData.notes,
      comments: chartData.comments,
      metadata: {
        createdAt: chartData.createdAt,
        updatedAt: chartData.updatedAt,
        reportGeneratedAt: new Date()
      }
    };

    //console.log(`[generateProformaReport] Report generated for patient: ${patientId}`);

    res.json({
      success: true,
      report,
      message: 'Proforma report generated successfully'
    });

  } catch (error) {
    console.error('[generateProformaReport] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate proforma report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Export proforma data
 */
export const exportProformaData = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { format = 'json' } = req.query;
   
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    //console.log(`[exportProformaData] Exporting data for patient: ${patientId} in format: ${format}`);

    const chart = await DentalChart.findOne({ patientId });
   
    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Dental chart not found'
      });
    }

    const chartData = formatChartData(chart);
   
    // For now, return JSON. Later, implement PDF/Excel export
    const exportData = {
      patient: chartData.proformaData,
      chart: {
        toothIssues: chartData.toothIssues,
        notes: chartData.notes,
        comments: chartData.comments,
        photos: chartData.photos.map(photo => ({
          ...photo,
          url: `${req.protocol}://${req.get('host')}${photo.url}`
        }))
      },
      exportInfo: {
        exportedAt: new Date(),
        format,
        patientId
      }
    };

    //console.log(`[exportProformaData] Data exported for patient: ${patientId}`);

    res.json({
      success: true,
      data: exportData,
      message: `Proforma data exported successfully as ${format}`
    });

  } catch (error) {
    console.error('[exportProformaData] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export proforma data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

//////////////////////////////////////////////////////////////////////////////
// Updated functions in dentalChartController.js to handle optional enum fields

/**
 * Save proforma data specifically - FIXED to handle optional gender
 */
export const saveProformaData = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { proformaData, hospitalId } = req.body;
   
    //console.log(`[saveProformaData] Request received for patient: ${patientId}`);
    //console.log(`[saveProformaData] Proforma data:`, proformaData);
    //console.log(`[saveProformaData] Hospital ID:`, hospitalId);
   
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    // Validate proforma data structure
    if (!proformaData || typeof proformaData !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Proforma data is required and must be an object'
      });
    }

    // Sanitize and validate proforma data - handle optional gender field
    const sanitizedProformaData = {
      fullName: (proformaData.fullName || '').toString().trim(),
      age: (proformaData.age || '').toString().trim(),
      medicalHistory: (proformaData.medicalHistory || '').toString().trim(),
      chiefComplaint: (proformaData.chiefComplaint || '').toString().trim(),
      clinicalFeatures: (proformaData.clinicalFeatures || '').toString().trim(),
      investigationComment: (proformaData.investigationComment || proformaData.comment || '').toString().trim(),
      diagnosis: (proformaData.diagnosis || '').toString().trim()
    };

    // Only include gender if it has a valid enum value
    const genderValue = (proformaData.gender || '').toString().trim();
    if (genderValue && ['Male', 'Female', 'Other'].includes(genderValue)) {
      sanitizedProformaData.gender = genderValue;
    }
    // If gender is empty or invalid, don't include it in the update (leave existing value or use schema default)

    //console.log(`[saveProformaData] Sanitized proforma data:`, sanitizedProformaData);

    let chart = await DentalChart.findOne({ patientId });
   
    if (!chart) {
      //console.log(`[saveProformaData] Creating new chart for patient: ${patientId}`);
     
      // For new charts, provide a default proforma structure
      const newProformaData = {
        fullName: sanitizedProformaData.fullName || '',
        age: sanitizedProformaData.age || '',
        medicalHistory: sanitizedProformaData.medicalHistory || '',
        chiefComplaint: sanitizedProformaData.chiefComplaint || '',
        clinicalFeatures: sanitizedProformaData.clinicalFeatures || '',
        investigationComment: sanitizedProformaData.investigationComment || '',
        diagnosis: sanitizedProformaData.diagnosis || ''
      };

      // Only add gender if it's valid
      if (sanitizedProformaData.gender) {
        newProformaData.gender = sanitizedProformaData.gender;
      }

      chart = new DentalChart({
        patientId,
        hospitalId: hospitalId || null,
        isAdult: true,
        toothIssues: new Map(),
        notes: new Map(),
        comments: [],
        proformaData: newProformaData,
        photos: []
      });
    } else {
      //console.log(`[saveProformaData] Updating existing chart for patient: ${patientId}`);
     
      const currentProforma = chart.proformaData ?
        (typeof chart.proformaData.toObject === 'function' ? chart.proformaData.toObject() : chart.proformaData) : {};
     
      // Merge existing data with new data, only updating provided fields
      chart.proformaData = { ...currentProforma, ...sanitizedProformaData };
     
      if (hospitalId) {
        chart.hospitalId = hospitalId;
      }
      chart.updatedAt = new Date();
    }

    //console.log(`[saveProformaData] About to save chart with proforma:`, chart.proformaData);

    await chart.save();
    //console.log(`[saveProformaData] Proforma data saved successfully for patient: ${patientId}`);
   
    const chartData = formatChartData(chart);
   
    res.json({
      success: true,
      message: 'Proforma data saved successfully',
      data: chartData.proformaData
    });

  } catch (error) {
    console.error('[saveProformaData] Detailed error:', error);
    console.error('[saveProformaData] Error stack:', error.stack);
   
    let errorMessage = 'Failed to save proforma data';
    if (error.name === 'ValidationError') {
      // Handle specific validation errors
      const validationErrors = Object.keys(error.errors).map(key => {
        const err = error.errors[key];
        if (err.kind === 'enum') {
          return `${key}: Please select a valid option`;
        }
        return `${key}: ${err.message}`;
      });
      errorMessage = `Validation error: ${validationErrors.join(', ')}`;
    } else if (error.name === 'CastError') {
      errorMessage = `Data type error: ${error.message}`;
    } else if (error.code === 11000) {
      errorMessage = 'Duplicate entry error';
    }
   
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
        validationErrors: error.errors
      } : undefined
    });
  }
};

/**
 * Save dental chart data - FIXED to handle optional gender
 */
export const saveDentalChart = async (req, res) => {
  try {
    const { patientId } = req.params;
    const requestData = req.body;
   
    //console.log(`[saveDentalChart] Starting save for patient: ${patientId}`);
    //console.log(`[saveDentalChart] Request data:`, JSON.stringify(requestData, null, 2));
   
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    // Validate patientId format (should be valid MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      console.error(`[saveDentalChart] Invalid patient ID format: ${patientId}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID format'
      });
    }

    // Validate and sanitize input data with proper gender handling
    const sanitizedData = {
      isAdult: typeof requestData.isAdult === 'boolean' ? requestData.isAdult : true,
      toothIssues: {},
      notes: {},
      comments: Array.isArray(requestData.comments) ? requestData.comments : [],
      proformaData: {},
      hospitalId: null
    };

    // Safely handle proforma data with optional gender
    if (requestData.proformaData && typeof requestData.proformaData === 'object' && !Array.isArray(requestData.proformaData)) {
      try {
        sanitizedData.proformaData = {
          fullName: (requestData.proformaData.fullName || '').toString().trim(),
          age: (requestData.proformaData.age || '').toString().trim(),
          medicalHistory: (requestData.proformaData.medicalHistory || '').toString().trim(),
          chiefComplaint: (requestData.proformaData.chiefComplaint || '').toString().trim(),
          clinicalFeatures: (requestData.proformaData.clinicalFeatures || '').toString().trim(),
          investigationComment: (requestData.proformaData.investigationComment || '').toString().trim(),
          diagnosis: (requestData.proformaData.diagnosis || '').toString().trim()
        };

        // Only include gender if it's a valid enum value
        const genderValue = (requestData.proformaData.gender || '').toString().trim();
        if (genderValue && ['Male', 'Female', 'Other'].includes(genderValue)) {
          sanitizedData.proformaData.gender = genderValue;
        }
       
        //console.log(`[saveDentalChart] Processed proforma data:`, sanitizedData.proformaData);
       
      } catch (proformaError) {
        console.warn(`[saveDentalChart] Error processing proforma data:`, proformaError);
        sanitizedData.proformaData = {
          fullName: '',
          age: '',
          medicalHistory: '',
          chiefComplaint: '',
          clinicalFeatures: '',
          investigationComment: '',
          diagnosis: ''
        };
      }
    }

    // Handle toothIssues (existing logic unchanged)
    if (requestData.toothIssues && typeof requestData.toothIssues === 'object' && !Array.isArray(requestData.toothIssues)) {
      try {
        Object.entries(requestData.toothIssues).forEach(([toothId, issues]) => {
          if (Array.isArray(issues) && issues.length > 0) {
            const validIssues = issues.filter(issue =>
              typeof issue === 'string' &&
              ['cavity', 'gumDisease', 'filling', 'missing', 'rootCanal', 'other'].includes(issue)
            );
            if (validIssues.length > 0) {
              sanitizedData.toothIssues[toothId] = validIssues;
            }
          }
        });
      } catch (issueError) {
        console.warn(`[saveDentalChart] Error processing tooth issues:`, issueError);
      }
    }

    // Handle notes (existing logic unchanged)
    if (requestData.notes && typeof requestData.notes === 'object' && !Array.isArray(requestData.notes)) {
      try {
        Object.entries(requestData.notes).forEach(([toothId, note]) => {
          if (typeof note === 'string' && note.trim()) {
            sanitizedData.notes[toothId] = note.trim();
          }
        });
      } catch (noteError) {
        console.warn(`[saveDentalChart] Error processing notes:`, noteError);
      }
    }

    // Handle hospitalId
    if (requestData.hospitalId) {
      if (mongoose.Types.ObjectId.isValid(requestData.hospitalId)) {
        sanitizedData.hospitalId = requestData.hospitalId;
      } else {
        console.warn(`[saveDentalChart] Invalid hospital ID format: ${requestData.hospitalId}`);
      }
    }

    //console.log(`[saveDentalChart] Sanitized data:`, JSON.stringify(sanitizedData, null, 2));

    let chart = await DentalChart.findOne({ patientId });
   
    if (chart) {
      //console.log(`[saveDentalChart] Updating existing chart for patient: ${patientId}`);
     
      try {
        // Update existing chart fields
        chart.isAdult = sanitizedData.isAdult;
        chart.toothIssues = new Map(Object.entries(sanitizedData.toothIssues));
        chart.notes = new Map(Object.entries(sanitizedData.notes));
        chart.comments = sanitizedData.comments;
       
        // Safely merge proforma data
        const currentProforma = chart.proformaData ?
          (typeof chart.proformaData.toObject === 'function' ? chart.proformaData.toObject() : chart.proformaData) : {};
        chart.proformaData = { ...currentProforma, ...sanitizedData.proformaData };
       
        if (sanitizedData.hospitalId) {
          chart.hospitalId = sanitizedData.hospitalId;
        }
        chart.updatedAt = new Date();
       
        //console.log(`[saveDentalChart] Chart fields updated, attempting save...`);
       
      } catch (updateError) {
        console.error(`[saveDentalChart] Error updating chart fields:`, updateError);
        throw updateError;
      }
     
    } else {
      //console.log(`[saveDentalChart] Creating new chart for patient: ${patientId}`);
     
      try {
        chart = new DentalChart({
          patientId,
          hospitalId: sanitizedData.hospitalId,
          isAdult: sanitizedData.isAdult,
          toothIssues: new Map(Object.entries(sanitizedData.toothIssues)),
          notes: new Map(Object.entries(sanitizedData.notes)),
          comments: sanitizedData.comments,
          proformaData: sanitizedData.proformaData,
          photos: []
        });
       
        //console.log(`[saveDentalChart] New chart created, attempting save...`);
       
      } catch (createError) {
        console.error(`[saveDentalChart] Error creating new chart:`, createError);
        throw createError;
      }
    }

    // Save with detailed error handling
    try {
      await chart.save();
      //console.log(`[saveDentalChart] Chart saved successfully for patient: ${patientId}`);
    } catch (saveError) {
      console.error(`[saveDentalChart] MongoDB save error:`, saveError);
      console.error(`[saveDentalChart] Save error details:`, {
        name: saveError.name,
        message: saveError.message,
        code: saveError.code,
        errors: saveError.errors
      });
     
      let errorMessage = 'Failed to save dental chart';
      if (saveError.name === 'ValidationError') {
        const validationErrors = Object.values(saveError.errors).map(err => {
          if (err.kind === 'enum') {
            return `${err.path}: Please select a valid option (received: "${err.value}")`;
          }
          return err.message;
        });
        errorMessage = `Validation failed: ${validationErrors.join(', ')}`;
      } else if (saveError.name === 'MongoError' || saveError.name === 'MongoServerError') {
        errorMessage = `Database error: ${saveError.message}`;
      } else if (saveError.code === 11000) {
        errorMessage = 'Duplicate entry - chart may already exist';
      }
     
      return res.status(400).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? {
          name: saveError.name,
          message: saveError.message,
          errors: saveError.errors
        } : undefined
      });
    }
   
    const chartData = formatChartData(chart);
   
    res.status(200).json({
      success: true,
      message: 'Dental chart saved successfully',
      data: chartData
    });

  } catch (error) {
    console.error('[saveDentalChart] Unexpected error:', error);
    console.error('[saveDentalChart] Error stack:', error.stack);
   
    res.status(500).json({
      success: false,
      message: 'Internal server error while saving dental chart',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    });
  }
};



// Add this function at the end of dentalChartController.js, before the export statements
export const fixCorruptedHospitalIds = async (req, res) => {
  try {
    //console.log('[fixCorruptedHospitalIds] Starting cleanup of corrupted hospitalId values...');
    
    // Find all dental charts with corrupted hospitalId
    const corruptedCharts = await DentalChart.find({
      hospitalId: { 
        $in: ['[object Object]', '[object%20Object]', 'undefined', null, ''] 
      }
    });
    
    //console.log(`[fixCorruptedHospitalIds] Found ${corruptedCharts.length} corrupted charts`);
    
    let fixedCount = 0;
    
    for (const chart of corruptedCharts) {
      try {
        // Try to get hospitalId from the associated patient
        const patient = await Patient.findById(chart.patientId);
        
        if (patient && patient.hospitalId) {
          const validHospitalId = typeof patient.hospitalId === 'object' 
            ? patient.hospitalId._id || patient.hospitalId.toString()
            : patient.hospitalId;
            
          if (validHospitalId && validHospitalId.match(/^[0-9a-fA-F]{24}$/)) {
            await DentalChart.findByIdAndUpdate(chart._id, {
              hospitalId: validHospitalId
            });
            
            //console.log(`[fixCorruptedHospitalIds] Fixed chart ${chart._id} with hospitalId ${validHospitalId}`);
            fixedCount++;
          }
        }
      } catch (error) {
        console.warn(`[fixCorruptedHospitalIds] Could not fix chart ${chart._id}:`, error.message);
      }
    }
    
    res.json({
      success: true,
      message: `Fixed ${fixedCount} corrupted dental charts`,
      totalFound: corruptedCharts.length,
      fixed: fixedCount
    });
    
  } catch (error) {
    console.error('[fixCorruptedHospitalIds] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix corrupted hospital IDs',
      error: error.message
    });
  }
};