//signup page
import React, { useState,useEffect } from "react";
import { Heart, User, GraduationCap, Mail, Lock, Eye, EyeOff, AlertCircle,Phone,Globe } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from '../assets/icons/dentoji_image.png'
import teeth from '../assets/icons/teeth.png'
//import teeth_1 from '../assets/icons/teeth_1.jpg'

const EnhancedSignupPage = () => {

  const [isEmailVerified, setIsEmailVerified] = useState(false);
const [showOTPField, setShowOTPField] = useState(false);
 const location = useLocation();
  const [referralCode, setReferralCode] = useState("");
  const [hasReferralCode, setHasReferralCode] = useState(false);
const [otpValue, setOtpValue] = useState("");
const [isOTPSending, setIsOTPSending] = useState(false);
const [isOTPVerifying, setIsOTPVerifying] = useState(false);
const [otpMessage, setOtpMessage] = useState("");
const [maskedEmail, setMaskedEmail] = useState("");
const [canResendOTP, setCanResendOTP] = useState(true);
const [resendCountdown, setResendCountdown] = useState(0);
  const [showPwd1, setShowPwd1] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    qualification: "",
    email: "",
    phone: "",
    country: "",
    password: "",
    confirmPassword: "",
     otp: "",
  });

    // ✅ ADD THIS ENTIRE useEffect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    
    if (refCode) {
     // console.log('🎁 Referral code detected:', refCode);
      setReferralCode(refCode);
      setHasReferralCode(true);
      showToast(`Referral code applied: ${refCode}`, 'success');
    }
  }, [location.search]);

  // Handle input with real-time validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });


    // Handle OTP field
if (name === "otp") {
  // Only allow numbers and limit to 6 digits
  const numericValue = value.replace(/\D/g, '').slice(0, 6);
  setFormData({ ...formData, [name]: numericValue });
  return;
}


    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Optionally validate the changed field immediately
    validateField(name, value);
  };

  // Handle email verification
const handleEmailVerification = async () => {
  if (!formData.email.trim()) {
    showToast("Please enter your email address first", "error");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email.trim())) {
    showToast("Please enter a valid email address", "error");
    return;
  }

  setIsOTPSending(true);

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: formData.email.trim() }),
    });

    const data = await response.json();

    if (response.ok) {
      setShowOTPField(true);
      setMaskedEmail(data.maskedEmail);
      setOtpMessage(`An OTP has been sent to ${data.maskedEmail}`);
      showToast("OTP sent successfully!", "success");
      
      // Start countdown for resend
      setCanResendOTP(false);
      setResendCountdown(60);
      const countdownInterval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            setCanResendOTP(true);
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      showToast(data.message || "Failed to send OTP", "error");
    }
  } catch (error) {
   // console.error("Send OTP error:", error);
    showToast("Network error. Please try again.", "error");
  } finally {
    setIsOTPSending(false);
  }
};

// Handle OTP verification
const handleOTPVerification = async () => {
  if (!formData.otp.trim()) {
    showToast("Please enter the OTP", "error");
    return;
  }

  if (formData.otp.trim().length !== 6) {
    showToast("OTP must be 6 digits", "error");
    return;
  }

  setIsOTPVerifying(true);

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        email: formData.email.trim(), 
        otp: formData.otp.trim() 
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setIsEmailVerified(true);
      setOtpMessage("Email verified successfully!");
      showToast("Email verified successfully!", "success");
    } else {
      showToast(data.message || "Invalid OTP", "error");
    }
  } catch (error) {
   // console.error("Verify OTP error:", error);
    showToast("Network error. Please try again.", "error");
  } finally {
    setIsOTPVerifying(false);
  }
};

  // Validate a single field
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    if (name === "name") {
      if (!value.trim()) {
        newErrors.name = "Full name is required";
      } else if (value.trim().length < 2) {
        newErrors.name = "Name must be at least 2 characters long";
      } else {
        delete newErrors.name;
      }
    }

    if (name === "email") {
      if (!value.trim()) {
        newErrors.email = "Email address is required";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          newErrors.email = "Please enter a valid email address";
        } else {
          delete newErrors.email;
        }
      }
    }

    if (name === "password") {
      if (!value) {
        newErrors.password = "Password is required";
      } else if (value.length < 6) {
        newErrors.password = "Password must be at least 6 characters long";
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        newErrors.password =
          "Password should contain at least one uppercase letter, one lowercase letter, and one number";
      } else {
        delete newErrors.password;
      }
    }

    if (name === "confirmPassword") {
      if (!value) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (value !== formData.password) {
        newErrors.confirmPassword = "Passwords do not match";
      } else {
        delete newErrors.confirmPassword;
      }
    }

    if (name === "qualification") {
      if (!value.trim()) {
        newErrors.qualification = "Qualification is recommended for your profile";
      } else {
        delete newErrors.qualification;
      }
    }

    setErrors(newErrors);
  };

  // Comprehensive form validation before submission
  const validateForm = () => {
    const newErrors = {};

    if (!isEmailVerified) {
  newErrors.email = "Please verify your email address first";
}

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password should contain at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.qualification.trim()) {
      newErrors.qualification = "Qualification is recommended for your profile";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enhanced toast notification function
  const showToast = (message, type = "info") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 max-w-sm shadow-lg transform transition-all duration-300 ${
      type === "error"
        ? "bg-red-500"
        : type === "success"
        ? "bg-green-500"
        : type === "warning"
        ? "bg-yellow-500"
        : "bg-blue-500"
    }`;

    const icon =
      type === "error" ? "❌" : type === "success" ? "✅" : type === "warning" ? "⚠️" : "ℹ️";

    toast.innerHTML = `
      <div class="flex items-center space-x-2">
        <span>${icon}</span>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => (toast.style.transform = "translateX(0)"), 100);

    setTimeout(() => {
      toast.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 4000);
  };

/* const validateCapitalization = () => {
  const newErrors = {};
  
  // Check if name starts with capital letter
  if (formData.name && formData.name.trim() && !/^[A-Z]/.test(formData.name.trim())) {
    newErrors.name = "First letter must be capital";
  }
  
  // Check if qualification starts with capital letter (only if field has value)
  if (formData.qualification && formData.qualification.trim() && !/^[A-Z]/.test(formData.qualification.trim())) {
    newErrors.qualification = "First letter must be capital";
  }
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(prev => ({ ...prev, ...newErrors }));
    return false;
  }
  
  return true;
}; */
  // Enhanced submit handler
  const handleSubmitWithPricingFlow = async (e) => {
    if (e) e.preventDefault();
     
          setErrors({});

    if (isLoading) return;
   

   // console.log("Starting signup process with pricing flow...");

    if (!validateForm()) {
      showToast("Please fix the errors in the form", "error");
      return;
    }

    setIsLoading(true);

    try {
      const requestData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        qualification: formData.qualification.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        country: formData.country.trim() || undefined,
        referralCode: referralCode.trim() || undefined,
      };

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();

      if (res.ok) {
        //console.log("Signup successful:", data);

        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        const adminData = {
          id: data.admin.id,
          name: data.admin.name,
          email: data.admin.email,
          role: data.admin.role,
          qualification: data.admin.qualification || "",
          phone: data.admin.phone || "",
          isNewSignup: data.isNewSignup,
          requiresPricing: data.requiresPricing,
        };

        localStorage.setItem("signupData", JSON.stringify(adminData));

       // ✅ REPLACE THE showToast LINE WITH THIS:
  if (referralCode) {
    showToast("🎉 Account created with referral! Complete payment for rewards.", "success");
  } else {
    showToast("Account created successfully! Choose your plan to get started.", "success");
  }

        setFormData({
          name: "",
          qualification: "",
          email: "",
          phone: "",
          country: "",
          password: "",
          confirmPassword: "",
        });
        setErrors({});

        setTimeout(() => {
          navigate("/pricing", {
            state: {
              newSignup: true,
              adminData: adminData,
              message: "Welcome! Please choose your subscription plan to continue.",
            },
          });
        }, 1500);
      } else {
      //  console.error("Signup failed:", data);

        if (res.status === 400) {
          if (data.message?.includes("Email already exists")) {
            setErrors({ email: "An account with this email already exists" });
            showToast("An account with this email already exists. Please try logging in.", "error");
          } else {
            showToast(data.message || "Please check your information and try again.", "error");
          }
        } else if (res.status === 500) {
          showToast("Server error. Please try again later or contact support.", "error");
        } else {
          showToast(data.message || "Signup failed. Please try again.", "error");
        }
      }
    } catch (error) {
     // console.error("Network error:", error);
      showToast("Network error. Please check your connection and try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Check form validity without triggering state updates
  const isFormValid = () => {
    return (
      formData.name.trim() &&
      formData.email.trim() &&
      isEmailVerified &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      agreedToTerms &&
      Object.keys(errors).length === 0
    );
  };


  // SignUp.jsx
  return (
  <div
    className="min-h-screen bg-[#ECF3FF] flex items-center justify-center p-2 sm:p-4 relative"
    style={{
      backgroundImage: `url(${teeth})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat'
    }}
  >
    {/* Background overlay */}
    <div className="absolute inset-0 bg-white opacity-75 z-0"></div>
   
    <div className="relative flex flex-col lg:flex-row w-full max-w-7xl p-2 sm:p-4 lg:p-6 gap-4 lg:gap-0">
      {/* Left side - Welcome section */}
      <div className="hidden lg:block lg:w-[60%] p-8 pl-0 text-white">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-8"></div>
        </div>
        
        {/* Updated Welcome Section */}
        <div className="mt-12 mb-10 ml-auto mr-32 max-w-md">
          <h2 className="text-5xl font-bold mb-1 text-gray-900">Welcome to</h2>
          <img 
            src={logo} 
            alt="Dentoji Logo" 
            className="w-[300px] h-[100px] object-contain select-none" 
            style={{ imageRendering: '-webkit-optimize-contrast' }}
            loading="eager"
          />
          
          <h2 className="text-xl text-gray-500 font-bold mb-6 sm:mt-4 sm:ml-1">Patient Management System</h2>

          {/* Feature list */}
          <div className="mt-8 ml-1 space-y-3">
  {[
    'Keep patient records organized',
    'Access to Interactive tooth chart',
    'Gain insights into patient data',
    'Manage appointments with patients',
    'Manage lab records',
  ].map((feature, index) => (
    <div key={index} className="flex items-center gap-3">
      <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center relative top-[1px]">
        <svg
          className="w-3.3 h-3.5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <p className="text-[16px] text-gray-600 font-medium flex items-center leading-none">
        {feature}
      </p>
    </div>
  ))}
</div>
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="w-full lg:w-[40%] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 flex flex-col lg:ml-60 max-h-[90vh]">
        {/* Mobile logo - only visible on mobile */}
        <div className="lg:hidden text-center mb-4">
          <img src={logo} alt="" className="w-48 sm:w-56 mx-auto" />
        </div>

        <div className="text-center mb-3 sm:mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-500 text-xs sm:text-sm">Set up your dental practice dashboard in minutes</p>
        </div>

<form onSubmit={handleSubmitWithPricingFlow} className="space-y-1.5 flex-1 flex flex-col">
  {/* START: SCROLLABLE AREA */}
  <div className="overflow-y-auto max-h-[calc(90vh-280px)] sm:max-h-[calc(90vh-300px)] lg:max-h-[calc(90vh-360px)] pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 space-y-1.5">
 
    {/* Full Name */}
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        Full Name <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
          <User className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          required
          disabled={isLoading}
          className={`w-full rounded-xl bg-gray-50 border-2 pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 disabled:opacity-50 ${
            errors.name ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
          }`}
        />
      </div>
      {errors.name && (
        <div className="flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
          <p className="text-xs text-red-600">{errors.name}</p>
        </div>
      )}
    </div>

    {/* Qualification */}
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Qualification</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
          <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <input
          type="text"
          name="qualification"
          value={formData.qualification}
          onChange={handleChange}
          placeholder="e.g., BDS, MDS, DDS"
          disabled={isLoading}
          className={`w-full rounded-xl bg-gray-50 border-2 pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 disabled:opacity-50 ${
            errors.qualification ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
          }`}
        />
      </div>
      {errors.qualification && (
        <div className="flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
          <p className="text-xs text-red-600">{errors.qualification}</p>
        </div>
      )}
    </div>

    {/* Phone Number */}
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        Phone Number
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
          <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
          disabled={isLoading}
          className={`w-full rounded-xl bg-gray-50 border-2 pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 disabled:opacity-50 ${
            errors.phone ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
          }`}
        />
      </div>
      {errors.phone && (
        <div className="flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
          <p className="text-xs text-red-600">{errors.phone}</p>
        </div>
      )}
    </div>

    {/* Country */}
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        Country
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
          <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <select
          name="country"
          value={formData.country}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full rounded-xl bg-gray-50 border-2 pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-xs sm:text-sm 
            focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 disabled:opacity-50 
            ${errors.country ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
        >
          <option value="">Select Country</option>
          <option value="India">India</option>
          <option value="United States">United States</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Canada">Canada</option>
          <option value="Australia">Australia</option>
          <option value="UAE">UAE</option>
          <option value="Saudi Arabia">Saudi Arabia</option>
          <option value="Germany">Germany</option>
          <option value="Singapore">Singapore</option>
          <option value="South Africa">South Africa</option>
        </select>
      </div>
      {errors.country && (
        <div className="flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
          <p className="text-xs text-red-600">{errors.country}</p>
        </div>
      )}
    </div>

    {hasReferralCode ? (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🎁</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-green-900 mb-1">
              Referral Code Applied! ✓
            </p>
            <p className="text-xs text-green-700 mb-2">
              Complete your subscription to receive special rewards
            </p>
            <div className="bg-white rounded-lg px-3 py-2 border-2 border-green-300">
              <p className="text-xs text-gray-600 mb-0.5">Your Code:</p>
              <p className="font-mono font-bold text-green-700 text-sm">{referralCode}</p>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
          Referral Code <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
            🎫
          </span>
          <input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            placeholder="Enter referral code"
            disabled={isLoading}
            className="w-full rounded-xl bg-gray-50 border-2 pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 disabled:opacity-50 border-gray-200 hover:border-gray-300 font-mono uppercase"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          💡 Get rewards when you sign up with a referral code
        </p>
      </div>
    )}



    {/* Email */}
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        Email Address <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
          <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email address"
          required
          disabled={isLoading || isEmailVerified}
          className={`w-full rounded-xl bg-gray-50 border-2 pl-9 sm:pl-10 pr-16 sm:pr-24 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 disabled:opacity-50 ${
            errors.email ? "border-red-300 bg-red-50" :
            isEmailVerified ? "border-green-300 bg-green-50" :
            "border-gray-200 hover:border-gray-300"
          }`}
        />
        {!isEmailVerified ? (
          <button
            type="button"
            onClick={handleEmailVerification}
            disabled={isOTPSending || !formData.email.trim()}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-blue-600 text-xs sm:text-sm font-medium hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer underline z-10"
          >
            {isOTPSending ? "Sending..." : "Verify"}
          </button>
        ) : (
          <span className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-green-500 cursor-pointer z-10">
            ✓
          </span>
        )}
      </div>
      {errors.email && (
        <div className="flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
          <p className="text-xs text-red-600">{errors.email}</p>
        </div>
      )}
     
      {/* OTP Field */}
      {showOTPField && (
        <div className="mt-3 animate-in slide-in-from-top-2 duration-300">
          {otpMessage && (
            <p className="text-xs sm:text-sm text-gray-600 mb-2">{otpMessage}</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              disabled={isOTPVerifying || isEmailVerified}
              className={`flex-1 rounded-xl bg-gray-50 border-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 disabled:opacity-50 ${
                isEmailVerified ? "border-green-300 bg-green-50" : "border-gray-200"
              }`}
            />
            {!isEmailVerified && (
              <button
                type="button"
                onClick={handleOTPVerification}
                disabled={isOTPVerifying || formData.otp.length !== 6}
                className="bg-green-500 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-medium hover:bg-green-600 disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                {isOTPVerifying ? "Verifying..." : "Verify OTP"}
              </button>
            )}
          </div>
          {!isEmailVerified && (
            <div className="flex justify-between items-center mt-2">
              <button
                type="button"
                onClick={handleEmailVerification}
                disabled={!canResendOTP || isOTPSending}
                className="text-xs text-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {canResendOTP ? "Resend OTP" : `Resend in ${resendCountdown}s`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>

    {/* Password */}
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        Password <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer z-10">
          <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <input
          type={showPwd1 ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a strong password"
          required
          disabled={isLoading}
          className={`w-full rounded-xl bg-gray-50 border-2 pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 disabled:opacity-50 ${
            errors.password ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPwd1(!showPwd1)}
          disabled={isLoading}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer z-10"
        >
          {showPwd1 ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
      </div>
      {errors.password && (
        <div className="flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
          <p className="text-xs text-red-600">{errors.password}</p>
        </div>
      )}
    </div>

    {/* Confirm Password */}
    <div>
      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
        Confirm Password <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer z-10">
          <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
        </span>
        <input
          type={showPwd2 ? "text" : "password"}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          required
          disabled={isLoading}
          className={`w-full rounded-xl bg-gray-50 border-2 pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 disabled:opacity-50 ${
            errors.confirmPassword ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPwd2(!showPwd2)}
          disabled={isLoading}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer z-10"
        >
          {showPwd2 ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>
      </div>
      {errors.confirmPassword && (
        <div className="flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
          <p className="text-xs text-red-600">{errors.confirmPassword}</p>
        </div>
      )}
    </div>

    {/* Terms of Service Checkbox */}
    <div className="flex items-start gap-2 pt-2 sm:pt-3  sm:mt-3">
      <input
        type="checkbox"
        id="termsCheckbox"
        checked={agreedToTerms}
        onChange={(e) => setAgreedToTerms(e.target.checked)}
        disabled={isLoading}
        className="mt-0.5 sm:mt-1 w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer disabled:opacity-50"
      />
      <label htmlFor="termsCheckbox" className="text-xs sm:text-sm text-gray-600 select-none">
        I agree to the{' '}
        <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline font-medium" onClick={(e) => { e.preventDefault(); window.open('/terms-of-service', '_blank', 'noopener,noreferrer'); }}>
          Terms of Service
        </a>
        {' '}and{' '}
        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline font-medium" onClick={(e) => { e.preventDefault(); window.open('/privacy-policy', '_blank', 'noopener,noreferrer'); }}>
          Privacy Policy
        </a>
      </label>
    </div>

  </div>
  {/* END: SCROLLABLE AREA */}

  {/* Submit Button - FIXED */}
  <div className="flex-shrink-0 mt-3 sm:mt-4">
    <button
      type="submit"
      disabled={isLoading || !isFormValid()}
      className="w-full bg-[#155DFC] text-white rounded-xl py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none cursor-pointer"
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-white sm:mr-2 cursor-pointer"></div>
          Creating Account...
        </>
      ) : (
        "Create Account & Choose Plan"
      )}
    </button>
  </div>
</form>

        {/* Login Link - FIXED */}
        <div className="mt-4 sm:mt-6 text-center flex-shrink-0">
          <p className="text-gray-600 text-xs sm:text-sm">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              disabled={isLoading}
              className="text-[#155DFC] font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
);

};

export default EnhancedSignupPage;