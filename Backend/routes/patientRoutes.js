
//patientRoutes.js
import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientById,
  getPatientStats,
  getAllAppointments,
  getAppointmentStats,
  createAppointment,
  updateAppointment,
  
  deleteAppointment,
  generatePatientId,
  addCustomFieldToAllPatients,
  getDentalIssuesStats, // Add this import
} from '../controllers/patientController.js';
//import { verifyToken } from '../middleware/authMiddleware.js';
import { 
  createOrder, 
  verifyPayment, 
  
  getPaymentHistory, 
  getCurrentPlan, 
  cancelSubscription, 
  handleWebhook 
} from '../controllers/paymentController.js';
import { 
  requireActiveSubscription, 
  checkPatientLimit,
  getSubscriptionFeatures 
} from '../middleware/subscriptionMiddleware.js';

import { 
  verifyToken, 
  verifyTokenWithSubscription,
  authorizeRoles,
  authenticateToken  // Import the alias for consistency
} from '../middleware/authMiddleware.js';

// Import Subscription model for admin routes
import Subscription from '../models/Subscription.js'; // Add this import


dotenv.config();

const router = express.Router();

router.get('/stats', verifyToken, authorizeRoles(['Admin', 'Receptionist']), getPatientStats);


// ✅ CORRECT ORDER - Status route FIRST
// router.patch('/:patientId/status', verifyToken, authorizeRoles(['Admin', 'Receptionist']), async (req, res) => {
//   try {
//     const { patientId } = req.params;
//     const { status } = req.body;
    
//     // Validate status
//     // if (!status || !['pending', 'completed'].includes(status)) {
//     //   return res.status(400).json({ 
//     //     success: false,
//     //     message: 'Invalid status. Must be "pending" or "completed"' 
//     //   });
//     // }
    
//     // Import Patient model
//     const { default: Patient } = await import('../models/Patient.js');
    
//     // Update patient
//     const patient = await Patient.findByIdAndUpdate(
//       patientId,
//       { status, updatedAt: new Date() },
//       { new: true, runValidators: true }
//     );
    
//     if (!patient) {
//       return res.status(404).json({ 
//         success: false,
//         message: 'Patient not found' 
//       });
//     }
    
//     res.json({
//       success: true,
//       message: 'Status updated successfully',
//       patient
//     });
//   } catch (error) {
//     console.error('❌ Status update error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Failed to update status',
//       error: error.message 
//     });
//   }
// });

/* Other patient routes below...
router.get('/:hospitalId/:patientId', verifyToken, authorizeRoles(['Admin', 'Receptionist']), getPatientById);
router.put('/:hospitalId/:patientId', verifyToken, authorizeRoles(['Admin', 'Receptionist']), updatePatient);
router.delete('/:hospitalId/:patientId', verifyToken, authorizeRoles(['Admin', 'Receptionist']), deletePatient);*/

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});



router.get('/dental-issues/stats', verifyToken, authorizeRoles(['Admin', 'Receptionist']), getDentalIssuesStats);

// Appointment routes - MUST be before generic patient routes
router.get('/appointments', verifyToken, authorizeRoles(['Admin', 'Receptionist']), getAllAppointments);
router.get('/appointments/stats', verifyToken, authorizeRoles(['Admin', 'Receptionist']), getAppointmentStats);

// Hospital-specific routes (more specific routes first)
router.get('/:hospitalId/generate-patient-id', verifyToken, authorizeRoles(['Admin', 'Receptionist']), generatePatientId);
router.post('/:hospitalId/add-custom-field', verifyToken, authorizeRoles(['Admin', 'Receptionist']), addCustomFieldToAllPatients);

// Patient CRUD routes
router.get('/', verifyToken, authorizeRoles(['Admin', 'Receptionist']), getPatients);
router.post('/:hospitalId',
  verifyToken,
  authorizeRoles(['Admin', 'Receptionist']),
  requireActiveSubscription,
  checkPatientLimit,
  createPatient
);

// Appointment routes for specific patients
router.post('/:hospitalId/:patientId/appointments', verifyToken, authorizeRoles(['Admin', 'Receptionist']), createAppointment);
router.put('/:hospitalId/:patientId/appointments/:appointmentId', verifyToken, authorizeRoles(['Admin', 'Receptionist']), updateAppointment);
router.delete('/:hospitalId/:patientId/appointments/:appointmentId', verifyToken, authorizeRoles(['Admin', 'Receptionist']), deleteAppointment);

// Individual patient routes - MUST be last among patient routes
router.get('/:hospitalId/:patientId', verifyToken, authorizeRoles(['Admin', 'Receptionist']), getPatientById);
router.put('/:hospitalId/:patientId', verifyToken, authorizeRoles(['Admin', 'Receptionist']), updatePatient);
router.delete('/:hospitalId/:patientId', verifyToken, authorizeRoles(['Admin', 'Receptionist']), deletePatient);



router.post('/razorpay/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, planType } = req.body;

    // Validate required fields
    if (!amount || !receipt || !planType) {
      return res.status(400).json({
        success: false,
        message: 'Amount, receipt, and planType are required'
      });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt,
      payment_capture: 1, // Auto capture payment
      notes: {
        planType,
        createdAt: new Date().toISOString()
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// Verify Razorpay payment (public route)
router.post('/razorpay/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planType,
      userDetails
    } = req.body;

    // Generate signature for verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(body.toString())
      .digest('hex');

    // Verify signature
    if (expectedSignature === razorpay_signature) {
      // Payment is authentic
      
      // Here you can save payment details to your database
      // const paymentRecord = {
      //   orderId: razorpay_order_id,
      //   paymentId: razorpay_payment_id,
      //   signature: razorpay_signature,
      //   planType,
      //   userDetails,
      //   status: 'completed',
      //   createdAt: new Date()
      // };

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          planType,
          status: 'completed'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
});

// Get specific payment details from Razorpay
router.get('/razorpay/payment/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await razorpay.payments.fetch(paymentId);

    res.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        created_at: payment.created_at
      }
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
});

// ==============================================
// WEBHOOK ROUTE (no auth required)
// ==============================================
router.post('/webhook', handleWebhook);

// ==============================================
// AUTHENTICATED CONTROLLER-BASED ROUTES
// ==============================================

// Create order with authentication
router.post('/create-order', authenticateToken, createOrder);

// Verify payment with authentication
router.post('/verify-payment', authenticateToken, verifyPayment);

// FREE TRIAL ROUTE - Important for new users
//router.post('/create-free-trial', authenticateToken, createFreeTrial);

// Alternative route name for consistency
//router.post('/free-trial', authenticateToken, createFreeTrial);

// ==============================================
// PROTECTED SUBSCRIPTION MANAGEMENT ROUTES
// ==============================================

// Get payment history (requires active subscription)
router.get('/history', verifyTokenWithSubscription, authorizeRoles(['Admin']), getPaymentHistory);

// Get current plan details
router.get('/current-plan', verifyToken, authorizeRoles(['Admin']), getCurrentPlan);

// Alternative route for current plan
router.get('/plan', verifyToken, authorizeRoles(['Admin']), getCurrentPlan);

// Cancel subscription
router.post('/cancel-subscription', verifyTokenWithSubscription, authorizeRoles(['Admin']), cancelSubscription);

// Alternative route for cancellation
router.post('/cancel', verifyTokenWithSubscription, authorizeRoles(['Admin']), cancelSubscription);
router.get('/subscription-features', verifyToken, getSubscriptionFeatures);
// ==============================================
// ADMIN ONLY ROUTES
// ==============================================

// Get all subscriptions (admin only)
router.get('/all-subscriptions', verifyToken, authorizeRoles(['SuperAdmin']), async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('adminId', 'email name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      subscriptions
    });
  } catch (error) {
    console.error('Error fetching all subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions',
      error: error.message
    });
  }
});

// ==============================================
// SUBSCRIPTION STATUS ROUTES
// ==============================================

// Check if user needs subscription (public info route)
router.get('/subscription-status/:adminId', async (req, res) => {
  try {
    const { adminId } = req.params;
    
    const subscription = await Subscription.findOne({
      adminId,
      status: { $in: ['active', 'trial'] }
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.json({
        success: true,
        hasActiveSubscription: false,
        needsSubscription: true,
        message: 'No active subscription found'
      });
    }

    const isActive = subscription.isActive();
    const daysRemaining = subscription.getDaysRemaining();

    res.json({
      success: true,
      hasActiveSubscription: isActive,
      needsSubscription: !isActive,
      subscription: {
        planType: subscription.planType,
        status: subscription.status,
        endDate: subscription.endDate,
        daysRemaining,
        isExpiringSoon: subscription.isExpiringSoon(),
        isTrial: subscription.planType === 'trial'
      }
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check subscription status',
      error: error.message
    });
  }
});

// ==============================================
// TRIAL SPECIFIC ROUTES
// ==============================================

// Check trial eligibility
router.get('/trial-eligibility', authenticateToken, async (req, res) => {
  try {
    const existingSubscription = await Subscription.findOne({
      adminId: req.user.adminId
    });

    const isEligible = !existingSubscription;

    res.json({
      success: true,
      eligible: isEligible,
      message: isEligible 
        ? 'You are eligible for a free trial'
        : 'You have already used your free trial or have an existing subscription'
    });
  } catch (error) {
    console.error('Error checking trial eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check trial eligibility',
      error: error.message
    });
  }
});

// Update patient status
// Update patient status
// router.patch('/:patientId/status', verifyToken, authorizeRoles(['Admin', 'Receptionist']), async (req, res) => {
//   try {
//     const { patientId } = req.params;
//     const { status } = req.body;
    
//     // Validate status value
//     if (!status || !['pending', 'completed'].includes(status)) {
//       return res.status(400).json({ 
//         success: false,
//         message: 'Invalid status. Must be either "pending" or "completed"' 
//       });
//     }
    
//     // Import Patient model at the top of the file if not already imported
//     const Patient = (await import('../models/Patient.js')).default;
    
//     const patient = await Patient.findByIdAndUpdate(
//       patientId,
//       { 
//         status,
//         updatedAt: new Date() // Add updatedAt timestamp
//       },
//       { 
//         new: true, 
//         runValidators: true 
//       }
//     );
    
//     if (!patient) {
//       return res.status(404).json({ 
//         success: false,
//         message: 'Patient not found' 
//       });
//     }
    
//     res.json({
//       success: true,
//       message: 'Status updated successfully',
//       patient: {
//         _id: patient._id,
//         patientId: patient.patientId,
//         name: `${patient.firstName} ${patient.lastName}`,
//         status: patient.status,
//         updatedAt: patient.updatedAt
//       }
//     });
//   } catch (error) {
//     console.error('Error updating patient status:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Failed to update status',
//       error: error.message 
//     });
//   }
// });
export default router;


