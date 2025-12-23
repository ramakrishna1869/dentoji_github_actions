import React, { useState, useEffect } from "react";
import { DollarSign, FileText, Clock, BarChart3 } from "lucide-react";

export default function FinanceCards() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalEncounters, setTotalEncounters] = useState(0);
  const [totalPaidRevenue, setTotalPaidRevenue] = useState(0);
  const [totalLabExpenses, setTotalLabExpenses] = useState(0);
  const [totalConsultationExpenses, setTotalConsultationExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch completed treatment revenue from API
  const fetchCompletedRevenue = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      const response = await fetch(`${VITE_BACKEND_URL}/api/finance/hospital/completed-revenue`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch revenue data');
      }

      const result = await response.json();
      
      if (result.success) {
        setTotalRevenue(result.data.totalRevenue || 0);
        setTotalEncounters(result.data.totalEncounters || 0);
      } else {
        throw new Error(result.message || 'Failed to load revenue data');
      }
    } catch (err) {
    //  console.error('Error fetching completed revenue:', err);
      throw err;
    }
  };

  // Fetch total paid revenue from API
  const fetchTotalPaidRevenue = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      const response = await fetch(`${VITE_BACKEND_URL}/api/finance/hospital/total-paid-revenue`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch paid revenue data');
      }

      const result = await response.json();
      
      if (result.success) {
        setTotalPaidRevenue(result.data.totalPaidRevenue || 0);
      } else {
        throw new Error(result.message || 'Failed to load paid revenue data');
      }
    } catch (err) {
    //  console.error('Error fetching total paid revenue:', err);
      throw err;
    }
  };

  const fetchLabExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      const response = await fetch(`${VITE_BACKEND_URL}/api/finance/hospital/lab-expenses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch lab expenses');
      }

      const result = await response.json();
      
      if (result.success) {
        setTotalLabExpenses(result.data.totalLabExpenses || 0);
      } else {
        throw new Error(result.message || 'Failed to load lab expenses');
      }
    } catch (err) {
     // console.error('Error fetching lab expenses:', err);
      throw err;
    }
  };

  const fetchConsultationExpenses = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      const response = await fetch(`${VITE_BACKEND_URL}/api/finance/hospital/consultation-expenses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch consultation expenses');
      }

      const result = await response.json();
      
      if (result.success) {
        setTotalConsultationExpenses(result.data.totalConsultationExpenses || 0);
      } else {
        throw new Error(result.message || 'Failed to load consultation expenses');
      }
    } catch (err) {
    //  console.error('Error fetching consultation expenses:', err);
      throw err;
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchCompletedRevenue(),
          fetchTotalPaidRevenue(),
          fetchLabExpenses(),
          fetchConsultationExpenses() 
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Format currency to Indian Rupees
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const cards = [
    { 
      label: "Total Treatment Revenue", 
      value: loading ? "Loading..." : error ? "Error" : formatCurrency(totalRevenue),
      icon: <DollarSign className="w-6 h-6" />, 
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-400",
      featured: false
    },
    { 
      label: "Total Paid Revenue", 
      value: loading ? "Loading..." : error ? "Error" : formatCurrency(totalPaidRevenue),
      icon: <FileText className="w-6 h-6" />, 
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-400",
      featured: false
    },
    { 
      label: "Total Amt Spent on Lab", 
      value: loading ? "Loading..." : error ? "Error" : formatCurrency(totalLabExpenses),
      icon: <Clock className="w-6 h-6" />, 
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-400",
      featured: false
    },
    { 
      label: "Total Amt Spent on Consultation", 
      value: loading ? "Loading..." : error ? "Error" : formatCurrency(totalConsultationExpenses),
      icon: <BarChart3 className="w-6 h-6" />, 
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-400",
      featured: false
    },
  ];

  return (
    <div className="mb-6">
      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <strong className="text-red-800 font-medium">Error loading data</strong>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${
              card.featured ? `border-2 ${card.borderColor}` : 'border border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              {/* Left side - Label and Value */}
              <div className="flex-1">
                {/* Label */}
                <div className="text-sm text-gray-500 font-medium mb-1">
                  {card.label}
                </div>
                
                {/* Value */}
                <div className="text-2xl font-bold text-gray-900">
                  {card.value}
                </div>
              </div>
              
              {/* Right side - Icon with background */}
              <div className={`inline-flex p-2.5 rounded-lg ${card.bgColor} ${card.color}`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}