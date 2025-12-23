// schedulers/subscriptionScheduler.js
import cron from 'node-cron';
import { SubscriptionService } from '../services/subscriptionService.js';
import Subscription from '../models/Subscription.js';
import Admin from '../models/Admin.js';

class SubscriptionScheduler {
  
  // Initialize all scheduled tasks
  static initializeSchedulers() {
    //console.log('🕐 Initializing subscription schedulers...');
    
    // Check for expired subscriptions every hour
    this.scheduleExpiryCheck();
    
    // Send expiry warnings daily at 9 AM
    this.scheduleExpiryWarnings();
    
    // Send renewal reminders every 6 hours
    this.scheduleRenewalReminders();
    
    // Cleanup old payment orders weekly
    this.schedulePaymentCleanup();
    
    //console.log('✅ All subscription schedulers initialized');
  }

  // Check for expired subscriptions every hour
  static scheduleExpiryCheck() {
    // Run every hour at minute 0
    cron.schedule('0 * * * *', async () => {
      try {
        //console.log('🔍 Running subscription expiry check...');
        
        const expiredCount = await SubscriptionService.handleExpiredSubscriptions();
        
        if (expiredCount > 0) {
          //console.log(`⚠️  Marked ${expiredCount} subscriptions as expired`);
        } else {
          //console.log('✅ No expired subscriptions found');
        }
        
      } catch (error) {
        console.error('❌ Error in subscription expiry check:', error);
      }
    });
    
    //console.log('📅 Scheduled subscription expiry check (hourly)');
  }

  // Send expiry warnings daily at 9 AM
static scheduleExpiryWarnings() {
  // Run daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      //console.log('📧 Running expiry warning notifications...');
      
      // Find subscriptions expiring in 2 and 1 days (for 3-day trial)
      const warningDays = [2, 1];  // ✅ Changed from [7, 3, 1]
      let totalWarnings = 0;
      
      for (const days of warningDays) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);
        
        // Find subscriptions expiring on this specific day
        const expiringSubscriptions = await Subscription.find({
          status: 'active',
          endDate: {
            $gte: new Date(endDate.setHours(0, 0, 0, 0)),
            $lt: new Date(endDate.setHours(23, 59, 59, 999))
          }
        }).populate('adminId', 'name email');
        
        for (const subscription of expiringSubscriptions) {
          await this.sendExpiryWarning(subscription, days);
          totalWarnings++;
        }
      }
      
      //console.log(`📬 Sent ${totalWarnings} expiry warning notifications`);
      
    } catch (error) {
      console.error('❌ Error in expiry warning scheduler:', error);
    }
  });
  
  //console.log('📅 Scheduled expiry warnings (daily at 9 AM)');
}

  // Send renewal reminders every 6 hours
static scheduleRenewalReminders() {
  // Run every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    try {
      //console.log('🔔 Running renewal reminder checks...');
      
      // Find subscriptions that expired in the last 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const expiredSubscriptions = await Subscription.find({
        status: 'expired',
        endDate: {
          $gte: threeDaysAgo,  // ✅ Changed from sevenDaysAgo
          $lt: new Date()
        }
      }).populate('adminId', 'name email');
      
      let reminderCount = 0;
      
      for (const subscription of expiredSubscriptions) {
        // Check if we haven't sent too many reminders recently
        const recentReminders = await this.getRecentReminderCount(subscription.adminId);
        
        if (recentReminders < 3) { // Max 3 reminders per week
          await this.sendRenewalReminder(subscription);
          reminderCount++;
        }
      }
      
      //console.log(`🔔 Sent ${reminderCount} renewal reminders`);
      
    } catch (error) {
      console.error('❌ Error in renewal reminder scheduler:', error);
    }
  });
  
  //console.log('📅 Scheduled renewal reminders (every 6 hours)');
}

  // Cleanup old payment orders weekly
  static schedulePaymentCleanup() {
    // Run every Sunday at 2 AM
    cron.schedule('0 2 * * 0', async () => {
      try {
        //console.log('🧹 Running payment order cleanup...');
        
        const { default: PaymentOrder } = await import('../models/PaymentOrder.js');
        
        // Delete failed/cancelled orders older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const cleanupResult = await PaymentOrder.deleteMany({
          status: { $in: ['failed', 'cancelled'] },
          createdAt: { $lt: thirtyDaysAgo }
        });
        
        //console.log(`🗑️  Cleaned up ${cleanupResult.deletedCount} old payment orders`);
        
      } catch (error) {
        console.error('❌ Error in payment cleanup scheduler:', error);
      }
    });
    
    //console.log('📅 Scheduled payment cleanup (weekly on Sunday)');
  }

  // Send expiry warning notification
  static async sendExpiryWarning(subscription, daysRemaining) {
    try {
      const admin = subscription.adminId;
      
      /*console.log(`📧 Sending ${daysRemaining}-day expiry warning to:`, {
        adminId: admin._id,
        email: admin.email,
        planType: subscription.planType
      });*/
      
      // Here you would integrate with your email service
      // Example with nodemailer or your preferred email service
      /*
      await emailService.send({
        to: admin.email,
        subject: `Your ${subscription.planType} expires in ${daysRemaining} days`,
        template: 'subscription-expiry-warning',
        data: {
          adminName: admin.name,
          planType: subscription.planType,
          daysRemaining: daysRemaining,
          endDate: subscription.endDate,
          renewalLink: `${process.env.FRONTEND_URL}/pricing`
        }
      });
      */
      
      // For now, just log the warning
      //console.log(`⚠️  Expiry warning: ${admin.name}'s ${subscription.planType} expires in ${daysRemaining} days`);
      
    } catch (error) {
      console.error('❌ Error sending expiry warning:', error);
    }
  }

  // Send renewal reminder notification
  static async sendRenewalReminder(subscription) {
    try {
      const admin = subscription.adminId;
      
      /*console.log(`🔔 Sending renewal reminder to:`, {
        adminId: admin._id,
        email: admin.email,
        expiredPlan: subscription.planType
      });*/
      
      // Here you would integrate with your email service
      /*
      await emailService.send({
        to: admin.email,
        subject: `Renew your ${subscription.planType} subscription`,
        template: 'subscription-renewal-reminder',
        data: {
          adminName: admin.name,
          planType: subscription.planType,
          expiredDate: subscription.endDate,
          renewalLink: `${process.env.FRONTEND_URL}/pricing`,
          features: subscription.features
        }
      });
      */
      
      //console.log(`🔔 Renewal reminder: ${admin.name}'s ${subscription.planType} needs renewal`);
      
      // Log the reminder for tracking
      await this.logReminderSent(subscription.adminId);
      
    } catch (error) {
      console.error('❌ Error sending renewal reminder:', error);
    }
  }

  // Get count of recent reminders sent to an admin
  static async getRecentReminderCount(adminId) {
    try {
      // This would typically be stored in a separate collection or cache
      // For now, we'll implement a simple counter
      
      const reminderKey = `reminder_${adminId}_${new Date().getWeek()}`;
      
      // You could use Redis for this:
      // const count = await redis.get(reminderKey);
      // return parseInt(count) || 0;
      
      // For now, return a default value
      return 0;
      
    } catch (error) {
      console.error('❌ Error getting reminder count:', error);
      return 0;
    }
  }

  // Log that a reminder was sent
 static async logReminderSent(adminId) {
  try {
    const reminderKey = `reminder_${adminId}_${new Date().getWeek()}`;
    
    // You could use Redis for this:
    // await redis.incr(reminderKey);
    // await redis.expire(reminderKey, 3 * 24 * 60 * 60); // Expire in 3 days
    
    //console.log(`📝 Logged reminder sent for admin: ${adminId}`);
    
  } catch (error) {
    console.error('❌ Error logging reminder:', error);
  }
}

  // Manual trigger for testing
  static async runManualExpiryCheck() {
    //console.log('🔍 Running manual subscription expiry check...');
    
    try {
      const expiredCount = await SubscriptionService.handleExpiredSubscriptions();
      //console.log(`✅ Manual expiry check complete. Expired count: ${expiredCount}`);
      return expiredCount;
    } catch (error) {
      console.error('❌ Error in manual expiry check:', error);
      throw error;
    }
  }

  // Get scheduler status
  static getSchedulerStatus() {
    return {
      expiryCheck: {
        schedule: 'Every hour at minute 0',
        nextRun: cron.getTasks().size > 0 ? 'Active' : 'Inactive'
      },
      expiryWarnings: {
        schedule: 'Daily at 9:00 AM',
        nextRun: 'Active'
      },
      renewalReminders: {
        schedule: 'Every 6 hours',
        nextRun: 'Active'
      },
      paymentCleanup: {
        schedule: 'Weekly on Sunday at 2:00 AM',
        nextRun: 'Active'
      }
    };
  }

  // Stop all schedulers
  static stopAllSchedulers() {
    //console.log('🛑 Stopping all subscription schedulers...');
    cron.getTasks().forEach((task, name) => {
      task.stop();
      //console.log(`⏹️  Stopped scheduler: ${name}`);
    });
    //console.log('✅ All schedulers stopped');
  }
}

// Helper method to add week number to Date prototype
Date.prototype.getWeek = function() {
  const onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

export default SubscriptionScheduler;

// Usage in your main app file:
/*
import SubscriptionScheduler from './schedulers/subscriptionScheduler.js';

// Initialize schedulers when the app starts
SubscriptionScheduler.initializeSchedulers();

// Optional: Add API endpoints to check scheduler status
app.get('/api/admin/scheduler-status', (req, res) => {
  const status = SubscriptionScheduler.getSchedulerStatus();
  res.json(status);
});

app.post('/api/admin/manual-expiry-check', async (req, res) => {
  try {
    const expiredCount = await SubscriptionScheduler.runManualExpiryCheck();
    res.json({ success: true, expiredCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
*/