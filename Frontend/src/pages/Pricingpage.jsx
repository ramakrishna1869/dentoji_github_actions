import React, { useState, useEffect } from "react";
import {
  ArrowLeft, Check, Crown, Sparkles, Zap, Shield, Star,
  AlertCircle, User, CreditCard, Clock, Loader2, RefreshCw,
  Phone, Mail, Globe, Award, X
} from "lucide-react";

export default function EnhancedPricingComponent() {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [redirecting, setRedirecting] = useState(false);
  const [hasExistingHospital, setHasExistingHospital] = useState(false);
  const [isNewAdmin, setIsNewAdmin] = useState(true);
  const [userDetails, setUserDetails] = useState({
    id: "", name: "", email: "", phone: "", qualification: ""
  });

  // Environment
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
  const MAX_RETRIES = 3;

  // Toast Notification
  const showToast = (message, type = 'info', duration = 5000) => {
    const existingToasts = document.querySelectorAll('.custom-toast');
    existingToasts.forEach(toast => toast.remove());

    const toast = document.createElement('div');
    toast.className = `custom-toast fixed top-4 right-4 p-4 rounded-xl text-white z-[9999] max-w-sm shadow-2xl transform transition-all duration-300 backdrop-blur-sm ${
      type === 'error' ? 'bg-red-500/90' :
      type === 'success' ? 'bg-green-500/90' :
      type === 'warning' ? 'bg-yellow-500/90' : 'bg-blue-500/90'
    }`;

    const icons = { error: 'Error', success: 'Success', warning: 'Warning', info: 'Info' };
    toast.innerHTML = `
      <div class="flex items-start space-x-3">
        <span style="font-size: 16px; margin-top: 2px;">${icons[type]}</span>
        <div>
          <span style="font-size: 14px; line-height: 1.4; display: block;">${message}</span>
          <div class="w-full bg-white/20 rounded-full h-1 mt-3">
            <div class="bg-white rounded-full h-1 toast-progress" style="width: 100%; transition: width ${duration}ms linear;"></div>
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200 ml-2" style="font-size: 16px;">×</button>
      </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      const progressBar = toast.querySelector('.toast-progress');
      if (progressBar) progressBar.style.width = '0%';
    }, 100);

    setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px) scale(0.95)';
        setTimeout(() => document.body.contains(toast) && document.body.removeChild(toast), 300);
      }
    }, duration);
  };

  // Navigation
  const navigateAfterPayment = () => {
    setRedirecting(true);
    const target = hasExistingHospital ? '/dashboard' : '/hospitalform';
    const message = hasExistingHospital ? 'Redirecting to dashboard...' : 'Redirecting to hospital setup...';
    showToast(message, 'success', 2000);
    setTimeout(() => {
      try {
        window.location.href = target;
      } catch (err) {
        showToast('Navigation failed. Please go manually.', 'error');
        setRedirecting(false);
      }
    }, 1500);
  };

  // API Call with Retry
  const apiCall = async (url, options = {}, retries = 0) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (retries < MAX_RETRIES && (error.name === 'TypeError' || error.message.includes('fetch'))) {
        await new Promise(r => setTimeout(r, 1000 * (retries + 1)));
        return apiCall(url, options, retries + 1);
      }
      throw error;
    }
  };

  // Load User Data
  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const hospitalData = JSON.parse(localStorage.getItem('hospitalData') || '{}');
      const hasHospital = !!hospitalData._id || localStorage.getItem('hasExistingHospital') === 'true';
      setHasExistingHospital(hasHospital);
      setIsNewAdmin(!hasHospital);

      if (token) {
        try {
          const response = await apiCall(`${BACKEND_URL}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.admin) {
            const admin = response.admin;
            const freshUser = {
              id: admin.id || admin._id || '',
              name: admin.name || admin.fullName || '',
              email: admin.email || '',
              phone: admin.phone || admin.phoneNumber || admin.mobile || '',
              qualification: admin.qualification || admin.degree || ''
            };
            setUserDetails(freshUser);
            localStorage.setItem('adminData', JSON.stringify(admin));
            return;
          }
        } catch (e) {
          console.warn('Backend profile fetch failed, using localStorage');
        }
      }

      // Fallback
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      setUserDetails({
        id: adminData.id || adminData._id || '',
        name: adminData.name || adminData.fullName || '',
        email: adminData.email || '',
        phone: adminData.phone || adminData.phoneNumber || adminData.mobile || '',
        qualification: adminData.qualification || adminData.degree || ''
      });
    } catch (error) {
     // console.error('Load user error:', error);
      showToast('Failed to load profile', 'error');
    }
  };

  // Fetch Plans
  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiCall(`${BACKEND_URL}/api/payments/plans`);
      

      if (!data.success || !Array.isArray(data.plans)) {
        throw new Error('Invalid response from server');
      }

      const enhancedPlans = data.plans.map(plan => ({
        ...plan,
        planType: plan.planType || 'Basic Plan',
        title: plan.title || 'Untitled Plan',
        amount: plan.amount || 0,
        description: plan.description || '',
        features: Array.isArray(plan.features) ? plan.features : [],
        icon: plan.icon || 'Star',
        formattedAmount: plan.amount > 0 ? `₹${(plan.amount / 100).toLocaleString('en-IN')}` : 'Free',
        isPopular: plan.popular || plan.planType === 'Monthly Plan',
        badge: plan.badge || (plan.popular ? 'Most Popular' : ''),
        ctaText: plan.button || `Choose ${plan.title}`
      }));

      setPlans(enhancedPlans);
    } catch (error) {
      setError(error.message);
      showToast(`Plans failed: ${error.message}`, 'error');
      setPlans([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Subscription Status
  const checkSubscriptionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const data = await apiCall(`${BACKEND_URL}/api/payments/subscription-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (data.success) {
        setSubscriptionStatus(data.data);
        if (data.data?.hasActiveSubscription) {
          showToast(`Active: ${data.data.subscription.planType}`, 'info', 3000);
        }
      }
    } catch (error) {
     // console.error('Subscription check failed:', error);
    }
  };

  // Load Razorpay
  const loadRazorpay = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        setRazorpayLoaded(true);
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        if (window.Razorpay) {
          setRazorpayLoaded(true);
          resolve(true);
        } else {
          reject(new Error('Razorpay failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Script load failed'));
      document.head.appendChild(script);
    });
  };

  // Payment Handler
  const handleRazorpayPayment = async (plan) => {
    if (isProcessingPayment || !razorpayLoaded) return;

    if (subscriptionStatus?.hasActiveSubscription) {
      if (subscriptionStatus.subscription.planType === plan.planType) {
        showToast('Already on this plan', 'info');
        return;
      }
      const confirm = window.confirm(
        `Switch from ${subscriptionStatus.subscription.planType} to ${plan.planType}?`
      );
      if (!confirm) return;
    }

    setIsProcessingPayment(true);
    setSelectedPlan(plan.planType);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Login required');

      if (!userDetails.email || !userDetails.name || !userDetails.phone) {
        throw new Error('Complete your profile first');
      }

      const orderData = await apiCall(`${BACKEND_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ planType: plan.planType })
      });

      if (!orderData.success) throw new Error(orderData.message || 'Order failed');

      const options = {
        key: RAZORPAY_KEY,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Dentoji Practice Management',
        description: `${plan.title} - ${plan.description}`,
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            const verification = await apiCall(`${BACKEND_URL}/api/payments/verify-payment`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planType: plan.planType
              })
            });

            if (verification.success) {
              showToast(`Welcome to ${plan.title}!`, 'success');
              setTimeout(navigateAfterPayment, 2000);
            } else {
              throw new Error('Verification failed');
            }
          } catch (err) {
            showToast('Verification failed. Contact support.', 'warning');
            setIsProcessingPayment(false);
            setSelectedPlan(null);
          }
        },
        prefill: { name: userDetails.name, email: userDetails.email, contact: userDetails.phone },
        theme: { color: '#4264D0' },
        modal: { ondismiss: () => {
          showToast('Payment cancelled', 'info');
          setIsProcessingPayment(false);
          setSelectedPlan(null);
        }}
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      showToast(`Payment failed: ${error.message}`, 'error');
      setIsProcessingPayment(false);
      setSelectedPlan(null);
    }
  };

  // Retry
  const handleRetry = async () => {
    setRetryCount(c => c + 1);
    setError(null);
    await Promise.all([loadUserData(), fetchPlans(), checkSubscriptionStatus()]);
    if (!razorpayLoaded) await loadRazorpay().catch(() => {});
  };

  // Helper function to safely get feature name
 // const getFeatureName = (feature) => {
 //   if (typeof feature === 'string') return feature;
  //  if (feature && typeof feature === 'object') {
  //    return feature.name || feature.feature || 'Feature';
 //   }
 //   return 'Feature';
 // };
const getFeatureName = (feature) => {
  if (!feature) return "Feature";

  if (typeof feature === "string") return feature;

  if (typeof feature === "object") {
    if (typeof feature.name === "string") return feature.name;
    if (typeof feature.feature === "string") return feature.feature;

    return JSON.stringify(feature); // prevents React crash!
  }

  return "Feature";
};


  // Helper function to check if feature is allowed
  const isFeatureAllowed = (feature) => {
    if (typeof feature === 'string') return true;
    if (feature && typeof feature === 'object') {
      return feature.allowed !== false;
    }
    return true;
  };

  // Init
  useEffect(() => {
    const init = async () => {
      await loadUserData();
      setTimeout(async () => {
        await Promise.allSettled([
          fetchPlans(),
          checkSubscriptionStatus(),
          loadRazorpay().catch(() => showToast('Payment unavailable', 'warning', 3000))
        ]);
      }, 100);
    };
    init();
  }, []);

  useEffect(() => {
    if (!isLoading && plans.length > 0 && hasExistingHospital !== undefined) {
      fetchPlans();
    }
  }, [hasExistingHospital]);

  // Loading
  if (isLoading && retryCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm w-full mx-4 border border-gray-100">
          <Loader2 className="w-12 h-12 text-[#4264D0] mx-auto animate-spin mb-6" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Pricing</h3>
          <p className="text-gray-600">Setting up your plans...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error && plans.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md w-full border border-red-100">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Pricing</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={handleRetry} disabled={isLoading} className="bg-[#4264D0] hover:bg-[#3854BC] text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {isLoading ? 'Retrying...' : `Retry (${retryCount}/${MAX_RETRIES})`}
          </button>
        </div>
      </div>
    );
  }

  // Redirecting
  if (redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-md w-full mx-4 border border-green-100">
          <Loader2 className="w-12 h-12 text-green-600 mx-auto animate-spin mb-6" />
          <h3 className="text-xl font-bold text-green-800 mb-2">Success!</h3>
          <p className="text-green-600">
            {hasExistingHospital ? 'Dashboard loading...' : 'Setting up hospital...'}
          </p>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm w-full">
            <Loader2 className="w-12 h-12 text-[#4264D0] mx-auto animate-spin mb-6" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Processing Payment</h3>
            <p className="text-gray-600">Complete in popup window...</p>
          </div>
        </div>
      )}

      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-[#4264D0]/10 text-[#4264D0] px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" /> PRICING
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Simple, <span className="bg-gradient-to-r from-[#4264D0] to-[#6B73FF] bg-clip-text text-transparent">transparent pricing</span>
          </h1>
        </div>

        <div className="max-w-6xl mx-auto">
          {plans.length === 0 ? (
            <div className="bg-red-50/50 border border-red-200/50 rounded-2xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-800 mb-2">No Plans Available</h3>
              <button onClick={handleRetry} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg">
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {plans.map((plan, index) => {
                const isCurrent = subscriptionStatus?.hasActiveSubscription && subscriptionStatus.subscription.planType === plan.planType;
                const isDisabled = isProcessingPayment || isCurrent || !razorpayLoaded;

                const config = {
                  'Basic Plan': { gradient: 'from-[#4264D0]/10 to-blue-50', border: 'border-blue-200', button: 'bg-[#4264D0] hover:bg-[#3854BC]', badge: '' },
                  'Monthly Plan': { gradient: 'from-[#4264D0]/10 to-blue-50', border: 'border-[#4264D0]/30', button: 'bg-[#4264D0] hover:bg-[#3854BC]', badge: 'Most Popular' },
                  'Yearly Plan': { gradient: 'from-[#4264D0]/10 to-blue-50', border: 'border-[#4264D0]/30', button: 'bg-[#4264D0] hover:bg-[#3854BC]', badge: 'RECOMMENDED' },
                }[plan.planType] || config['Basic Plan'];

                return (
                  <div
                    key={index}
                    className={`relative rounded-3xl border-2 transition-all hover:scale-105 hover:shadow-2xl bg-gradient-to-br ${config.gradient} ${config.border} ${isCurrent ? 'ring-4 ring-green-300/60' : 'shadow-xl'} ${plan.isPopular ? 'ring-2 ring-[#4264D0]/20' : ''}`}
                  >
                    {plan.isPopular && !isCurrent && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#4264D0] to-[#6B73FF] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg animate-bounce">
                        {config.badge}
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute -top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-pulse">
                        <Check className="w-4 h-4 inline mr-1" /> Active
                      </div>
                    )}

                    <div className="p-8 flex flex-col h-full">
                      <div className="mb-6">
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">
                          {plan.planType.replace(' Plan', '')} Plan
                        </h3>
                        <p className="text-gray-600 text-lg">
                          {plan.planType === 'Yearly Plan' ? 'Best value' : 'Flexible billing'}
                        </p>
                      </div>

                      <div className="mb-8">
                        <div className="flex items-baseline gap-1 mb-2">
                          <span className="text-5xl font-bold text-gray-900">
                            {plan.planType === 'Yearly Plan' ? '₹14,500' : plan.formattedAmount}
                          </span>
                          <span className="text-gray-500 text-lg">
                            {plan.planType === 'Yearly Plan' ? '/year' : plan.planType === 'Monthly Plan' ? '/month' : '/30 days'}
                          </span>
                        </div>
                      </div>

                      {/* FIXED FEATURE RENDERING */}
                    {/* FIXED FEATURE RENDERING */}
                     {/* FIXED FEATURE RENDERING WITH KEYS */}
                      <div className="flex-1 mb-8">
                        <div className="space-y-3">
                          {(plan.features || [])
                            .filter(Boolean)
                            .slice(0, 9)
                            .map((feature, i) => {
                              const featureName = getFeatureName(feature);
                              const allowed = isFeatureAllowed(feature);
                              const featureId = typeof feature === 'object' && feature.id ? feature.id : `${plan.planType}-feature-${i}`;

                              return (
                                <div key={featureId} className="flex items-start gap-3 text-gray-700">
                                  {allowed ? (
                                    <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                  ) : (
                                    <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                  )}
                                  <span className="text-sm leading-relaxed">{featureName}</span>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      <div className="mt-auto">
                        <button
                          onClick={() => handleRazorpayPayment(plan)}
                          disabled={isDisabled}
                          className={`w-full text-white px-6 py-4 rounded-2xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${config.button} shadow-lg hover:shadow-xl relative overflow-hidden`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {isCurrent ? 'Current Plan' : isProcessingPayment && selectedPlan === plan.planType ? 'Processing...' : 'Choose Plan'}
                            {!(isCurrent || isProcessingPayment) && (
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                        <p className="text-xs text-gray-500 text-center mt-3">
                          {plan.planType === 'Yearly Plan' ? 'Best value!' : 'Secure • Cancel anytime'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      
      </div>
    </div>
  );
}
