import express from 'express';
import {
  createConsultation,
  getConsultations,
  getConsultationById,
  updateConsultation,
  deleteConsultation,
  searchPatientsForConsultation,
  testConsultation,
  updatePayment,
  getUpcomingConsultations,
  getPendingPayments,
  getConsultationStats
} from '../controllers/consultationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Global authentication middleware
router.use(verifyToken);

// Test
router.post('/test', testConsultation);

// Stats & utility routes
router.get('/stats', getConsultationStats);
router.get('/upcoming', getUpcomingConsultations);
router.get('/pending-payments', getPendingPayments);
router.get('/search-patients', searchPatientsForConsultation);

// CRUD
router.post('/', createConsultation);
router.get('/', getConsultations);
router.get('/:id', getConsultationById);

// Payment route MUST be above update route
router.put('/:id/payment', updatePayment);

router.put('/:id', updateConsultation);
router.delete('/:id', deleteConsultation);

export default router;
