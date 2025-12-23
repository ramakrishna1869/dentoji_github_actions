// src/components/Host/Graph/GraphHeader.jsx
import React, { useState, useEffect } from 'react';
import { Bell, DollarSign, UserCheck, CheckCircle, Gift } from 'lucide-react';
 
const GraphHeader = () => {
  const [hostName, setHostName] = useState('');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalDentistsOnboarded: 0,
    activeSubscriptions: 0,
    referralAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  const statsConfig = [
    {
      key: 'totalRevenue',
      title: "Total Revenue",
      bgColor: "#D1FAE5",
      icon: DollarSign,
      iconColor: "text-green-600"
    },
    {
      key: 'totalDentistsOnboarded',
      title: "Total Dentists Onboarded",
      bgColor: "#DBEAFE",
      icon: UserCheck,
      iconColor: "text-blue-600"
    },
    {
      key: 'activeSubscriptions',
      title: "Active Subscriptions",
      bgColor: "#FEF3C7",
      icon: CheckCircle,
      iconColor: "text-yellow-600"
    },
    {
      key: 'referralAmount',
      title: "Referral Amount",
      bgColor: "#FEE2E2",
      icon: Gift,
      iconColor: "text-red-600"
    }
  ];
 
  useEffect(() => {
    fetchHostProfile();
    fetchGraphStats();
  }, []);
 
  const fetchHostProfile = async () => {
    try {
      const token = localStorage.getItem('host_auth_token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/host/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
 
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHostName(data.host.name);
        }
      }
    } catch (err) {
     // console.error('Error fetching host profile:', err);
    }
  };
 
  const fetchGraphStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('host_auth_token');
     
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/graph/header-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
 
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
 
      const data = await response.json();
     
      if (data.success) {
        setStats(data.stats);
      } else {
        throw new Error(data.message || 'Failed to fetch statistics');
      }
    } catch (err) {
     // console.error('Error fetching graph stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between">
        {/* Left side - Greeting */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Good Morning <span className="text-blue-600">{hostName || 'Guest'}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Hope you are well!</p>
        </div>
       
        {/* Right side - Notification */}
        <div className="flex items-center">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Bell className="w-5 h-5 text-black fill-black" />
          </button>
        </div>
      </div>
     
      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-4 gap-6 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl shadow-sm p-4 bg-white animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
              <div className="flex items-center justify-between">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="w-[60px] h-[61px] bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-lg">
          Error loading statistics: {error}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6 mt-8">
          {statsConfig.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="rounded-xl shadow-sm p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="font-medium text-gray-600"
                    style={{
                      fontFamily: 'Poppins',
                      fontWeight: 500,
                      fontSize: '12px',
                      lineHeight: '18px',
                      letterSpacing: '2%',
                      opacity: 1
                    }}
                  >
                    {stat.title}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    {stat.key === 'totalRevenue' || stat.key === 'referralAmount' 
                      ? `₹${stats[stat.key].toLocaleString('en-IN')}` 
                      : stats[stat.key]}
                  </span>
                  <div
                    className="rounded-lg flex items-center justify-center"
                    style={{
                      background: stat.bgColor,
                      width: '60px',
                      height: '61px',
                      borderRadius: '12px'
                    }}
                  >
                    <Icon className={`w-7 h-7 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
 
export default GraphHeader;