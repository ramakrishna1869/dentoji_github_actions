import express from 'express';
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientById,
  getPatientStats,
  getAllAppointments,
  getAppointmentStats,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  generatePatientId,           // Import from controller
  addCustomFieldToAllPatients, // Import from controller
} from '../controllers/patientController.js';
import { verifyToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Patient routes
router.get('/', verifyToken, authorizeRoles(['Admin', 'Receptionist']), getPatients);
router.post('/:hospitalId', verifyToken, authorizeRoles(['Admin', 'Receptionist']), createPatient);
router.get('/:hospitalId/generate-patient-id', verifyToken, authorizeRoles(['Admin', 'Receptionist']), generatePatientId);
router.put('/:hospitalId/:patientId', verifyToken, authorizeRoles(['Admin', 'Receptionist']), updatePatient);
router.delete('/:hospitalId/:patientId', verifyToken, authorizeRoles(['Admin', 'Receptionist']), deletePatient);
router.get('/:hospitalId/:patientId', verifyToken, authorizeRoles(['Admin', 'Receptionist']), getPatientById);
router.post('/:hospitalId/add-custom-field', verifyToken, authorizeRoles(['Admin', 'Receptionist']), addCustomFieldToAllPatients);

// Patient stats
router.get('/stats', verifyToken, authorizeRoles(['Admin', 'Receptionist']), getPatientStats);

// Appointment routes (embedded in patients)
router.get('/appointments', verifyToken, authorizeRoles(['Admin', 'Receptionist']), getAllAppointments);
router.get('/appointments/stats', verifyToken, authorizeRoles(['Admin', 'Receptionist']), getAppointmentStats);
router.post('/:hospitalId/:patientId/appointments', verifyToken, authorizeRoles(['Admin', 'Receptionist']), createAppointment);
router.put('/:hospitalId/:patientId/appointments/:appointmentId', verifyToken, authorizeRoles(['Admin', 'Receptionist']), updateAppointment);
router.delete('/:hospitalId/:patientId/appointments/:appointmentId', verifyToken, authorizeRoles(['Admin', 'Receptionist']), deleteAppointment);

export default router;