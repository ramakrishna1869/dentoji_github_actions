
import express from 'express';
import {
  registerReceptionist,
  loginReceptionist,
  updateReceptionist,
  deleteReceptionist,
  listofReceptionist,
  getTempPassword,
  changePassword,
  fixPasswordEncryption,
  getReceptionistCount,
  checkReceptionistLimit
} from '../controllers/receptionistController.js';
import {
  verifyToken,
  verifyTokenWithSubscription,
  checkHospitalRegistration,
  authorizeRoles,
  requireFeature
} from '../middleware/authMiddleware.js';

const router = express.Router();

// ========================================
// PUBLIC ROUTES (No Authentication Required)
// ========================================

// ✅ Receptionist login - NO subscription check here
// The subscription check happens INSIDE the controller
router.post('/login', loginReceptionist);

// ========================================
// ADMIN UTILITY ROUTES
// ========================================

// Admin utility for fixing password encryption issues
router.post('/fix-passwords',
  verifyToken,
  authorizeRoles(['Admin']),
  fixPasswordEncryption
);

// ========================================
// PROTECTED ROUTES (Authentication Required)
// ========================================

// Get list of receptionists
router.get('/list', verifyToken, listofReceptionist);

// Password management routes
router.get('/:id/temp-password',
  verifyToken,
  authorizeRoles(['Admin']),
  getTempPassword
);

router.put('/:id/change-password',
  verifyToken,
  changePassword
);

// ========================================
// ADMIN ONLY ROUTES (Subscription Required)
// ========================================

// Register new receptionist (Admin only, requires subscription)
router.post('/register',
  verifyTokenWithSubscription,
  checkHospitalRegistration,
  authorizeRoles(['Admin']),
  registerReceptionist
);

router.post('/',
  verifyTokenWithSubscription,
  checkHospitalRegistration,
  authorizeRoles(['Admin']),
  registerReceptionist
);

// Update receptionist (Admin only with subscription)
router.put('/:id',
  verifyTokenWithSubscription,
  checkHospitalRegistration,
  authorizeRoles(['Admin']),
  updateReceptionist
);

router.put('/update/:id',
  verifyTokenWithSubscription,
  checkHospitalRegistration,
  authorizeRoles(['Admin']),
  updateReceptionist
);

// Delete receptionist (Admin only with subscription)
router.delete('/:id',
  verifyTokenWithSubscription,
  checkHospitalRegistration,
  authorizeRoles(['Admin']),
  deleteReceptionist
);

router.delete('/remove/:id',
  verifyTokenWithSubscription,
  checkHospitalRegistration,
  authorizeRoles(['Admin']),
  deleteReceptionist
);

// Check receptionist limit and count
router.get('/check-limit', verifyToken, checkReceptionistLimit);
router.get('/count', verifyToken, getReceptionistCount);

export default router;