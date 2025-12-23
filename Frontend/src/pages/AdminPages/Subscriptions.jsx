import React from 'react';
//import StatsSection from '../../components/Host/Plans/Subscriptions/StatsSection';
import StatsSection from '@/components/Host/Plans/FreeTrail/Subscriptions/StatsSection';
import DoctorTable from '@/components/Host/Plans/FreeTrail/Subscriptions/DoctorTable';
import AdminSidebar from '@/components/Host/AdminSidebar';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      
      {/* Add left margin to account for sidebar width */}
      <div className="ml-24 p-8">
        <StatsSection />
        
        <DoctorTable />
      </div>
    </div>
  );
};

export default App;