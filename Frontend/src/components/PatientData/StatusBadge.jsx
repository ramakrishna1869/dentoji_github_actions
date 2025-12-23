import React from 'react';

export default function StatusBadge({ status }) {
  const colors = {
    Active: 'bg-green-100 text-green-800',
    Scheduled: 'bg-blue-100 text-blue-800',
    Completed: 'bg-purple-100 text-purple-800',
    Paid: 'bg-green-100 text-green-800',
    Ongoing: 'bg-yellow-100 text-yellow-800',
    Treated: 'bg-gray-100 text-gray-800'
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}
