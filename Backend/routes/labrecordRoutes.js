
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  createLabRecord,
  getLabRecords,
  getLabRecordById,
  updateLabRecord,
  deleteLabRecord,
  searchPatientsForLab,
  testLabRecord,
  uploadBill,
  viewBill,
  updatePayment,
    getLabStatistics,
  getLabStatsSummary
} from '../controllers/labRecordController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/lab-bills/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: labrecord_id + timestamp + original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `lab-bill-${req.params.id}-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  /*console.log('File filter - File info:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype
  });*/

  // Accept only specific file types
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    //console.log('File type accepted');
    return cb(null, true);
  } else {
    //console.log('File type rejected');
    cb(new Error('Only .png, .jpg, .jpeg, and .pdf files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});

// Apply authentication middleware to all routes
router.use(verifyToken);

// Debug/Test endpoints
router.post('/test', testLabRecord);

// Main CRUD operations
router.post('/', createLabRecord);                    // Create new lab record
router.get('/', getLabRecords);                       // Get all lab records with filtering
router.get('/search-patients', searchPatientsForLab); // Search patients for lab record
router.get('/:id', getLabRecordById);                 // Get single lab record
router.put('/:id', updateLabRecord);                  // Update lab record
router.delete('/:id', deleteLabRecord);               // Delete lab record
router.get('/statistics', verifyToken, getLabStatistics);
router.get('/statistics/summary', verifyToken, getLabStatsSummary);

// Bill management routes
router.post('/:id/upload-bill', upload.single('bill'), uploadBill); // Upload bill
router.get('/:id/view-bill', viewBill);               // View uploaded bill

// Payment update route
router.put('/:id/payment', updatePayment);            // Update payment status

export default router;