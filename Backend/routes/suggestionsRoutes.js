// routes/suggestionsRoutes.js
import express from 'express';
import {
  createSuggestions,
  getPatientSuggestions,
  getHospitalSuggestions,
  updateSuggestion,
  deleteSuggestion
} from '../controllers/suggestionsController.js';
//import { verifyToken } from '../middleware/auth.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// CREATE - Add new suggestions for a patient
// POST /api/suggestions/hospital/:hospitalId/patient/:patientId
router.post('/hospital/:hospitalId/patient/:patientId', verifyToken, createSuggestions);

// GET - Fetch suggestions for a specific patient
// GET /api/suggestions/hospital/:hospitalId/patient/:patientId
router.get('/hospital/:hospitalId/patient/:patientId', verifyToken, getPatientSuggestions);

// GET - Fetch all suggestions for a hospital (with optional patient filter)
// GET /api/suggestions/hospital/:hospitalId?patientId=xxx&page=1&limit=20
router.get('/hospital/:hospitalId', verifyToken, getHospitalSuggestions);

// UPDATE - Update a specific suggestion
// PUT /api/suggestions/:suggestionId
router.put('/:suggestionId', verifyToken, updateSuggestion);

// DELETE - Delete a specific suggestion
// DELETE /api/suggestions/:suggestionId
router.delete('/:suggestionId', verifyToken, deleteSuggestion);

export default router;