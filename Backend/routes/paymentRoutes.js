//paymentRoutes - UPDATED WITHOUT FREE TRIAL
import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import PaymentOrder from '../models/PaymentOrder.js';
import Admin from '../models/Admin.js';
import Subscription from '../models/Subscription.js';
import { SubscriptionService } from '../services/subscriptionService.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { getBasicPlanUsers, getPaidSubscriptionUsers, getUserSubscriptionDetails ,getPaymentHistory, getCurrentPlan} from '../controllers/paymentController.js';

dotenv.config();
const router = express.Router();

// Simple logger replacement for pino
const logger = {
  info: (obj, msg) => console.log('[INFO]', msg || '', obj),
  warn: (obj, msg) => console.warn('[WARN]', msg || '', obj),
  error: (obj, msg) => console.error('[ERROR]', msg || '', obj)
};

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Helper functions - UPDATED
const getPlanDuration = (planType) => {
  const durations = {
    'Basic Plan': 30,
    'Monthly Plan': 30,
    'Yearly Plan': 365,
  };
  return durations[planType] || 30;
};

const getPlanEndDate = (planType) => {
  const duration = getPlanDuration(planType);
  return new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
};

const getPlanAmount = (planType) => {
  const amounts = {
    'Basic Plan': 99900, // ₹999 in paise
    'Monthly Plan': 175000, // ₹1750 in paise
    'Yearly Plan': 1450000, // ₹14500 in paise
  };
  return amounts[planType] || 0;
};

const generateShortReceipt = (adminId) => {
  const timestamp = Date.now().toString().slice(-8);
  const shortAdminId = adminId.toString().slice(-8);
  return `rcpt_${timestamp}_${shortAdminId}`;
};

// GET: Available Plans - UPDATED
router.get('/plans', (req, res) => {
  const requestId = crypto.randomUUID();
  try {
    logger.info({ requestId, message: 'Fetching available plans' });
    const plans = [
      {
        id: 'basic-plan',
        planType: 'Basic Plan',
        title: 'Basic Plan',
        description: 'Perfect for small practices getting started',
        price: '₹999',
        period: '/month',
        amount: 99900,
        currency: 'INR',
        popular: false,
        gradient: 'from-green-400 to-emerald-500',
        bgClass: 'bg-white',
        borderClass: 'border-green-200',
        buttonClass: 'bg-gradient-to-r from-green-500 to-emerald-600',
        icon: 'Sparkles',
        button: 'Get Started',
        features: [
          { id: 'basic-f1', name: 'Up to 250 patients', allowed: true },
          { id: 'basic-f2', name: 'Basic appointment scheduling', allowed: true },
          { id: 'basic-f3', name: 'Patient management', allowed: true },
          { id: 'basic-f4', name: 'Medication management', allowed: true },
          { id: 'basic-f5', name: 'Receptionist Access', allowed: false },
          { id: 'basic-f6', name: 'Doctor Consultation', allowed: false },
          { id: 'basic-f7', name: 'Interactive Teeth Chart', allowed: false },
          { id: 'basic-f8', name: 'Unable to download prescription', allowed: false },
        ]
      },
      {
        id: 'monthly-plan',
        planType: 'Monthly Plan',
        title: 'Monthly Plan',
        description: 'Perfect for growing practices',
        price: '₹1750',
        period: '/month',
        amount: 175000,
        currency: 'INR',
        popular: true,
        badge: 'Most Popular',
        gradient: 'from-blue-500 to-cyan-500',
        bgClass: 'bg-blue-50',
        borderClass: 'border-blue-300',
        buttonClass: 'bg-gradient-to-r from-blue-500 to-cyan-600',
        icon: 'Zap',
        button: 'Choose Monthly',
        features: [
          { id: 'monthly-f1', name: 'Everything Basic Plan', allowed: true },
          { id: 'monthly-f2', name: 'Advanced Scheduling', allowed: true },
          { id: 'monthly-f3', name: 'Complete patient history', allowed: true },
          { id: 'monthly-f4', name: 'Advanced analytics', allowed: true },
          { id: 'monthly-f5', name: 'Priority support', allowed: true },
          { id: 'monthly-f6', name: 'Referral system', allowed: true },
          { id: 'monthly-f7', name: 'Custom Reports', allowed: true },
        ],
      },
      {
        id: 'yearly-plan',
        planType: 'Yearly Plan',
        title: 'Yearly Plan',
        description: 'Best value for established practices',
        price: '₹14500',
        period: '/year',
        originalPrice: '₹20,400',
        savings: 'Save ₹2,400',
        amount: 1450000,
        currency: 'INR',
        popular: false,
        gradient: 'from-purple-500 to-pink-500',
        bgClass: 'bg-purple-50',
        borderClass: 'border-purple-300',
        buttonClass: 'bg-gradient-to-r from-purple-500 to-pink-600',
        icon: 'Crown',
        button: 'Choose Yearly',
        features: [
          { id: 'yearly-f1', name: "Everything in Monthly Plan", allowed: true },
          { id: 'yearly-f2', name: "Unlimited patients", allowed: true },
          { id: 'yearly-f3', name: "Advanced integrations", allowed: true },
          { id: 'yearly-f4', name: "Custom branding ", allowed: true },
          { id: 'yearly-f5', name: "API access ", allowed: true },
          { id: 'yearly-f6', name: "Dedicated Support", allowed: true },
          { id: 'yearly-f7', name: "Practice analytics", allowed: true },
          { id: 'yearly-f8', name: "Export Capabilities", allowed: true },
        ],
      }
    ];

    res.json({ success: true, plans });
  } catch (error) {
    logger.error({ requestId, error: error.message, stack: error.stack, message: 'Error fetching plans' });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans',
      error: error.message,
      requestId,
    });
  }
});
// POST: Create Razorpay Order - UPDATED (NO FREE TRIAL)
router.post('/create-order', verifyToken, async (req, res) => {
  const requestId = crypto.randomUUID();
  try {
    const { planType } = req.body;
    const adminId = req.user.id;

    logger.info({ requestId, adminId, planType, message: 'Creating order' });

    const validPlanTypes = ['Basic Plan', 'Monthly Plan', 'Yearly Plan'];
    if (!validPlanTypes.includes(planType)) {
      logger.warn({ requestId, adminId, planType, message: 'Invalid plan type' });
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type. Valid plans: Basic Plan, Monthly Plan, Yearly Plan',
        requestId,
      });
    }

    // Check for existing subscription
    const existingSubscription = await SubscriptionService.getCurrentSubscription(adminId);
    
    // Only block if trying to buy the SAME plan again
    if (existingSubscription && existingSubscription.planType === planType) {
      return res.status(409).json({
        success: false,
        message: `You already have an active ${planType} subscription`,
        currentPlan: existingSubscription.planType,
        daysRemaining: existingSubscription.getDaysRemaining(),
        requestId,
      });
    }

    // Log plan switch
    if (existingSubscription) {
      logger.info({
        requestId,
        adminId,
        currentPlan: existingSubscription.planType,
        newPlan: planType,
        message: `Plan switch: ${existingSubscription.planType} → ${planType}`
      });
    }

    const amount = getPlanAmount(planType);
    if (amount <= 0) {
      logger.warn({ requestId, adminId, planType, message: 'Invalid plan amount' });
      return res.status(400).json({
        success: false,
        message: 'Invalid plan amount',
        requestId,
      });
    }

    const shortReceipt = generateShortReceipt(adminId);
    logger.info({ requestId, adminId, receipt: shortReceipt, message: `Generated receipt (length: ${shortReceipt.length})` });

    const orderOptions = {
      amount,
      currency: 'INR',
      receipt: shortReceipt,
      payment_capture: 1,
      notes: {
        planType,
        adminId,
        adminEmail: req.user.email || '',
        createdAt: new Date().toISOString(),
        switchingFrom: existingSubscription ? existingSubscription.planType : 'none'
      },
    };

    const razorpayOrder = await razorpay.orders.create(orderOptions);
    logger.info({ requestId, adminId, orderId: razorpayOrder.id, message: 'Razorpay order created successfully' });

    const paymentOrderData = {
      adminId,
      orderId: shortReceipt,
      razorpayOrderId: razorpayOrder.id,
      amount: amount / 100,
      currency: 'INR',
      planType,
      planDuration: getPlanDuration(planType),
      planEndDate: getPlanEndDate(planType),
      receipt: shortReceipt,
      status: 'created',
      userDetails: {
        id: req.user.id,
        name: req.user.name || '',
        email: req.user.email || '',
        phone: req.user.phone || '',
        qualification: req.user.qualification || '',
      },
      metadata: {
        adminName: req.user.name || '',
        adminEmail: req.user.email || '',
        type: existingSubscription ? 'plan_switch' : 'subscription_payment',
        previousPlan: existingSubscription ? existingSubscription.planType : null,
        userAgent: req.get('User-Agent') || '',
        ip: req.ip || '',
        reason: existingSubscription ? `Switching from ${existingSubscription.planType} to ${planType}` : 'New subscription purchase',
        timestamp: new Date().toISOString(),
      },
      paymentDetails: {
        payment_method: 'razorpay',
        payment_status: 'pending',
        razorpay_order_id: razorpayOrder.id,
        created_at: razorpayOrder.created_at,
      },
    };

    const savedPaymentOrder = await PaymentOrder.create(paymentOrderData);
    logger.info({ requestId, adminId, paymentOrderId: savedPaymentOrder._id, message: 'Payment order saved successfully' });

    res.json({
      success: true,
      message: existingSubscription 
        ? `Switching from ${existingSubscription.planType} to ${planType}`
        : 'Order created successfully',
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status,
      },
      paymentOrderId: savedPaymentOrder._id,
      planDetails: {
        planType,
        planDuration: getPlanDuration(planType),
        formattedAmount: `₹${(amount / 100).toLocaleString('en-IN')}`,
        switchingFrom: existingSubscription ? existingSubscription.planType : null
      },
      requestId,
    });
  } catch (error) {
    logger.error({ requestId, adminId: req.user.id, error: error.message, stack: error.stack, message: 'Error creating order' });
    let errorMessage = 'Failed to create payment order';
    let statusCode = 500;

    if (error.message && error.message.includes('receipt')) {
      errorMessage = 'Receipt generation error. Please try again.';
      statusCode = 400;
    } else if (error.statusCode) {
      statusCode = error.statusCode;
      errorMessage = error.error?.description || error.message || errorMessage;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message,
      requestId,
      details: process.env.NODE_ENV === 'development' ? { razorpayError: error.error || null, stack: error.stack } : undefined,
    });
  }
});

// POST: Verify Payment - UPDATED WITH TRANSACTIONS
router.post('/verify-payment', verifyToken, async (req, res) => {
  const requestId = crypto.randomUUID();
  const session = await mongoose.startSession();
  
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = req.body;
    const adminId = req.user.id;

    logger.info({ requestId, adminId, razorpay_order_id, razorpay_payment_id, planType, message: 'Verifying payment' });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      logger.warn({ requestId, adminId, message: 'Missing required payment parameters' });
      await session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Missing required payment parameters',
        required: ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'],
        requestId,
      });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET).update(body.toString()).digest('hex');

    if (expectedSignature !== razorpay_signature) {
      logger.error({
        requestId,
        adminId,
        expectedSignature,
        receivedSignature: razorpay_signature,
        message: 'Payment signature verification failed',
      });

      await PaymentOrder.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          status: 'failed',
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          'paymentDetails.payment_status': 'failed',
          'paymentDetails.error_description': 'Invalid payment signature',
          updatedAt: new Date(),
        }
      );

      await session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed. This transaction is not authentic.',
        errorCode: 'SIGNATURE_VERIFICATION_FAILED',
        requestId,
      });
    }

    logger.info({ requestId, adminId, message: 'Payment signature verified successfully' });

    // Fetch payment details from Razorpay
    let paymentDetails = null;
    try {
      paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
      logger.info({
        requestId,
        adminId,
        paymentId: paymentDetails.id,
        status: paymentDetails.status,
        method: paymentDetails.method,
        amount: paymentDetails.amount,
        message: 'Payment details fetched from Razorpay',
      });
    } catch (fetchError) {
      logger.error({ requestId, adminId, error: fetchError.message, stack: fetchError.stack, message: 'Error fetching payment details from Razorpay' });
    }

    // START TRANSACTION
    try {
      await session.startTransaction();

      // Update PaymentOrder
      const updatedPaymentOrder = await PaymentOrder.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          status: 'completed',
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          paymentDetails: {
            payment_method: paymentDetails?.method || 'card',
            payment_status: 'completed',
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            amount: paymentDetails?.amount || 0,
            currency: paymentDetails?.currency || 'INR',
            created_at: paymentDetails?.created_at || Math.floor(Date.now() / 1000),
            captured_at: paymentDetails?.captured_at || Math.floor(Date.now() / 1000),
            verified_at: new Date(),
          },
          updatedAt: new Date(),
        },
        { new: true, session }
      );

      if (!updatedPaymentOrder) {
        throw new Error('Payment order record not found in our database');
      }

      logger.info({ requestId, adminId, paymentOrderId: updatedPaymentOrder._id, message: 'Payment order updated successfully' });

      // Deactivate existing subscriptions
      await Subscription.updateMany(
        {
          adminId: adminId,
          status: 'active'
        },
        {
          status: 'replaced',
          updatedAt: new Date()
        },
        { session }
      );

      // Create new subscription
      const subscriptionPaymentDetails = {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        payment_method: paymentDetails?.method || 'card',
        payment_status: 'completed',
      };

      const planConfig = Subscription.getPlanFeatures(planType);
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + (planConfig.duration * 24 * 60 * 60 * 1000));

      const subscription = new Subscription({
        adminId: adminId,
        planType: planType,
        status: 'active',
        startDate: startDate,
        endDate: endDate,
        amount: planConfig.amount,
        currency: 'INR',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        paymentDetails: subscriptionPaymentDetails,
        features: {
          maxPatients: planConfig.maxPatients,
          hasAdvancedReporting: planConfig.hasAdvancedReporting,
          hasPrioritySupport: planConfig.hasPrioritySupport,
          hasApiAccess: planConfig.hasApiAccess,
          hasWhiteLabel: planConfig.hasWhiteLabel
        },
        autoRenew: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedSubscription = await subscription.save({ session });
      logger.info({ requestId, adminId, subscriptionId: savedSubscription._id, message: 'Subscription created successfully' });

      // Update Admin record
      await Admin.findByIdAndUpdate(
        adminId,
        {
          subscriptionStatus: 'active',
          currentPlan: planType,
          subscriptionId: savedSubscription._id,
          subscriptionStartDate: startDate,
          subscriptionEndDate: endDate,
          lastSubscriptionUpdate: new Date()
        },
        { session }
      );

      // COMMIT TRANSACTION
      await session.commitTransaction();
      logger.info({ requestId, adminId, message: 'Transaction committed successfully' });

      res.json({
        success: true,
        message: `Payment verified successfully! Your ${planType} subscription is now active.`,
        data: {
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          planType,
          status: 'completed',
          subscriptionId: savedSubscription._id,
          subscription: {
            id: savedSubscription._id,
            planType: savedSubscription.planType,
            status: savedSubscription.status,
            startDate: savedSubscription.startDate,
            endDate: savedSubscription.endDate,
            daysRemaining: savedSubscription.getDaysRemaining(),
            features: savedSubscription.features,
          },
        },
        nextStep: {
          redirectTo: '/hospitalform',
          message: 'Your subscription is active! Please complete your hospital setup to start using Dentoji.',
        },
        requestId,
      });

    } catch (transactionError) {
      await session.abortTransaction();
      logger.error({ requestId, adminId, error: transactionError.message, stack: transactionError.stack, message: 'Transaction aborted due to error' });
      throw transactionError;
    }

  } catch (error) {
    logger.error({ requestId, adminId: req.user.id, error: error.message, stack: error.stack, message: 'Error verifying payment' });
    res.status(500).json({
      success: false,
      message: 'Payment verification failed due to server error',
      error: error.message,
      requestId,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  } finally {
    await session.endSession();
    logger.info({ requestId, message: 'Session ended' });
  }
});

// GET: Subscription Status
router.get('/subscription-status', verifyToken, async (req, res) => {
  const requestId = crypto.randomUUID();
  try {
    const adminId = req.user.id;
    logger.info({ requestId, adminId, message: 'Checking subscription status' });

    const subscriptionStatus = await SubscriptionService.checkSubscriptionStatus(adminId);

    logger.info({
      requestId,
      adminId,
      hasActive: subscriptionStatus.hasActiveSubscription,
      planType: subscriptionStatus.planType,
      daysRemaining: subscriptionStatus.daysRemaining,
      message: 'Subscription status retrieved',
    });

    res.json({
      success: true,
      message: subscriptionStatus.message,
      ...subscriptionStatus,
      requestId,
    });
  } catch (error) {
    logger.error({ requestId, adminId: req.user.id, error: error.message, stack: error.stack, message: 'Error getting subscription status' });
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription status',
      error: error.message,
      hasActiveSubscription: false,
      needsPricing: true,
      requestId,
    });
  }
});

// DELETE: Delete User Basic Plan (Admin only) - UPDATED
router.delete('/delete-basic-plan/:userId', verifyToken, async (req, res) => {
  const requestId = crypto.randomUUID();
  try {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      logger.warn({ requestId, userId, message: 'Invalid user ID' });
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required',
        requestId,
      });
    }

    const admin = await Admin.findById(userId);
    if (!admin) {
      logger.warn({ requestId, userId, message: 'User not found' });
      return res.status(404).json({
        success: false,
        message: 'User not found',
        requestId,
      });
    }

    const basicPlanSubscription = await Subscription.findOne({
      adminId: userId,
      planType: 'Basic Plan',
      status: 'active'
    });

    if (!basicPlanSubscription) {
      return res.status(400).json({
        success: false,
        message: 'User does not have an active Basic Plan',
        requestId,
      });
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await Subscription.findByIdAndUpdate(
          basicPlanSubscription._id,
          {
            status: 'cancelled',
            cancelledAt: new Date(),
            cancellationReason: 'Deleted by admin',
            updatedAt: new Date(),
          },
          { session }
        );

        await Admin.findByIdAndUpdate(
          userId,
          {
            subscriptionStatus: 'cancelled',
            currentPlan: null,
            subscriptionId: null,
            lastSubscriptionUpdate: new Date(),
          },
          { session }
        );

        await PaymentOrder.updateMany(
          {
            adminId: userId,
            planType: 'Basic Plan',
            status: 'completed',
          },
          {
            status: 'cancelled',
            updatedAt: new Date(),
          },
          { session }
        );
      });
    } catch (transactionError) {
      logger.error({ requestId, userId, error: transactionError.message, stack: transactionError.stack, message: 'Transaction failed' });
      throw transactionError;
    } finally {
      await session.endSession();
    }

    logger.info({ requestId, userId, message: `Basic Plan deleted for user ${userId} by admin` });

    res.status(200).json({
      success: true,
      message: 'Basic Plan deleted successfully',
      data: {
        userId,
        userName: admin.name,
        deletedAt: new Date(),
      },
      requestId,
    });
  } catch (error) {
    logger.error({ requestId, userId: req.params.userId, error: error.message, stack: error.stack, message: 'Error deleting user Basic Plan' });
    res.status(500).json({
      success: false,
      message: 'Failed to delete user Basic Plan',
      error: error.message,
      requestId,
    });
  }
});

// GET: Debug subscription data (development only)
if (process.env.NODE_ENV === 'development') {
  router.get('/debug/:adminId', async (req, res) => {
    const requestId = crypto.randomUUID();
    try {
      const { adminId } = req.params;
      logger.info({ requestId, adminId, message: 'Fetching debug subscription data' });
      const debugData = await SubscriptionService.debugSubscriptionData(adminId);
      res.json({ success: true, debug: debugData, requestId });
    } catch (error) {
      logger.error({ requestId, adminId: req.params.adminId, error: error.message, stack: error.stack, message: 'Error fetching debug data' });
      res.status(500).json({ success: false, error: error.message, requestId });
    }
  });
}

// GET: Basic Plan Users (was Free Trial Users)
router.get('/basic-plans', verifyToken, getBasicPlanUsers);

// GET: Paid Subscription Users
router.get('/paid-subscriptions', verifyToken, getPaidSubscriptionUsers);
router.get('/current-plan', verifyToken, getCurrentPlan);

// GET: Specific User Details
router.get('/user-details/:userId', verifyToken, getUserSubscriptionDetails);
router.get('/payment-history', verifyToken, getPaymentHistory);

export default router;