// controllers/adminReferralController.js
import Referral from '../models/Referral.js';
import Admin from '../models/Admin.js';
import Subscription from '../models/Subscription.js';
import mongoose from 'mongoose';

// Referral commission rates
const COMMISSION_RATES = {
  'Monthly Plan': 200,  // ₹200 per monthly referral
  'Yearly Plan': 500    // ₹500 per yearly referral
};

/**
 * Get overall referral statistics for admin dashboard
 * Logic: Referral → Subscription (get plan types) → Calculate commissions
 */
export const getAdminReferralStats = async (req, res) => {
  try {
    console.log('📊 Admin: Fetching referral stats');

    // Step 1: Get all accepted/registered referrals from Referral model
    const acceptedReferrals = await Referral.find({ 
      status: { $in: ['Accepted', 'Registered'] }
    }).lean();

    if (acceptedReferrals.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          totalAmount: '0',
          totalReferrals: 0,
          yearlyAmount: '0',
          monthlyAmount: '0'
        }
      });
    }

    // Step 2: Extract all referred doctor IDs
    const referredDoctorIds = acceptedReferrals.map(ref => ref.referredDoctorId);

    // Step 3: Get subscriptions for all referred doctors from Subscription model
    const subscriptions = await Subscription.find({
      adminId: { $in: referredDoctorIds },
      status: 'active'
    }).lean();

    // Step 4: Calculate commission totals based on plan type
    let totalAmount = 0;
    let yearlyAmount = 0;
    let monthlyAmount = 0;
    let yearlyCount = 0;
    let monthlyCount = 0;

    subscriptions.forEach(sub => {
      const planType = sub.planType;
      
      if (planType === 'Yearly Plan') {
        const commission = COMMISSION_RATES['Yearly Plan'];
        yearlyAmount += commission;
        totalAmount += commission;
        yearlyCount++;
      } else if (planType === 'Monthly Plan') {
        const commission = COMMISSION_RATES['Monthly Plan'];
        monthlyAmount += commission;
        totalAmount += commission;
        monthlyCount++;
      }
    });

    console.log('✅ Admin stats fetched:', { 
      totalReferrals: acceptedReferrals.length, 
      totalAmount: totalAmount,
      subscriptionsFound: subscriptions.length,
      yearlyCount,
      monthlyCount
    });

    res.status(200).json({
      success: true,
      stats: {
        totalAmount: totalAmount.toString(),
        totalReferrals: acceptedReferrals.length,
        yearlyAmount: yearlyAmount.toString(),
        monthlyAmount: monthlyAmount.toString()
      }
    });
  } catch (error) {
    console.error('❌ Error fetching admin referral stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral statistics',
      error: error.message
    });
  }
};

/**
 * Get all referrals grouped by referrer doctor with total earnings
 * Logic: Referral (get referrerId) → Subscription (get plan type) → Calculate commission → Admin (get details)
 */
export const getAdminReferralList = async (req, res) => {
  try {
    console.log('📋 Admin: Fetching referral list');

    const { search, sortBy } = req.query;

    // STEP 1: Get all referrals (both "Accepted" and "Registered" status)
    const referrals = await Referral.find({ 
      status: { $in: ['Accepted', 'Registered'] }
    }).lean();

    if (referrals.length === 0) {
      console.log('⚠️  No referrals found with status Accepted or Registered');
      return res.status(200).json({
        success: true,
        referrals: []
      });
    }

    console.log(`📌 Found ${referrals.length} referrals`);
    console.log('📌 Sample referral:', JSON.stringify(referrals[0], null, 2));

    // STEP 2: Group referrals by referrerId (the doctor who made the referral)
    const referrerMap = {};

    for (const referral of referrals) {
      const referrerId = referral.referrerId.toString();

      if (!referrerMap[referrerId]) {
        referrerMap[referrerId] = {
          referrerId: referrerId,
          referredDoctorIds: [], // Store IDs for subscription lookup
          referralDetails: []     // Store basic referral info
        };
      }

      // Add referred doctor ID
      referrerMap[referrerId].referredDoctorIds.push(referral.referredDoctorId);
      
      // Store referral details
      referrerMap[referrerId].referralDetails.push({
        referredDoctorId: referral.referredDoctorId,
        referredDoctorName: referral.referredDoctorName,
        referredDoctorEmail: referral.referredDoctorEmail,
        registeredAt: referral.registeredAt
      });
    }

    console.log(`👥 Grouped into ${Object.keys(referrerMap).length} referrers`);

    // STEP 3: For each referrer, get subscription amounts and admin details
    const referrerList = [];

    for (const [referrerId, data] of Object.entries(referrerMap)) {
      console.log(`\n🔍 Processing referrer: ${referrerId}`);
      console.log(`   Referred Doctor IDs:`, data.referredDoctorIds.map(id => id.toString()));
      
      // Get all subscriptions for the referred doctors
      const subscriptions = await Subscription.find({
        adminId: { $in: data.referredDoctorIds },
        status: 'active'
      }).lean();

      console.log(`💰 Found ${subscriptions.length} active subscriptions`);
      if (subscriptions.length > 0) {
        console.log(`💰 Sample subscription:`, JSON.stringify(subscriptions[0], null, 2));
      } else {
        // Try finding ANY subscription (regardless of status)
        const anySubscriptions = await Subscription.find({
          adminId: { $in: data.referredDoctorIds }
        }).lean();
        console.log(`⚠️  Found ${anySubscriptions.length} subscriptions (any status)`);
        if (anySubscriptions.length > 0) {
          console.log(`⚠️  Sample (any status):`, JSON.stringify(anySubscriptions[0], null, 2));
        }
      }

      // Create a map for quick subscription lookup by adminId
      const subscriptionMap = {};
      subscriptions.forEach(sub => {
        subscriptionMap[sub.adminId.toString()] = sub;
      });

      // Calculate commission totals and enrich referral details
      let totalAmount = 0;
      let yearlyEarnings = 0;
      let monthlyEarnings = 0;
      const enrichedReferralDetails = [];

      for (const detail of data.referralDetails) {
        const referredDoctorId = detail.referredDoctorId.toString();
        const subscription = subscriptionMap[referredDoctorId];

        console.log(`   👤 Referred Doctor: ${detail.referredDoctorName}`);
        console.log(`      ID: ${referredDoctorId}`);
        console.log(`      Subscription found: ${subscription ? 'YES' : 'NO'}`);
        
        let commission = 0;
        let planType = 'No Active Plan';
        
        if (subscription) {
          planType = subscription.planType;
          console.log(`      Plan: ${planType}`);
          
          // Calculate commission based on plan type
          if (planType === 'Yearly Plan') {
            commission = COMMISSION_RATES['Yearly Plan']; // ₹500
            yearlyEarnings += commission;
          } else if (planType === 'Monthly Plan') {
            commission = COMMISSION_RATES['Monthly Plan']; // ₹200
            monthlyEarnings += commission;
          }
          
          console.log(`      Commission: ₹${commission}`);
          totalAmount += commission;
        }

        enrichedReferralDetails.push({
          referredDoctorName: detail.referredDoctorName,
          referredDoctorEmail: detail.referredDoctorEmail,
          planType: planType,
          amount: commission,
          registeredAt: detail.registeredAt
        });
      }
      
      console.log(`   📊 Commission Totals - Total: ₹${totalAmount}, Yearly: ₹${yearlyEarnings}, Monthly: ₹${monthlyEarnings}`);

      // STEP 4: Get referrer details from Admin model
      const referrerAdmin = await Admin.findById(referrerId).lean();

      if (referrerAdmin) {
        referrerList.push({
          doctorId: referrerId,
          doctorName: referrerAdmin.name || 'Unknown',
          email: referrerAdmin.email || 'N/A',
          phone: referrerAdmin.phone || 'N/A',
          totalAmount: totalAmount,
          totalReferrals: data.referredDoctorIds.length,
          yearlyEarnings: yearlyEarnings,
          monthlyEarnings: monthlyEarnings,
          referralDetails: enrichedReferralDetails
        });
      } else {
        console.log(`⚠️  Admin not found for referrerId: ${referrerId}`);
      }
    }

    console.log(`✅ Built referrer list with ${referrerList.length} doctors`);

    // STEP 5: Apply search filter
    let filteredList = referrerList;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredList = referrerList.filter(ref => 
        ref.doctorName.toLowerCase().includes(searchLower) ||
        ref.email.toLowerCase().includes(searchLower) ||
        ref.phone.includes(search)
      );
      console.log(`🔍 Search filtered to ${filteredList.length} results`);
    }

    // STEP 6: Apply sorting
    if (sortBy === 'Amount (Low to High)') {
      filteredList.sort((a, b) => a.totalAmount - b.totalAmount);
    } else if (sortBy === 'Amount (High to Low)') {
      filteredList.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (sortBy === 'Name (A-Z)') {
      filteredList.sort((a, b) => a.doctorName.localeCompare(b.doctorName));
    } else {
      // Default: Amount (High to Low)
      filteredList.sort((a, b) => b.totalAmount - a.totalAmount);
    }

    console.log(`✅ Admin: Returning ${filteredList.length} referrers`);

    // STEP 7: Format response (amounts are already in rupees, no conversion needed)
    res.status(200).json({
      success: true,
      referrals: filteredList.map(ref => ({
        id: ref.doctorId,
        doctorName: ref.doctorName,
        doctorId: ref.doctorId,
        email: ref.email,
        phone: ref.phone,
        totalAmount: ref.totalAmount.toString(),
        totalReferrals: ref.totalReferrals,
        yearlyEarnings: ref.yearlyEarnings.toString(),
        monthlyEarnings: ref.monthlyEarnings.toString(),
        referralDetails: ref.referralDetails.map(detail => ({
          referredDoctorName: detail.referredDoctorName,
          referredDoctorEmail: detail.referredDoctorEmail,
          planType: detail.planType,
          amount: detail.amount.toString(),
          registeredAt: detail.registeredAt
        }))
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching admin referral list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral list',
      error: error.message
    });
  }
};

/**
 * Get detailed referrals for a specific doctor
 * Logic: Referral (filter by referrerId) → Subscription (get plan type) → Calculate commission → Return details
 */
export const getDoctorReferralDetails = async (req, res) => {
  try {
    const { doctorId } = req.params;

    console.log('📋 Admin: Fetching referral details for doctor:', doctorId);

    // STEP 1: Get all referrals made by this doctor (where they are the referrer)
    const referrals = await Referral.find({
      referrerId: doctorId,
      status: { $in: ['Accepted', 'Registered'] }
    }).lean();

    if (referrals.length === 0) {
      return res.status(200).json({
        success: true,
        referrals: []
      });
    }

    console.log(`📌 Found ${referrals.length} referrals made by doctor ${doctorId}`);

    // STEP 2: Get referred doctor IDs
    const referredDoctorIds = referrals.map(ref => ref.referredDoctorId);

    // STEP 3: Get subscriptions for all referred doctors
    const subscriptions = await Subscription.find({
      adminId: { $in: referredDoctorIds },
      status: 'active'
    }).lean();

    console.log(`💰 Found ${subscriptions.length} active subscriptions`);

    // Create subscription map for quick lookup
    const subscriptionMap = {};
    subscriptions.forEach(sub => {
      subscriptionMap[sub.adminId.toString()] = sub;
    });

    // STEP 4: Map subscriptions to referrals and calculate commissions
    const detailedReferrals = referrals.map(ref => {
      const referredDoctorId = ref.referredDoctorId.toString();
      const subscription = subscriptionMap[referredDoctorId];

      let commission = 0;
      let planType = 'No Active Plan';

      if (subscription) {
        planType = subscription.planType;
        if (planType === 'Yearly Plan') {
          commission = COMMISSION_RATES['Yearly Plan']; // ₹500
        } else if (planType === 'Monthly Plan') {
          commission = COMMISSION_RATES['Monthly Plan']; // ₹200
        }
      }

      return {
        referredDoctorName: ref.referredDoctorName,
        referredDoctorEmail: ref.referredDoctorEmail,
        planType: planType,
        amount: commission.toFixed(2),
        date: ref.registeredAt || ref.createdAt
      };
    });

    console.log(`✅ Returning ${detailedReferrals.length} detailed referrals`);

    res.status(200).json({
      success: true,
      referrals: detailedReferrals
    });
  } catch (error) {
    console.error('❌ Error fetching doctor referral details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral details',
      error: error.message
    });
  }
};

/**
 * Delete a referral (admin only)
 */
export const deleteReferral = async (req, res) => {
  try {
    const { referralId } = req.params;

    console.log('🗑️  Admin: Attempting to delete referral:', referralId);

    const referral = await Referral.findByIdAndDelete(referralId);

    if (!referral) {
      return res.status(404).json({
        success: false,
        message: 'Referral not found'
      });
    }

    console.log('✅ Referral deleted:', referralId);

    res.status(200).json({
      success: true,
      message: 'Referral deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting referral:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete referral',
      error: error.message
    });
  }
};