import React from "react";
const paymentColors = {
  Paid: "bg-green-100 text-green-600",
  Unpaid: "bg-yellow-100 text-yellow-600",
};

const PaymentBadge = ({ payment }) => (
  <span className={`text-xs px-2 py-1 rounded-full font-medium ${paymentColors[payment]}`}>
    {payment}
  </span>
);

export default PaymentBadge;
