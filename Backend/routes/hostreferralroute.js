// routes/adminReferralRoutes.js
import express from 'express';
import {
  getAdminReferralStats,
  getAdminReferralList,
  getDoctorReferralDetails,
  deleteReferral
} from '../controllers/hostreferralController.js';

const router = express.Router();

/**
 * @route   GET /api/admin/referrals/stats
 * @desc    Get overall referral statistics for admin dashboard
 * @access  Public (no auth required)
 */
router.get('/stats', getAdminReferralStats);

/**
 * @route   GET /api/admin/referrals/list
 * @desc    Get all referrals grouped by referrer doctor
 * @access  Public (no auth required)
 */
router.get('/list', getAdminReferralList);

/**
 * @route   GET /api/admin/referrals/doctor/:doctorId
 * @desc    Get detailed referrals for a specific doctor
 * @access  Public (no auth required)
 */
router.get('/doctor/:doctorId', getDoctorReferralDetails);

/**
 * @route   DELETE /api/admin/referrals/:referralId
 * @desc    Delete a referral
 * @access  Public (no auth required)
 */
router.delete('/:referralId', deleteReferral);

export default router;