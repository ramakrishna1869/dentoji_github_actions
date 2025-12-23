import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Users, DollarSign, XCircle } from 'lucide-react';

const DashboardHeader = () => {
  const [stats, setStats] = useState({
    totalClinics: 0,
    activeSubscriptions: 0,
    totalRevenue: '0',
    expiredPlans: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHeaderStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('host_auth_token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/host/dashboard/header-stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Failed to fetch stats');

      if (result.success) {
        setStats({
          totalClinics: result.stats.totalClinics || 0,
          activeSubscriptions: result.stats.activeSubscriptions || 0,
          totalRevenue: result.stats.totalRevenue || '0',
          expiredPlans: result.stats.expiredPlans || 0
        });
      } else {
        throw new Error(result.message || 'Failed to load statistics');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeaderStats();
    const interval = setInterval(fetchHeaderStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const statsArray = [
    {
      title: "Total Clinics Onboarded",
      value: loading ? "..." : stats.totalClinics.toLocaleString(),
      icon: Users,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500"
    },
    {
      title: "Active Subscriptions",
      value: loading ? "..." : stats.activeSubscriptions.toLocaleString(),
      icon: TrendingUp,
      bgColor: "bg-green-50",
      iconColor: "text-green-500"
    },
    {
      title: "Expired Plans",
      value: loading ? "..." : stats.expiredPlans.toLocaleString(),
      icon: XCircle,
      bgColor: "bg-red-50",
      iconColor: "text-red-500"
    },
    {
      title: "Total Revenue",
      value: loading ? "..." : `₹${stats.totalRevenue}`,
      icon: DollarSign,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500"
    }
  ];

  return (
    <div className="bg-gray-100 rounded-xl shadow-sm p-4 sm:p-6 mb-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
            Clinic Onboarding Dashboard
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
            Monitor clinic registrations, track subscription status, and view revenue at a glance
          </p>
        </div>

        
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-800">
          Failed to load statistics: {error}
        </div>
      )}

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsArray.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-3 sm:p-4 min-h-[88px] sm:h-24 flex items-center justify-between border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 mb-1 leading-tight truncate">
                  {stat.title}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                  {stat.value}
                </p>
              </div>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} rounded-lg flex items-center justify-center ml-2 sm:ml-3 flex-shrink-0`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardHeader;