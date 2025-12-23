import React, { useState } from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyles()}`}>
      {status}
    </span>
  );
};

const DaysLeftBadge = ({ daysLeft }) => {
  if (daysLeft === 'Completed') {
    return <span className="text-sm text-gray-500">Completed</span>;
  }
  
  return <span className="text-sm text-gray-900">{daysLeft}</span>;
};

const DoctorTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('subscriptions');

  const doctorsData = [
    {
      name: 'Dr.Vanitha',
      email: 'vanitha@gmail.com',
      startDate: 'Jul 20,2025',
      nextBilling: 'Jul 27,2025',
      plan: 'Monthly',
      daysLeft: '2 Days Left',
      usersAllowed: 2,
      paymentStatus: 'Paid'
    },
    {
      name: 'Dr.Samuel',
      email: 'dsamuel@gmail.com',
      startDate: 'Jul 25,2025',
      nextBilling: 'Jul 31,2025',
      plan: 'Yearly',
      daysLeft: '3 Days Left',
      usersAllowed: 2,
      paymentStatus: 'Paid'
    },
    {
      name: 'Dr.Saranya',
      email: 'saranya@gmail.com',
      startDate: 'Jun 24,2025',
      nextBilling: 'Jun 30,2025',
      plan: 'Monthly',
      daysLeft: 'Completed',
      usersAllowed: 2,
      paymentStatus: 'Pending'
    },
    {
      name: 'Dr.Swasi',
      email: 'swasishree@gamil.com',
      startDate: 'Jun 24,2025',
      nextBilling: 'Jun 30,2025',
      plan: 'Monthly',
      daysLeft: 'Completed',
      usersAllowed: 2,
      paymentStatus: 'Pending'
    }
  ];

  const filteredDoctors = doctorsData.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (doctor) => {
    //console.log('View doctor:', doctor);
  };

  const handleDelete = (doctor) => {
    //console.log('Delete doctor:', doctor);
  };

  return (
    <div>
      {/* Doctor Information Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Doctor/ Clinic Information</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
             
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="filter" 
                  value="subscriptions"
                  checked={selectedFilter === 'subscriptions'}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="mr-2" 
                />
                <span className="text-sm text-blue-600">Subscriptions</span>
              </label>
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by Doctor/Clinic name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Doctor Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Email Number</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Start Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Next Billing Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Plan</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Days Left</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Users Allowed</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Payment Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doctor, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-900">{doctor.name}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{doctor.email}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{doctor.startDate}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{doctor.nextBilling}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{doctor.plan}</td>
                  <td className="py-4 px-4 text-sm">
                    <DaysLeftBadge daysLeft={doctor.daysLeft} />
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">{doctor.usersAllowed}</td>
                  <td className="py-4 px-4">
                    <StatusBadge status={doctor.paymentStatus} />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleView(doctor)}
                        className="p-1 rounded hover:bg-gray-100 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(doctor)}
                        className="p-1 rounded hover:bg-red-50 text-red-500 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
     
    </div>
  );
};

export default DoctorTable;