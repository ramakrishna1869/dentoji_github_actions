// routes/financeRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import * as financeController from '../controllers/financeController.js';

const router = express.Router();

// Request logging middleware
const logRequest = (req, res, next) => {
  console.log(`[Finance Routes] ${req.method} ${req.path} - Patient: ${req.params.patientId || 'N/A'}`);
  
  if (req.query && Object.keys(req.query).length > 0) {
    console.log(`[Finance Routes] Query params:`, req.query);
  }
  
  next();
};

// Apply logging to all routes
router.use(logRequest);

// Patient-specific finance routes
router.get('/finance/patient/:patientId', 
  authenticateToken,
  financeController.getPatientFinance
);

router.post('/finance/patient/:patientId/sync', 
  authenticateToken,
  financeController.syncPatientFinance
);

// Hospital-wide finance routes (require authentication)
router.get('/finance/hospital/summary', 
  authenticateToken,
  financeController.getHospitalFinanceSummary
);

router.get('/finance/hospital/top-patients', 
  authenticateToken,
  financeController.getTopRevenuePatients
);

router.get('/finance/hospital/revenue-by-date', 
  authenticateToken,
  financeController.getRevenueByDateRange
);

router.post('/finance/hospital/bulk-sync', 
  authenticateToken,
  financeController.bulkSyncFinance
);

router.get('/finance/hospital/completed-revenue', 
  authenticateToken,
  financeController.getCompletedTreatmentRevenue
);

// For Total Paid Revenue
router.get('/finance/hospital/total-paid-revenue', 
  authenticateToken,
  financeController.getTotalPaidRevenue
);

router.get('/finance/hospital/lab-expenses', 
  authenticateToken,
  financeController.getLabExpenses
);

router.get('/finance/hospital/consultation-expenses', 
  authenticateToken,
  financeController.getConsultationExpenses
);

// Patient pending amounts routes
/*router.get('/patient-pending-amounts', 
  authenticateToken, 
  financeController.getPatientPendingAmounts
);

// NEW ROUTE: Get pending amounts from encounters
router.get('/patient-pending-amounts-encounters', 
  authenticateToken, 
  financeController.getPatientPendingAmountsFromEncounters
);*/

router.get('/patient-pending-amounts-combined', 
  authenticateToken, 
  financeController.getPatientPendingAmountsCombined
);

router.get('/patient-details/:patientId', 
  authenticateToken, 
  financeController.getPatientPendingDetails
);

// Global error handler
router.use((error, req, res, next) => {
  console.error('[Finance Routes] Error:', {
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