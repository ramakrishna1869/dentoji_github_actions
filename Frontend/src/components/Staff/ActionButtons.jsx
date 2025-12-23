import { Pencil, Eye } from "lucide-react";
import React from "react";
const ActionButtons = ({ onEdit, onView }) => (
  <div className="flex space-x-2 gap-2">
    <button onClick={onEdit} className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer" title="Edit">
      <Pencil className="w-4 h-4" />
    </button>
    <button onClick={onView} className="text-green-600 hover:text-green-800 text-sm font-medium cursor-pointer" title="View">
      <Eye className="w-4 h-4" />
    </button>
  </div>
);
export default ActionButtons;
