//ReceptionistAccessManagement.jsx
import React, { useState, useEffect } from 'react';
import { Users, Shield, Loader2 } from 'lucide-react';
import { useNavigate } from "react-router-dom";
const ReceptionistAccessManagement = () => {
  const [receptionists, setReceptionists] = useState([]);
  const [receptionistPermissions, setReceptionistPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Available permissions (inline definition to avoid import issues)
  const AVAILABLE_PERMISSIONS = {
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
     
    profile: { name: 'Profile', icon: '👤', description: 'Manage user profile' }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch receptionists list
      const receptionistsResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/receptionists/list`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (!receptionistsResponse.ok) {
        throw new Error('Failed to fetch receptionists');
      }
      
      const receptionistsList = await receptionistsResponse.json();
      setReceptionists(receptionistsList);

      // Fetch permissions for each receptionist
      const permissionsData = {};
      for (const receptionist of receptionistsList) {
        try {
          const permResponse = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/permissions/receptionist/${receptionist._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (permResponse.ok) {
            const permData = await permResponse.json();
            if (permData.success) {
              permissionsData[receptionist._id] = permData.permissions || [];
            } else {
              // Default permissions if none found
              permissionsData[receptionist._id] = ['patients', 'appointments',  'share'];
            }
          } else {
            // Default permissions on error
            permissionsData[receptionist._id] = ['patients', 'appointments',  'share'];
          }
        } catch (permError) {
         // console.error(`Error fetching permissions for ${receptionist.name}:`, permError);
          // Default permissions on error
          permissionsData[receptionist._id] = ['patients', 'appointments',  'share'];
        }
      }
      
      setReceptionistPermissions(permissionsData);
    } catch (error) {
     // console.error('Error fetching data:', error);
      setError('Failed to load receptionist data');
    } finally {
      setLoading(false);
    }
  };

  const updatePermissions = async (receptionistId, newPermissions) => {
    setUpdating(prev => ({ ...prev, [receptionistId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/permissions/receptionist/${receptionistId}`,
        {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ permissions: newPermissions })
        }
      );

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        setReceptionistPermissions(prev => ({
          ...prev,
          [receptionistId]: newPermissions
        }));
      } else {
        throw new Error(responseData.message || 'Failed to update permissions');
      }
    } catch (error) {
    //  console.error('Error updating permissions:', error);
      // Still update UI optimistically if it might have worked
      if (error.response?.status === 200) {
        setReceptionistPermissions(prev => ({
          ...prev,
          [receptionistId]: newPermissions
        }));
      }
    } finally {
      setUpdating(prev => ({ ...prev, [receptionistId]: false }));
    }
  };

  const getAccessLevel = (permissions) => {
    const permCount = permissions.length;
    const totalAvailable = Object.keys(AVAILABLE_PERMISSIONS).length;
    
    if (permCount <= 4) return 'basic';
    if (permCount === totalAvailable) return 'all';
    return 'medium';
  };

  const handleAccessChange = (receptionistId, accessType) => {
    let newPermissions = [];
    
    switch (accessType) {
      case 'basic':
        newPermissions = ['patients', 'appointments',  'share'];
        break;
      case 'medium':
        // Add some medium-level permissions (6-8 permissions)
        newPermissions = [
          'patients', 'appointments',  'share', 
          'dashboard', 'profile', 'settings'
        ];
        break;
      case 'all':
        newPermissions = Object.keys(AVAILABLE_PERMISSIONS);
        break;
    }
    
    updatePermissions(receptionistId, newPermissions);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 h-64">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Receptionist Access Management
        </h3>
        <div className="text-red-500 text-center py-4">{error}</div>
      </div>
    );
  }
return (
  <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
    <div className='flex justify-between'>
    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
      Receptionist Access Management
    </h3>
     <h2
      onClick={() => navigate("/permissions")}
      className="text-blue-600 font-semibold cursor-pointer hover:underline hover:text-blue-700 transition-colors duration-200"
    >
      View Permissions
    </h2>
   </div>
    
    <div className="space-y-3 sm:space-y-4">
      {receptionists.slice(0, 4).map((receptionist) => {
        const permissions = receptionistPermissions[receptionist._id] || [];
        const accessLevel = getAccessLevel(permissions);
        const isUpdating = updating[receptionist._id];
        
        return (
          <div key={receptionist._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-gray-800 text-sm sm:text-base truncate">{receptionist.name}</h4>
                <p className={`text-xs sm:text-sm truncate ${
                  accessLevel === 'basic' ? 'text-blue-600' :
                  accessLevel === 'medium' ? 'text-green-600' :
                  accessLevel === 'all' ? 'text-purple-600' : 'text-gray-600'
                }`}>
                  {receptionist.name} has access for ({permissions.length}) pages
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              {isUpdating ? (
                <div className="flex items-center gap-2 text-blue-600 w-full sm:w-auto justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs sm:text-sm">Updating...</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleAccessChange(receptionist._id, 'basic')}
                    className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 sm:py-1 text-[10px] sm:text-xs rounded-lg border-2 cursor-pointer transition-colors whitespace-nowrap ${
                      accessLevel === 'basic'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Basic Access
                  </button>

                  <button
                    onClick={() => handleAccessChange(receptionist._id, 'medium')}
                    className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 sm:py-1 text-[10px] sm:text-xs rounded-lg border-2 cursor-pointer transition-colors whitespace-nowrap ${
                      accessLevel === 'medium'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Medium Access
                  </button>

                  <button
                    onClick={() => handleAccessChange(receptionist._id, 'all')}
                    className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 sm:py-1 text-[10px] sm:text-xs rounded-lg border-2 cursor-pointer transition-colors whitespace-nowrap ${
                      accessLevel === 'all'
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    Grant All
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
      
      {receptionists.length === 0 && (
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-gray-400" />
          <p className="text-sm sm:text-base">No receptionists found</p>
        </div>
      )}
    </div>
  </div>
);
};

export default ReceptionistAccessManagement;