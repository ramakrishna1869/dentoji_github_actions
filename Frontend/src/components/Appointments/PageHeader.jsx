import { Plus } from "lucide-react";
import React from "react";
const PageHeader = ({ onAddClick }) => (
  <div className="flex justify-between items-center mb-8">
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Appointments</h1>
      <p className="text-gray-600">Manage and schedule patient appointments</p>
    </div>
    {/* <button
      onClick={onAddClick}
      className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600"
    >
      <Plus size={20} />
      <span>Add Appointment</span>
    </button> */}
  </div>
);

export default PageHeader;
