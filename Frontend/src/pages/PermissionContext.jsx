

 
// PermissionContext.js - UPDATED WITH DEFAULT PERMISSIONS
import React, { createContext, useContext, useState, useEffect,useCallback } from 'react';
import axios from 'axios';
 
const PermissionContext = createContext();
 
// Available pages that can be granted permissions for
export const AVAILABLE_PERMISSIONS = {
  dashboard: { name: 'Dashboard', icon: '📊', description: 'View hospital dashboard and analytics' },
  patients: { name: 'Patients', icon: '👥', description: 'Manage patient records and information' },
  appointments: { name: 'Appointments', icon: '📅', description: 'Schedule and manage appointments' },
  staff: { name: 'Staff Management', icon: '👨‍⚕️', description: 'Manage hospital staff members' },
  labmanagement: { name: 'Lab Management', icon: '🔬', description: 'Handle laboratory tests and results' },
  settings: { name: 'Settings', icon: '⚙️', description: 'Configure system settings' },
  consultant: { name: 'Consultant', icon: '👨‍⚕️', description: 'Doctor consultation management' },
  finance: { name: 'Finance', icon: '💰', description: 'Financial reports and billing' },
  receptionisttable: { name: 'Receptionist Table', icon: '📋', description: 'View receptionist records' },
  share: { name: 'Refer & Earn', icon: '📤', description: 'Share patient referrals' },
  profile: { name: 'Profile', icon: '👤', description: 'Manage user profile' },
  // ✅ Add this
};
 
// Default permissions when no permissions are found in database
//const DEFAULT_PERMISSIONS = ['patients'];
// Default permissions when no permissions are found in database
// Default permissions when no permissions are found in database
const DEFAULT_PERMISSIONS = ['patients', 'appointments',  'share'];
 
// Route to permission mapping
const ROUTE_PERMISSION_MAP = {
  '/dashboard': 'dashboard',
  '/patients': 'patients',
  '/addpatient': 'patients',
  '/appointments': 'appointments',
  '/staff': 'staff',
  '/labmanagement': 'labmanagement',
  '/settings': 'settings',
  '/consultant': 'consultant',
  '/finance': 'finance',
  '/logout':'logout',
  '/share': 'share',
  '/receptionisttable': 'receptionisttable',
  '/profile': 'profile',
  '/pricing': 'pricing'
};
 
export const PermissionProvider = ({ children }) => {

    //console.log("🚀 PermissionContext mounted in frontend!"); // ✅ add here

  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [hasPermissionsInDB, setHasPermissionsInDB] = useState(false);
 

const fetchUserPermissions = useCallback(async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      //console.log('No token found, using default permissions');
      setUserPermissions(DEFAULT_PERMISSIONS);
      setUserRole('Guest');
      setHasPermissionsInDB(false);
      setLoading(false);
      return;
    }

    // Decode token to get role
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const role = decoded.role;
    setUserRole(role);

    // If user is Admin, they have all permissions
    if (role === 'Admin' || role === 'admin') {
      //console.log('Admin user detected, granting all permissions');
      setUserPermissions(Object.keys(AVAILABLE_PERMISSIONS));
      setHasPermissionsInDB(true);
      setLoading(false);
      return;
    }

    // For Receptionist users, fetch permissions from database
    if (role === 'Receptionist' || role === 'receptionist') {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/permissions/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
       
        //console.log('📊 Raw API Response:', response.data);

        // Check if response has permissions and they're not empty
        if (response.data.success && response.data.permissions && response.data.permissions.length > 0) {
          //console.log('✅ Using database permissions:', response.data.permissions);
          setUserPermissions(response.data.permissions);
          setHasPermissionsInDB(true);
        } else {
          //console.log('⚠️ No permissions in database or empty array, using defaults');
          setUserPermissions(DEFAULT_PERMISSIONS);
          setHasPermissionsInDB(false);
        }
      } catch (apiError) {
        //console.log('❌ API error, using default permissions:', apiError.message);
        setUserPermissions(DEFAULT_PERMISSIONS);
        setHasPermissionsInDB(false);
      }
    } else {
      //console.log('Unknown role, using default permissions');
      setUserPermissions(DEFAULT_PERMISSIONS);
      setHasPermissionsInDB(false);
    }

  } catch (error) {
   // console.error('Error fetching permissions:', error);
    setUserPermissions(DEFAULT_PERMISSIONS);
    setHasPermissionsInDB(false);
  } finally {
    setLoading(false);
  }
}, []);
 

    useEffect(() => {
    fetchUserPermissions();
  }, []);

  useEffect(() => {
  // Expose refresh function globally for permission updates
  window.refreshUserPermissions = refreshPermissions;
  
  return () => {
    delete window.refreshUserPermissions;
  };
}, []);



 


 
  // const hasPermission = (permission) => {
  //   // Admins always have all permissions
  //   if (userRole === 'Admin' || userRole === 'admin') {
  //     return true;
  //   }
   
  //   //console.log('🔍 Checking permission:', {
  //     permission,
  //     userPermissions,
  //     hasIt: userPermissions.includes(permission),
  //     hasPermissionsInDB,
  //     usingDefaults: !hasPermissionsInDB
  //   });
   
  //   // If we have permissions in DB, use them
  //   if (hasPermissionsInDB) {
  //     return userPermissions.includes(permission);
  //   }
 
  //   // If no permissions in DB, use default permissions
  //   return DEFAULT_PERMISSIONS.includes(permission);
  // };
 

const hasPermission = (permission) => {
  // Admins always have all permissions
  if (userRole === 'Admin' || userRole === 'admin') {
    return true;
  }

  // ✅ Logout, Profile, and Pricing are always accessible for everyone
  const ALWAYS_ALLOWED = ['logout', 'profile', 'pricing'];
  if (ALWAYS_ALLOWED.includes(permission)) {
    return true;
  }

  // For receptionist users
  if (userRole === 'Receptionist' || userRole === 'receptionist') {
    // If we have permissions in DB, use them strictly
    if (hasPermissionsInDB && userPermissions.length > 0) {
      // Patients is always allowed even if not explicitly in DB
      if (permission === 'patients') {
        return true;
      }
      const result = userPermissions.includes(permission);
      return result;
    } else {
      // No DB permissions - use defaults
      const result = DEFAULT_PERMISSIONS.includes(permission);
      return result;
    }
  }

  // For other roles, deny access
  return false;
};
 
 
  const checkRoutePermission = (route) => {
    // Remove leading slash and convert to permission key
    const permissionKey = route.replace('/', '').toLowerCase();
   
    // Use route mapping first, then fall back to direct mapping
    const mappedPermission = ROUTE_PERMISSION_MAP[route] || permissionKey;
   
    // Special cases for route mapping (keeping your original logic)
    const routeMapping = {
      
      'receptionisttable': 'receptionisttable',
      'consultant': 'consultant',
      'labmanagement': 'labmanagement'
    };
   
    const finalPermission = routeMapping[permissionKey] || mappedPermission;
   
    /*console.log('🗺️ Route permission check:', {
      route,
      permissionKey,
      mappedPermission,
      finalPermission,
      result: hasPermission(finalPermission),
      hasPermissionsInDB,
      usingDefaults: !hasPermissionsInDB
    });*/
   
    return hasPermission(finalPermission);
  };
 
  // Get effective permissions (either from DB or default)
  const getEffectivePermissions = () => {
    if (userRole === 'Admin' || userRole === 'admin') {
      return Object.keys(AVAILABLE_PERMISSIONS);
    }
 
    return hasPermissionsInDB ? userPermissions : DEFAULT_PERMISSIONS;
  };
 
  // Refresh permissions after updates
// Refresh permissions after updates
const refreshPermissions = useCallback(async () => {
  setLoading(true);
  await fetchUserPermissions();
}, [fetchUserPermissions]);
 
  return (
    <PermissionContext.Provider value={{
      userPermissions: getEffectivePermissions(),
      hasPermission,
      checkRoutePermission,
      fetchUserPermissions,
      refreshPermissions,
      userRole,
      loading,
      hasPermissionsInDB,
      defaultPermissions: DEFAULT_PERMISSIONS,
      permissions: getEffectivePermissions() // Adding this for compatibility
    }}>
      {children}
    </PermissionContext.Provider>
  );
};
 
export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider');
  }
  return context;
};