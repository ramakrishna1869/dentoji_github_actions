// models/Subscription.js - UPDATED WITHOUT FREE TRIAL
import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
        index: true
    },
    planType: {
        type: String,
        required: true,
        enum: ['Basic Plan', 'Monthly Plan', 'Yearly Plan']
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'cancelled', 'expired', 'pending', 'replaced'],
        default: 'pending'
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    // Payment fields - required for all plans
    paymentId: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    paymentDetails: {
        payment_method: {
            type: String,
            required: true
        },
        payment_status: {
            type: String,
            default: 'pending'
        },
        razorpay_payment_id: String,
        razorpay_order_id: String,
        razorpay_signature: String,
        created_at: Number,
        verified_at: Date
    },
    features: {
        maxPatients: {
            type: Number,
            default: function() {
                const planFeatures = {
                    'Basic Plan': 4,
                    'Monthly Plan': -1, // Unlimited
                    'Yearly Plan': -1   // Unlimited
                };
                return planFeatures[this.planType];
            }
        },
        hasAdvancedReporting: {
            type: Boolean,
            default: function() {
                return ['Monthly Plan', 'Yearly Plan'].includes(this.planType);
            }
        },
        hasPrioritySupport: {
            type: Boolean,
            default: function() {
                return ['Monthly Plan', 'Yearly Plan'].includes(this.planType);
            }
        },
        hasApiAccess: {
            type: Boolean,
            default: function() {
                return this.planType === 'Yearly Plan';
            }
        },
        hasWhiteLabel: {
            type: Boolean,
            default: function() {
                return this.planType === 'Yearly Plan';
            }
        }
    },
    autoRenew: {
        type: Boolean,
        default: false
    },
    // Cancellation details
    cancelledAt: Date,
    cancellationReason: String,
    
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

subscriptionSchema.methods.isActive = function() {
    const now = new Date();
    return this.status === 'active' && this.endDate > now;
};

// Indexes for performance
subscriptionSchema.index({ adminId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ planType: 1 });

// Instance methods
subscriptionSchema.methods.getDaysRemaining = function() {
    const now = new Date();
    if (this.endDate <= now) return 0;
    const diff = this.endDate - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

subscriptionSchema.methods.isExpiringSoon = function() {
    return this.getDaysRemaining() <= 3 && this.getDaysRemaining() > 0;
};

subscriptionSchema.methods.isExpired = function() {
    return this.endDate <= new Date();
};

// Static methods
subscriptionSchema.statics.getPlanFeatures = function(planType) {
    const plans = {
        'Basic Plan': {
            maxPatients: 250,
            hasAdvancedReporting: false,
            hasPrioritySupport: false,
            hasApiAccess: false,
            hasWhiteLabel: false,
            duration: 30,
            amount: 99900 // ₹999 in paise
        },
        'Monthly Plan': {
            maxPatients: -1, // Unlimited
            hasAdvancedReporting: true,
            hasPrioritySupport: true,
            hasApiAccess: false,
            hasWhiteLabel: false,
            duration: 30,
            amount: 175000 // ₹1750 in paise
        },
        'Yearly Plan': {
            maxPatients: -1, // Unlimited
            hasAdvancedReporting: true,
            hasPrioritySupport: true,
            hasApiAccess: true,
            hasWhiteLabel: true,
            duration: 365,
            amount: 1450000 // ₹14500 in paise
        }
    };
    return plans[planType] || null;
};

subscriptionSchema.statics.getPlanAmount = function(planType) {
    const features = this.getPlanFeatures(planType);
    return features ? features.amount : 0;
};

// Pre-save middleware
subscriptionSchema.pre('save', function(next) {
    if (this.isNew) {
        // Set features based on plan type if not already set
        const planFeatures = this.constructor.getPlanFeatures(this.planType);
        if (planFeatures && !this.features.maxPatients) {
            this.features = {
                maxPatients: planFeatures.maxPatients,
                hasAdvancedReporting: planFeatures.hasAdvancedReporting,
                hasPrioritySupport: planFeatures.hasPrioritySupport,
                hasApiAccess: planFeatures.hasApiAccess,
                hasWhiteLabel: planFeatures.hasWhiteLabel
            };
        }
    }
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('Subscription', subscriptionSchema);