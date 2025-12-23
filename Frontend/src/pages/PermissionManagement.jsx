//PermissionManagement

import React, { useState, useEffect } from 'react';
import { User, Shield, Check, X, Save, Search, Filter } from 'lucide-react';
import axios from 'axios';
import { AVAILABLE_PERMISSIONS } from './PermissionContext';

const PermissionManagement = () => {
  const [receptionists, setReceptionists] = useState([]);
  const [selectedReceptionist, setSelectedReceptionist] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchReceptionists();
  }, []);

  const fetchReceptionists = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/receptionists/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReceptionists(response.data);
    } catch (error) {
     // console.error('Error fetching receptionists:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceptionistPermissions = async (receptionistId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/permissions/receptionist/${receptionistId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
   
    //console.log('🔍 Fetching permissions for receptionist:', receptionistId);
    //console.log('📊 Backend response:', response.data);

    const permissionObj = {};
    
    // Initialize all permissions as false first
    Object.keys(AVAILABLE_PERMISSIONS).forEach(key => {
      permissionObj[key] = false;
    });

    // Check if we got a successful response with permissions
    if (response.data.success && response.data.permissions) {
      response.data.permissions.forEach(permission => {
        if (permissionObj.hasOwnProperty(permission)) {
          permissionObj[permission] = true;
        }
      });
    }

    // Always ensure patients permission is enabled
    permissionObj['patients'] = true;

    //console.log('📋 Final permission state:', permissionObj);
    setPermissions(permissionObj);
    
  } catch (error) {
  //  console.error('Error fetching permissions:', error);
    
    // Initialize with default permissions on error
    const defaultPermissionObj = {};
    Object.keys(AVAILABLE_PERMISSIONS).forEach(key => {
      defaultPermissionObj[key] = false;
    });
    
    // Set default permissions to true
    ['patients', 'appointments',  'share'].forEach(permission => {
      if (defaultPermissionObj.hasOwnProperty(permission)) {
        defaultPermissionObj[permission] = true;
      }
    });
    
    setPermissions(defaultPermissionObj);
  }
};


 

  const handleReceptionistSelect = (receptionist) => {
    setSelectedReceptionist(receptionist);
    fetchReceptionistPermissions(receptionist._id);
  };

  const handlePermissionToggle = (permission) => {
    // Prevent toggling of 'patients' permission for receptionists
    if (permission === 'patients') {
      return; // Do nothing - patients permission cannot be changed
    }
   
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  // Fixed verifyPermissions function - now properly integrated
  const verifyPermissions = async () => {
    if (!selectedReceptionist) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/permissions/receptionist/${selectedReceptionist._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        const permissionObj = {};
        response.data.permissions.forEach(permission => {
          permissionObj[permission] = true;
        });
        permissionObj['patients'] = true; // Always ensure patients is true
        setPermissions(permissionObj);
        
        //console.log('✅ Permissions verified from server:', response.data.permissions);
      }
    } catch (error) {
     // console.error('Error verifying permissions:', error);
    }
  };

  // Completely rewritten savePermissions function
  const savePermissions = async () => {
    if (!selectedReceptionist) return;
   
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const permissionsList = Object.keys(permissions).filter(key => permissions[key]);
     
      //console.log('🚀 Sending permissions to backend:', permissionsList);
     
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/permissions/receptionist/${selectedReceptionist._id}`,
        { permissions: permissionsList },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000
        }
      );
     
      //console.log('📥 Backend response:', response.data);
     
      if (response.data.success) {
        setMessage(`Permissions updated successfully for ${selectedReceptionist.name}`);
        
        // Verify the save by fetching back from server after a short delay
        setTimeout(async () => {
          await verifyPermissions();
        }, 500);
        
        // Trigger permission refresh for logged-in users
        if (window.refreshUserPermissions) {
          try {
            setTimeout(async () => {
              await window.refreshUserPermissions();
              //console.log('✅ User permissions refreshed');
            }, 1000);
          } catch (refreshError) {
            console.warn('Permission refresh failed:', refreshError);
          }
        }
      } else {
        setMessage(`Failed to update permissions: ${response.data.message || 'Unknown error'}`);
      }
      
    } 
    catch (error) {
 // console.error('❌ Error saving permissions:', error);
  
  // Check if it's actually a successful response with error status
  if (error.response?.status === 200 && error.response?.data?.success) {
    setMessage(`Permissions updated successfully for ${selectedReceptionist.name}`);
    setTimeout(async () => {
      await verifyPermissions();
    }, 500);
  } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout') || error.message.includes('Network Error')) {
    setMessage(`Network error occurred. Verifying if permissions were saved...`);
    setTimeout(async () => {
      await verifyPermissions();
      setMessage(`Please check if permissions were saved correctly.`);
    }, 2000);
  } else {
    const errorMessage = error.response?.data?.message || error.message || 'Error updating permissions';
    setMessage(`Error updating permissions: ${errorMessage}`);
  }
}
    finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const filteredReceptionists = receptionists.filter(receptionist => {
    const matchesSearch = receptionist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receptionist.email.toLowerCase().includes(searchTerm.toLowerCase());
   
    if (filterStatus === 'all') return matchesSearch;
    // Add more filters as needed
    return matchesSearch;
  });

  const renderPermissionCard = (key, permission) => {
    const isPatientPermission = key === 'patients';
    const isEnabled = permissions[key];
   
    return (
      <div
        key={key}
        className={`p-4 rounded-lg border-2 transition-all ${
          isEnabled
            ? 'bg-green-50 border-green-200 hover:bg-green-100'
            : 'bg-white border-gray-200 hover:bg-gray-50'
        } ${isPatientPermission ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
        onClick={() => !isPatientPermission && handlePermissionToggle(key)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isEnabled ? 'bg-green-200' : 'bg-gray-200'
            }`}>
              <span className="text-lg">{permission.icon}</span>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 flex items-center gap-2">
                {permission.name}
                {isPatientPermission && (
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    Always Enabled
                  </span>
                )}
              </h4>
              <p className="text-xs text-gray-600">{permission.description}</p>
            </div>
          </div>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isEnabled ? 'bg-green-500' : 'bg-gray-300'
          }`}>
            {isEnabled ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <X className="w-4 h-4 text-gray-600" />
            )}
          </div>
        </div>
        {isPatientPermission && (
          <div className="mt-2 text-xs text-blue-600">
            Patient management access is permanently enabled for all receptionists
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-600" />
          Permission Management
        </h2>
        <p className="text-gray-600 mt-1">Manage receptionist access permissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Receptionist List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Receptionists</h3>
           
            {/* Search and Filter */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search receptionists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
             
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Receptionists</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Receptionist List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredReceptionists.map((receptionist) => (
                <div
                  key={receptionist._id}
                  onClick={() => handleReceptionistSelect(receptionist)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedReceptionist?._id === receptionist._id
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{receptionist.name}</p>
                      <p className="text-sm text-gray-600 truncate">{receptionist.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Permission Settings */}
        <div className="lg:col-span-2">
          {selectedReceptionist ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Permissions for {selectedReceptionist.name}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedReceptionist.email}</p>
                </div>
                <button
                  onClick={() => {
                    // Fixed: Only patients permission for basic access
                    const basicPermissions = {
                      patients: true, 
                      appointments: true, 
                      
                      share: true 
                    };
                    setPermissions(basicPermissions);
                  }}
                  className="bg-blue-50 text-[#155DFC]  px-4 py-2 rounded-lg hover:bg-blue-100 w-[116px] h-[34px] flex items-center justify-center text-[12px] border-2 border-[#155DFC] cursor-pointer"
                >
                  Basic Access
                </button>
              </div>

              {/* Permission Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {Object.entries(AVAILABLE_PERMISSIONS).map(([key, permission]) =>
                  renderPermissionCard(key, permission)
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex justify-end gap-2 mb-6">
                <button
                  onClick={() => setPermissions({ patients: true })} // Always keep patients permission
                  className="px-4 py-2 bg-red-50 text-[#E7000B] rounded-lg hover:bg-red-100 w-[116px] h-[34px] flex items-center justify-center text-[12px] border-2 border-[#E7000B] cursor-pointer"
                >
                  Revoke All
                </button>
                <button
                  onClick={() => {
                    const allPermissions = {};
                    Object.keys(AVAILABLE_PERMISSIONS).forEach(key => {
                      allPermissions[key] = true;
                    });
                    setPermissions(allPermissions);
                  }}
                  className="px-4 py-2 bg-green-50 text-[#22C55E] rounded-lg hover:bg-green-100 w-[116px] h-[34px] flex items-center justify-center text-[12px] border-2 border-[#22C55E] cursor-pointer"
                >
                  Grant All
                </button>
              </div>

              {/* Save Changes Button */}
              <div className="w-full flex justify-center">
                <button
                  onClick={savePermissions}
                  disabled={saving}
                  className={`bg-blue-600 text-white px-10 py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer w-[720px] h-[46px] text-[18px] ${saving ? 'opacity-50' : 'hover:bg-blue-700'}`}
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Select a Receptionist</h3>
              <p className="text-gray-600">Choose a receptionist from the list to manage their permissions</p>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {message && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
          message.includes('Error') || message.includes('Failed') 
            ? 'bg-red-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;