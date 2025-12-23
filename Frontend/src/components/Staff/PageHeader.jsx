import { Plus, Users } from "lucide-react"; 
import AddStaffModal from "./AddStaffModal"; 
import { useState } from "react"; 
import React from "react";  
import { useNavigate } from "react-router-dom"; 

const PageHeader = ({ onStaffAdded, receptionistCount }) => {
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState(false);

  const FREE_RECEPTIONIST_LIMIT = 2;
  const isAtLimit = receptionistCount >= FREE_RECEPTIONIST_LIMIT;

 // console.log('PageHeader - Receptionist count:', receptionistCount);
 // console.log('PageHeader - At limit:', isAtLimit);

  // ✅ ALWAYS OPEN MODAL - NO LIMIT CHECK
  const handleAddStaff = () => {
   // console.log('✅ Opening add staff modal (no limit on adding staff)');
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleStaffAdded = (newStaff) => {
    setModalOpen(false);
    if (onStaffAdded) {
      onStaffAdded(newStaff);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
        {/* Title & Description */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Staff Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage clinic staff and their permissions
          </p>
          
          {/* Receptionist Account Status Badge */}
          <div className="flex items-center gap-2 mt-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
              isAtLimit 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              <Users size={14} />
              <span>
                {FREE_RECEPTIONIST_LIMIT} Free Accounts Used
              </span>
            </div>
            
            {isAtLimit && (
              <div className="inline-flex items-center gap-1 text-xs text-orange-600 font-medium">
                <span>₹350 per additional account</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Add Staff Button - ALWAYS ENABLED */}
        <div className="w-full sm:w-auto">
          <button
            onClick={handleAddStaff}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg transition-all cursor-pointer text-sm sm:text-base font-medium bg-blue-500 text-white hover:bg-blue-600"
          >
            <Plus size={18} className="sm:w-5 sm:h-5" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* AddStaffModal - ALWAYS OPENS */}
      <AddStaffModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose}
        mode="add"
        onStaffAdded={handleStaffAdded}
        receptionistCount={receptionistCount}
      />
    </>
  );
};

export default PageHeader;