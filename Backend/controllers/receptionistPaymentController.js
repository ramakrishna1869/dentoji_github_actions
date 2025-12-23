import Razorpay from 'razorpay';
import crypto from 'crypto';
import ReceptionistPayment from '../models/ReceptionistPayment.js';
import Receptionist from '../models/Receptionist.js';

// ✅ Check if environment variables are loaded
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
  console.error('❌ RAZORPAY_KEY_ID or RAZORPAY_SECRET is missing in environment variables');
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

export const createOrder = async (req, res) => {
  try {
    const { receptionistCount } = req.body;
    const adminId = req.user?.id;

    // ✅ Validate adminId
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // ✅ Validate receptionistCount
    if (!receptionistCount || receptionistCount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid receptionist count'
      });
    }

    const amount = 35000; // ₹350 in paise
    const receipt = `receipt_receptionist_${Date.now()}`;
    const orderId = `order_receptionist_${adminId}_${Date.now()}`;

    console.log('📦 Creating Razorpay order:', { amount, receipt, adminId });

    // ✅ Create Razorpay order with error handling
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amount,
        currency: 'INR',
        receipt: receipt
      });
    } catch (razorpayError) {
      console.error('❌ Razorpay API Error:', razorpayError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create Razorpay order',
        error: razorpayError.message || 'Razorpay API error'
      });
    }

    console.log('✅ Razorpay order created:', razorpayOrder.id);

    // Save payment record
    const payment = new ReceptionistPayment({
      adminId,
      orderId,
      razorpayOrderId: razorpayOrder.id,
      amount,
      receptionistCount,
      status: 'created',
      receipt,
      description: `Payment for additional receptionist #${receptionistCount}`
    });

    await payment.save();
    console.log('✅ Payment record saved:', orderId);

    res.status(200).json({
      success: true,
      order: {
        orderId,
        razorpayOrderId: razorpayOrder.id,
        amount,
        currency: 'INR',
        receipt,
        key: process.env.RAZORPAY_KEY_ID // ✅ Send key to frontend
      }
    });

  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    const adminId = req.user?.id;

    // ✅ Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data'
      });
    }

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    console.log('🔐 Verifying payment:', { razorpay_order_id, razorpay_payment_id, orderId });

    // ✅ Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      console.error('❌ Signature mismatch:', { generated_signature, razorpay_signature });
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed'
      });
    }

    console.log('✅ Signature verified successfully');

    // ✅ Update payment record - find by razorpayOrderId if orderId not provided
    const query = orderId 
      ? { orderId, adminId }
      : { razorpayOrderId: razorpay_order_id, adminId };

    const payment = await ReceptionistPayment.findOneAndUpdate(
      query,
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'paid',
        paidAt: new Date()
      },
      { new: true }
    );

    if (!payment) {
      console.error('❌ Payment record not found:', query);
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    console.log('✅ Payment verified and updated:', payment.orderId);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        orderId: payment.orderId,
        amount: payment.amount,
        status: payment.status,
        receptionistCount: payment.receptionistCount
      }
    });

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};
