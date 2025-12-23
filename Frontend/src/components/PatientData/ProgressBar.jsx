import React from 'react';

export default function ProgressBar({ label, percentage, color }) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600',
    green: 'bg-green-500 text-green-600',
    yellow: 'bg-yellow-400 text-yellow-500',
  };

  const barColor = colorClasses[color]?.split(' ')[0];
  const textColor = colorClasses[color]?.split(' ')[1];

  return (
    <div className="space-y-1 mb-3"> {/* ✅ Added mb-3 for bottom space */}
      <div className="flex justify-between text-xs font-semibold text-black/70"> {/* ✅ font-semibold */}
        <span>{label}</span>
        <span className={`${textColor}`}>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 ">
        <div
          className={`${barColor} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
