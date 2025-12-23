// routes/graphStatsRoutes.js
import express from 'express';
import {
  getGraphHeaderStats,
  getSubscriptionTrends,
  getOnboardingFunnelStats,
  getSubscriptionTrendsDetailed, 
} from '../controllers/graphStatsController.js';
import hostAuthMiddleware from '../middleware/hostAuth.js';
const router = express.Router();

/**
 * @route   GET /api/graph/header-stats
 * @desc    Get graph header statistics (cards data)
 * @access  Protected (requires authentication)
 * @returns {
 *   totalClinicsOnboarded: number,
 *   activeClinics: number,
 *   newOnboardingsThisMonth: number,
 *   inactiveClinics: number
 * }
 */
router.get('/header-stats', hostAuthMiddleware, getGraphHeaderStats);

/**
 * @route   GET /api/graph/subscription-trends
 * @desc    Get subscription trends data for chart
 * @access  Protected (requires authentication)
 * @query   timeframe (optional) - 'weekly', 'monthly', or 'yearly' (default: 'monthly')
 * @returns {
 *   timeframe: string,
 *   data: Array<{ label: string, value: number }>
 * }
 * @example GET /api/graph/subscription-trends?timeframe=monthly
 */
router.get('/subscription-trends', hostAuthMiddleware, getSubscriptionTrends);

/**
 * @route   GET /api/graph/onboarding-funnel
 * @desc    Get onboarding funnel statistics
 * @access  Protected (requires authentication)
 * @returns {
 *   leads: number,
 *   demos: number,
 *   onboarded: number
 * }
 */

router.get('/subscription-trends-detailed', hostAuthMiddleware, getSubscriptionTrendsDetailed);

router.get('/onboarding-funnel', hostAuthMiddleware, getOnboardingFunnelStats);

export default router;
