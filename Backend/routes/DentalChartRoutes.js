// routes/dentalChartRoutes.js - FIXED VERSION WITH PATIENT ENDPOINT
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dentalChartController from '../controllers/dentalChartController.js';
// Removed: import { verifyToken } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'Uploads', 'dental-photos');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const sanitizedName = path.basename(file.originalname, extension).replace(/[^a-zA-Z0-9.-]/g, '');
    cb(null, `dental-${uniqueSuffix}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
  },
});

// Multer error handling middleware
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.',
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name in file upload.',
      });
    }
  }
  if (error.message === 'Invalid file type. Only images are allowed.') {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  next(error);
};

// REMOVED: Authentication middleware
// router.use(verifyToken);

// Main dental chart routes - NO AUTHENTICATION REQUIRED
router.get('/dentalchart/:patientId', dentalChartController.getDentalChart);
router.post('/dentalchart/:patientId', dentalChartController.saveDentalChart);
router.delete('/dentalchart/:patientId', dentalChartController.deleteDentalChart);

// NEW: INVESTIGATION COMMENT SPECIFIC ROUTES (Optional - if you want separate endpoints)
router.get('/:patientId/investigation-comment', dentalChartController.getInvestigationComment);
router.post('/:patientId/investigation-comment', dentalChartController.saveInvestigationComment);

// FIXED: Patient data endpoint
router.get('/dentalchart/:patientId/patient', dentalChartController.getPatientBasicInfo);

// Photo management routes - NO AUTHENTICATION REQUIRED
router.post('/dentalchart/:patientId/upload-photo',
  upload.single('photo'),
  handleMulterError,
  dentalChartController.uploadPhoto
);

// Add this route at the end, before the error handler
router.post('/fix-corrupted-hospital-ids', dentalChartController.fixCorruptedHospitalIds);

router.post('/dentalchart/:patientId/upload-photos',
  upload.array('photos', 5),
  handleMulterError,
  dentalChartController.uploadMultiplePhotos
);

router.get('/dentalchart/:patientId/photos', dentalChartController.getPhotos);
router.put('/dentalchart/:patientId/photo/:photoId', dentalChartController.updatePhoto);
router.delete('/dentalchart/:patientId/photo/:photoId', dentalChartController.removePhoto);

// PROFORMA ROUTES - NO AUTHENTICATION REQUIRED
router.post('/dentalchart/:patientId/proforma', dentalChartController.saveProformaData);
router.get('/dentalchart/:patientId/proforma', dentalChartController.getProformaData);
router.get('/dentalchart/:patientId/proforma/report', dentalChartController.generateProformaReport);
router.get('/dentalchart/:patientId/proforma/export', dentalChartController.exportProformaData);

// Additional utility routes - NO AUTHENTICATION REQUIRED
router.get('/dentalchart/:patientId/print', dentalChartController.printProforma);
router.get('/dentalchart/:patientId/statistics', dentalChartController.getChartStatistics);

// Global error handler for this router
router.use((error, req, res, next) => {
  console.error('Dental chart route error:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
});

export default router;
