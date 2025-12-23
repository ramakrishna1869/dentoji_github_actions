// controllers/paymentController.js
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import PaymentOrder from '../models/PaymentOrder.js';
import Admin from '../models/Admin.js';
import Subscription from '../models/Subscription.js';
import { SubscriptionService } from '../services/subscriptionService.js';
import { trackReferralSubscription } from './referralController.js';
// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ,
  key_secret: process.env.RAZORPAY_SECRET 
});

// Plan configurations with pricing
const PLAN_CONFIGS = {
  'Basic Plan': {
    amount: 99900, // ₹999 in paise
    duration: 30, // days
    features: {
      maxPatients: 250,
      hasAdvancedReporting: false,
      hasPrioritySupport: false,
      hasApiAccess: false,
      hasWhiteLabel: false
    }
  },
  'Monthly Plan': {
    amount: 175000, // ₹1750 in paise
    duration: 30,
    features: {
      maxPatients: -1, // Unlimited
      hasAdvancedReporting: true,
      hasPrioritySupport: true,
      hasApiAccess: false,
      hasWhiteLabel: false
    }
  },
  'Yearly Plan': {
    amount: 1450000, // ₹14500 in paise
    duration: 365,
    features: {
      maxPatients: -1, // Unlimited
      hasAdvancedReporting: true,
      hasPrioritySupport: true,
      hasApiAccess: true,
      hasWhiteLabel: true
    }
  }
};

// --- GET AVAILABLE PLANS ---
// --- GET AVAILABLE PLANS ---
export const getPlans = async (req, res) => {
  try {
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

    res.status(200).json({
      success: true,
      plans
    });

  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans',
      error: error.message
    });
  }
};

// --- CREATE RAZORPAY ORDER ---
export const createOrder = async (req, res) => {
  try {
    const { planType, currency = 'INR', adminId } = req.body;

    // Validate planType
    if (!planType) {
      return res.status(400).json({
        success: false,
        message: 'planType is required'
      });
    }

    // Get plan config
    const planConfig = PLAN_CONFIGS[planType];
    if (!planConfig) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan type: ${planType}`
      });
    }

    // ✅ Correct amount (in paise for Razorpay)
    const amount = planConfig.amount;

    // Resolve admin ID
    const actualAdminId = adminId || req.user?.id || req.user?.adminId;
    if (!actualAdminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is missing. Please login again.'
      });
    }

    // Validate admin
    const admin = await Admin.findById(actualAdminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found'
      });
    }

    // ✅ Replace old active subscription (NO BLOCKING)
    await Subscription.updateMany(
      { adminId: actualAdminId, status: 'active', endDate: { $gt: new Date() } },
      { status: 'replaced', updatedAt: new Date() }
    );

    // Check if there is already a pending unpaid order (avoid duplicates)
    const recentPendingOrder = await PaymentOrder.findOne({
      adminId: actualAdminId,
      status: 'created',
      planType,
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // last 30 mins
    });

    if (recentPendingOrder) {
      return res.status(200).json({
        success: true,
        message: 'Using existing pending order',
        order: {
          id: recentPendingOrder.razorpayOrderId,
          amount: recentPendingOrder.amount,
          currency: recentPendingOrder.currency
        }
      });
    }

    const receipt = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const options = {
      amount: amount, 
      currency,
      receipt,
      payment_capture: 1,
      notes: {
        planType,
        adminId: actualAdminId,
        adminEmail: admin.email,
        adminName: admin.name
      }
    };

    const order = await razorpay.orders.create(options);

    const paymentOrder = new PaymentOrder({
      adminId: actualAdminId,
      razorpayOrderId: order.id,
      amount,
      currency,
      planType,
      status: 'created',
      receipt,
      createdAt: new Date()
    });

    await paymentOrder.save();

    return res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      }
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};


// --- VERIFY PAYMENT AND CREATE SUBSCRIPTION ---
// paymentController.js - FIXED verifyPayment function

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planType,
      userDetails
    } = req.body;

    console.log('🔍 Verifying payment:', {
      razorpay_order_id,
      razorpay_payment_id,
      planType
    });

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Find the payment order
    const paymentOrder = await PaymentOrder.findOne({
      razorpayOrderId: razorpay_order_id
    });

    if (!paymentOrder) {
      return res.status(404).json({
        success: false,
        message: 'Payment order not found'
      });
    }

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
   
    const paymentDetails = {
      razorpay_payment_id: payment.id,
      razorpay_order_id: payment.order_id,
      razorpay_signature: razorpay_signature,
      payment_method: payment.method,
      payment_status: 'completed',
      created_at: payment.created_at,
      verified_at: new Date()
    };

    // Start transaction for atomic operation
    const session = await mongoose.startSession();
    let subscription;

    try {
      await session.withTransaction(async () => {
        // Update payment order
        paymentOrder.status = 'paid';
        paymentOrder.paymentDetails = paymentDetails;
        paymentOrder.updatedAt = new Date();
        if (userDetails) {
          paymentOrder.userDetails = userDetails;
        }
        await paymentOrder.save({ session });

        // Deactivate any existing active subscriptions
        await Subscription.updateMany(
          {
            adminId: paymentOrder.adminId,
            status: 'active'
          },
          {
            status: 'replaced',
            updatedAt: new Date()
          },
          { session }
        );

        // Create new subscription
        const planConfig = PLAN_CONFIGS[paymentOrder.planType];
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + (planConfig.duration * 24 * 60 * 60 * 1000));

        subscription = new Subscription({
          adminId: paymentOrder.adminId,
          planType: paymentOrder.planType,
          status: 'active',
          startDate: startDate,
          endDate: endDate,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          paymentDetails: paymentDetails,
          features: planConfig.features,
          autoRenew: false,
          createdAt: new Date()
        });

        await subscription.save({ session });

        // Update admin with subscription info
        await Admin.findByIdAndUpdate(
          paymentOrder.adminId,
          {
            subscriptionStatus: 'active',
            currentPlan: paymentOrder.planType,
            subscriptionId: subscription._id,
            subscriptionStartDate: startDate,
            subscriptionEndDate: endDate,
            lastSubscriptionUpdate: new Date()
          },
          { session }
        );
      });

      // ✅ FIXED: Track referral AFTER successful transaction
      console.log('💰 About to track referral subscription...');
      console.log('Admin ID:', paymentOrder.adminId);
      console.log('Subscription ID:', subscription._id);
      console.log('Plan Type:', paymentOrder.planType);

      // Import at top if not already imported
      // import { trackReferralSubscription } from './referralController.js';
      
      const referralResult = await trackReferralSubscription(
        paymentOrder.adminId, 
        subscription._id, 
        paymentOrder.planType
      );

      if (referralResult) {
        console.log('✅ Referral tracked successfully:', referralResult._id);
      } else {
        console.log('⚠️ No referral found or not eligible for bonus');
      }

    } catch (transactionError) {
      console.error('❌ Transaction failed:', transactionError);
      throw transactionError;
    } finally {
      await session.endSession();
    }

    const daysRemaining = subscription.getDaysRemaining();

    console.log('✅ Payment verified and subscription created successfully');

    res.status(200).json({
      success: true,
      message: 'Payment verified and subscription activated successfully',
      paymentDetails: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        planType: paymentOrder.planType,
        paymentMethod: paymentDetails.payment_method,
        paidAt: new Date()
      },
      subscription: {
        id: subscription._id,
        planType: subscription.planType,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        daysRemaining: daysRemaining,
        features: subscription.features,
        status: 'active'
      },
      admin: {
        id: paymentOrder.adminId,
        subscriptionStatus: 'active',
        currentPlan: paymentOrder.planType
      },
      nextStep: {
        redirectTo: "/hospitalform",
        message: "Please complete your hospital registration to get started"
      }
    });

  } catch (error) {
    console.error('❌ Error verifying payment:', error);
   
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};







// --- GET SUBSCRIPTION STATUS ---
export const getSubscriptionStatus = async (req, res) => {
  try {
    const adminId = req.user?.id;
    if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing admin ID'
      });
    }

    // Get current subscription
    const subscription = await Subscription.findOne({
      adminId: new mongoose.Types.ObjectId(adminId),
      status: 'active',
      endDate: { $gt: new Date() }
    });

    if (!subscription) {
      // Check if there are any completed payments
      const completedPayments = await PaymentOrder.find({
        adminId: adminId,
        status: { $in: ['paid', 'completed'] }
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        hasActiveSubscription: false,
        needsPricing: true,
        hasPaymentHistory: completedPayments.length > 0,
        lastPayment: completedPayments[0] || null,
        message: completedPayments.length > 0 ?
          'Subscription expired - please renew' :
          'No active subscription found'
      });
    }

    const daysRemaining = subscription.getDaysRemaining();
    const isExpiringSoon = daysRemaining <= 3;

    res.status(200).json({
      success: true,
      hasActiveSubscription: true,
      needsPricing: false,
      subscription: {
        id: subscription._id,
        planType: subscription.planType,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        daysRemaining: daysRemaining,
        isExpiringSoon: isExpiringSoon,
        features: subscription.features,
        status: subscription.status
      }
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription status',
      error: error.message
    });
  }
};

// --- GET PAYMENT HISTORY ---
export const getPaymentHistory = async (req, res) => {
  try {
    const adminId = req.query.adminId || req.user?.id;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    // Get payment orders
    const payments = await PaymentOrder.find({ adminId })
      .sort({ createdAt: -1 })
      .select('-paymentDetails.razorpay_signature')
      .lean();

    // Get subscription history
    const subscriptions = await Subscription.find({ adminId })
      .sort({ createdAt: -1 })
      .lean();

    // Get current subscription status
    const currentSubscription = await SubscriptionService.checkSubscriptionStatus(adminId);

    res.status(200).json({
      success: true,
      data: {
        currentSubscription,
        paymentHistory: payments.map(payment => ({
          id: payment._id,
          orderId: payment.orderId,
          razorpayOrderId: payment.razorpayOrderId,
          amount: payment.amount,
          currency: payment.currency,
          planType: payment.planType,
          status: payment.status,
          paymentMethod: payment.paymentDetails?.payment_method,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
          receipt: payment.receipt
        })),
        subscriptionHistory: subscriptions.map(sub => ({
          id: sub._id,
          planType: sub.planType,
          status: sub.status,
          startDate: sub.startDate,
          endDate: sub.endDate,
          amount: sub.amount,
          daysActive: sub.status === 'active' ? sub.getDaysRemaining() :
                     Math.ceil((sub.endDate - sub.startDate) / (1000 * 60 * 60 * 24)),
          createdAt: sub.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
   
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
};

// --- GET CURRENT PLAN DETAILS ---
export const getCurrentPlan = async (req, res) => {
  try {
    const adminId = req.query.adminId || req.user?.id;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    const subscriptionStatus = await SubscriptionService.checkSubscriptionStatus(adminId);
    const usageStats = await SubscriptionService.getUsageStats ?
      await SubscriptionService.getUsageStats(adminId) : null;

    // Get latest payment information
    const latestPayment = await PaymentOrder.findOne({ adminId })
      .sort({ createdAt: -1 })
      .select('-paymentDetails.razorpay_signature')
      .lean();

    // Get admin details
    const admin = await Admin.findById(adminId).select('name email subscriptionStatus currentPlan');

    res.status(200).json({
      success: true,
      data: {
        subscriptionStatus,
        usageStats,
        latestPayment: latestPayment ? {
          orderId: latestPayment.orderId,
          amount: latestPayment.amount,
          planType: latestPayment.planType,
          status: latestPayment.status,
          createdAt: latestPayment.createdAt,
          paymentMethod: latestPayment.paymentDetails?.payment_method
        } : null,
        admin: admin ? {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          subscriptionStatus: admin.subscriptionStatus,
          currentPlan: admin.currentPlan
        } : null
      }
    });

  } catch (error) {
    console.error('Error fetching current plan:', error);
   
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current plan details',
      error: error.message
    });
  }
};

// --- CANCEL SUBSCRIPTION ---
export const cancelSubscription = async (req, res) => {
  try {
    const { adminId, reason } = req.body;

    const actualAdminId = adminId || req.user?.id;
    if (!actualAdminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    // Find current active subscription
    const currentSubscription = await Subscription.findOne({
      adminId: actualAdminId,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    if (!currentSubscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found to cancel'
      });
    }

    // Start transaction
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // Update subscription status
        currentSubscription.status = 'cancelled';
        currentSubscription.cancelledAt = new Date();
        currentSubscription.cancellationReason = reason;
        currentSubscription.updatedAt = new Date();
        await currentSubscription.save({ session });

        // Update admin subscription status
        await Admin.findByIdAndUpdate(
          actualAdminId,
          {
            subscriptionStatus: "cancelled",
            lastSubscriptionUpdate: new Date()
          },
          { session }
        );

        // Create cancellation record
        const cancellationRecord = new PaymentOrder({
          adminId: actualAdminId,
          orderId: `cancellation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          razorpayOrderId: null,
          amount: 0,
          currency: 'INR',
          planType: currentSubscription.planType,
          receipt: `cancellation_receipt_${Date.now()}`,
          status: 'cancelled',
          paymentDetails: {
            payment_method: 'cancellation',
            payment_status: 'cancelled',
            created_at: Math.floor(Date.now() / 1000),
            cancelled_at: new Date()
          },
          metadata: {
            type: 'cancellation',
            reason: reason || 'No reason provided',
            originalSubscriptionId: currentSubscription._id.toString(),
            adminName: admin.name,
            adminEmail: admin.email
          },
          createdAt: new Date()
        });
       
        await cancellationRecord.save({ session });
      });
    } catch (transactionError) {
      console.error('Cancellation transaction failed:', transactionError);
      throw transactionError;
    } finally {
      await session.endSession();
    }

    //console.log(`Subscription cancelled for admin ${actualAdminId}. Reason: ${reason || 'No reason provided'}`);

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: {
        cancelledSubscription: {
          id: currentSubscription._id,
          planType: currentSubscription.planType,
          cancelledAt: new Date(),
          reason: reason || 'No reason provided',
          refundEligible: false // Set based on your refund policy
        }
      }
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
   
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
};

// --- RENEW SUBSCRIPTION ---
export const renewSubscription = async (req, res) => {
  try {
    const { adminId, planType } = req.body;

    const actualAdminId = adminId || req.user?.id;
    if (!actualAdminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    // Validate plan type
    const planConfig = PLAN_CONFIGS[planType];
    if (!planConfig) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan type: ${planType}`
      });
    }

    // Check current subscription
    const currentSubscription = await Subscription.findOne({
      adminId: actualAdminId,
      status: { $in: ['active', 'expired'] }
    }).sort({ createdAt: -1 });

    // If Free Trial, prevent direct renewal (must go through payment)
    if (currentSubscription && currentSubscription.planType === 'Basic Plan' && planType !=='Basic Plan') {
      return res.status(400).json({
        success: false,
        message: 'Please complete payment to upgrade from Basic Plan',
        requiresPayment: true
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ready for renewal',
      planConfig: {
        planType: planType,
        amount: planConfig.amount,
        duration: planConfig.duration,
        features: planConfig.features
      },
      currentSubscription: currentSubscription ? {
        planType: currentSubscription.planType,
        status: currentSubscription.status,
        endDate: currentSubscription.endDate,
        daysRemaining: currentSubscription.getDaysRemaining()
      } : null,
      nextStep: planConfig.amount > 0 ? 'payment_required' : 'direct_activation'
    });

  } catch (error) {
    console.error('Error preparing subscription renewal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to prepare subscription renewal',
      error: error.message
    });
  }
};

// --- WEBHOOK HANDLER FOR RAZORPAY EVENTS ---
export const handleWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret')
      .update(webhookBody)
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      console.error('Webhook signature verification failed');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    //console.log('Webhook event received:', event.event);

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
     
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
     
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;
       
      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload.subscription.entity);
        break;
       
      default:
        //console.log('Unhandled webhook event:', event.event);
    }

    res.status(200).json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// --- WEBHOOK HELPER FUNCTIONS ---
const handlePaymentCaptured = async (payment) => {
  try {
    //console.log('Processing payment captured:', payment.id);

    const paymentOrder = await PaymentOrder.findOne({
      razorpayOrderId: payment.order_id
    });

    if (paymentOrder && paymentOrder.status === 'created') {
      paymentOrder.status = 'paid';
      paymentOrder.paymentDetails = {
        ...paymentOrder.paymentDetails,
        razorpay_payment_id: payment.id,
        payment_method: payment.method,
        payment_status: 'completed',
        captured_at: payment.captured_at,
        verified_at: new Date()
      };
      paymentOrder.updatedAt = new Date();
      await paymentOrder.save();

      // Ensure subscription is created if not already exists
      const existingSubscription = await Subscription.findOne({
        adminId: paymentOrder.adminId,
        status: 'active',
        endDate: { $gt: new Date() }
      });

      if (!existingSubscription) {
        const planConfig = PLAN_CONFIGS[paymentOrder.planType];
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + (planConfig.duration * 24 * 60 * 60 * 1000));

        const subscription = new Subscription({
          adminId: paymentOrder.adminId,
          planType: paymentOrder.planType,
          status: 'active',
          startDate: startDate,
          endDate: endDate,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          paymentId: payment.id,
          orderId: payment.order_id,
          paymentDetails: paymentOrder.paymentDetails,
          features: planConfig.features,
          autoRenew: false
        });

        await subscription.save();
       
        // Update admin status
        await Admin.findByIdAndUpdate(paymentOrder.adminId, {
          subscriptionStatus: "active",
          currentPlan: paymentOrder.planType,
          subscriptionId: subscription._id,
          subscriptionStartDate: startDate,
          subscriptionEndDate: endDate,
          lastSubscriptionUpdate: new Date()
        });

        //console.log('Subscription created via webhook for admin:', paymentOrder.adminId);
      }
    }

  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
};

const handlePaymentFailed = async (payment) => {
  try {
    //console.log('Processing payment failed:', payment.id);

    const paymentOrder = await PaymentOrder.findOne({
      razorpayOrderId: payment.order_id
    });

    if (paymentOrder) {
      paymentOrder.status = 'failed';
      paymentOrder.paymentDetails = {
        ...paymentOrder.paymentDetails,
        razorpay_payment_id: payment.id,
        error_code: payment.error_code,
        error_description: payment.error_description,
        payment_status: 'failed',
        failed_at: new Date()
      };
      paymentOrder.updatedAt = new Date();
      await paymentOrder.save();

      //console.log('Payment order marked as failed:', payment.order_id);
    }

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
};

const handleOrderPaid = async (order) => {
  try {
    //console.log('Processing order paid:', order.id);

    const paymentOrder = await PaymentOrder.findOne({
      razorpayOrderId: order.id
    });

    if (paymentOrder && paymentOrder.status !== 'paid') {
      paymentOrder.status = 'paid';
      paymentOrder.updatedAt = new Date();
      await paymentOrder.save();

      //console.log('Payment order status updated to paid:', order.id);
    }

  } catch (error) {
    console.error('Error handling order paid:', error);
  }
};

const handleSubscriptionCharged = async (subscription) => {
  try {
    //console.log('Processing subscription charged:', subscription.id);
    // Handle recurring subscription charges if applicable
    // This would be for monthly/yearly auto-renewals
  } catch (error) {
    console.error('Error handling subscription charged:', error);
  }
};

// --- GET SUBSCRIPTION ANALYTICS ---
export const getSubscriptionAnalytics = async (req, res) => {
  try {
    const adminId = req.user?.id;
   
    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    // Get all subscriptions for this admin
    const subscriptions = await Subscription.find({ adminId })
      .sort({ createdAt: -1 })
      .lean();

    // Get all payments for this admin
    const payments = await PaymentOrder.find({ adminId })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate analytics
    const analytics = {
      totalSubscriptions: subscriptions.length,
      totalPayments: payments.filter(p => p.status === 'paid' || p.status === 'completed').length,
      totalSpent: payments
        .filter(p => p.status === 'paid' || p.status === 'completed')
        .reduce((sum, payment) => sum + payment.amount, 0),
      currentPlan: subscriptions.find(sub => sub.status === 'active')?.planType || 'None',
      subscriptionHistory: subscriptions.map(sub => ({
        planType: sub.planType,
        status: sub.status,
        startDate: sub.startDate,
        endDate: sub.endDate,
        daysUsed: sub.status === 'active' ?
          Math.ceil((new Date() - sub.startDate) / (1000 * 60 * 60 * 24)) :
          Math.ceil((sub.endDate - sub.startDate) / (1000 * 60 * 60 * 24)),
        createdAt: sub.createdAt
      })),
      paymentTrends: calculatePaymentTrends(payments)
    };

    res.status(200).json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error fetching subscription analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription analytics',
      error: error.message
    });
  }
};

// --- HELPER FUNCTION FOR PAYMENT TRENDS ---
const calculatePaymentTrends = (payments) => {
  const last6Months = [];
  const now = new Date();
 
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
   
    const monthPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.createdAt);
      return paymentDate >= monthStart &&
             paymentDate <= monthEnd &&
             (payment.status === 'paid' || payment.status === 'completed');
    });

    const monthTotal = monthPayments.reduce((sum, payment) => sum + payment.amount, 0);
   
    last6Months.push({
      month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
      totalAmount: monthTotal,
      paymentCount: monthPayments.length,
      payments: monthPayments.map(p => ({
        planType: p.planType,
        amount: p.amount,
        date: p.createdAt
      }))
    });
  }
 
  return last6Months;
};

// --- UPGRADE SUBSCRIPTION ---
export const upgradeSubscription = async (req, res) => {
  try {
    const { adminId, newPlanType } = req.body;

    const actualAdminId = adminId || req.user?.id;
    if (!actualAdminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    // Validate new plan
    const newPlanConfig = PLAN_CONFIGS[newPlanType];
    if (!newPlanConfig) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan type: ${newPlanType}`
      });
    }

    // Get current subscription
    const currentSubscription = await Subscription.findOne({
      adminId: actualAdminId,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    if (!currentSubscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found. Please purchase a new subscription.',
        requiresNewSubscription: true
      });
    }

    // Check if it's actually an upgrade
  const planHierarchy = { 'Basic Plan': 1, 'Monthly Plan': 2, 'Yearly Plan': 3 };
    const currentLevel = planHierarchy[currentSubscription.planType] || 0;
    const newLevel = planHierarchy[newPlanType] || 0;

    if (newLevel <= currentLevel) {
      return res.status(400).json({
        success: false,
        message: 'Cannot downgrade or switch to same plan. Please contact support for assistance.',
        currentPlan: currentSubscription.planType,
        requestedPlan: newPlanType
      });
    }

    // Calculate prorated amount
    const remainingDays = currentSubscription.getDaysRemaining();
    const totalDaysInNewPlan = newPlanConfig.duration;
    const proratedAmount = Math.round((newPlanConfig.amount * remainingDays) / totalDaysInNewPlan);

    res.status(200).json({
      success: true,
      upgradeDetails: {
        currentPlan: currentSubscription.planType,
        newPlan: newPlanType,
        currentEndDate: currentSubscription.endDate,
        remainingDays: remainingDays,
        proratedAmount: proratedAmount,
        fullAmount: newPlanConfig.amount,
        savings: newPlanConfig.amount - proratedAmount
      },
      message: 'Upgrade calculation completed. Proceed with payment to complete upgrade.',
      requiresPayment: proratedAmount > 0
    });

  } catch (error) {
    console.error('Error calculating subscription upgrade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate subscription upgrade',
      error: error.message
    });
  }
};

// --- GET DETAILED SUBSCRIPTION INFO ---
export const getDetailedSubscriptionInfo = async (req, res) => {
  try {
    const adminId = req.query.adminId || req.user?.id;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    // Get admin details
    const admin = await Admin.findById(adminId).select('-password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Get current subscription with full details
    const currentSubscription = await Subscription.findOne({
      adminId: adminId,
      status: 'active',
      endDate: { $gt: new Date() }
    });

    // Get subscription history
    const subscriptionHistory = await Subscription.find({ adminId })
      .sort({ createdAt: -1 })
      .lean();

    // Get payment history
    const paymentHistory = await PaymentOrder.find({ adminId })
      .sort({ createdAt: -1 })
      .select('-paymentDetails.razorpay_signature')
      .lean();

    // Calculate total spent
    const totalSpent = paymentHistory
      .filter(p => p.status === 'paid' || p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Get usage statistics if available
    let usageStats = null;
    try {
      if (SubscriptionService.getUsageStats) {
        usageStats = await SubscriptionService.getUsageStats(adminId);
      }
    } catch (usageError) {
      //console.log('Usage stats not available:', usageError.message);
    }

    const response = {
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        subscriptionStatus: admin.subscriptionStatus,
        currentPlan: admin.currentPlan,
        signupDate: admin.createdAt
      },
      currentSubscription: currentSubscription ? {
        id: currentSubscription._id,
        planType: currentSubscription.planType,
        status: currentSubscription.status,
        startDate: currentSubscription.startDate,
        endDate: currentSubscription.endDate,
        daysRemaining: currentSubscription.getDaysRemaining(),
        daysUsed: Math.ceil((new Date() - currentSubscription.startDate) / (1000 * 60 * 60 * 24)),
        features: currentSubscription.features,
        isExpiringSoon: currentSubscription.getDaysRemaining() <= 7,
        autoRenew: currentSubscription.autoRenew
      } : null,
      subscriptionHistory: subscriptionHistory.map(sub => ({
        id: sub._id,
        planType: sub.planType,
        status: sub.status,
        startDate: sub.startDate,
        endDate: sub.endDate,
        amount: sub.amount,
        duration: Math.ceil((sub.endDate - sub.startDate) / (1000 * 60 * 60 * 24)),
        createdAt: sub.createdAt
      })),
      paymentSummary: {
        totalTransactions: paymentHistory.length,
        successfulPayments: paymentHistory.filter(p => p.status === 'paid' || p.status === 'completed').length,
        failedPayments: paymentHistory.filter(p => p.status === 'failed').length,
        totalSpent: totalSpent,
        averageTransactionValue: totalSpent > 0 ? Math.round(totalSpent / paymentHistory.filter(p => p.status === 'paid' || p.status === 'completed').length) : 0
      },
      recentPayments: paymentHistory.slice(0, 5).map(payment => ({
        id: payment._id,
        orderId: payment.orderId,
        amount: payment.amount,
        planType: payment.planType,
        status: payment.status,
        paymentMethod: payment.paymentDetails?.payment_method,
        createdAt: payment.createdAt
      })),
      usageStats: usageStats || {
        message: 'Usage statistics not available'
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching detailed subscription info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription details',
      error: error.message
    });
  }
};

// --- SUBSCRIPTION EXPIRY CHECK ---
export const checkExpiringSubscriptions = async (req, res) => {
  try {
    const warningDays = parseInt(req.query.warningDays) || 7;
   
    // Find subscriptions expiring within warning period
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + warningDays);

    const expiringSubscriptions = await Subscription.find({
      status: 'active',
      endDate: {
        $gte: new Date(),
        $lte: expiringDate
      }
    }).populate('adminId', 'name email');

    const expiredSubscriptions = await Subscription.find({
      status: 'active',
      endDate: { $lt: new Date() }
    }).populate('adminId', 'name email');

    // Update expired subscriptions
    if (expiredSubscriptions.length > 0) {
      const expiredIds = expiredSubscriptions.map(sub => sub._id);
      await Subscription.updateMany(
        { _id: { $in: expiredIds } },
        {
          status: 'expired',
          updatedAt: new Date()
        }
      );

      // Update admin subscription status
      const expiredAdminIds = expiredSubscriptions.map(sub => sub.adminId._id);
      await Admin.updateMany(
        { _id: { $in: expiredAdminIds } },
        {
          subscriptionStatus: 'expired',
          lastSubscriptionUpdate: new Date()
        }
      );
    }

    res.status(200).json({
      success: true,
      data: {
        expiringSubscriptions: expiringSubscriptions.map(sub => ({
          subscriptionId: sub._id,
          adminId: sub.adminId._id,
          adminName: sub.adminId.name,
          adminEmail: sub.adminId.email,
          planType: sub.planType,
          endDate: sub.endDate,
          daysRemaining: sub.getDaysRemaining()
        })),
        expiredSubscriptions: expiredSubscriptions.map(sub => ({
          subscriptionId: sub._id,
          adminId: sub.adminId._id,
          adminName: sub.adminId.name,
          adminEmail: sub.adminId.email,
          planType: sub.planType,
          endDate: sub.endDate,
          expiredDays: Math.ceil((new Date() - sub.endDate) / (1000 * 60 * 60 * 24))
        })),
        summary: {
          expiringSoon: expiringSubscriptions.length,
          alreadyExpired: expiredSubscriptions.length,
          updatedExpiredCount: expiredSubscriptions.length
        }
      }
    });

  } catch (error) {
    console.error('Error checking expiring subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check expiring subscriptions',
      error: error.message
    });
  }
};

// --- SUBSCRIPTION REMINDER ---
export const sendSubscriptionReminder = async (req, res) => {
  try {
    const { adminId, reminderType = 'expiring' } = req.body;

    const actualAdminId = adminId || req.user?.id;
    if (!actualAdminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    // Get admin and subscription details
    const admin = await Admin.findById(actualAdminId).select('-password');
    const subscription = await Subscription.findOne({
      adminId: actualAdminId,
      status: reminderType === 'expired' ? 'expired' : 'active'
    }).sort({ createdAt: -1 });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: `No ${reminderType} subscription found`
      });
    }

    // In a real application, you would send email/SMS here
    // For now, we'll just log and return success
    const reminderData = {
      adminId: actualAdminId,
      adminName: admin.name,
      adminEmail: admin.email,
      subscriptionId: subscription._id,
      planType: subscription.planType,
      reminderType: reminderType,
      sentAt: new Date()
    };

    if (reminderType === 'expiring') {
      reminderData.daysRemaining = subscription.getDaysRemaining();
      reminderData.endDate = subscription.endDate;
    } else {
      reminderData.expiredDays = Math.ceil((new Date() - subscription.endDate) / (1000 * 60 * 60 * 24));
    }

    //console.log('Subscription reminder sent:', reminderData);

    res.status(200).json({
      success: true,
      message: `${reminderType} subscription reminder sent successfully`,
      reminderData
    });

  } catch (error) {
    console.error('Error sending subscription reminder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send subscription reminder',
      error: error.message
    });
  }
};

// Add these endpoints to paymentController.js

// --- GET FREE TRIAL USERS ---
export const getBasicPlanUsers = async (req, res) => {
  try {
    const currentDate = new Date();
   
    // Find all active free trial subscriptions - REMOVE .lean()
    const freeTrialSubscriptions = await Subscription.find({
      planType: 'Free Trial',
      status: 'active',
      endDate: { $gt: currentDate }
    })
    .populate('adminId', 'name email phone createdAt')
    .sort({ startDate: -1 });
    // REMOVED .lean() from above

    const freeTrialUsers = [];
   
    for (const subscription of freeTrialSubscriptions) {
      if (!subscription.adminId) continue;
     
      const paidSubscription = await Subscription.findOne({
        adminId: subscription.adminId._id,
        planType: { $in: ['Monthly Plan', 'Yearly Plan'] },
        status: 'active',
        endDate: { $gt: currentDate }
      });
     
      const hasCompletedPaidSubscription = await Subscription.findOne({
        adminId: subscription.adminId._id,
        planType: { $in: ['Monthly Plan', 'Yearly Plan'] },
        status: { $in: ['completed', 'expired', 'replaced'] }
      });
     
      if (!paidSubscription && !hasCompletedPaidSubscription) {
        // Now getDaysRemaining() will work because it's a Mongoose document
        const daysRemaining = subscription.getDaysRemaining();
        const daysUsed = Math.ceil((currentDate - subscription.startDate) / (1000 * 60 * 60 * 24));
       
        const paymentOrder = await PaymentOrder.findOne({
          adminId: subscription.adminId._id,
          planType: 'Free Trial',
          status: { $in: ['completed', 'paid'] }
        }).sort({ createdAt: -1 });
       
        freeTrialUsers.push({
          subscriptionId: subscription._id,
          adminId: subscription.adminId._id,
          name: subscription.adminId.name,
          email: subscription.adminId.email,
          phone: subscription.adminId.phone || 'N/A',
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          daysRemaining: daysRemaining,
          daysUsed: daysUsed,
          totalDays: 3,
          status: 'Active',
          isExpiringSoon: daysRemaining <= 2,
          features: subscription.features,
          signupDate: subscription.adminId.createdAt,
          paymentOrderId: paymentOrder?._id || null,
          receipt: paymentOrder?.receipt || null
        });
      }
    }

    res.status(200).json({
      success: true,
      count: freeTrialUsers.length,
      data: freeTrialUsers,
      summary: {
        totalActiveTrials: freeTrialUsers.length,
        expiringSoon: freeTrialUsers.filter(u => u.isExpiringSoon).length,
        averageDaysUsed: freeTrialUsers.length > 0
          ? Math.round(freeTrialUsers.reduce((sum, u) => sum + u.daysUsed, 0) / freeTrialUsers.length)
          : 0
      }
    });

  } catch (error) {
    console.error('Error fetching free trial users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch free trial users',
      error: error.message
    });
  }
};
// --- GET ALL SUBSCRIPTION USERS (PAID ONLY) ---
export const getPaidSubscriptionUsers = async (req, res) => {
  try {
    const currentDate = new Date();
   
    // Find all active paid subscriptions
    const paidSubscriptions = await Subscription.find({
      planType: { $in: ['Monthly Plan', 'Yearly Plan'] },
      status: 'active',
      endDate: { $gt: currentDate }
    })
    .populate('adminId', 'name email phone createdAt')
    .sort({ startDate: -1 })
    .lean();

    const paidUsers = paidSubscriptions
      .filter(sub => sub.adminId) // Filter out null adminIds
      .map(subscription => {
        const daysRemaining = subscription.getDaysRemaining ?
          subscription.getDaysRemaining() :
          Math.ceil((subscription.endDate - currentDate) / (1000 * 60 * 60 * 24));
       
        const totalDays = subscription.planType === 'Monthly Plan' ? 30 : 365;
        const daysUsed = totalDays - daysRemaining;

        return {
          subscriptionId: subscription._id,
          adminId: subscription.adminId._id,
          name: subscription.adminId.name,
          email: subscription.adminId.email,
          phone: subscription.adminId.phone || 'N/A',
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          nextBillingDate: subscription.endDate,
          plan: subscription.planType,
          daysRemaining: daysRemaining,
          daysUsed: daysUsed,
          totalDays: totalDays,
          usersAllowed: subscription.features?.maxPatients || 'Unlimited',
          paymentStatus: 'Paid',
          status: 'Active',
          isExpiringSoon: daysRemaining <= 7,
          amount: subscription.amount,
          currency: subscription.currency,
          features: subscription.features,
          signupDate: subscription.adminId.createdAt,
          paymentId: subscription.paymentId,
          orderId: subscription.orderId
        };
      });

    res.status(200).json({
      success: true,
      count: paidUsers.length,
      data: paidUsers,
      summary: {
        totalPaidSubscriptions: paidUsers.length,
        monthlySubscriptions: paidUsers.filter(u => u.plan === 'Monthly Plan').length,
        yearlySubscriptions: paidUsers.filter(u => u.plan === 'Yearly Plan').length,
        expiringSoon: paidUsers.filter(u => u.isExpiringSoon).length,
        totalRevenue: paidUsers.reduce((sum, u) => sum + (u.amount || 0), 0)
      }
    });

  } catch (error) {
    console.error('Error fetching paid subscription users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch paid subscription users',
      error: error.message
    });
  }
};

// --- DELETE USER TRIAL (ADMIN ONLY) ---
export const deleteUserTrial = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    // Verify the user exists
    const admin = await Admin.findById(userId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is on free trial
    const freeTrialSubscription = await Subscription.findOne({
      adminId: userId,
      planType: 'Free Trial',
      status: 'active'
    });

    if (!freeTrialSubscription) {
      return res.status(400).json({
        success: false,
        message: 'User does not have an active free trial'
      });
    }

    // Start transaction
    const session = await mongoose.startSession();
   
    try {
      await session.withTransaction(async () => {
        // Cancel the free trial subscription
        await Subscription.findByIdAndUpdate(
          freeTrialSubscription._id,
          {
            status: 'cancelled',
            cancelledAt: new Date(),
            cancellationReason: 'Deleted by admin',
            updatedAt: new Date()
          },
          { session }
        );

        // Update admin status
        await Admin.findByIdAndUpdate(
          userId,
          {
            subscriptionStatus: 'cancelled',
            currentPlan: null,
            subscriptionId: null,
            lastSubscriptionUpdate: new Date()
          },
          { session }
        );

        // Mark payment orders as cancelled
        await PaymentOrder.updateMany(
          {
            adminId: userId,
            planType: 'Free Trial',
            status: 'completed'
          },
          {
            status: 'cancelled',
            updatedAt: new Date()
          },
          { session }
        );
      });
    } catch (transactionError) {
      console.error('Transaction failed:', transactionError);
      throw transactionError;
    } finally {
      await session.endSession();
    }

    //console.log(`Free trial deleted for user ${userId} by admin`);

    res.status(200).json({
      success: true,
      message: 'Free trial deleted successfully',
      data: {
        userId: userId,
        userName: admin.name,
        deletedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error deleting user trial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user trial',
      error: error.message
    });
  }
};
export const getUserSubscriptionDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid user ID is required'
      });
    }

    // Get admin details
    const admin = await Admin.findById(userId).select('-password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all subscriptions for this user
    const subscriptions = await Subscription.find({ adminId: userId })
      .sort({ createdAt: -1 })
      .lean();

    // Get all payment orders for this user
    const payments = await PaymentOrder.find({ adminId: userId })
      .sort({ createdAt: -1 })
      .select('-paymentDetails.razorpay_signature')
      .lean();

    // Get current active subscription
    const currentSubscription = subscriptions.find(
      sub => sub.status === 'active' && new Date(sub.endDate) > new Date()
    );

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          signupDate: admin.createdAt,
          subscriptionStatus: admin.subscriptionStatus,
          currentPlan: admin.currentPlan
        },
        currentSubscription: currentSubscription ? {
          id: currentSubscription._id,
          planType: currentSubscription.planType,
          status: currentSubscription.status,
          startDate: currentSubscription.startDate,
          endDate: currentSubscription.endDate,
          daysRemaining: Math.ceil((new Date(currentSubscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)),
          features: currentSubscription.features
        } : null,
        subscriptionHistory: subscriptions.map(sub => ({
          id: sub._id,
          planType: sub.planType,
          status: sub.status,
          startDate: sub.startDate,
          endDate: sub.endDate,
          amount: sub.amount,
          createdAt: sub.createdAt
        })),
        paymentHistory: payments.map(payment => ({
          id: payment._id,
          orderId: payment.orderId,
          razorpayOrderId: payment.razorpayOrderId,
          amount: payment.amount,
          currency: payment.currency,
          planType: payment.planType,
          status: payment.status,
          paymentMethod: payment.paymentDetails?.payment_method,
          createdAt: payment.createdAt,
          receipt: payment.receipt
        })),
        statistics: {
          totalSubscriptions: subscriptions.length,
          totalPayments: payments.filter(p => p.status === 'paid' || p.status === 'completed').length,
          totalSpent: payments
            .filter(p => p.status === 'paid' || p.status === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0),
         hasHadBasicPlan: subscriptions.some(sub => sub.planType === 'Basic Plan'),
hasHadPremiumPlan: subscriptions.some(sub => ['Monthly Plan', 'Yearly Plan'].includes(sub.planType))
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user subscription details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user details',
      error: error.message
    });
  }
};


