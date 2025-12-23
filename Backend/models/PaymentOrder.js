// models/PaymentOrder.js
import mongoose from 'mongoose';

const paymentOrderSchema = new mongoose.Schema({
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
        sparse: true // Allows null values but enforces uniqueness when not null
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    planType: {
        type: String,
        required: true,
        enum: ['Basic Plan', 'Monthly Plan', 'Yearly Plan']
    },
    planDuration: {
        type: Number,
        required: true // Now required
    },
    planEndDate: {
        type: Date,
        required: true // Now required
    },
    receipt: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'created', 'paid', 'failed', 'cancelled', 'completed'], // Added 'pending' and 'created'
        default: 'pending'
    },
    // FIXED: Made these optional since they're only available after payment
    paymentId: {
        type: String,
        required: false // Changed from required to optional
    },
    signature: {
        type: String,
        required: false // Changed from required to optional
    },
    paymentDetails: {
        payment_method: String,
        payment_status: String,
        razorpay_payment_id: String,
        razorpay_order_id: String,
        razorpay_signature: String,
        created_at: Number,
        captured_at: Number,
        failed_at: Number,
        verified_at: Date,
        error_code: String,
        error_description: String
    },
    userDetails: {
        id: String,
        name: String,
        email: String,
        phone: String,
        qualification: String
    },
    // FIXED: Changed metadata to Mixed type to handle both objects and strings
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for better performance
paymentOrderSchema.index({ adminId: 1, status: 1 });
paymentOrderSchema.index({ razorpayOrderId: 1 });
paymentOrderSchema.index({ createdAt: -1 });

export default mongoose.model('PaymentOrder', paymentOrderSchema);