// ===== MIDDLEWARE USAGE GUIDE FOR ALL ROUTES =====
// This guide shows how to apply the enhanced middleware to different route types

// ===== PATIENT ROUTES EXAMPLE =====
/*
import express from 'express';
import {
  verifyTokenWithDailyExpiry,
  checkHospitalRegistrationWithExpiry,
  authorizeRolesWithExpiry,
  requireActiveSubscriptionWithExpiry,
  requireFeatureWithExpiry,
  checkPatientLimitWithExpiry
} from '../middleware/authMiddleware.js';
import { patientController } from '../controllers/patientController.js';

const router = express.Router();

// Base authentication for all patient routes
router.use(
  verifyTokenWithDailyExpiry,              // Daily 12 AM token expiry
  requireActiveSubscriptionWithExpiry,     // Active subscription required
  checkHospitalRegistrationWithExpiry      // Hospital must be registered
);

// Create patient (check limits)
router.post('/', 
  authorizeRolesWithExpiry(['Admin', 'Receptionist']),
  checkPatientLimitWithExpiry,  // Check subscription patient limits
  patientController.create
);

// Get all patients
router.get('/',
  authorizeRolesWithExpiry(['Admin', 'Receptionist']),
  patientController.getAll
);

// Update patient (premium feature)
router.put('/:id',
  authorizeRolesWithExpiry(['Admin', 'Receptionist']),
  requireFeatureWithExpiry('patientUpdates'),
  patientController.update
);

// Delete patient (Admin only)
router.delete('/:id',
  authorizeRolesWithExpiry(['Admin']),
  requireFeatureWithExpiry('deletePatients'),
  patientController.delete
);
*/

// ===== APPOINTMENT ROUTES EXAMPLE =====
/*
import express from 'express';
import {
  verifyTokenWithDailyExpiry,
  checkHospitalRegistrationWithExpiry,
  authorizeRolesWithExpiry,
  requireActiveSubscriptionWithExpiry,
  requireFeatureWithExpiry
} from '../middleware/authMiddleware.js';
import { appointmentController } from '../controllers/appointmentController.js';

const router = express.Router();

// Base authentication
router.use(
  verifyTokenWithDailyExpiry,
  requireActiveSubscriptionWithExpiry,
  checkHospitalRegistrationWithExpiry
);

// Create appointment
router.post('/',
  authorizeRolesWithExpiry(['Admin', 'Receptionist']),
  requireFeatureWithExpiry('appointments'),
  appointmentController.create
);

// Get appointments
router.get('/',
  authorizeRolesWithExpiry(['Admin', 'Receptionist']),
  appointmentController.getAll
);

// Update appointment
router.put('/:id',
  authorizeRolesWithExpiry(['Admin', 'Receptionist']),
  appointmentController.update
);

// Cancel appointment (Admin only for certain statuses)
router.patch('/:id/cancel',
  authorizeRolesWithExpiry(['Admin']),
  appointmentController.cancel
);
*/

// ===== RECEPTIONIST ROUTES EXAMPLE =====
/*
import express from 'express';
import {
  verifyTokenWithDailyExpiry,
  checkHospitalRegistrationWithExpiry,
  authorizeRolesWithExpiry,
  requireActiveSubscriptionWithExpiry,
  requireFeatureWithExpiry
} from '../middleware/authMiddleware.js';
import { receptionistController } from '../controllers/receptionistController.js';

const router = express.Router();

// Base authentication (Admin only for receptionist management)
router.use(
  verifyTokenWithDailyExpiry,
  requireActiveSubscriptionWithExpiry,
  checkHospitalRegistrationWithExpiry,
  authorizeRolesWithExpiry(['Admin'])  // Only Admin can manage receptionists
);

// Create receptionist (premium feature)
router.post('/',
  requireFeatureWithExpiry('receptionistManagement'),
  receptionistController.create
);

// Get all receptionists
router.get('/',
  receptionistController.getAll
);

// Update receptionist
router.put('/:id',
  receptionistController.update
);

// Delete/deactivate receptionist
router.delete('/:id',
  receptionistController.delete
);

// Reset receptionist password
router.patch('/:id/reset-password',
  requireFeatureWithExpiry('passwordReset'),
  receptionistController.resetPassword
);
*/

// ===== HOSPITAL ROUTES EXAMPLE =====
/*
import express from 'express';
import {
  verifyTokenWithDailyExpiry,
  authorizeRolesWithExpiry,
  requireActiveSubscriptionWithExpiry
} from '../middleware/authMiddleware.js';
import { hospitalController } from '../controllers/hospitalController.js';

const router = express.Router();

// Hospital registration (Admin only)
router.post('/',
  verifyTokenWithDailyExpiry,
  authorizeRolesWithExpiry(['Admin']),
  requireActiveSubscriptionWithExpiry,
  hospitalController.create
);

// Get hospital details
router.get('/',
  verifyTokenWithDailyExpiry,
  authorizeRolesWithExpiry(['Admin', 'Receptionist']),
  hospitalController.getDetails
);

// Update hospital (Admin only)
router.put('/',
  verifyTokenWithDailyExpiry,
  authorizeRolesWithExpiry(['Admin']),
  requireActiveSubscriptionWithExpiry,
  hospitalController.update
);
*/

// ===== REPORTS/ANALYTICS ROUTES EXAMPLE =====
/*
import express from 'express';
import {
  verifyTokenWithDailyExpiry,
  checkHospitalRegistrationWithExpiry,
  authorizeRolesWithExpiry,
  requireActiveSubscriptionWithExpiry,
  requireFeatureWithExpiry
} from '../middleware/authMiddleware.js';
import { reportsController } from '../controllers/reportsController.js';

const router = express.Router();

// Base authentication
router.use(
  verifyTokenWithDailyExpiry,
  requireActiveSubscriptionWithExpiry,
  checkHospitalRegistrationWithExpiry
);

// Patient analytics (premium feature)
router.get('/patient-analytics',
  authorizeRolesWithExpiry(['Admin']),
  requireFeatureWithExpiry('analytics'),
  reportsController.patientAnalytics
);

// Revenue reports (premium feature)
router.get('/revenue',
  authorizeRolesWithExpiry(['Admin']),
  requireFeatureWithExpiry('revenueReports'),
  reportsController.revenueReport
);

// Basic stats (available to receptionists)
router.get('/basic-stats',
  authorizeRolesWithExpiry(['Admin', 'Receptionist']),
  reportsController.basicStats
);
*/

// ===== PROFILE ROUTES EXAMPLE =====
/*
import express from 'express';
import {
  verifyTokenWithDailyExpiry,
  authorizeRolesWithExpiry
} from '../middleware/authMiddleware.js';
import { profileController } from '../controllers/profileController.js';

const router = express.Router();

// Profile routes (no subscription required for basic profile access)
router.use(verifyTokenWithDailyExpiry);

// Get own profile
router.get('/',
  authorizeRolesWithExpiry(['Admin', 'Receptionist']),
  profileController.getProfile
);

// Update own profile
router.put('/',
  authorizeRolesWithExpiry(['Admin', 'Receptionist']),
  profileController.updateProfile
);

// Upload profile image
router.post('/upload-image',
  authorizeRolesWithExpiry(['Admin', 'Receptionist']),
  profileController.uploadImage
);
*/

// ===== SUBSCRIPTION ROUTES EXAMPLE =====
/*
import express from 'express';
import {
  verifyTokenWithDailyExpiry,
  authorizeRolesWithExpiry
} from '../middleware/authMiddleware.js';
import { subscriptionController } from '../controllers/subscriptionController.js';

const router = express.Router();

// Subscription management (Admin only)
router.use(
  verifyTokenWithDailyExpiry,
  authorizeRolesWithExpiry(['Admin'])
);

// Get subscription status
router.get('/status',
  subscriptionController.getStatus
);

// Create/upgrade subscription
router.post('/create',
  subscriptionController.create
);

// Get usage statistics
router.get('/usage',
  subscriptionController.getUsage
);

// Cancel subscription
router.patch('/cancel',
  subscriptionController.cancel
);
*/

// ===== MIDDLEWARE DECISION MATRIX =====
/*

ROUTE TYPE                    | TOKEN | SUBSCRIPTION | HOSPITAL | ROLES           | FEATURES
------------------------------|-------|-------------|----------|-----------------|------------------
Auth (login/signup)           | ❌    | ❌          | ❌       | Public          | ❌
Profile Management            | ✅    | ❌          | ❌       | Admin,Recept    | ❌
Hospital Registration         | ✅    | ✅          | ❌       | Admin           | ❌
Patient Management            | ✅    | ✅          | ✅       | Admin,Recept    | patientUpdates
Appointment Management        | ✅    | ✅          | ✅       | Admin,Recept    | appointments
Consultation Management       | ✅    | ✅          | ✅       | Admin,Recept    | consultations
Receptionist Management       | ✅    | ✅          | ✅       | Admin           | receptionistMgmt
Reports/Analytics             | ✅    | ✅          | ✅       | Admin           | analytics
Payment Management            | ✅    | ✅          | ✅       | Admin,Recept    | paymentMgmt
Subscription Management       | ✅    | ❌          | ❌       | Admin           | ❌

Legend:
✅ = Required
❌ = Not Required
Admin = Admin role only
Recept = Receptionist role only
Admin,Recept = Both roles allowed

*/

// ===== COMMON PATTERNS =====

// Pattern 1: Public routes (no auth)
/*
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/health', healthController.check);
*/

// Pattern 2: Basic authenticated routes
/*
router.use(verifyTokenWithDailyExpiry);
router.get('/profile', profileController.get);
router.put('/profile', profileController.update);
*/

// Pattern 3: Subscription-required routes
/*
router.use(
  verifyTokenWithDailyExpiry,
  requireActiveSubscriptionWithExpiry
);
*/

// Pattern 4: Full business routes
/*
router.use(
  verifyTokenWithDailyExpiry,
  requireActiveSubscriptionWithExpiry,
  checkHospitalRegistrationWithExpiry,
  authorizeRolesWithExpiry(['Admin', 'Receptionist'])
);
*/

// Pattern 5: Admin-only management routes
/*
router.use(
  verifyTokenWithDailyExpiry,
  requireActiveSubscriptionWithExpiry,
  checkHospitalRegistrationWithExpiry,
  authorizeRolesWithExpiry(['Admin'])
);
*/

// Pattern 6: Premium feature routes
/*
router.get('/advanced-analytics',
  verifyTokenWithDailyExpiry,
  requireActiveSubscriptionWithExpiry,
  authorizeRolesWithExpiry(['Admin']),
  requireFeatureWithExpiry('advancedAnalytics'),
  analyticsController.advanced
);
*/