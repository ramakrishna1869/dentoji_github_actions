
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Lock, X, AlertTriangle, Shield, User, Settings } from 'lucide-react';
import API from './api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DotLottieReact } from '@lottiefiles/dotlottie-react'; // ✅ ADD THIS
import DentalX from './components/Dentojiwebsite/Dentalx1/Dentalx';
// ✅ ADD THIS - Import your animation (make sure file has no spaces in name)
import animationData from './assets/GladiatorTooth.json';

import { PermissionProvider, usePermissions } from './pages/PermissionContext';
import DentalSidebar from './components/DentalSidebar';
import AdminSidebar from './components/Host/AdminSidebar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import PatientManagement from './pages/PatientManagement';
import AddPatient from './pages/AddPatient';
import Appointments from './pages/Appointments';
import StaffManagement from './pages/StaffManagement';
import PatientDetailsPage from './pages/Patientdata';
import LabManagement from './pages/LabManagement';
import SettingsPage from './pages/Settings';
import Login from './pages/Login';
import Patentrecord from './pages/Patientrecord';
import DoctorConsultations from './pages/DoctorConsultations';
import HospitalForm from './pages/HospitalForm';
import FinancePage from './pages/FinancePage';
import Logout from './pages/Logout';
import ReceptionistSignup from './pages/ReceptionistSignup';
import DentalReferralScreen from './pages/DentalReferralScreen';
import ReceptionistTable from './pages/ReceptionistTable';
import PermissionManagement from './pages/PermissionManagement';

import SignupPage from './pages/SignUp';
import Profile from "./pages/DoctorProfile";
import PricingPage from './pages/PricingPage';
import ReceptionistPricing from './pages/ReceptionistPricing';
import TreatmentEncounters from './pages/TreatmentTable';
import MedicationTable from './pages/MedicationTable';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyCode from './pages/VerifyCode';
import BillingPage from './pages/BillingPage';

// Host Admin Pages
import FreeTrail from './pages/AdminPages/FreeTrail';
import AdminDashboard from './pages/AdminPages/Dashboard';
import Coupons from './pages/AdminPages/Coupons';
import AddNewCoupon from './pages/AdminPages/AddNewCoupon';
import Graph from './pages/AdminPages/Graph';
import Subscription from './pages/AdminPages/Subscriptions';
import HostLogin from './components/Host/HostLogin';
import HostLogoutPage from './components/Host/HostLogout';
import AutoLogoutAtMidnight from './pages/AutoLogoutAtMidnight';

// ==================== GLOBAL LOADING COMPONENT ====================
function GlobalLoader() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fff',
        zIndex: 99999,
      }}
    >
      <DotLottieReact
        data={animationData}
        loop
        autoplay
        style={{ width: 300, height: 300 }}
      />
    </div>
  );
}

// Create Access Control Context
const AccessControlContext = createContext();

// Enhanced Access Denied Modal Component
function AccessDeniedModal({ isVisible, onClose, userRole, attemptedPage, hasPermissionSystem = false }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 60);

      const timer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [isVisible, onClose]);

  const handleClose = () => {
    setIsAnimating(false);
    setProgress(0);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isVisible && !isAnimating) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${
        isVisible && isAnimating
          ? 'bg-black/30 backdrop-blur-sm bg-opacity-50'
          : 'bg-black/30 backdrop-blur-sm bg-opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 transform transition-all duration-500 border-2 border-red-100 ${
          isVisible && isAnimating
            ? 'scale-100 opacity-100 translate-y-0 rotate-0'
            : 'scale-75 opacity-0 translate-y-8 rotate-3'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center relative">
          <button
            onClick={handleClose}
            className="absolute -top-2 -right-2 bg-[#4169E1] text-white rounded-full p-2 hover:bg-[#3557c7] transition-all duration-300 hover:scale-110 hover:rotate-90 z-10 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative mx-auto mb-6">
            <div className={`w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center transition-all duration-700 ${
              isVisible && isAnimating ? 'animate-bounce shadow-lg' : ''
            }`}>
              <Lock className={`w-12 h-12 text-[#4169E1] transition-transform duration-500 ${
                isVisible && isAnimating ? 'scale-110' : 'scale-100'
              }`} />
            </div>

            <div className={`absolute inset-0 rounded-full border-4 border-[#4169E1] transition-all duration-1000 ${
              isVisible && isAnimating ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
            }`}></div>
            <div className={`absolute inset-0 rounded-full border-2 border-[#4169E1] transition-all duration-1500 ${
              isVisible && isAnimating ? 'scale-200 opacity-0' : 'scale-100 opacity-100'
            }`} style={{ transitionDelay: '200ms' }}></div>
          </div>

          <div className="flex justify-center items-center gap-2 mb-4">
            <Shield className={`w-6 h-6 text-[#4169E1] transition-transform duration-700 ${
              isVisible && isAnimating ? 'animate-pulse scale-110' : 'scale-100'
            }`} />
            <AlertTriangle className={`w-6 h-6 text-amber-500 transition-transform duration-700 ${
              isVisible && isAnimating ? 'animate-pulse scale-110' : 'scale-100'
            }`} style={{ transitionDelay: '100ms' }} />
            <User className={`w-6 h-6 text-blue-500 transition-transform duration-700 ${
              isVisible && isAnimating ? 'animate-pulse scale-110' : 'scale-100'
            }`} style={{ transitionDelay: '200ms' }} />
          </div>

          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-4">
            <span className={`inline-block transition-all duration-500 ${
              isVisible && isAnimating ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-4'
            }`} style={{ transitionDelay: '200ms' }}>
              Access Denied
            </span>
          </h2>

          <div className={`inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4 transition-all duration-500 ${
            isVisible && isAnimating ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-90'
          }`} style={{ transitionDelay: '300ms' }}>
            <User className="w-4 h-4 mr-2" />
            {userRole} User
          </div>

          <div className={`space-y-3 mb-6 transition-all duration-500 ${
            isVisible && isAnimating ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
          }`} style={{ transitionDelay: '400ms' }}>
            <p className="text-gray-700 font-medium">
              You don't have permission to access:
            </p>
            <p className="text-lg font-bold text-[#4169E1] bg-red-50 px-4 py-2 rounded-lg">
              {attemptedPage}
            </p>
            {hasPermissionSystem && userRole === 'Receptionist' && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700 mb-2">
                  <Settings className="w-4 h-4 inline mr-1" />
                  Permission-based access control is active
                </p>
                <p className="text-xs text-blue-600">
                  Contact your administrator to request access to this page
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500">
              This page is restricted to authorized users only.
            </p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#4169E1] via-[#4169E1] to-[#4169E1] h-3 rounded-full transition-all duration-100 ease-out relative"
              style={{ width: progress + '%' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
            </div>
          </div>

          <p className={`text-sm text-gray-600 transition-all duration-500 flex items-center justify-center gap-2 ${
            isVisible && isAnimating ? 'opacity-100' : 'opacity-0'
          }`} style={{ transitionDelay: '600ms' }}>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            Redirecting to authorized pages...
          </p>
        </div>
      </div>
    </div>
  );
}

// Enhanced Access Control Provider
function AccessControlProvider({ children }) {
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [attemptedPage, setAttemptedPage] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [hasPermissionSystem, setHasPermissionSystem] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const role = decoded.role ?
          decoded.role.charAt(0).toUpperCase() + decoded.role.slice(1).toLowerCase() :
          'Unknown';
        setUserRole(role);
      } catch (err) {
       // console.error('Error decoding token:', err);
      }
    }
  }, []);

  const triggerAccessDenied = (pageName) => {
    setAttemptedPage(pageName);
    setShowAccessDenied(true);
  };

  const closeAccessDenied = () => {
    setShowAccessDenied(false);
  };

  return (
    <AccessControlContext.Provider value={{ triggerAccessDenied, userRole }}>
      {children}
      <AccessDeniedModal
        isVisible={showAccessDenied}
        onClose={closeAccessDenied}
        userRole={userRole}
        attemptedPage={attemptedPage}
        hasPermissionSystem={hasPermissionSystem}
      />
    </AccessControlContext.Provider>
  );
}

export const useAccessControl = () => {
  const context = useContext(AccessControlContext);
  if (!context) {
    throw new Error('useAccessControl must be used within AccessControlProvider');
  }
  return context;
};

// JWT decode function
const jwtDecode = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
   // console.error('Token decode error:', error);
    throw new Error('Invalid token');
  }
};

// Host Protected Route Component
function HostProtectedRoute({ children }) {
  const [isHostAuthenticated, setIsHostAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkHostAuth = () => {
      const hostToken = localStorage.getItem('host_auth_token');
     
      if (!hostToken) {
        setIsHostAuthenticated(false);
        return;
      }

      try {
        const decoded = jwtDecode(hostToken);
        const currentTime = Date.now() / 1000;
       
        if (decoded.exp && decoded.exp < currentTime) {
          localStorage.removeItem('host_auth_token');
          setIsHostAuthenticated(false);
          return;
        }

        setIsHostAuthenticated(true);
      } catch (err) {
       // console.error('Host auth check error:', err);
        localStorage.removeItem('host_auth_token');
        setIsHostAuthenticated(false);
      }
    };

    checkHostAuth();
  }, []);

  if (isHostAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isHostAuthenticated) {
    return <Navigate to="/host/login" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
}

// Admin/Receptionist Protected Route
function ProtectedRoute({ allowedRoles, requirePermission, children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const { triggerAccessDenied } = useAccessControl();
  const { hasPermission, checkRoutePermission, loading: permissionLoading, userRole: contextRole } = usePermissions();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const role = decoded.role ?
          decoded.role.charAt(0).toUpperCase() + decoded.role.slice(1).toLowerCase() :
          'Unknown';

        setUserRole(role);
        setIsAuthenticated(true);
      } catch (err) {
       // console.error('Auth check error:', err.message);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch subscription status after authentication
useEffect(() => {
  let cancelled = false;
  const fetchSubscription = async () => {
    setSubscriptionLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSubscriptionStatus(null);
        setSubscriptionLoading(false);
        return;
      }

      // ✅ Decode token to check user role
      const decoded = jwtDecode(token);
      const role = decoded.role?.toLowerCase();
      
    //  console.log('🔍 Fetching subscription for role:', role);

      let subscriptionData = null;

      if (role === 'receptionist') {
        // ✅ For receptionist, get doctor's subscription from localStorage
        // This was stored during login from backend response
        const receptionistData = JSON.parse(localStorage.getItem('receptionistData') || '{}');
        const doctorSubscription = receptionistData.doctorSubscription;

      //  console.log('👤 Receptionist - Doctor Subscription from login:', doctorSubscription);

        if (doctorSubscription) {
          subscriptionData = {
            hasActiveSubscription: doctorSubscription.hasActiveSubscription || 
                                   doctorSubscription.isActive,
            subscription: {
              status: doctorSubscription.isActive ? 'active' : 'expired',
              planType: doctorSubscription.planType,
              endDate: doctorSubscription.endDate
            },
            planType: doctorSubscription.planType,
            daysRemaining: doctorSubscription.daysRemaining
          };
        } else {
          // If not in localStorage, make API call to get doctor's subscription
          const adminId = receptionistData.adminId;
          if (adminId) {
            const resp = await API.get(`/api/payments/subscription-status?doctorId=${adminId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const payload = resp?.data?.data || resp?.data;
            subscriptionData = {
              hasActiveSubscription: payload?.hasActiveSubscription || false,
              subscription: payload?.subscription || null
            };
          }
        }
      } else {
        // ✅ For doctors/admins, fetch their own subscription
        const resp = await API.get('/api/payments/subscription-status', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const payload = resp?.data?.data || resp?.data || null;
        
       // console.log('👨‍⚕️ Doctor/Admin Subscription Response:', payload);
        
        subscriptionData = {
          hasActiveSubscription: payload?.hasActiveSubscription || 
                                 payload?.subscription?.status === 'active',
          subscription: payload?.subscription || null,
          rawData: payload
        };
      }

     // console.log('✅ Final Normalized Subscription:', subscriptionData);
      
      if (!cancelled) {
        setSubscriptionStatus(subscriptionData);
      }
    } catch (err) {
     // console.error('❌ Subscription fetch failed:', err);
      if (!cancelled) {
        setSubscriptionStatus({
          hasActiveSubscription: false,
          subscription: null,
          error: err.message
        });
      }
    } finally {
      if (!cancelled) setSubscriptionLoading(false);
    }
  };

  if (isAuthenticated) {
    fetchSubscription();
  } else {
    setSubscriptionLoading(false);
  }

  return () => { cancelled = true; };
}, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && userRole && allowedRoles && !permissionLoading) {
      const hasRoleAccess = allowedRoles.includes(userRole) || allowedRoles.includes(contextRole);

      if ((userRole === 'Admin' || contextRole === 'Admin') && hasRoleAccess) {
        return;
      }

      if ((userRole === 'Receptionist' || contextRole === 'Receptionist') && hasRoleAccess) {
        if (requirePermission) {
          // If this receptionist is on a Basic plan, allow core pages without checking granular permissions
          const planTypeLocal = subscriptionStatus?.subscription?.planType || '';
          const isBasicLocal = typeof planTypeLocal === 'string' && planTypeLocal.toLowerCase().includes('basic');
          const basicAllowedPathsLocal = [
            '/dashboard', '/addpatient', '/treatmentencounters', '/medications', '/share', '/finance', '/settings', '/labmanagement', '/patients', '/logout',"/profile","/pricing",
          ];

          if (isBasicLocal) {
            const currentPath = location.pathname.split('?')[0];
            const allowedByBasic = basicAllowedPathsLocal.some(p => p === currentPath || currentPath.startsWith(p + '/'));
            if (allowedByBasic) {
              return;
            }
          }

          const hasRequiredPermission = typeof requirePermission === 'string'
            ? hasPermission(requirePermission)
            : checkRoutePermission(location.pathname);

          if (!hasRequiredPermission) {
            const pageName = getPageNameFromPath(location.pathname);
            triggerAccessDenied(pageName);
            return;
          }
        }
        return;
      }

      if (!hasRoleAccess) {
        const pageName = getPageNameFromPath(location.pathname);
        triggerAccessDenied(pageName);
      }
    }
  }, [isAuthenticated, userRole, allowedRoles, requirePermission, location.pathname, triggerAccessDenied, hasPermission, checkRoutePermission, permissionLoading, contextRole]);

  const getPageNameFromPath = (pathname) => {
    const pathMap = {
      '/dashboard': 'Dashboard',
      '/patients': 'Patients',
      '/appointments': 'Appointments',
      '/staff': 'Staff Management',
      '/labmanagement': 'Lab Management',
      '/settings': 'Settings',
      '/consultant': 'Consultant',
      '/finance': 'Finance',
      '/receptionisttable': 'Receptionist Table',
      '/share': 'Share',
      '/messages': 'Messages',
      '/profile': 'Profile',
      '/pricing': 'Pricing'
    };
   
    return pathMap[pathname] || pathname.replace('/', '').charAt(0).toUpperCase() + pathname.replace('/', '').slice(1);
  };

  if (isAuthenticated === null || permissionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Wait for subscription info if authenticated
  if (isAuthenticated && subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user has no active subscription (or subscription info missing), redirect to pricing and prevent access
  // Wait for subscription data to load before making decisions
if (isAuthenticated && !subscriptionLoading) {
  const allowedWhenNoSubscription = ['/pricing', '/receptionist-pricing', '/logout'];
  const currentPath = location.pathname.split('?')[0];
  
  // Check if user is a Receptionist
  const isReceptionist = userRole === 'Receptionist' || contextRole === 'Receptionist';
  
  if (isReceptionist) {
    // ✅ For receptionist, this is now the DOCTOR's subscription status
    const hasActiveSub = subscriptionStatus?.hasActiveSubscription === true || 
                         subscriptionStatus?.subscription?.status === 'active';
    
   /* console.log('👤 Receptionist Check (Doctor\'s Subscription):', { 
      hasActiveSub, 
      subscriptionStatus,
      message: 'This should be the DOCTOR\'s subscription, not receptionist\'s'
    });*/
    
    if (subscriptionStatus && !hasActiveSub) {
      // Doctor's subscription expired - logout receptionist
      if (currentPath !== '/logout') {
        toast.error("Doctor's subscription has expired. Please contact your administrator.");
        
        localStorage.removeItem('token');
        localStorage.removeItem('receptionistData');
        localStorage.removeItem('receptionistPermissions');
        localStorage.removeItem('hospitalData');
        
        console.warn("⚠️ Doctor's subscription expired. Receptionist logged out.");
        return <Navigate to="/login" replace />;
      }
    }
  } else {
    // For doctors/admins - check their own subscription
    const hasActiveSub = subscriptionStatus?.hasActiveSubscription === true || 
                         subscriptionStatus?.subscription?.status === 'active';
    
   /* console.log('👨‍⚕️ Doctor/Admin Check:', { 
      hasActiveSub, 
      subscriptionStatus 
    });*/
    
    if (subscriptionStatus && !hasActiveSub) {
      if (!allowedWhenNoSubscription.includes(currentPath)) {
        toast.warning("Please activate your subscription to access all features.");
        return <Navigate to="/pricing" replace />;
      }
    }
  }
}


  // If user has active subscription but it's a Basic plan, restrict accessible routes
  const basicAllowedPaths = [
    '/dashboard',
    '/addpatient',
    '/treatmentencounters',
    '/medications',
    '/share',
    '/finance',
    '/settings',
    '/labmanagement',
    '/patients',
    '/logout',
    '/profile',
    '/pricing',
    '/patientdata',
    '/patientdata/treatmentencounters',
    '/patientdata/medications',
      
    '/hospitalform'
  ];

  const planType = subscriptionStatus?.subscription?.planType || '';
  const isBasicPlan = typeof planType === 'string' && planType.toLowerCase().includes('basic');

  if (isAuthenticated && isBasicPlan) {
    const currentPath = location.pathname.split('?')[0];
    // allow nested patient data paths and treatment/medications for allowed patient pages
    const allowed = basicAllowedPaths.some(p => p === currentPath || currentPath.startsWith(p + '/') );
    if (!allowed) {
      const pageName = getPageNameFromPath(location.pathname);
      triggerAccessDenied(pageName);
      return <Navigate to="/dashboard" replace />;
    }
  }
  if ((userRole === 'Receptionist' || contextRole === 'Receptionist') && requirePermission) {
    const hasRequiredPermission = typeof requirePermission === 'string'
      ? hasPermission(requirePermission)
      : checkRoutePermission(location.pathname);

    if (!hasRequiredPermission) {
      return <Navigate to="/patients" replace />;
    }
  }

  const hasAnyRoleAccess = allowedRoles && (allowedRoles.includes(userRole) || allowedRoles.includes(contextRole));
  if (allowedRoles && !hasAnyRoleAccess) {
    return <Navigate to="/patients" replace />;
  }

  return children || <Outlet />;
}

// Layout Components
function SidebarLayout() {
  return (
    <div className="md:flex md:min-h-screen">
      <DentalSidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 bg-gray-50 md:ml-20">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}

function SimpleLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

function HostLayout() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 bg-gray-50 ml-20">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen">
      {/* AUTO LOGOUT COMPONENT - Active on all pages */}
      <AutoLogoutAtMidnight />
     
      <Routes>
         
        {/* HOST ROUTES */}
        <Route path="/host/login" element={<HostLogin />} />
        <Route path="/host/logout" element={<HostLogoutPage />} />
       
        <Route element={<HostProtectedRoute />}>
          <Route element={<HostLayout />}>
            <Route path="/host/ClinicsandDoctors" element={<AdminDashboard />} />
            <Route path="/host/dashboard" element={<Graph />} />
            <Route path="/host/coupons" element={<Coupons />} />
            <Route path="/host/plans" element={<FreeTrail />} />
            <Route path="/host/add-new-coupon" element={<AddNewCoupon />} />
            <Route path="/host/subscriptions" element={<Subscription />} />
          </Route>
        </Route>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<DentalX />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/receptionist-pricing" element={<ReceptionistPricing />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        {/* ADMIN/RECEPTIONIST ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Receptionist']} />}>
  <Route element={<SimpleLayout />}>
    <Route path="/logout" element={<Logout />} />
  </Route>
</Route>
        {/* PRICING ROUTE - Admin only */}
<Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
  <Route element={<SimpleLayout />}>
    <Route
      path="/pricing"
      element={
        <ProtectedRoute
          allowedRoles={['Admin']}
          requirePermission="pricing"
        >
          <PricingPage />
        </ProtectedRoute>
      }
    />
  </Route>
</Route>


        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route element={<SimpleLayout />}>
            <Route path="/hospitalform" element={<HospitalForm />} />
            <Route path="/receptionistsignup" element={<ReceptionistSignup />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Receptionist']} />}>
          <Route element={<SidebarLayout />}>
            <Route path="/patients" element={<PatientManagement />} />
            <Route path="/addpatient" element={<AddPatient />} />
            <Route path="/patientdata/:hospitalId/:patientId" element={<PatientDetailsPage />} />
            <Route path="/patientdata" element={<PatientDetailsPage />} />
            <Route path="/patientrecord" element={<Patentrecord />} />
           
         

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute
                  allowedRoles={['Admin', 'Receptionist']}
                  requirePermission="dashboard"
                >
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoute
                  allowedRoles={['Admin', 'Receptionist']}
                  requirePermission="appointments"
                >
                  <Appointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute
                  allowedRoles={['Admin', 'Receptionist']}
                  requirePermission="staff"
                >
                  <StaffManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/labmanagement"
              element={
                <ProtectedRoute
                  allowedRoles={['Admin', 'Receptionist']}
                  requirePermission="labmanagement"
                >
                  <LabManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute
                  allowedRoles={['Admin', 'Receptionist']}
                  requirePermission="profile"
                >
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route path="/billing"
              element={
                <ProtectedRoute
                  allowedRoles={['Admin','Receptionist']}
                  requirePermission="billing"
                >
                  <BillingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute
                  allowedRoles={['Admin', 'Receptionist']}
                  requirePermission="settings"
                >
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/consultant"
              element={
                <ProtectedRoute
                  allowedRoles={['Admin', 'Receptionist']}
                  requirePermission="consultant"
                >
                  <DoctorConsultations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finance"
              element={
                <ProtectedRoute
                  allowedRoles={['Admin', 'Receptionist']}
                  requirePermission="finance"
                >
                  <FinancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/share"
              element={
                <ProtectedRoute
                  allowedRoles={['Admin', 'Receptionist']}
                  requirePermission="share"
                >
                  <DentalReferralScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/receptionisttable"
              element={
                <ProtectedRoute
                  allowedRoles={['Admin', 'Receptionist']}
                  requirePermission="receptionisttable"
                >
                  <ReceptionistTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/treatmentencounters/:patientId"
              element={
                <ProtectedRoute
                  allowedRoles={['Admin', 'Receptionist']}
                  requirePermission="treatmentencounters"
                >
                  <TreatmentEncounters />
                </ProtectedRoute>
              }
            />
           
            <Route
              path="/medications/:patientId"
              element={
                <ProtectedRoute
                  allowedRoles={['Admin', 'Receptionist']}
                  requirePermission="medications"
                >
                  <MedicationTable />
                </ProtectedRoute>
              }
            />
            <Route
              path="/permissions"
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <PermissionManagement />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>

      { /* <Route path="/" element={<Navigate to="/login" replace />} /> */}
      </Routes>
     
      {/* Toast Container for notifications */}
      <ToastContainer />
    </div>
  );
}

// ==================== MAIN APP COMPONENT WITH LOADING ====================
export default function App() {
  const [loading, setLoading] = useState(true);
     


  useEffect(() => {
    // Add responsive styles dynamically
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 1366px) {
        html { font-size: 14px; }
        .container, [class*="container"] {
          padding-left: 1.5rem !important;
          padding-right: 1.5rem !important;
        }
      }
      
      @media (max-width: 1280px) {
        html { font-size: 13px; }
        .container, [class*="container"] {
          padding-left: 1rem !important;
          padding-right: 1rem !important;
        }
      }
      
      @media (max-height: 768px) {
        body { overflow-y: auto; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {


    // Hide loader after 3 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer); // cleanup
  }, []);

  // Show loader while loading
  if (loading) {
    return <GlobalLoader />;
  }

  // Main app content after loading
  return (
    <Router>
      <AccessControlProvider>
        <PermissionProvider>
          <AppLayout />
        </PermissionProvider>
      </AccessControlProvider>
    </Router>
  );
}
