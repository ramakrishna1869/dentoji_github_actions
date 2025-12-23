import React, { useState, useEffect } from 'react';

const OnboardingFunnel = () => {
  const [funnelData, setFunnelData] = useState([
    { stage: 'Leads', count: 0 },
    { stage: 'Demos', count: 0 },
    { stage: 'Onboarded', count: 0 }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFunnelData();
  }, []);

  const fetchFunnelData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('host_auth_token');
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/graph/onboarding-funnel`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFunnelData([
            { stage: 'Leads', count: data.funnel.leads },
            { stage: 'Demos', count: data.funnel.demos },
            { stage: 'Onboarded', count: data.funnel.onboarded }
          ]);
        }
      }
    } catch (err) {
     // console.error('Error fetching funnel data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Onboarding Funnel</h2>
        <div className="mt-4">
          <h3 className="text-base font-semibold text-gray-900">Clinic Distribution</h3>
          <p className="text-sm text-gray-600 mt-1">Active clinics by city/state</p>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {funnelData.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                background: '#407BFF0F',
                borderRadius: '10px',
                minHeight: '39px'
              }}
            >
              <span className="text-sm font-medium text-gray-900">{item.stage}</span>
              <span 
                className="text-black"
                style={{
                  fontFamily: 'Roboto',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  textAlign: 'right',
                  opacity: 1
                }}
              >
                {item.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OnboardingFunnel;