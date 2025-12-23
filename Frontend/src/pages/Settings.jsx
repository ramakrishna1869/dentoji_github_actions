import React, { useState, useEffect } from "react";
import { Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
const SettingsPage = () => {
  const Navigate=useNavigate();
  const [clinicName, setClinicName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [adminName, setAdminName] = useState("");
  const [qualification, setQualification] = useState("");

  // Security Settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(5);
  const [sessionTimeout, setSessionTimeout] = useState(60); 

  // Notification Settings
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [pushNotif, setPushNotif] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [patientUpdates, setPatientUpdates] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);

  // Backup & Recovery Settings
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState("Daily");
  const [lastBackupDate, setLastBackupDate] = useState("");
  const [storageLocation, setStorageLocation] = useState("Cloud");

  // System Settings
  const [autoUpdates, setAutoUpdates] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [language, setLanguage] = useState("English");
  const goto=()=>{Navigate('/permissions');}
  // Loading and status states
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [userRole, setUserRole] = useState("Admin");
  const [hospitalId, setHospitalId] = useState("");

  // API configuration//Settings.jsx file
  const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}`; // Adjust to your backend URL

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // API call helper
  const apiCall = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  };

  // Load settings on component mount
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    setLoading(true);
    try {
      // Load user profile data
      const profileData = await apiCall('/auth/profile');
      //console.log('Full Profile data received:', profileData);

      // Extract user data based on response structure (same logic as DoctorProfile)
      const userData = profileData.admin || profileData.receptionist || profileData.user || profileData;
      const hospital = profileData.hospital;
      
      //console.log('User data extracted:', userData);
      //console.log('Hospital data extracted:', hospital);

      if (userData) {
        //console.log('Setting user data:');
        //console.log('- Name:', userData.name);
        //console.log('- Email:', userData.email);
        //console.log('- Phone:', userData.phone || userData.primaryNumber);
        //console.log('- Location:', userData.location);
        //console.log('- Qualification:', userData.qualification);
        //console.log('- Role:', userData.role);

        // Map the fields correctly
        setAdminName(userData.name || '');
        setEmail(userData.email || '');
        setPhone(userData.phone || userData.primaryNumber || ''); // Phone from user profile
        setAddress(userData.location || ''); // Location becomes address
        setQualification(userData.qualification || '');
        setUserRole(userData.role || 'Admin');
        setHospitalId(userData.hospitalId || userData._id || '');
      }

      // Handle hospital data if it exists separately
      if (hospital) {
        //console.log('Hospital data found:', hospital);
        setClinicName(hospital.name || '');
        // If hospital has its own phone/address, you can decide which takes priority
        // setPhone(hospital.phone || phone); // Uncomment if you want hospital phone to override
        // setAddress(hospital.address || address); // Uncomment if you want hospital address to override
      }

      // Load settings data
      try {
        const settingsData = await apiCall('/settings');
        //console.log('Settings data received:', settingsData);

        // Security settings
        if (settingsData.security) {
          setTwoFactorAuth(settingsData.security.twoFactorAuth || false);
          setLoginAttempts(settingsData.security.loginAttempts || 5);
          setSessionTimeout(settingsData.security.sessionTimeout || 60);
        }

        // Notification settings
        if (settingsData.notifications) {
          setEmailNotif(settingsData.notifications.emailNotif !== false);
          setSmsNotif(settingsData.notifications.smsNotif || false);
          setPushNotif(settingsData.notifications.pushNotif !== false);
          setAppointmentReminders(settingsData.notifications.appointmentReminders !== false);
          setPatientUpdates(settingsData.notifications.patientUpdates !== false);
          setSystemAlerts(settingsData.notifications.systemAlerts !== false);
        }

        // Backup settings
        if (settingsData.backup) {
          setAutoBackup(settingsData.backup.autoBackup !== false);
          setBackupFrequency(settingsData.backup.backupFrequency || 'Daily');
          setStorageLocation(settingsData.backup.storageLocation || 'Cloud');
          setLastBackupDate(settingsData.backup.lastBackupDate || 'Never');
        }

        // System settings
        if (settingsData.system) {
          setAutoUpdates(settingsData.system.autoUpdates !== false);
          setMaintenanceMode(settingsData.system.maintenanceMode || false);
          setTimezone(settingsData.system.timezone || 'Asia/Kolkata');
          setLanguage(settingsData.system.language || 'English');
        }

      } catch (settingsError) {
        //console.log('Settings not found, using defaults');
      }

    } catch (error) {
     // console.error("Error loading settings:", error);
      setSaveStatus("Error loading settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus("Saving...");

    try {
      const settingsData = {
        profile: {
          name: adminName,
          email,
          phone, // This will save the phone number back to the profile
          location: address, // This will save the address as location in the profile
          qualification
        },
        clinic: {
          name: clinicName,
          phone,
          address
        },
        security: {
          twoFactorAuth,
          loginAttempts,
          sessionTimeout
        },
        notifications: {
          emailNotif,
          smsNotif,
          pushNotif,
          appointmentReminders,
          patientUpdates,
          systemAlerts
        },
        backup: {
          autoBackup,
          backupFrequency,
          storageLocation
        },
        system: {
          autoUpdates,
          maintenanceMode,
          timezone,
          language
        }
      };

      //console.log("Saving settings:", settingsData);

      // Save settings
      await apiCall('/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsData)
      });

      // Update profile with phone and location changes
      await apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: adminName,
          phone: phone, // Save phone to profile
          location: address, // Save address as location to profile
          qualification
        })
      });

      setSaveStatus("Settings saved successfully!");
      setTimeout(() => setSaveStatus(""), 3000);

    } catch (error) {
     // console.error("Error saving settings:", error);
      setSaveStatus("Error saving settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackupNow = async () => {
    setLoading(true);
    setSaveStatus("Creating backup...");
    try {
      const result = await apiCall('/settings/backup', {
        method: 'POST'
      });

      if (result.lastBackupDate) {
        setLastBackupDate(result.lastBackupDate);
      } else {
        const now = new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        setLastBackupDate(now);
      }

      setSaveStatus("Backup completed successfully!");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
    //  console.error("Backup error:", error);
      setSaveStatus("Backup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !adminName) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-90 min-h-screen">
      {/* Header */}
      <div className="mb-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your clinic settings and preferences</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors cursor-pointer"
        onClick={goto}
        >
          <Key size={20} />
          <span>Permissions</span>
        </button>
      </div>
      {saveStatus && (
        <div className={`mt-4 p-3 rounded-md ${
          saveStatus.includes('Error') || saveStatus.includes('failed')
            ? 'bg-red-100 text-red-700'
            : saveStatus.includes('successfully') || saveStatus.includes('completed')
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-100 text-blue-700'
        }`}>
          {saveStatus}
        </div>
      )}
    </div>
      <div className="space-y-8">
        {/* Profile Information 
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Administrator Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-md bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                readOnly
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-1 focus:ring-gray-100 bg-gray-100 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                readOnly
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-100 focus:border-transparent"
                placeholder="e.g., 9876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Qualification</label>
              <input
                type="text"
                readOnly
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 bg-gray-100  focus:border-transparent"
                placeholder="e.g., MBBS, MD, B.Tech"
              />
            </div>
            {/* <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Location/Address</label>
              <textarea
                readOnly
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 bg-gray-100 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="e.g., City, State, Country or full address"
              />
            </div> 
          </div>
        </div>*/}

        {/* Clinic Information 
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Clinic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Name</label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full border border-gray-300 bg-gray-100 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your clinic name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 bg-gray-100 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Clinic contact number"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Address</label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-300 bg-gray-100 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Full clinic address"
              />
            </div>
          </div>
        </div>*/}

        {/* Notification Settings */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Notification Settings</h3>
          <div className="space-y-4">
            <SettingItem
              title="Email Notifications"
              description="Receive notifications via email"
              control={<Toggle checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />}
            />
            <SettingItem
              title="SMS Notifications"
              description="Receive updates via text message"
              control={<Toggle checked={smsNotif} onChange={() => setSmsNotif(!smsNotif)} />}
            />
            <SettingItem
              title="Push Notifications"
              description="Receive push notifications on your device"
              control={<Toggle checked={pushNotif} onChange={() => setPushNotif(!pushNotif)} />}
            />
            <SettingItem
              title="Appointment Reminders"
              description="Send reminders for upcoming appointments"
              control={<Toggle checked={appointmentReminders} onChange={() => setAppointmentReminders(!appointmentReminders)} />}
            />
            <SettingItem
              title="Patient Updates"
              description="Notifications about patient record changes"
              control={<Toggle checked={patientUpdates} onChange={() => setPatientUpdates(!patientUpdates)} />}
            />
            <SettingItem
              title="System Alerts"
              description="Important system notifications and alerts"
              control={<Toggle checked={systemAlerts} onChange={() => setSystemAlerts(!systemAlerts)} />}
            />
          </div>
        </div>

        {/* Security Settings */}
        {/* <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Security Settings</h3>
          <div className="space-y-4">
            <SettingItem
              title="Two-Factor Authentication"
              description="Add an extra layer of security to your account"
              control={<Toggle checked={twoFactorAuth} onChange={() => setTwoFactorAuth(!twoFactorAuth)} />}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                <select
                  value={loginAttempts}
                  onChange={(e) => setLoginAttempts(Number(e.target.value))}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={3}>3 attempts</option>
                  <option value={5}>5 attempts</option>
                  <option value={10}>10 attempts</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={480}>8 hours</option>
                </select>
              </div>
            </div>
          </div>
        </div> */}

        {/* Backup & Recovery */}
        {/* <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Backup & Recovery</h3>
          <div className="space-y-4">
            <SettingItem
              title="Automatic Backup"
              description="Automatically backup your data"
              control={<Toggle checked={autoBackup} onChange={() => setAutoBackup(!autoBackup)} />}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                <select
                  value={backupFrequency}
                  onChange={(e) => setBackupFrequency(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={!autoBackup}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Storage Location</label>
                <select
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Cloud">Cloud Storage</option>
                  <option value="Local">Local Storage</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Backup</label>
                <input
                  type="text"
                  value={lastBackupDate}
                  readOnly
                  className="w-full border border-gray-300 px-4 py-2 rounded-md bg-gray-50 text-gray-600"
                />
              </div>
            </div>
            <div className="pt-4">
              <button
                onClick={handleBackupNow}
                disabled={loading}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {loading ? "Creating Backup..." : "Backup Now"}
              </button>
            </div>
          </div>
        </div> */}

        {/* System Settings */}
        {/* <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">System Settings</h3>
          <div className="space-y-4">
            <SettingItem
              title="Automatic Updates"
              description="Automatically install system updates"
              control={<Toggle checked={autoUpdates} onChange={() => setAutoUpdates(!autoUpdates)} />}
            />
            <SettingItem
              title="Maintenance Mode"
              description="Enable maintenance mode (disables user access)"
              control={<Toggle checked={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} />}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Tamil">Tamil</option>
                </select>
              </div>
            </div>
          </div>
        </div> */}

        {/* System Information */}
        {/* <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">System Information</h3>
          <SystemStats />
        </div> */}

        {/* Action Buttons 
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={loadUserSettings}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium transition-colors cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>*/}
      </div>
    </div>
  );
};

// System Statistics Component
const SystemStats = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    systemVersion: 'v2.1.4'
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/settings/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
     // console.error('Error loading system stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (statsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <p className="text-2xl font-bold text-blue-600">{stats.totalPatients}</p>
        <p className="text-sm text-gray-600">Total Patients</p>
      </div>
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <p className="text-2xl font-bold text-green-600">{stats.totalAppointments}</p>
        <p className="text-sm text-gray-600">This Month's Appointments</p>
      </div>
      <div className="text-center p-4 bg-purple-50 rounded-lg">
        <p className="text-lg font-bold text-purple-600">{stats.systemVersion}</p>
        <p className="text-sm text-gray-600">System Version</p>
      </div>
    </div>
  );
};

// Helper component for consistent setting items
const SettingItem = ({ title, description, control }) => (
  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
    <div>
      <p className="font-medium text-sm">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    {control}
  </div>
);

// Enhanced Toggle Switch Component
const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only peer"
    />
    <div className={`w-14 h-7 rounded-full peer transition-all duration-300 ease-in-out ${checked ? 'bg-blue-500' : 'bg-gray-300'
      } peer-focus:ring-2 peer-focus:ring-blue-300`}>
      <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ease-in-out transform ${checked ? 'translate-x-7' : 'translate-x-0.5'
        }`}>
      </div>
    </div>
    <span className={`ml-3 text-sm font-medium transition-colors duration-200 ${checked ? 'text-blue-600' : 'text-gray-500'
      }`}>
      {checked ? 'ON' : 'OFF'}
    </span>
  </label>
);

export default SettingsPage;
