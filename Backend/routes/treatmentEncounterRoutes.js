// routes/treatmentEncounterRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import * as treatmentEncounterController from '../controllers/treatmentEncounterController.js';

const router = express.Router();

// Request logging middleware - FIXED VERSION
const logRequest = (req, res, next) => {
  //console.log(`[TreatmentEncounter Routes] ${req.method} ${req.path} - Patient: ${req.params.patientId || 'N/A'}`);
  
  // Fix: Check if req.body exists and is an object before using Object.keys()
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    //console.log(`[TreatmentEncounter Routes] Body keys:`, Object.keys(req.body));
  }
  
  next();
};

// Apply logging to all routes
router.use(logRequest);

// Main treatment encounter routes
router.get('/treatment-encounters/active-patients/count', authenticateToken, treatmentEncounterController.getActivePatientsCount
);
router.get('/treatment-encounters/:patientId', treatmentEncounterController.getPatientEncounters);
router.post('/treatment-encounters/:patientId', treatmentEncounterController.savePatientEncounters);

// Individual encounter management
router.post('/treatment-encounters/:patientId/encounter', treatmentEncounterController.addEncounter);
router.put('/treatment-encounters/:patientId/encounter/:encounterId', treatmentEncounterController.updateEncounter);
router.delete('/treatment-encounters/:patientId/encounter/:encounterId', treatmentEncounterController.deleteEncounter);

// Statistics and reporting
router.get('/treatment-encounters/:patientId/statistics', treatmentEncounterController.getEncounterStatistics);

// Global error handler
router.use((error, req, res, next) => {
  console.error('[TreatmentEncounter Routes] Error:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    params: req.params
  });
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? {
      stack: error.stack,
      name: error.name
    } : undefined,
  });
});

export default router;