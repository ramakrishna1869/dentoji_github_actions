//SystemLogs
import React from "react";

const SystemLogs = () => {
  const logs = [
    {
      message: "David Martinez added a new patient record",
      time: "Today 09:43 AM",
      type: "info",
    },
    {
      message: "Emily Wilson edited appointment details for John Doe",
      time: "Today 08:30 AM",
      type: "warning",
    },
    {
      message: "Admin revoked access for Emily Wilson",
      time: "Yesterday 05:15 PM",
      type: "error",
    },
    {
      message: "Admin granted access to David Martinez",
      time: "Aug 12 10:30 PM",
      type: "success",
    },
  ];

  const getLogColor = (type) => {
    switch (type) {
      case "info":
        return "border-l-blue-500";
      case "warning":
        return "border-l-yellow-500";
      case "error":
        return "border-l-red-500";
      case "success":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900">System Logs</h3>
        <button className="text-blue-600 text-sm cursor-pointer">View All</button>
      </div>
      <div className="space-y-4">
        {logs.map((log, index) => (
          <div
            key={index}
            className={`border-l-4 ${getLogColor(log.type)} pl-4`}
          >
            <p className="text-sm text-gray-900">{log.message}</p>
            <p className="text-xs text-gray-500 mt-1">{log.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemLogs;
