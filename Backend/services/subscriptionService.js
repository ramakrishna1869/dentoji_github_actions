//subscriptionService.js - UPDATED WITHOUT FREE TRIAL
import Subscription from '../models/Subscription.js';
import PaymentOrder from '../models/Payment.js';
import mongoose from 'mongoose';

export class SubscriptionService {
  
  /**
   * Create a new subscription with proper validation and transaction handling
   */
  static async createSubscription(adminId, planType, paymentDetails = null) {
    try {
      console.log('Creating subscription:', { adminId, planType });
      
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database connection not ready');
      }
      
      const adminObjectId = this._validateAndConvertAdminId(adminId);
      const planFeatures = Subscription.getPlanFeatures(planType);
      
      if (!planFeatures) {
        throw new Error(`Invalid plan type: ${planType}`);
      }
      
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + (planFeatures.duration * 24 * 60 * 60 * 1000));

      const subscriptionData = {
        adminId: adminObjectId,
        planType: planType,
        status: 'active',
        startDate: startDate,
        endDate: endDate,
        amount: planFeatures.amount,
        currency: 'INR',
        features: {
          maxPatients: planFeatures.maxPatients,
          hasAdvancedReporting: planFeatures.hasAdvancedReporting,
          hasPrioritySupport: planFeatures.hasPrioritySupport,
          hasApiAccess: planFeatures.hasApiAccess,
          hasWhiteLabel: planFeatures.hasWhiteLabel
        },
        autoRenew: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this._processPaymentDetails(subscriptionData, planType, paymentDetails, planFeatures);

      const session = await mongoose.startSession();
      let savedSubscription;
      
      try {
        await session.withTransaction(async () => {
          const existingActive = await Subscription.findOne({
            adminId: adminObjectId,
            status: 'active',
            endDate: { $gt: new Date() }
          }).session(session);

          // ✅ UPDATED LOGIC: Allow switching between ANY plans
          if (existingActive) {
            // Prevent duplicate - can't activate same plan twice
            if (existingActive.planType === planType) {
              throw new Error(`You already have an active ${planType} subscription`);
            }

            // ✅ ALLOW SWITCHING: Replace current plan with new plan
            console.log(`Switching from ${existingActive.planType} to ${planType}`);
            existingActive.status = 'replaced';
            existingActive.updatedAt = new Date();
            await existingActive.save({ session });
          }

          // Create new subscription
          const subscription = new Subscription(subscriptionData);
          
          const validationError = subscription.validateSync();
          if (validationError) {
            throw new Error(`Validation failed: ${Object.keys(validationError.errors).join(', ')}`);
          }

          savedSubscription = await subscription.save({ session });
          console.log('✅ Subscription created/switched:', savedSubscription._id);
        });
      } catch (transactionError) {
        console.error('Transaction failed:', transactionError);
        throw transactionError;
      } finally {
        await session.endSession();
      }

      return savedSubscription;

    } catch (error) {
      console.error('Subscription creation error:', error.message);
      throw error;
    }
  }

  /**
   * Get current active subscription for an admin
   */
  static async getCurrentSubscription(adminId) {
    try {
      if (!adminId) {
        return null;
      }
      
      const adminObjectId = this._validateAndConvertAdminId(adminId);
      if (!adminObjectId) return null;
      
      // Find active, non-expired subscription
      const subscription = await Subscription.findOne({
        adminId: adminObjectId,
        status: 'active',
        endDate: { $gt: new Date() }
      }).sort({ createdAt: -1 });
      
      if (!subscription) {
        return null;
      }

      // Double-check expiration status
      if (subscription.isExpired()) {
        subscription.status = 'expired';
        subscription.expiredAt = new Date();
        await subscription.save();
        return null;
      }

      return subscription;
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      return null; // Return null to prevent login failures
    }
  }

  /**
   * Check comprehensive subscription status
   */
  static async checkSubscriptionStatus(adminId) {
    try {
      const subscription = await this.getCurrentSubscription(adminId);

      if (!subscription) {
        return {
          hasActiveSubscription: false,
          needsPricing: true,
          planType: null,
          daysRemaining: 0,
          isExpiringSoon: false,
          message: 'No active subscription found'
        };
      }

      const daysRemaining = subscription.getDaysRemaining();
      const isExpiringSoon = subscription.isExpiringSoon();

      return {
        hasActiveSubscription: true,
        needsPricing: false,
        subscription: {
          id: subscription._id,
          planType: subscription.planType,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          amount: subscription.amount,
          features: subscription.features,
          daysRemaining,
          isExpiringSoon
        },
        planType: subscription.planType,
        daysRemaining,
        isExpiringSoon,
        endDate: subscription.endDate,
        features: subscription.features,
        message: `Active ${subscription.planType} - ${daysRemaining} days remaining`
      };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return {
        hasActiveSubscription: false,
        needsPricing: true,
        planType: null,
        message: 'Error checking subscription status'
      };
    }
  }

  /**
   * Get subscription history for an admin
   */
  static async getSubscriptionHistory(adminId) {
    try {
      const adminObjectId = this._validateAndConvertAdminId(adminId);
      if (!adminObjectId) return [];

      const subscriptions = await Subscription.find({ adminId: adminObjectId })
        .sort({ createdAt: -1 })
        .lean();

      return subscriptions;
    } catch (error) {
      console.error('Error getting subscription history:', error);
      throw error;
    }
  }

  /**
   * Upgrade existing subscription
   */
  static async upgradeSubscription(adminId, planType, paymentDetails) {
    try {
      // Create new subscription (this will automatically handle existing ones via transaction)
      const newSubscription = await this.createSubscription(adminId, planType, paymentDetails);
      return newSubscription;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      throw error;
    }
  }

  /**
   * Renew subscription (same as upgrade for this implementation)
   */
  static async renewSubscription(adminId, planType, paymentDetails) {
    try {
      return await this.createSubscription(adminId, planType, paymentDetails);
    } catch (error) {
      console.error('Error renewing subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel active subscription
   */
  static async cancelSubscription(adminId, reason = 'user_requested') {
    try {
      const adminObjectId = this._validateAndConvertAdminId(adminId);
      
      const subscription = await Subscription.findOne({
        adminId: adminObjectId,
        status: 'active'
      });

      if (!subscription) {
        throw new Error('No active subscription found to cancel');
      }

      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      subscription.cancellationReason = reason;
      subscription.updatedAt = new Date();
      
      await subscription.save();

      return subscription;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  /**
   * Handle expired subscriptions (batch process)
   */
  static async handleExpiredSubscriptions() {
    try {
      const now = new Date();
      const expiredSubscriptions = await Subscription.find({
        status: 'active',
        endDate: { $lt: now }
      });

      let processedCount = 0;
      for (const subscription of expiredSubscriptions) {
        try {
          subscription.status = 'expired';
          subscription.expiredAt = now;
          subscription.updatedAt = now;
          await subscription.save();
          processedCount++;
        } catch (error) {
          console.error(`Error updating subscription ${subscription._id}:`, error);
        }
      }

      return processedCount;
    } catch (error) {
      console.error('Error handling expired subscriptions:', error);
      throw error;
    }
  }

  /**
   * Check if admin can access a specific feature
   */
  static async canAccessFeature(adminId, featureName) {
    try {
      const subscription = await this.getCurrentSubscription(adminId);
      
      if (!subscription) {
        return false;
      }

      const hasFeature = subscription.features && subscription.features[featureName];
      return hasFeature || false;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  /**
   * Get usage statistics for admin
   */
  static async getUsageStats(adminId) {
    try {
      const subscription = await this.getCurrentSubscription(adminId);
      
      if (!subscription) {
        return {
          hasSubscription: false,
          message: 'No active subscription found'
        };
      }

      // Dynamically import Patient model to avoid circular dependencies
      let currentPatientCount = 0;
      try {
        const { default: Patient } = await import('../models/Patient.js');
        currentPatientCount = await Patient.countDocuments({ 
          adminId: this._validateAndConvertAdminId(adminId)
        });
      } catch (importError) {
        console.warn('Could not import Patient model:', importError.message);
      }
      
      const maxPatients = subscription.features.maxPatients;
      const isUnlimited = maxPatients === -1;
      
      return {
        hasSubscription: true,
        subscription: {
          id: subscription._id,
          planType: subscription.planType,
          status: subscription.status,
          daysRemaining: subscription.getDaysRemaining()
        },
        usage: {
          currentPatients: currentPatientCount,
          maxPatients: isUnlimited ? 'Unlimited' : maxPatients,
          patientUsagePercentage: isUnlimited ? 0 : Math.round((currentPatientCount / maxPatients) * 100),
          isNearLimit: !isUnlimited && (currentPatientCount / maxPatients) > 0.8
        },
        features: subscription.features
      };
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      throw error;
    }
  }

  /**
   * Get plan amount in paise (for Razorpay)
   */
  static getPlanAmount(planType) {
    const planFeatures = Subscription.getPlanFeatures(planType);
    return planFeatures ? planFeatures.amount : 0;
  }

  /**
   * Get all available plan details - UPDATED
   */
 static getPlanDetails() {
    return  [
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
  }

  /**
   * Debug subscription data for troubleshooting
   */
  static async debugSubscriptionData(adminId) {
    try {
      const adminObjectId = this._validateAndConvertAdminId(adminId);
      if (!adminObjectId) {
        return { error: 'Invalid adminId provided' };
      }
      
      // Check database connection
      const dbState = mongoose.connection.readyState;
      
      // Collection stats
      const totalInCollection = await Subscription.countDocuments({});
      const adminSubscriptions = await Subscription.countDocuments({ adminId: adminObjectId });
      
      // Get detailed subscription data
      const subscriptions = await Subscription.find({ adminId: adminObjectId })
        .sort({ createdAt: -1 })
        .lean();
      
      const debugInfo = {
        database: {
          connected: dbState === 1,
          connectionState: dbState,
          databaseName: mongoose.connection.name
        },
        counts: {
          totalInCollection,
          adminSubscriptions
        },
        subscriptions: subscriptions.map(sub => ({
          id: sub._id,
          planType: sub.planType,
          status: sub.status,
          startDate: sub.startDate,
          endDate: sub.endDate,
          daysRemaining: sub.endDate ? Math.ceil((sub.endDate - new Date()) / (1000 * 60 * 60 * 24)) : null,
          amount: sub.amount,
          createdAt: sub.createdAt
        }))
      };
      
      return debugInfo;
      
    } catch (error) {
      console.error('Debug error:', error);
      throw error;
    }
  }

  // ============= PRIVATE HELPER METHODS =============

  /**
   * Validate and convert adminId to ObjectId
   * @private
   */
  static _validateAndConvertAdminId(adminId) {
    if (!adminId) {
      throw new Error('AdminId is required');
    }

    if (typeof adminId === 'string') {
      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        throw new Error('Invalid adminId format');
      }
      return new mongoose.Types.ObjectId(adminId);
    } else if (adminId instanceof mongoose.Types.ObjectId) {
      return adminId;
    } else {
      throw new Error('Invalid adminId type - must be string or ObjectId');
    }
  }

  /**
   * Process payment details based on plan type - UPDATED
   * @private
   */
  static _processPaymentDetails(subscriptionData, planType, paymentDetails, planFeatures) {
    // All plans now require payment (no free trial)
    if (planFeatures.amount > 0) {
      // Paid plan requires payment details
      if (!paymentDetails || !paymentDetails.razorpay_payment_id || !paymentDetails.razorpay_order_id) {
        throw new Error('Payment details required for all plans');
      }

      subscriptionData.paymentId = paymentDetails.razorpay_payment_id;
      subscriptionData.orderId = paymentDetails.razorpay_order_id;
      subscriptionData.paymentDetails = {
        razorpay_payment_id: paymentDetails.razorpay_payment_id,
        razorpay_order_id: paymentDetails.razorpay_order_id,
        razorpay_signature: paymentDetails.razorpay_signature || '',
        payment_method: paymentDetails.payment_method || 'card',
        payment_status: 'completed',
        verified_at: new Date(),
        amount: planFeatures.amount,
        currency: 'INR'
      };
    }
  }
}