// models/ReceptionistPayment.js
import mongoose from 'mongoose';
 
const receptionistPaymentSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayOrderId: {
    type: String,
    required: true
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  amount: {
    type: Number,
    required: true,
    default: 35000 // ₹350 in paise
  },
  currency: {
    type: String,
    default: 'INR'
  },
  receptionistCount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'created', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: String,
  description: String,
  receipt: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  paidAt: Date
});
 
receptionistPaymentSchema.index({ adminId: 1, status: 1 });
 
export default mongoose.model('ReceptionistPayment', receptionistPaymentSchema);
 