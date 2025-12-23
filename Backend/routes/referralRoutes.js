// routes/referralRoutes.js
import express from 'express';
import {
  getReferralStats,
  getReferralInfo,
  sendReferralInvitation,
  getReferralList,
    trackReferralSubscription
} from '../controllers/referralController.js';
import { verifyToken } from '../middleware/authMiddleware.js'; // Adjust based on your auth middleware

const router = express.Router();

/**
 * @route   GET /api/referral/stats
 * @desc    Get referral statistics (Total Sent, Registered, Pending, Success Rate)
 * @access  Protected
 */
router.get('/stats', verifyToken, getReferralStats);

/**
 * @route   GET /api/referral/info
 * @desc    Get referral code, link, and earnings
 * @access  Protected
 */
router.get('/info', verifyToken, getReferralInfo);

/**
 * @route   POST /api/referral/invite
 * @desc    Send referral invitation to a doctor
 * @access  Protected
 * @body    { email, name, phone }
 */
router.post('/invite', verifyToken, sendReferralInvitation);

/**
 * @route   GET /api/referral/list
 * @desc    Get all referrals for logged-in doctor
 * @access  Protected
 * @query   status, startDate, endDate (optional filters)
 */
router.get('/list', verifyToken, getReferralList);
router.get('/rewards',verifyToken, trackReferralSubscription);
export default router;