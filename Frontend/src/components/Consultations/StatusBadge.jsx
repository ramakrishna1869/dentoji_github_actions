import React from "react";
const statusColors = {
  Scheduled: "bg-blue-100 text-blue-600",
  Completed: "bg-green-100 text-green-600",
  "High Urgency": "bg-red-100 text-red-600",
};

const StatusBadge = ({ status }) => (
  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[status]}`}>
    {status}
  </span>
);

export default StatusBadge;
