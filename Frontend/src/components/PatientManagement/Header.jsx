import React from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <div className="ml-1">
        <h1 className="text-2xl font-bold text-gray-800">Patient Management </h1>
        <p className="text-gray-500">Manage patient records and information</p>
      </div>
      <div className="flex gap-3 mr-2">
        
        <button
          onClick={() => navigate("/addpatient")}
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2.5 sm:py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap flex items-center justify-center gap-2">
           
          + Add New Patient
        </button>
      </div>
    </div>
  );
}