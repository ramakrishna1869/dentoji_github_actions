// src/pages/AdminPages/Dashboard.jsx
import React, { useState } from 'react';
import DashboardHeader from '../../components/Host/Dashboard/DashboardHeader';
import DashboardTable from '../../components/Host/Dashboard/DashboardTable';

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('');

  const handleSearch = (term) => {
    setSearchTerm(term);
    //console.log('Searching for:', term);
  };

  const handleSortChange = (sortValue) => {
    setSortBy(sortValue);
    //console.log('Sort changed to:', sortValue);
  };

  return (
    <div className="min-h-screen bg-gray-100 overflow-hidden">
      <div className="max-w-full px-6 py-6">
        {/* Header Stats Component */}
        <DashboardHeader />
        
        {/* Combined Table with Filters Component */}
        <DashboardTable 
          searchTerm={searchTerm}
          sortBy={sortBy}
          onSearch={handleSearch}
          onSortChange={handleSortChange}
        />
      </div>
    </div>
  );
};

export default Dashboard;