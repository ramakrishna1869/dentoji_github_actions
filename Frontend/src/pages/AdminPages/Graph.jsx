// src/pages/AdminPages/Graph.jsx
import React from 'react';
import GraphHeader from '../../components/Host/Graph/GraphHeader';
import GraphChart from '../../components/Host/Graph/GraphChart';
import OnboardingFunnel from '../../components/Host/Graph/OnboardingFunnel';
import GeographicSpread from '../../components/Host/Graph/GeographicSpread';

const Graph = () => {
  return (
    <div className="min-h-screen bg-gray-100 overflow-hidden">
      <div className="max-w-full px-6 py-6">
        {/* Header Component */}
        <GraphHeader />
        
        {/* Graph Chart Component */}
        <GraphChart />
        
        {/* Bottom Section with Onboarding Funnel and Geographic Spread */}
        
      </div>
    </div>
  );
};

export default Graph;