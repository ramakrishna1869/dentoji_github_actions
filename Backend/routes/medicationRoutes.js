// routes/medicationRoutes.js
import express from 'express';
import {
  createMedication,
  getPatientMedications,
  getAllMedications,
  getMedicationById,
  updateMedication,
  deleteMedication,
  getMedicationStats
} from '../controllers/medicationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get medication statistics
router.get('/stats', verifyToken, getMedicationStats);

// Get all medications with pagination and filtering
router.get('/', verifyToken, getAllMedications);

// Create new medication/prescription for a specific patient
router.post('/patient/:patientId', verifyToken, createMedication);

// Get all medications for a specific patient
router.get('/patient/:patientId', verifyToken, getPatientMedications);

// Get specific medication by ID
router.get('/:medicationId', verifyToken, getMedicationById);

// Update specific medication
router.put('/:medicationId', verifyToken, updateMedication);

// Delete specific medication
router.delete('/:medicationId', verifyToken, deleteMedication);

export default router;