import React from "react";
const Badge = ({ text, colorClass }) => (
  <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
    {text}
  </span>
);
export default Badge;
