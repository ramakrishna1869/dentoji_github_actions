// // ===== AdminSidebar.js - ADMIN DASHBOARD SIDEBAR =====
// import React from "react";
// import { Link, useLocation } from "react-router-dom";
// import { useAccessControl } from "../../App";
// // Admin-specific icons (only these 3 exist in AdminIcons folder)
// import DashboardIcon from "../../assets/icons/AdminIcons/Dashboard.png";
// import AppointmentsIcon from "../../assets/icons/AdminIcons/Appointments.png";
// import ConsultationsIcon from "../../assets/icons/AdminIcons/Consultations.png";
// // Regular icons from main icons folder
// import FinanceIcon from "../../assets/icons/Finance.png";
// import CouponsIcon from "../../assets/icons/share.png";
// import PlansIcon from "../../assets/icons/Settings.png";
// import LogoutIcon from "../../assets/icons/Logout.png";

// const AdminSidebar = () => {
//   const location = useLocation();
//   const { userRole } = useAccessControl();

//   // Define admin menu items
//   const adminMainLinks = [
//     {
//       to: '/host/dashboard',
//       paths: ['/host/dashboard'],
//       icon: DashboardIcon,
//       label: "Dashboard",
//     },
//     {
//       to: '/host/appointments',
//       paths: ['/host/appointments'],
//       icon: AppointmentsIcon,
//       label: "Appointments",
//     },
//     {
//       to: '/host/consultations',
//       paths: ['/host/consultations'],
//       icon: ConsultationsIcon,
//       label: "Consultations",
//     },
//     {
//       to: '/host/finance',
//       paths: ['/host/finance'],
//       icon: FinanceIcon,
//       label: "Finance",
//     },
//   ];

//   const adminBottomLinks = [
//     {
//       to: '/host/coupons',
//       paths: ['/host/coupons'],
//       icon: CouponsIcon,
//       label: "Coupons",
//     },
//     {
//       to: '/host/freetrail',
//       paths: ['/host/freetrail'],
//       icon: PlansIcon,
//       label: "Plans",
//     },
//     {
//       to: '/logout',
//       paths: ['/logout'],
//       icon: LogoutIcon,
//       label: "Logout",
//     },
//   ];

//   // Combine all links for mobile view
//   const mobileLinks = [
//     ...adminMainLinks.slice(0, 3), // Dashboard, Appointments, Consultations
//     ...adminBottomLinks.slice(0, 2), // Coupons, Plans
//   ];

//   // Desktop Link Component
//   const DesktopLink = ({ link, idx }) => {
//     const isActive = link.paths.includes(location.pathname);

//     return (
//       <div
//         key={`desktop-${idx}`}
//         className="relative group flex flex-col items-center py-0.5 cursor-pointer"
//       >
//         <Link to={link.to} className="flex flex-col items-center">
//           <DesktopLinkContent link={link} isActive={isActive} />
//         </Link>
//       </div>
//     );
//   };

//   // Mobile Link Component
//   const MobileLink = ({ link, idx }) => {
//     const isActive = link.paths.includes(location.pathname);

//     return (
//       <div
//         key={`mobile-${idx}`}
//         className="flex-1 flex flex-col items-center justify-center py-2 cursor-pointer"
//       >
//         <Link to={link.to} className="flex flex-col items-center w-full h-full justify-center">
//           <MobileLinkContent link={link} isActive={isActive} />
//         </Link>
//       </div>
//     );
//   };

//   // Desktop Link Content
//   const DesktopLinkContent = ({ link, isActive }) => (
//     <>
//       <div
//         className={`p-1.5 lg:p-2 rounded-xl transition-all duration-300 ease-in-out relative
//           ${isActive 
//             ? 'bg-white/20 backdrop-blur-md border border-white/40 shadow-lg' 
//             : 'opacity-90 group-hover:opacity-100 group-hover:bg-white/15'
//           }
//         `}
//       >
//         <img
//           src={link.icon}
//           alt={link.label}
//           className="w-5 h-5 lg:w-6 lg:h-6 transition-all duration-300"
//         />
//       </div>

//       <div
//         className={`rounded text-[10px] transition-all duration-300 ease-in-out text-center mt-1 leading-tight font-medium
//           ${isActive
//             ? 'opacity-100 translate-y-0 text-white font-medium'
//             : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 text-white'
//           }
//         `}
//       >
//         {link.label}
//       </div>
//     </>
//   );

//   // Mobile Link Content
//   const MobileLinkContent = ({ link, isActive }) => (
//     <>
//       <div
//         className={`p-2 rounded-lg transition-all duration-300 ease-in-out relative
//           ${isActive ? 'bg-[#4169E1]/20 border border-[#4169E1]/40' : ''}
//         `}
//       >
//         <img
//           src={link.icon}
//           alt={link.label}
//           className={`w-5 h-5 transition-all duration-300 ${
//             isActive ? 'filter brightness-125' : ''
//           }`}
//         />
//       </div>

//       <div
//         className={`text-[9px] transition-all duration-300 ease-in-out text-center mt-1 leading-tight
//           ${isActive
//             ? 'text-[#4169E1] font-semibold'
//             : 'text-gray-600'
//           }
//         `}
//       >
//         <span className="block">{link.label}</span>
//       </div>
//     </>
//   );

//   return (
//     <>
//       {/* DESKTOP SIDEBAR */}
//       <div className="hidden md:flex flex-col items-center bg-[#4169E1] text-white rounded-3xl w-16 lg:w-20 h-screen fixed left-2 lg:left-5 top-0 shadow-xl">
//         {/* Logo - Fixed at top */}
//         <div className="text-center font-bold text-[10px] lg:text-xs leading-tight tracking-wide py-2 lg:py-3 px-1 lg:px-2 w-full">
//           Admin
//         </div>

//         {/* Main Links - Flexible space */}
//         <div className="flex flex-col justify-evenly flex-1 w-full py-2 space-y-1">
//           {adminMainLinks.map((link, idx) => (
//             <DesktopLink key={`main-${idx}`} link={link} idx={idx} />
//           ))}
//         </div>

//         {/* Bottom Links - Fixed at bottom */}
//         <div className="flex flex-col w-full pt-0 pb-2 space-y-1">
//           {adminBottomLinks.map((link, idx) => (
//             <DesktopLink key={`bottom-${idx}`} link={link} idx={idx} />
//           ))}
//         </div>
//       </div>

//       {/* MOBILE BOTTOM NAVIGATION */}
//       <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 safe-area-bottom">
//         <div className="flex items-center justify-around h-16 px-2">
//           {mobileLinks.map((link, idx) => (
//             <MobileLink key={`mobile-nav-${idx}`} link={link} idx={idx} />
//           ))}
//         </div>
//       </div>

//       {/* Mobile spacing div to prevent content from being hidden behind bottom nav */}
//       <div className="md:hidden h-16 w-full"></div>
//     </>
//   );
// };

// export default AdminSidebar;


// ===== AdminSidebar.js - ADMIN DASHBOARD SIDEBAR =====
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAccessControl } from "../../App";
// Admin-specific icons (only these 3 exist in AdminIcons folder)
import DashboardIcon from "../../assets/icons/AdminIcons/Dashboard.png";
import CouponIcon from "../../assets/icons/AdminIcons/coupon.png";
import ConsultationsIcon from "../../assets/icons/AdminIcons/Consultations.png";
// Regular icons from main icons folder
import CouponsIcon from "../../assets/icons/AdminIcons/plans.png";
import LogoutIcon from "../../assets/icons/Logout.png";

const AdminSidebar = () => {
  const location = useLocation();
  const { userRole } = useAccessControl();

  // Define admin menu items - Only 4 top icons
  const adminMainLinks = [
    {
      to: '/host/dashboard',
      paths: ['/host/dashboard'],
      icon: DashboardIcon,
      label: "Dashboard",
    },
    {
      to: '/host/ClinicsandDoctors',
      paths: ['/host/ClinicsandDoctors'],
      icon: ConsultationsIcon,
      label: "C/D",
    }, 
     {
      to: '/host/plans',
      paths: ['/host/plans'],
      icon: CouponsIcon,
      label: "Plans",
    },
    {
      to: '/host/coupons',
      paths: ['/host/coupons'],
      icon: CouponIcon,
      label: "Coupons",
    },
  
  ];

  const adminBottomLinks = [
    {
      to: '/host/logout',
      paths: ['/host/logout'],
      icon: LogoutIcon,
      label: "Logout",
    },
  ];

  // Combine all links for mobile view - 4 icons
  const mobileLinks = [
    ...adminMainLinks, // All 4 main icons
  ];

  // Desktop Link Component
  const DesktopLink = ({ link, idx }) => {
    const isActive = link.paths.includes(location.pathname);

    return (
      <div
        key={`desktop-${idx}`}
        className="relative group flex flex-col items-center py-2 cursor-pointer"
      >
        <Link to={link.to} className="flex flex-col items-center">
          <DesktopLinkContent link={link} isActive={isActive} />
        </Link>
      </div>
    );
  };

  // Mobile Link Component
  const MobileLink = ({ link, idx }) => {
    const isActive = link.paths.includes(location.pathname);

    return (
      <div
        key={`mobile-${idx}`}
        className="flex-1 flex flex-col items-center justify-center py-2 cursor-pointer"
      >
        <Link to={link.to} className="flex flex-col items-center w-full h-full justify-center">
          <MobileLinkContent link={link} isActive={isActive} />
        </Link>
      </div>
    );
  };

  // Desktop Link Content
  const DesktopLinkContent = ({ link, isActive }) => (
    <>
      <div
        className={`p-1.5 lg:p-2 rounded-xl transition-all duration-300 ease-in-out relative
          ${isActive 
            ? 'bg-white/20 backdrop-blur-md border border-white/40 shadow-lg' 
            : 'opacity-90 group-hover:opacity-100 group-hover:bg-white/15'
          }
        `}
      >
        <img
          src={link.icon}
          alt={link.label}
          className="w-5 h-5 lg:w-6 lg:h-6 transition-all duration-300"
        />
      </div>

      <div
        className={`rounded text-[10px] transition-all duration-300 ease-in-out text-center mt-1 leading-tight font-medium
          ${isActive
            ? 'opacity-100 translate-y-0 text-white font-medium'
            : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 text-white'
          }
        `}
      >
        {link.label}
      </div>
    </>
  );

  // Mobile Link Content
  const MobileLinkContent = ({ link, isActive }) => (
    <>
      <div
        className={`p-2 rounded-lg transition-all duration-300 ease-in-out relative
          ${isActive ? 'bg-[#4169E1]/20 border border-[#4169E1]/40' : ''}
        `}
      >
        <img
          src={link.icon}
          alt={link.label}
          className={`w-5 h-5 transition-all duration-300 ${
            isActive ? 'filter brightness-125' : ''
          }`}
        />
      </div>

      <div
        className={`text-[9px] transition-all duration-300 ease-in-out text-center mt-1 leading-tight
          ${isActive
            ? 'text-[#4169E1] font-semibold'
            : 'text-gray-600'
          }
        `}
      >
        <span className="block">{link.label}</span>
      </div>
    </>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex flex-col items-center bg-[#4169E1] text-white rounded-3xl w-16 lg:w-20 fixed left-2 lg:left-5 top-2 bottom-2 shadow-xl">
        {/* Logo - Fixed at top */}
        <div className="text-center font-bold text-[10px] lg:text-xs leading-tight tracking-wide py-2 lg:py-3 px-1 lg:px-2 w-full">
          Admin
        </div>

        {/* Main Links - Very compact spacing with fixed top margin */}
        <div className="flex flex-col w-full py-2 space-y-0.5 mt-2">
          {adminMainLinks.map((link, idx) => (
            <DesktopLink key={`main-${idx}`} link={link} idx={idx} />
          ))}
        </div>
        
        {/* Spacer to push logout to bottom */}
        <div className="flex-1"></div>

        {/* Bottom Links - Fixed at bottom with margin */}
        <div className="flex flex-col w-full pt-0 pb-2 mb-2 space-y-1">
          {adminBottomLinks.map((link, idx) => (
            <DesktopLink key={`bottom-${idx}`} link={link} idx={idx} />
          ))}
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileLinks.map((link, idx) => (
            <MobileLink key={`mobile-nav-${idx}`} link={link} idx={idx} />
          ))}
        </div>
      </div>

      {/* Mobile spacing div to prevent content from being hidden behind bottom nav */}
      <div className="md:hidden h-16 w-full"></div>
    </>
  );
};

export default AdminSidebar;