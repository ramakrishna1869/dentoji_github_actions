// routes/customFieldsRoutes.js
import express from 'express';
import {
  // Patient custom fields
  getPatientCustomFields,
  addPatientCustomField,
  updatePatientCustomField,
  deletePatientCustomField,
  
  // Medication custom fields
  getMedicationCustomFields,
  addMedicationCustomField,
  updateMedicationCustomField,
  deleteMedicationCustomField,
  
  // Payment-Treatment custom fields
  getPaymentTreatmentCustomFields,
  addPaymentTreatmentCustomField,
  updatePaymentTreatmentCustomField,
  deletePaymentTreatmentCustomField
} from '../controllers/customFieldsController.js';

// Import your authentication middleware
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(verifyToken);

// Test route for debugging - KEEP THIS FIRST
router.get('/test', (req, res) => {
  //console.log('✅ Custom fields test route hit successfully');
  //console.log('🔑 User from token:', req.user);
  //console.log('🌐 Request URL:', req.originalUrl);
  //console.log('🔍 Request method:', req.method);
  
  res.json({ 
    success: true,
    message: 'Custom fields routes are working perfectly!',
    timestamp: new Date().toISOString(),
    userId: req.user?.id,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl,
    routes: {
      patient: [
        'GET /api/custom-fields/patient/:patientId',
        'POST /api/custom-fields/patient/:patientId', 
        'PUT /api/custom-fields/patient/:patientId/:fieldId',
        'DELETE /api/custom-fields/patient/:patientId/:fieldId'
      ],
      medication: [
        'GET /api/custom-fields/medication/:medicationId',
        'POST /api/custom-fields/medication/:medicationId',
        'PUT /api/custom-fields/medication/:medicationId/:fieldId', 
        'DELETE /api/custom-fields/medication/:medicationId/:fieldId'
      ],
      paymentTreatment: [
        'GET /api/custom-fields/payment-treatment/:patientId',
        'POST /api/custom-fields/payment-treatment/:patientId',
        'PUT /api/custom-fields/payment-treatment/:patientId/:fieldId',
        'DELETE /api/custom-fields/payment-treatment/:patientId/:fieldId'
      ]
    },
    tips: {
      usage: 'Make sure to include Authorization: Bearer <token> in your headers',
      contentType: 'Content-Type: application/json is required for POST/PUT requests'
    }
  });
});

// PATIENT CUSTOM FIELDS ROUTES
router.get('/patient/:patientId', getPatientCustomFields);
router.post('/patient/:patientId', addPatientCustomField);
router.put('/patient/:patientId/:fieldId', updatePatientCustomField);
router.delete('/patient/:patientId/:fieldId', deletePatientCustomField);

// MEDICATION CUSTOM FIELDS ROUTES
router.get('/medication/:medicationId', getMedicationCustomFields);
router.post('/medication/:medicationId', addMedicationCustomField);
router.put('/medication/:medicationId/:fieldId', updateMedicationCustomField);
router.delete('/medication/:medicationId/:fieldId', deleteMedicationCustomField);

// PAYMENT-TREATMENT CUSTOM FIELDS ROUTES
router.get('/payment-treatment/:patientId', getPaymentTreatmentCustomFields);
router.post('/payment-treatment/:patientId', addPaymentTreatmentCustomField);
router.put('/payment-treatment/:patientId/:fieldId', updatePaymentTreatmentCustomField);
router.delete('/payment-treatment/:patientId/:fieldId', deletePaymentTreatmentCustomField);

export default router;