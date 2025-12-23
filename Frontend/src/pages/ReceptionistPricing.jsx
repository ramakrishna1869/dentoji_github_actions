import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Check, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
 
const ReceptionistPricing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Get staff member data from navigation state
  const staffMemberData = location.state?.staffMemberData || null;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [receptionistCount, setReceptionistCount] = useState(0);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
 
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // ✅ Log staff member data on mount
  useEffect(() => {
    if (staffMemberData) {
     // console.log('📋 Staff member data received:', staffMemberData);
    } else {
     // console.log('⚠️ No staff member data - payment will redirect to staff page');
    }
  }, [staffMemberData]);
 
  useEffect(() => {
    loadRazorpay();
    fetchReceptionistCount();
  }, []);
 
  const loadRazorpay = () => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }
 
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => console.error('Failed to load Razorpay');
    document.head.appendChild(script);
  };
 
  const fetchReceptionistCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/receptionists/count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
    //  console.log('📊 Current receptionist count:', data.count);
      setReceptionistCount(data.count || 0);
    } catch (error) {
     // console.error('Error fetching count:', error);
    }
  };
 
  const handlePayment = async () => {
    if (!razorpayLoaded || isProcessing) return;
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      
      //console.log('🔄 Starting payment process...');
    //  console.log('📊 Current receptionist count:', receptionistCount);
      
      const orderResponse = await fetch(`${BACKEND_URL}/api/receptionist-payment/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receptionistCount: receptionistCount + 1 })
      });

      const orderData = await orderResponse.json();
      
     // console.log('📦 Order response:', orderData);
      
      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      const razorpayKey = orderData.order.key || import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!razorpayKey) {
        throw new Error('Razorpay key is missing. Please check configuration.');
      }

    //  console.log('🔑 Using Razorpay key:', razorpayKey);
    //  console.log('✅ Order created:', orderData.order.orderId);

      const options = {
        key: razorpayKey,
        amount: orderData.order.amount.toString(),
        currency: "INR",
        name: "Additional Receptionist Access",
        description: `Payment for receptionist #${receptionistCount + 1}`,
        order_id: orderData.order.razorpayOrderId,

        handler: async function (response) {
        //  console.log("💳 Payment success:", response);

          const verifyResponse = await fetch(`${BACKEND_URL}/api/receptionist-payment/verify-payment`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderData.order.orderId
            }),
          });

          const verifyData = await verifyResponse.json();
         // console.log("✅ Verification:", verifyData);

          if (verifyData.success) {
         //   console.log('✅ Payment verified successfully');
            
            // ✅ UPDATED: Navigate with staff data if available
            if (staffMemberData) {
           //   console.log('📋 Redirecting to signup with staff data:', staffMemberData);
              navigate('/receptionistsignup', {
                state: {
                  fromPayment: true,
                  fromStaffManagement: true,
                  staffMemberId: staffMemberData._id,
                  staffMemberData: {
                    name: staffMemberData.name,
                    email: staffMemberData.email,
                    role: 'Receptionist', // ✅ Always Receptionist
                    originalRole: staffMemberData.role, // ✅ Keep original role
                    department: staffMemberData.department || 'Reception',
                    phone: staffMemberData.phone || '',
                  },
                  permissions: ['patients', 'appointments', 'share']
                }
              });
            } else {
              // ✅ No staff data - redirect to staff page with success message
             // console.log('ℹ️ No staff data - redirecting to staff page');
              navigate('/staff', {
                state: {
                  message: 'Payment successful! You can now create more receptionist accounts.',
                  type: 'success',
                  refresh: true
                }
              });
            }
          } else {
            alert("Payment verification failed. Please contact support.");
            setIsProcessing(false);
          }
        },

        modal: {
          ondismiss: function() {
          //  console.log('❌ Payment cancelled by user');
            setIsProcessing(false);
          }
        },

        theme: { color: "#4F46E5" },
        payment_capture: 1,
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
     // console.error('❌ Payment error:', error);
      alert(`Payment failed: ${error.message}`);
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    navigate('/staff');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Back to Staff Management</span>
        </button>
      </div>
     
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="text-center pt-8 pb-4">
            <div className="w-20 h-20 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Add More Receptionist</h1>
            <p className="text-sm text-gray-500 px-6">
  2 free accounts used.<br />
  Each additional receptionist requires payment.
</p>
          </div>

 
          <div className="mx-6 mb-6 bg-gray-50 rounded-2xl p-6">
            <div className="text-center mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-1">Premium Access</h2>
              <p className="text-xs text-gray-500 mb-4">One-time payment for additional receptionist</p>
             
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">₹350</span>
                <span className="text-sm text-gray-500 ml-1">per receptionist</span>
              </div>
             
              <div className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full inline-block">
                All inclusive
              </div>
            </div>
 
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">What's Included:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Instant activation after payment</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Full access to receptionist features</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Patient management capabilities</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">No recurring charges</span>
                </div>
              </div>
            </div>
 
            <button
              onClick={handlePayment}
              disabled={!razorpayLoaded || isProcessing}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-6 rounded-xl font-medium text-sm transition-colors disabled:opacity-50  flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  {staffMemberData 
                    ? `Pay ₹350 & Create Account` 
                    : `Pay ₹350 & Add Receptionist`
                  }
                </>
              )}
            </button>

            {/* ✅ Additional info text */}
            <p className="text-xs text-gray-500 text-center mt-3">
              {staffMemberData 
                ? 'After payment, you\'ll set up the account credentials' 
                : 'Payment unlocks the ability to add more receptionists'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default ReceptionistPricing;