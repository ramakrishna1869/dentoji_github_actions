// // FreeTrailFilters.jsx
// import React, { useState } from 'react';
// import { Search, Filter } from 'lucide-react';

// const FreeTrailFilters = ({ onSearch, onFilterChange }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [activeTab, setActiveTab] = useState('trials');

//   const handleSearchChange = (e) => {
//     const value = e.target.value;
//     setSearchTerm(value);
//     if (onSearch) {
//       onSearch(value); // This will trigger immediately, no 3-letter minimum
//     }
//   };

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     if (onFilterChange) {
//       onFilterChange({ type: 'tab', value: tab });
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
//       {/* Single line with Doctor/Clinic, radio buttons, and search */}
//       <div className="flex items-center justify-between">
//         {/* Doctor/Clinic Information title */}
//         <h2 className="text-lg font-semibold text-gray-900">Doctor/ Clinic Information</h2>
        
//         {/* Radio buttons for Trials/Subscriptions */}
//         <div className="flex items-center space-x-6">
//           <label className="flex items-center cursor-pointer">
//             <input
//               type="radio"
//               name="tabType"
//               value="trials"
//               checked={activeTab === 'trials'}
//               onChange={(e) => handleTabChange(e.target.value)}
//               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
//             />
//             <span className="ml-2 text-sm font-medium text-gray-700">Trials</span>
//           </label>
          
//           <label className="flex items-center cursor-pointer">
//             <input
//               type="radio"
//               name="tabType"
//               value="subscriptions"
//               checked={activeTab === 'subscriptions'}
//               onChange={(e) => handleTabChange(e.target.value)}
//               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
//             />
//             <span className="ml-2 text-sm font-medium text-gray-700">Subscriptions</span>
//           </label>
//         </div>

//         {/* Search bar */}
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//           <input
//             type="text"
//             placeholder="Search by Doctor/Clinic name"
//             value={searchTerm}
//             onChange={handleSearchChange}
//             className="pl-10 pr-4 py-2.5 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FreeTrailFilters;