//Dashboard StatCard.jsx
import React from "react";
import { Users, Calendar, DollarSign } from "lucide-react";
 
export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  bgColor,
  textColor,
}) {
return (
  <div className="bg-white rounded-2xl shadow p-4 sm:p-6 flex items-center justify-between w-full h-20">
    <div className="flex-1 min-w-0">
      <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-black mt-1 truncate">{value}</p>
      {subtitle && (
        <p
          className={`text-xs sm:text-sm mt-1 flex items-center ${
            subtitle.toLowerCase().includes("increase")
              ? "text-green-500"
              : subtitle.toLowerCase().includes("decrease")
              ? "text-red-500"
              : "text-gray-500"
          }`}
        >
          <span className="mr-1">
            {subtitle.toLowerCase().includes("increase")
              ? "↗"
              : subtitle.toLowerCase().includes("decrease")
              ? "↘"
              : ""}
          </span>
          <span className="truncate">{subtitle}</span>
        </p>
      )}
    </div>
    <div
      className={`p-2 rounded-xl ${bgColor} flex items-center justify-center h-10 w-10 sm:h-10 sm:w-10 flex-shrink-0 ml-3`}
    >
      <div className={textColor}>{icon}</div>
    </div>
  </div>
);
}
// Main component to display the three stat cards
const Dashboard = () => {
  return (
    <div className="p-3 sm:p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      <StatCard
        title="Total Patients"
        value="150"
        subtitle="25 new this month"
        icon={<Users />}
        bgColor="bg-blue-100"
        textColor="text-blue-600"
      />
      <StatCard
        title="Total Appointments"
        value="200"
        subtitle="All time"
        icon={<Calendar />}
        bgColor="bg-purple-100"
        textColor="text-purple-600"
      />
      {/* <StatCard
        title="Monthly Revenue"
        value="$18,390"
        subtitle="From completed appointments"
        icon={<DollarSign />}
        bgColor="bg-green-100"
        textColor="text-green-600"
      /> */}
    </div>
  );
};
 