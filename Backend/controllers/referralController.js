// controllers/referralController.js - COMPLETE VERSION
import Referral from '../models/Referral.js';
import Admin from '../models/Admin.js';
import Subscription from '../models/Subscription.js';
import mongoose from 'mongoose';
import { 
  sendReferralEmail, 
  sendReferralRegisteredEmail, 
  sendReferralAcceptedEmail 
} from '../services/emailService.js';

/**
 * Get referral statistics for header cards
 */
export const getReferralStats = async (req, res) => {
  try {
    console.log('📊 getReferralStats called:', {
      hasAdmin: !!req.admin,
      adminId: req.admin?._id
    });

    if (!req.admin || !req.admin._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Admin not found in request'
      });
    }

    const doctorId = req.admin._id;

    // Use Promise.all for parallel queries (faster)
    const [totalSent, registered, pending] = await Promise.all([
      Referral.countDocuments({ referrerId: doctorId }),
      Referral.countDocuments({ referrerId: doctorId, status: { $in: ['Registered', 'Accepted'] } }),
      Referral.countDocuments({ referrerId: doctorId, status: 'Pending' })
    ]);

    // Calculate accepted referrals (those with subscription)
    const referrals = await Referral.find({ referrerId: doctorId }).lean();
    
    let acceptedCount = 0;
    for (const referral of referrals) {
      // Check if referral has accepted status OR has a subscription
      if (referral.status === 'Accepted') {
        acceptedCount++;
      } else if (referral.referredDoctorId) {
        // Check if referred doctor has an active subscription
        const subscription = await Subscription.findOne({
          adminId: referral.referredDoctorId,
          status: 'active'
        });
        if (subscription && subscription.planType !== 'Basic Plan') {
          acceptedCount++;
        }
      }
    }

    const successRate = totalSent > 0 ? Math.round((acceptedCount / totalSent) * 100) : 0;

    console.log('✅ Stats fetched:', { totalSent, registered, accepted: acceptedCount, pending, successRate });

    res.status(200).json({
      success: true,
      stats: {
        totalSent,
        registered,
        pending,
        successRate: `${successRate}%`
      }
    });
  } catch (error) {
    console.error('❌ Error fetching referral stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral statistics',
      error: error.message
    });
  }
};

/**
 * Get referral code, link and total earnings for the doctor
 */
export const getReferralInfo = async (req, res) => {
  try {
    console.log('📋 getReferralInfo called:', {
      hasAdmin: !!req.admin,
      adminId: req.admin?._id
    });

    if (!req.admin || !req.admin._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Admin not found in request'
      });
    }

    const doctor = req.admin;
    let referralCode = doctor.referralCode;
    
    // Generate referral code if doesn't exist
    if (!referralCode) {
      const sanitizedName = doctor.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      referralCode = `DENTAL_${sanitizedName}_${randomSuffix}`;
      
      await Admin.findByIdAndUpdate(doctor._id, { referralCode });
    }

    const referralLink = `${process.env.FRONTEND_URL}/signup?ref=${referralCode}`;

    // Calculate total earnings - Get all accepted/registered referrals
    const referrals = await Referral.find({
      referrerId: doctor._id,
      status: { $in: ['Accepted', 'Registered'] }
    }).lean();

    let totalEarnings = 0;

    // Calculate earnings for each referral
    for (const referral of referrals) {
      if (referral.referralAmount && referral.referralAmount > 0) {
        // If amount is already stored in referral
        totalEarnings += referral.referralAmount;
      } else if (referral.referredDoctorId) {
        // If amount is not stored, get it from subscription
        const subscription = await Subscription.findOne({
          adminId: referral.referredDoctorId,
          status: 'active'
        })
          .sort({ createdAt: -1 })
          .select('planType')
          .lean();

        if (subscription) {
          switch (subscription.planType) {
            case 'Yearly Plan':
              totalEarnings += 50000; // ₹500 in paise
              break;
            case 'Monthly Plan':
              totalEarnings += 20000; // ₹200 in paise
              break;
            default:
              totalEarnings += 0;
          }
        }
      }
    }

    console.log('✅ Referral info fetched:', { referralCode, totalEarnings });

    res.status(200).json({
      success: true,
      referralCode,
      referralLink,
      totalEarnings // in paise
    });
  } catch (error) {
    console.error('❌ Error fetching referral info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral information',
      error: error.message
    });
  }
};

/**
 * Send referral invitation
 */
export const sendReferralInvitation = async (req, res) => {
  try {
    if (!req.admin || !req.admin._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Admin not found in request'
      });
    }

    const doctorId = req.admin._id;
    const { email, name, phone } = req.body;

    // Validate input
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is already registered
    const existingDoctor = await Admin.findOne({ email: normalizedEmail });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'This doctor is already registered on DentalX'
      });
    }

    // Check if referral already exists for this email
    const existingReferral = await Referral.findOne({
      referrerId: doctorId,
      referredDoctorEmail: normalizedEmail
    });

    if (existingReferral) {
      return res.status(400).json({
        success: false,
        message: 'Referral already sent to this email',
        referralStatus: existingReferral.status
      });
    }

    // Get doctor's referral code
    const doctor = await Admin.findById(doctorId);
    let referralCode = doctor.referralCode;
    
    if (!referralCode) {
      const sanitizedName = doctor.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      referralCode = `DENTAL_${sanitizedName}_${randomSuffix}`;
      
      doctor.referralCode = referralCode;
      await doctor.save();
    }

    // Create referral link
    const referralLink = `${process.env.FRONTEND_URL}/signup?ref=${referralCode}`;

    // Create new referral
    const newReferral = new Referral({
      referrerId: doctorId,
      referredDoctorEmail: normalizedEmail,
      referredDoctorName: name?.trim() || null,
      referredDoctorPhone: phone?.trim() || null,
      referralCode: referralCode,
      status: 'Pending',
      dateSent: new Date()
    });

    await newReferral.save();

    // Send email invitation (non-blocking)
    sendReferralEmail(normalizedEmail, referralCode, doctor.name, referralLink)
      .catch(error => {
        console.error('Failed to send referral email:', error);
      });

    console.log('✅ Referral created:', newReferral._id);

    res.status(201).json({
      success: true,
      message: 'Referral invitation sent successfully',
      referral: {
        id: newReferral._id,
        email: newReferral.referredDoctorEmail,
        status: newReferral.status,
        dateSent: newReferral.dateSent
      }
    });
  } catch (error) {
    console.error('❌ Error sending referral invitation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send referral invitation',
      error: error.message
    });
  }
};

/**
 * Get all referrals for a doctor with filters - WITH SUBSCRIPTION DATA
 */
export const getReferralList = async (req, res) => {
  try {
    if (!req.admin || !req.admin._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Admin not found in request'
      });
    }

    const referrerId = req.admin._id;
    const { status, startDate, endDate } = req.query;

    // Build query
    let query = { referrerId };

    if (status && status !== 'All Status') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Fetch referrals
    const referrals = await Referral.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Enrich referrals with subscription data
    const enrichedReferrals = await Promise.all(
      referrals.map(async (referral) => {
        let planType = referral.planType;
        let referralAmount = referral.referralAmount;

        // If planType or amount is null, fetch from subscription
        if ((!planType || !referralAmount) && referral.referredDoctorId) {
          const subscription = await Subscription.findOne({
            adminId: referral.referredDoctorId,
            status: 'active'
          })
            .sort({ createdAt: -1 })
            .select('planType amount')
            .lean();

          if (subscription) {
            planType = subscription.planType;
            
            // Calculate referral amount based on plan
            switch (subscription.planType) {
              case 'Yearly Plan':
                referralAmount = 50000; // ₹500 in paise
                break;
              case 'Monthly Plan':
                referralAmount = 20000; // ₹200 in paise
                break;
              case 'Basic Plan':
              default:
                referralAmount = 0;
            }
          }
        }

        return {
          id: referral._id,
          referralId: referral.referralCode || referral._id.toString().slice(-8).toUpperCase(),
          doctorName: referral.referredDoctorName || 'N/A',
          email: referral.referredDoctorEmail,
          phone: referral.referredDoctorPhone || 'N/A',
          planType: planType || '-',
          status: referral.status,
          referralAmount: referralAmount || 0,
          dateSent: referral.createdAt,
          registeredAt: referral.registeredAt,
          acceptedAt: referral.acceptedAt
        };
      })
    );

    res.json({
      success: true,
      referrals: enrichedReferrals
    });

  } catch (error) {
    console.error('Error fetching referral list:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching referral list',
      error: error.message
    });
  }
};

/**
 * OPTIMIZED VERSION - Get referrals using aggregation (faster for large datasets)
 */
export const getReferralListOptimized = async (req, res) => {
  try {
    if (!req.admin || !req.admin._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Admin not found in request'
      });
    }

    const referrerId = req.admin._id;
    const { status, startDate, endDate } = req.query;

    // Build match stage
    let matchStage = { referrerId: new mongoose.Types.ObjectId(referrerId) };

    if (status && status !== 'All Status') {
      matchStage.status = status;
    }

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchStage.createdAt.$lte = new Date(endDate);
      }
    }

    const referrals = await Referral.aggregate([
      // Match referrals for this referrer
      { $match: matchStage },
      
      // Sort by creation date
      { $sort: { createdAt: -1 } },
      
      // Lookup subscription data
      {
        $lookup: {
          from: 'subscriptions', // MongoDB collection name
          let: { refDoctorId: '$referredDoctorId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$adminId', '$$refDoctorId'] },
                    { $eq: ['$status', 'active'] }
                  ]
                }
              }
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            { $project: { planType: 1, amount: 1 } }
          ],
          as: 'subscription'
        }
      },
      
      // Unwind subscription (convert array to object)
      {
        $unwind: {
          path: '$subscription',
          preserveNullAndEmptyArrays: true
        }
      },
      
      // Add computed fields
      {
        $addFields: {
          // Use referral planType if exists, otherwise use subscription planType
          finalPlanType: {
            $cond: {
              if: { $ifNull: ['$planType', false] },
              then: '$planType',
              else: '$subscription.planType'
            }
          },
          // Calculate referral amount
          finalReferralAmount: {
            $cond: {
              if: { $ifNull: ['$referralAmount', false] },
              then: '$referralAmount',
              else: {
                $switch: {
                  branches: [
                    { case: { $eq: ['$subscription.planType', 'Yearly Plan'] }, then: 50000 },
                    { case: { $eq: ['$subscription.planType', 'Monthly Plan'] }, then: 20000 }
                  ],
                  default: 0
                }
              }
            }
          }
        }
      },
      
      // Project final shape
      {
        $project: {
          id: '$_id',
          referralId: {
            $cond: {
              if: { $ifNull: ['$referralCode', false] },
              then: '$referralCode',
              else: { $toUpper: { $substr: [{ $toString: '$_id' }, 16, 8] } }
            }
          },
          doctorName: { $ifNull: ['$referredDoctorName', 'N/A'] },
          email: '$referredDoctorEmail',
          phone: { $ifNull: ['$referredDoctorPhone', 'N/A'] },
          planType: { $ifNull: ['$finalPlanType', '-'] },
          status: '$status',
          referralAmount: '$finalReferralAmount',
          dateSent: '$createdAt',
          registeredAt: '$registeredAt',
          acceptedAt: '$acceptedAt'
        }
      }
    ]);

    res.json({
      success: true,
      referrals
    });

  } catch (error) {
    console.error('Error fetching referral list:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching referral list',
      error: error.message
    });
  }
};

/**
 * Process referral when a new doctor signs up with referral code
 */
export const processReferralSignup = async (referralCode, newDoctorId, newDoctorEmail, newDoctorName) => {
  try {
    if (!referralCode) {
      console.log('⚠️ No referral code provided');
      return null;
    }

    console.log('🔍 Processing referral signup:', { referralCode, newDoctorId, newDoctorEmail });

    const normalizedEmail = newDoctorEmail.toLowerCase().trim();

    // Find referral by code (not email), because invited doctor might use different email
    const referral = await Referral.findOne({
      referralCode: referralCode,
      status: 'Pending'
    });

    if (!referral) {
      console.log('⚠️ No matching pending referral found for code:', referralCode);
      return null;
    }

    // Update referral with actual registered doctor info
    referral.status = 'Registered';
    referral.referredDoctorId = newDoctorId;
    referral.referredDoctorName = newDoctorName;
    referral.referredDoctorEmail = normalizedEmail; // Update with actual email used
    referral.registeredAt = new Date();
    
    await referral.save();
    
    // Get referrer details for notification
    const referrer = await Admin.findById(referral.referrerId);
    if (referrer && referrer.email) {
      sendReferralRegisteredEmail(referrer.email, referrer.name, newDoctorName)
        .catch(err => console.error('Failed to send registration notification:', err));
    }
    
    console.log('✅ Referral marked as registered:', referral._id);
    return referral;

  } catch (error) {
    console.error('❌ Error processing referral signup:', error);
    return null;
  }
};

/**
 * Helper function to get referral reward amount
 */
const getReferralRewardAmount = (planType) => {
  switch (planType) {
    case 'Yearly Plan':
      return 50000; // ₹500 in paise
    case 'Monthly Plan':
      return 20000; // ₹200 in paise
    case 'Basic Plan':
    default:
      return 0;
  }
};

/**
 * Track referral when a subscription is purchased
 */
export const trackReferralSubscription = async (adminId, subscriptionId, planType) => {
  try {
    console.log('🔍 Checking for referral to update for admin:', adminId);

    // Step 1: Find if this admin has a "Registered" referral
    const referral = await Referral.findOne({
      referredDoctorId: adminId,
      status: 'Registered'
    });

    if (!referral) {
      console.log('⚠️ No registered referral found for this admin');
      return {
        success: false,
        message: 'No registered referral found',
        amount: 0,
        planType: null
      };
    }

    console.log('✅ Found registered referral:', referral._id);

    // Step 2: Find their active subscription
    const subscription = await Subscription.findOne({
      adminId: adminId,
      status: 'active'
    }).sort({ createdAt: -1 });

    if (!subscription) {
      console.log('⚠️ No active subscription found');
      return {
        success: false,
        message: 'No active subscription found',
        amount: 0,
        planType: null
      };
    }

    console.log('✅ Found subscription:', {
      id: subscription._id,
      planType: subscription.planType,
      amount: subscription.amount
    });

    // Step 3: Verify that referredDoctorId equals subscription adminId
    if (referral.referredDoctorId.toString() !== subscription.adminId.toString()) {
      console.log('⚠️ Referral doctor ID does not match subscription admin ID');
      return {
        success: false,
        message: 'Referral doctor ID and subscription admin ID do not match',
        amount: 0,
        planType: null
      };
    }

    // Step 4: Calculate reward based on plan
    const rewardAmount = getReferralRewardAmount(subscription.planType);

    console.log('💰 Calculated reward:', rewardAmount, 'paise');

    if (rewardAmount === 0) {
      console.log('⚠️ No reward for Basic Plan');
      return {
        success: false,
        message: 'No reward for Basic Plan',
        amount: 0,
        planType: subscription.planType
      };
    }

    // Step 5: Update the referral
    referral.status = 'Accepted';
    referral.subscriptionId = subscription._id;
    referral.planType = subscription.planType;
    referral.referralAmount = rewardAmount;
    referral.acceptedAt = new Date();

    await referral.save();

    console.log('✅ Referral updated successfully:', {
      referralId: referral._id,
      status: referral.status,
      amount: referral.referralAmount,
      planType: referral.planType
    });

    // Step 6: Verify it was saved
    const verified = await Referral.findById(referral._id);
    console.log('🔍 Verification:', {
      status: verified.status,
      amount: verified.referralAmount,
      planType: verified.planType,
      subscriptionId: verified.subscriptionId
    });

    // Step 7: Notify referrer
    try {
      const referrer = await Admin.findById(referral.referrerId).select('name email');
      if (referrer && referrer.email) {
        await sendReferralAcceptedEmail({
          to: referrer.email,
          name: referrer.name,
          rewardAmount: (rewardAmount / 100).toFixed(2),
          planType: subscription.planType,
          referredDoctorName: referral.referredDoctorName
        });
        console.log('📧 Notification email sent to referrer');
      }
    } catch (emailError) {
      console.error('⚠️ Email failed but referral updated:', emailError.message);
    }

    // Step 8: Return the amount and plan
    return {
      success: true,
      message: 'Referral updated successfully',
      amount: rewardAmount,
      planType: subscription.planType,
      referralId: verified._id,
      subscriptionId: subscription._id,
      amountInRupees: (rewardAmount / 100).toFixed(2)
    };

  } catch (error) {
    console.error('❌ Error updating referral:', error);
    return {
      success: false,
      message: error.message,
      amount: 0,
      planType: null
    };
  }
};