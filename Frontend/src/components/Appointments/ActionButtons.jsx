import React from "react";
import { Pencil, Eye, X } from "lucide-react";

const ActionButtons = ({ onEdit, onView, onCancel, showCancel = true }) => (
  <div className="flex space-x-2 gap-2">
    <button onClick={onEdit} className="text-blue-600 hover:text-blue-800 cursor-pointer"><Pencil className="w-4 h-4" /></button>
    <button onClick={onView} className="text-green-600 hover:text-green-800 cursor-pointer"><Eye className="w-4 h-4" /></button>
    {showCancel && (
      <button onClick={onCancel} className="text-red-600 hover:text-red-800 cursor-pointer"><X className="w-4 h-4" /></button>
    )}
  </div>
);

export default ActionButtons;
