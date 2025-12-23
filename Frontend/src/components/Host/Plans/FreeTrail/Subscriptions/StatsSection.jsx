import React from 'react';

const StatCard = ({ title, value, bgColor = "bg-green-100" }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
    <h3 className="text-sm text-gray-600 mb-2">{title}</h3>
    <div className="flex items-center justify-between">
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      <div className={`w-16 h-8 ${bgColor} rounded-md`}></div>
    </div>
  </div>
);

const StatsSection = () => {
  const stats = [
    { title: "Active Yearly Subscriptions", value: "892" },
    { title: "Active Monthly Subscriptions", value: "25" },
    { title: "Revenue This Month", value: "25" },
    { title: "Total Revenue", value: "25" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} title={stat.title} value={stat.value} />
      ))}
    </div>
  );
};

export default StatsSection;