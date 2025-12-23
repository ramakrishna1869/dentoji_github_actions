
import express from 'express';
import {
  getDashboardData,
  getDashboardStats,
  getDashboardHeaderStats,
  getDoctorDetails,
  deleteDoctor
} from '../controllers/hostDashboardController.js';
import hostAuthMiddleware from '../middleware/hostAuth.js';

const router = express.Router();
// All routes use hostAuthMiddleware instead of authenticateToken ff
router.get('/dashboard', getDashboardData);
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/header-stats', getDashboardHeaderStats);
router.get('/dashboard/doctor/:doctorId', getDoctorDetails);
router.delete('/dashboard/doctor/:doctorId', deleteDoctor);

export default router;