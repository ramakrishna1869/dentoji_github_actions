

import React from "react";
import { User } from "lucide-react";

export default function PatientInfoCard({ patientData }) {
  //console.log("hi",patientData);
  return (
    <div className="bg-white rounded-xl shadow p-6 min-h-64 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <User className="text-blue-500 w-6 h-6" />
          <h2 className="text-sm font-semibold">Personal Information</h2>
        </div>
        <div className="text-sm text-gray-700 space-y-3">
          <div>
            <span className="text-gray-500">Full Name</span><br />
            <span className="font-semibold text-black">{patientData?.firstName || ""} {patientData?.lastName || ''}</span>
          </div>
          <div>
            <span className="text-gray-500">Age</span><br />
            <span className="font-semibold text-black">{patientData?.age || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">Gender</span><br />
            <span className="font-semibold text-black">{patientData?.gender || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">Phone</span><br />
            <span className="font-semibold text-black">{patientData?.primaryNumber || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">Email</span><br />
            <span className="font-semibold text-black">{patientData?.emailAddress || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">Address</span><br />
            <span className="font-semibold text-black">{patientData?.address || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
