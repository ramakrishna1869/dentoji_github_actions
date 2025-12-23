// controllers/graphStatsController.js
import Admin from "../models/Admin.js";
import Subscription from "../models/Subscription.js";
import Referral from "../models/Referral.js";
import mongoose from "mongoose";

// Referral commission rates (hardcoded)
const COMMISSION_RATES = {
  'Monthly Plan': 200,  // ₹200 per monthly referral
  'Yearly Plan': 500    // ₹500 per yearly referral
};

/**
 * Get graph header statistics
 * Returns statistics for the graph header cards
 */
export const getGraphHeaderStats = async (req, res) => {
  try {
    //console.log('📊 Fetching graph header statistics...');

    // 1. Total Revenue - Sum of all subscription amounts
    const totalRevenueResult = await Subscription.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);

    // 2. Total Dentists Onboarded - Count unique admins with subscriptions
    const totalDentistsResult = await Admin.aggregate([
      {
        $lookup: {
          from: 'subscriptions',
          let: { adminId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$adminId', '$$adminId'] }
              }
            },
            { $limit: 1 }
          ],
          as: 'subscriptions'
        }
      },
      {
        $match: {
          'subscriptions.0': { $exists: true }
        }
      },
      {
        $count: 'total'
      }
    ]);

    // 3. Active Subscriptions (currently active and non-expired)
    const activeSubscriptionsResult = await Subscription.aggregate([
      {
        $match: {
          status: 'active',
          endDate: { $gt: new Date() }
        }
      },
      {
        $count: 'total'
      }
    ]);

    // 4. Referral Amount - Calculate total commission from referrals
    let referralAmount = 0;

    try {
      // Get all accepted/registered referrals
      const acceptedReferrals = await Referral.find({
        status: { $in: ['Accepted', 'Registered'] }
      }).lean();

      if (acceptedReferrals.length > 0) {
        // Get all referred doctor IDs
        const referredDoctorIds = acceptedReferrals.map(ref => ref.referredDoctorId);

        // Get active subscriptions for these referred doctors
        const referredSubscriptions = await Subscription.find({
          adminId: { $in: referredDoctorIds },
          status: 'active'
        }).lean();

        // Calculate total commission based on plan types
        referredSubscriptions.forEach(sub => {
          const planType = sub.planType;
          if (planType === 'Yearly Plan') {
            referralAmount += COMMISSION_RATES['Yearly Plan']; // ₹500
          } else if (planType === 'Monthly Plan') {
            referralAmount += COMMISSION_RATES['Monthly Plan']; // ₹200
          }
        });

        console.log(`💰 Total Referral Commission: ₹${referralAmount} (from ${referredSubscriptions.length} referred subscriptions)`);
      }
    } catch (referralError) {
      console.error('⚠️  Error calculating referral amount:', referralError);
      // Don't fail the entire request, just log the error
    }

    const result = {
      totalRevenue: Math.round((totalRevenueResult[0]?.totalRevenue || 0) / 100), // Convert paise to rupees
      totalDentistsOnboarded: totalDentistsResult[0]?.total || 0,
      activeSubscriptions: activeSubscriptionsResult[0]?.total || 0,
      referralAmount: referralAmount // Already in rupees (commission amount)
    };

    //console.log('✅ Graph header statistics fetched:', result);

    res.status(200).json({
      success: true,
      stats: result
    });

  } catch (error) {
    console.error('❌ Error fetching graph header stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch graph header statistics',
      error: error.message
    });
  }
};

/**
 * Get subscription trends data for chart
 * Returns data based on timeframe (weekly, monthly, yearly)
 */
export const getSubscriptionTrends = async (req, res) => {
  try {
    const { timeframe = 'monthly' } = req.query;
    //console.log(`📈 Fetching subscription trends for: ${timeframe}`);

    let groupBy, dateFormat, labels;
    const now = new Date();

    switch (timeframe.toLowerCase()) {
      case 'weekly':
        // Last 7 days
        groupBy = { $dayOfWeek: '$createdAt' };
        labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        break;
      
      case 'yearly':
        // Last 7 years
        groupBy = { $year: '$createdAt' };
        const currentYear = now.getFullYear();
        labels = Array.from({ length: 7 }, (_, i) => (currentYear - 6 + i).toString());
        break;
      
      case 'monthly':
      default:
        // Last 12 months
        groupBy = { $month: '$createdAt' };
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        break;
    }

    // Get date range based on timeframe
    let startDate;
    if (timeframe.toLowerCase() === 'weekly') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe.toLowerCase() === 'yearly') {
      startDate = new Date(now.getFullYear() - 6, 0, 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const trendsData = await Subscription.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Format response data
    const data = labels.map((label, index) => {
      let matchIndex = index + 1;
      if (timeframe.toLowerCase() === 'yearly') {
        matchIndex = parseInt(label);
      }
      
      const found = trendsData.find(item => item._id === matchIndex);
      return {
        label: label,
        value: found ? found.count : 0
      };
    });

    //console.log('✅ Subscription trends fetched:', data.length, 'data points');

    res.status(200).json({
      success: true,
      timeframe,
      data
    });

  } catch (error) {
    console.error('❌ Error fetching subscription trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription trends',
      error: error.message
    });
  }
};

/**
 * Get onboarding funnel statistics
 * Returns funnel data: Leads, Demos, Onboarded
 */
export const getOnboardingFunnelStats = async (req, res) => {
  try {
    //console.log('📊 Fetching onboarding funnel statistics...');

    // Get unique admins with their latest subscription based on startDate
    const allAdminsWithSubscriptions = await Admin.aggregate([
      {
        $lookup: {
          from: 'subscriptions',
          let: { adminId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$adminId', '$$adminId'] }
              }
            },
            { $sort: { startDate: -1 } },
            { $limit: 1 }
          ],
          as: 'latestSubscription'
        }
      },
      {
        $match: {
          'latestSubscription.0': { $exists: true }
        }
      },
      {
        $unwind: '$latestSubscription'
      }
    ]);

    // Leads: Total unique admins with any subscription
    const leads = allAdminsWithSubscriptions.length;

    // Demos: Unique admins whose latest subscription is Free Trial
    const demos = allAdminsWithSubscriptions.filter(
      admin => admin.latestSubscription.planType === 'Free Trial'
    ).length;

    // Onboarded: Unique admins whose latest subscription is Monthly or Yearly Plan
    const onboarded = allAdminsWithSubscriptions.filter(
      admin => admin.latestSubscription.planType === 'Monthly Plan' || 
               admin.latestSubscription.planType === 'Yearly Plan'
    ).length;

    const result = {
      leads,
      demos,
      onboarded
    };

    //console.log('✅ Onboarding funnel statistics fetched:', result);

    res.status(200).json({
      success: true,
      funnel: result
    });

  } catch (error) {
    console.error('❌ Error fetching onboarding funnel stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch onboarding funnel statistics',
      error: error.message
    });
  }
};

/**
 * Get subscription trends data for chart with unique clinic counts
 * Returns data based on timeframe (weekly, monthly, yearly) using startDate
 * Counts only the most recent subscription per admin
 */
export const getSubscriptionTrendsDetailed = async (req, res) => {
  try {
    const { timeframe = 'monthly' } = req.query;
    //console.log(`📈 Fetching detailed subscription trends for: ${timeframe}`);

    const now = new Date();
    let labels, dateRanges;

    switch (timeframe.toLowerCase()) {
      case 'weekly':
        // Current week (Sunday to Saturday)
        const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - currentDayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        
        labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dateRanges = labels.map((_, index) => {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + index);
          const endDate = new Date(date);
          endDate.setHours(23, 59, 59, 999);
          return { start: date, end: endDate };
        });
        break;

      case 'yearly':
        // Last 7 years
        const startYear = now.getFullYear() - 6;
        labels = Array.from({ length: 7 }, (_, i) => (startYear + i).toString());
        dateRanges = labels.map((year) => {
          const yearNum = parseInt(year);
          return {
            start: new Date(yearNum, 0, 1),
            end: new Date(yearNum, 11, 31, 23, 59, 59, 999)
          };
        });
        break;

      case 'monthly':
      default:
        // All 12 months of current year
        labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = now.getMonth(); // 0 = Jan, 8 = Sep
        
        dateRanges = labels.map((_, index) => {
          // Only set valid date range for months that have occurred (up to current month)
          if (index <= currentMonth) {
            return {
              start: new Date(now.getFullYear(), index, 1),
              end: new Date(now.getFullYear(), index + 1, 0, 23, 59, 59, 999)
            };
          } else {
            // For future months, set impossible date range so count will be 0
            return {
              start: new Date(now.getFullYear(), index, 1),
              end: new Date(now.getFullYear(), index, 1) // Same start and end = no data
            };
          }
        });
        break;
    }

    // Get all subscriptions and find the latest one per admin
    const allSubscriptions = await Subscription.find({}).sort({ startDate: -1 }).lean();
    
    // Group by adminId and get only the latest subscription for each admin
    const latestSubscriptionsByAdmin = {};
    allSubscriptions.forEach(sub => {
      const adminIdStr = sub.adminId.toString();
      if (!latestSubscriptionsByAdmin[adminIdStr]) {
        latestSubscriptionsByAdmin[adminIdStr] = sub;
      }
    });

    // Convert to array
    const latestSubscriptions = Object.values(latestSubscriptionsByAdmin);

    // Count unique admins for each time period based on their latest subscription startDate
    const data = dateRanges.map((range, index) => {
      const count = latestSubscriptions.filter(sub => {
        const startDate = new Date(sub.startDate);
        return startDate >= range.start && startDate <= range.end;
      }).length;

      return {
        label: labels[index],
        value: count
      };
    });

    // Find peak value and its index
    const maxValue = Math.max(...data.map(d => d.value), 0);
    const peakIndex = data.findIndex(d => d.value === maxValue);

    /*console.log('✅ Detailed subscription trends fetched:', {
      dataPoints: data.length,
      maxValue,
      peakLabel: labels[peakIndex >= 0 ? peakIndex : 0],
      totalUniqueAdmins: latestSubscriptions.length
    });*/

    res.status(200).json({
      success: true,
      timeframe,
      data,
      peak: {
        value: maxValue,
        label: labels[peakIndex >= 0 ? peakIndex : 0],
        index: peakIndex >= 0 ? peakIndex : 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching detailed subscription trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription trends',
      error: error.message
    });
  }
};