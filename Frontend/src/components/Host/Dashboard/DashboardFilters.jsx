// // src/components/Host/Dashboard/DashboardFilters.jsx
// import React, { useState } from 'react';
// import { Search, ChevronDown } from 'lucide-react';

// const DashboardFilters = ({ onSearch, onSortChange }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortBy, setSortBy] = useState('');

//   const handleSearchChange = (e) => {
//     const value = e.target.value;
//     setSearchTerm(value);
//     if (onSearch) {
//       onSearch(value);
//     }
//   };

//   const handleSortChange = (e) => {
//     const value = e.target.value;
//     setSortBy(value);
//     if (onSortChange) {
//       onSortChange(value);
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
//       <div className="flex items-center justify-between">
//         {/* Doctor/Clinic Information title */}
//         <h2 className="text-lg font-semibold text-gray-900">Doctor/ Clinic Information</h2>
        
//         {/* Sort dropdown and Search bar */}
//         <div className="flex items-center space-x-4">
//           {/* Sort By dropdown */}
//           <div className="relative">
//             <select
//               value={sortBy}
//               onChange={handleSortChange}
//               className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
//             >
//               <option value="">Sort By</option>
//               <option value="lastAccess">Last Access (Latest)</option>
//               <option value="lastAccess_oldest">Last Access (Oldest)</option>
//               <option value="doctorName">Doctor Name (A-Z)</option>
//               <option value="clinicName">Clinic Name (A-Z)</option>
//               <option value="status">Status</option>
//             </select>
//             <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
//           </div>
          
//           {/* Search bar */}
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//             <input
//               type="text"
//               placeholder="Search by Doctor/Clinic name"
//               value={searchTerm}
//               onChange={handleSearchChange}
//               className="pl-10 pr-4 py-2.5 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardFilters;