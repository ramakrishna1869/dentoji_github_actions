import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAccessControl } from "../App";
import { usePermissions } from "../pages/PermissionContext";
import { Lock, Menu, X, Crown, AlertCircle } from "lucide-react";
import DashboardIcon from "../assets/icons/Dashboard.png";
import PatientIcon from "../assets/icons/Dental_Patient.png";
import TreatmentIcon from "../assets/icons/Treatment.png";
import UserGroupIcon from "../assets/icons/User_Groups.png";
import MicroscopeIcon from "../assets/icons/Optical_Microscope.png";
import SettingsIcon from "../assets/icons/Settings.png";
import LogoutIcon from "../assets/icons/Logout.png";
import DoctorIcon from "../assets/icons/Doctor.png";
import FinanceIcon from "../assets/icons/Finance.png";
import ShareIcon from "../assets/icons/share.png";

// ✅ Upgrade Modal Component
const UpgradeModal = ({ isVisible, onClose, feature, currentPlan }) => {
  const navigate = useNavigate();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 border-2 border-yellow-100">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Upgrade Required
          </h2>

          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            <AlertCircle className="w-4 h-4 mr-2" />
            Current Plan: {currentPlan}
          </div>

          <p className="text-gray-700 font-medium mb-3">
            This feature requires:
          </p>
          <p className="text-lg font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg mb-4">
            {feature}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Upgrade your plan to unlock this feature and many more!
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/pricing');
              }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-colors shadow-lg"
            >
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DentalSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { triggerAccessDenied, userRole } = useAccessControl();
  const { hasPermission, userRole: contextRole, permissions, loading: permissionLoading } = usePermissions();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [restrictedFeature, setRestrictedFeature] = useState('');

  const effectiveRole = contextRole || userRole;
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // ✅ Fetch subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoadingSubscription(false);
          return;
        }

        const response = await fetch(`${BACKEND_URL}/api/patients/subscription-features`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        
        if (data.success && data.hasSubscription) {
          setSubscriptionData(data.subscription);
        }
      } catch (error) {
        //console.error('Failed to fetch subscription:', error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscription();
  }, []);

  // ✅ Define which features each plan can access
  const PLAN_FEATURES = {
    'Basic Plan': [
      'dashboard', 'patients', 'labmanagement', 'settings', 
      'logout', 'pricing',"share","finance"
    ],
    'Monthly Plan': [
      'dashboard', 'patients', 'appointments', 'staff', 'labmanagement',
      'consultant', 'finance', 'share', 'settings', 'logout', 'pricing',
      'receptionisttable', 'profile', 'billing'
    ],
    'Yearly Plan': [
      'dashboard', 'patients', 'appointments', 'staff', 'labmanagement',
      'consultant', 'finance', 'share', 'settings', 'logout', 'pricing',
      'receptionisttable', 'profile', 'billing', 'permissions'
    ]
  };

  const canAccessFeature = (featureKey) => {
    // Admin - check subscription plan
    if (effectiveRole === 'Admin' || effectiveRole === 'admin') {
      if (!subscriptionData) return true;
      
      const allowedFeatures = PLAN_FEATURES[subscriptionData.planType] || [];
      return allowedFeatures.includes(featureKey);
    }

    // Receptionist - check permissions
    if (effectiveRole === 'Receptionist' || effectiveRole === 'receptionist') {
      return hasPermission(featureKey);
    }

    return false;
  };

  const handleRestrictedClick = (e, featureName) => {
    e.preventDefault();
    setRestrictedFeature(featureName);
    setShowUpgradeModal(true);
  };

  const allMainLinks = [
    {
      to: '/dashboard',
      paths: ['/dashboard'],
      icon: DashboardIcon,
      label: "Dashboard",
      permission: 'dashboard',
      featureKey: 'dashboard',
      requiredPlans: ['Basic Plan', 'Monthly Plan', 'Yearly Plan']
    },
    {
      to: '/patients',
      paths: ['/patients', '/addpatient'],
      icon: PatientIcon,
      label: "Patients",
      permission: 'patients',
      featureKey: 'patients',
      requiredPlans: ['Basic Plan', 'Monthly Plan', 'Yearly Plan']
    },
    {
      to: '/appointments',
      paths: ['/appointments'],
      icon: TreatmentIcon,
      label: "Appointments",
      permission: 'appointments',
      featureKey: 'appointments',
      requiredPlans: ['Monthly Plan', 'Yearly Plan']
    },
    {
      to: '/staff',
      paths: ['/staff'],
      icon: UserGroupIcon,
      label: "Staff",
      permission: 'staff',
      featureKey: 'staff',
      requiredPlans: ['Monthly Plan', 'Yearly Plan']
    },
    {
      to: '/labmanagement',
      paths: ['/labmanagement'],
      icon: MicroscopeIcon,
      label: "Labs",
      permission: 'labmanagement',
      featureKey: 'labmanagement',
      requiredPlans: ['Basic Plan', 'Monthly Plan', 'Yearly Plan']
    },
    {
      to: '/consultant',
      paths: ['/consultant'],
      icon: DoctorIcon,
      label: "Consultant",
      permission: 'consultant',
      featureKey: 'consultant',
      requiredPlans: ['Monthly Plan', 'Yearly Plan']
    },
    {
      to: '/finance',
      paths: ['/finance'],
      icon: FinanceIcon,
      label: "Finance",
      permission: 'finance',
      featureKey: 'finance',
      requiredPlans: ['Monthly Plan', 'Yearly Plan']
    },
  ];

  const allBottomLinks = [
    {
      to: '/share',
      paths: ['/share'],
      icon: ShareIcon,
      label: "Share",
      permission: 'share',
      featureKey: 'share',
      requiredPlans: ['Monthly Plan', 'Yearly Plan']
    },
    {
      to: '/settings',
      paths: ['/settings'],
      icon: SettingsIcon,
      label: "Settings",
      permission: 'settings',
      featureKey: 'settings',
      requiredPlans: ['Basic Plan', 'Monthly Plan', 'Yearly Plan']
    },
    {
      to: '/logout',
      paths: ['/logout'],
      icon: LogoutIcon,
      label: "Logout",
      permission: null,
      featureKey: 'logout',
      requiredPlans: ['Basic Plan', 'Monthly Plan', 'Yearly Plan']
    },
  ];

  const handleLinkClick = (e, link) => {
    const hasAccess = canAccessFeature(link.featureKey);
    
    if (!hasAccess && effectiveRole === 'Admin') {
      // Admin but plan restriction
      e.preventDefault();
      handleRestrictedClick(e, `${link.label} (Requires ${link.requiredPlans.filter(p => p !== subscriptionData?.planType).join(' or ')})`);
      setIsMobileMenuOpen(false);
      return false;
    }

    if (!hasAccess && effectiveRole === 'Receptionist') {
      // Receptionist permission restriction
      e.preventDefault();
      triggerAccessDenied(link.label);
      setIsMobileMenuOpen(false);
      return false;
    }

    setIsMobileMenuOpen(false);
    return true;
  };

  const DesktopLink = ({ link, idx }) => {
    const isActive = link.paths.includes(location.pathname);
    const hasAccess = canAccessFeature(link.featureKey);
    const isRestricted = !hasAccess;

    return (
      <div
        key={`desktop-${idx}`}
        className={`relative group flex flex-col items-center ${isRestricted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={(e) => !isRestricted ? handleLinkClick(e, link) : handleRestrictedClick(e, `${link.label} (Requires ${link.requiredPlans.filter(p => p !== subscriptionData?.planType).join(' or ')})`)}
      >
        {!isRestricted ? (
          <Link to={link.to} className="flex flex-col items-center">
            <DesktopLinkContent link={link} isActive={isActive} isRestricted={isRestricted} />
          </Link>
        ) : (
          <div className="flex flex-col items-center">
            <DesktopLinkContent link={link} isActive={isActive} isRestricted={isRestricted} />
          </div>
        )}
      </div>
    );
  };

  const DesktopLinkContent = ({ link, isActive, isRestricted }) => (
    <>
      <div
        className={`
          p-0.5 md:p-1 lg:p-1.5 xl:p-2 2xl:p-2.5
          rounded-lg md:rounded-xl
          transition-all duration-300 ease-in-out relative
          ${isActive ? 'bg-white/20 backdrop-blur-md border border-white/40 shadow-lg' : 'opacity-90 group-hover:opacity-100'}
          ${isRestricted
            ? 'opacity-40 group-hover:opacity-60 group-hover:bg-yellow-500/10 border border-yellow-300/30'
            : 'group-hover:bg-white/15'
          }
        `}
      >
        <img
          src={link.icon}
          alt={link.label}
          className={`
            w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7
            transition-all duration-300 
            ${isRestricted ? 'filter grayscale contrast-50' : ''}
          `}
        />

        {isRestricted && (
          <div className="absolute -top-0.5 -right-0.5 bg-red-500 text-white rounded-full w-3 h-3 md:w-3 md:h-3 flex items-center justify-center">
  <Lock className="w-1.5 h-1.5 md:w-2 md:h-2" />
</div>
        )}
      </div>

      <div
        className={`
          rounded text-[7px] md:text-[8px] lg:text-[9px] xl:text-[10px] 2xl:text-[11px]
          transition-all duration-300 ease-in-out text-center 
          mt-0.5 md:mt-0.5 lg:mt-1
          leading-tight font-medium
          ${isActive
            ? 'opacity-100 translate-y-0 text-white font-medium'
            : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'
          }
          ${isRestricted
            ? 'text-yellow-200 group-hover:text-yellow-300'
            : 'text-white'
          }
        `}
      >
        {link.label}
      </div>
    </>
  );

  const MobileSidebarLink = ({ link }) => {
    const isActive = link.paths.includes(location.pathname);
    const hasAccess = canAccessFeature(link.featureKey);
    const isRestricted = !hasAccess;

    return (
      <div
        className={`flex items-center px-4 sm:px-6 py-3 sm:py-4 cursor-pointer transition-all duration-200 ${
          isActive ? 'bg-white/10' : 'hover:bg-white/5 active:bg-white/15'
        } ${isRestricted ? 'opacity-50' : ''}`}
        onClick={(e) => handleLinkClick(e, link)}
      >
        {!isRestricted ? (
          <Link to={link.to} className="flex items-center w-full">
            <div className="relative flex-shrink-0">
              <img src={link.icon} alt={link.label} className="w-6 h-6" />
            </div>
            <span className={`ml-3 sm:ml-4 text-sm sm:text-base ${isActive ? 'font-semibold' : 'font-normal'}`}>
              {link.label}
            </span>
          </Link>
        ) : (
          <div className="flex items-center w-full">
            <div className="relative flex-shrink-0">
              <img src={link.icon} alt={link.label} className="w-6 h-6 filter grayscale" />
              <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                <Lock className="w-2.5 h-2.5" />
              </div>
            </div>
            <span className="ml-3 sm:ml-4 text-sm sm:text-base text-yellow-300">{link.label}</span>
          </div>
        )}
      </div>
    );
  };

  if (loadingSubscription || permissionLoading) {
    return (
      <>
        <div className="hidden md:flex flex-col items-center bg-[#4169E1] text-white rounded-3xl w-14 md:w-16 lg:w-[4.5rem] xl:w-20 2xl:w-24 h-screen fixed left-2 md:left-2 lg:left-3 xl:left-5 top-0 shadow-xl">
          <div className="text-center font-bold text-[8px] md:text-[9px] lg:text-[10px] xl:text-xs leading-tight tracking-wide py-1.5 md:py-2 lg:py-2 xl:py-2.5 px-1 w-full">
            Dentoji
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 md:h-6 md:w-6 border-2 border-white border-t-transparent"></div>
          </div>
        </div>

        <div className="md:hidden fixed top-0 left-0 right-0 bg-[#4169E1] z-50 h-14 sm:h-16 flex items-center px-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Upgrade Modal */}
      <UpgradeModal
        isVisible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={restrictedFeature}
        currentPlan={subscriptionData?.planType || 'No Plan'}
      />

      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex flex-col h-screen items-center bg-[#4169E1] text-white rounded-xl md:rounded-3xl w-10 md:w-16 lg:w-[4.5rem] xl:w-20 2xl:w-22 fixed left-2 md:left-2 lg:left-3 xl:left-5 top-0 shadow-xl">
        <div className="text-center font-bold text-[8px] md:text-[9px] lg:text-[10px] xl:text-xs 2xl:text-sm leading-tight mt-6 tracking-wide px-1 w-full flex-shrink-0">
          Dentoji
        </div>

        <div className="sidebar-main-section flex flex-col justify-evenly flex-1 w-full mt-4">
          {allMainLinks.map((link, idx) => (
            <DesktopLink key={`main-${idx}`} link={link} idx={idx} />
          ))}
        </div>

        <div className="sidebar-bottom-section flex flex-col justify-evenly w-full mt-2 flex-shrink-0 mb-2">
          {allBottomLinks.map((link, idx) => (
            <DesktopLink key={`bottom-${idx}`} link={link} idx={idx} />
          ))}
        </div>
      </div>

      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-[#4169E1] z-50 h-14 sm:h-16 flex items-center px-3 sm:px-4 shadow-lg">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white p-2.5 sm:p-3 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors cursor-pointer touch-manipulation"
          aria-label="Toggle menu"
        >
          <Menu size={22} className="sm:w-6 sm:h-6" />
        </button>
        <div className="flex-1 text-center">
          <span className="text-white font-bold text-base sm:text-lg">Dentoji</span>
        </div>
        <div className="w-10 sm:w-12"></div>
      </div>

      {/* MOBILE SIDEBAR MENU */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        <div
          className={`absolute top-0 left-0 h-full w-64 xs:w-72 sm:w-80 bg-[#4169E1] text-white shadow-2xl transform transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
            <div className="text-lg sm:text-xl font-bold">Dentoji</div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white p-2 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors cursor-pointer touch-manipulation"
              aria-label="Close menu"
            >
              <X size={22} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="overflow-y-auto h-[calc(100%-56px)] sm:h-[calc(100%-64px)]">
            <div className="py-2 sm:py-4">
              {allMainLinks.map((link, idx) => (
                <MobileSidebarLink key={`sidebar-main-${idx}`} link={link} />
              ))}
            </div>

            <div className="border-t border-white/10 py-2 sm:py-4">
              {allBottomLinks.map((link, idx) => (
                <MobileSidebarLink key={`sidebar-bottom-${idx}`} link={link} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden h-14 sm:h-16 w-full"></div>

      {/* Responsive styles */}
      <style jsx="true">{`
        @media (min-width: 1920px) and (max-height: 1000px) {
          .sidebar-bottom-section {
            height: 38% !important;
            min-height: 300px !important;
            padding-top: 0.75rem !important;
            padding-bottom: 1.75rem !important;
          }
          .sidebar-main-section {
            padding-top: 0.25rem !important;
            padding-bottom: 0.25rem !important;
          }
        }

        @media (min-width: 1920px) and (min-height: 1001px) and (max-height: 1100px) {
          .sidebar-bottom-section {
            height: 36% !important;
            min-height: 290px !important;
            padding-top: 1rem !important;
            padding-bottom: 1.5rem !important;
          }
        }

        @media (min-width: 1920px) and (min-height: 1101px) {
          .sidebar-bottom-section {
            height: 32% !important;
            min-height: 260px !important;
          }
        }

        @media (min-width: 1536px) and (max-width: 1919px) {
          .sidebar-bottom-section {
            height: 30% !important;
            min-height: 220px !important;
          }
        }

        @media (min-width: 1280px) and (max-width: 1535px) {
          .sidebar-bottom-section {
            height: 28% !important;
            min-height: 200px !important;
          }
        }

        @media (min-width: 768px) and (max-width: 1279px) {
          .sidebar-bottom-section {
            height: 26% !important;
            min-height: 180px !important;
          }
        }

        @media (min-width: 768px) {
          .main-content {
            margin-left: 4rem;
          }
        }
        @media (min-width: 1024px) {
          .main-content {
            margin-left: 5rem;
          }
        }
        @media (min-width: 1280px) {
          .main-content {
            margin-left: 6rem;
          }
        }
        @media (min-width: 1536px) {
          .main-content {
            margin-left: 7rem;
          }
        }

        /* Touch optimization */
        @media (hover: none) {
          .touch-manipulation {
            touch-action: manipulation;
          }
        }
      `}</style>
    </>
  );
};

export default DentalSidebar;