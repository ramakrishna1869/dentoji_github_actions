// src/hooks/usePatientLimit.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const usePatientLimit = () => {
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
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
    //  console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };
 // console.log("Subscription Data in Hook:", subscriptionData);

  const checkPatientLimit = () => {
    if (!subscriptionData) return true;

    const { currentPatientCount, maxPatients } = subscriptionData;

    // -1 means unlimited (Monthly/Yearly plans)
    if (maxPatients === -1) return true;

    // Check if limit reached
    if (currentPatientCount >= maxPatients) {
      setShowLimitModal(true);
      return false;
    }

    return true;
  };

  const canAddPatient = !loading && (
    subscriptionData?.maxPatients === -1 || 
    subscriptionData?.currentPatientCount < subscriptionData?.maxPatients
  );

  return {
    checkPatientLimit,
    canAddPatient,
    currentCount: subscriptionData?.currentPatientCount || 0,
    maxPatients: subscriptionData?.maxPatients || 0,
    planType: subscriptionData?.planType,
    loading,
    showLimitModal,
    setShowLimitModal,
    refreshData: fetchSubscriptionData
  };
};