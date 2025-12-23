// // import React from "react";
// // import {  Wallet } from "lucide-react";

// // export default function PaymentHistoryCard({ paymentHistory }) {
// //   return (
// //     <div className="bg-white rounded-xl shadow p-6 min-h-64 flex flex-col justify-between">
// //       <div>
// //         <div className="flex items-center gap-2 mb-4">
// //           <Wallet className="text-green-500 w-6 h-6" />
// //           <h2 className="text-sm font-semibold">Payment History</h2>
// //         </div>
// //         <div className="text-sm text-gray-800 space-y-3">
// //           <div className="flex justify-between">
// //             <span className="text-gray-500">Total Paid</span>
// //             <span className="text-green-600 font-semibold">$2,450</span>
// //           </div>
// //           <div className="flex justify-between">
// //             <span className="text-gray-500">Op Fee</span>
// //             <span className="text-red-500 font-semibold">$150</span>
// //           </div>
// //           <div className="flex justify-between">
// //             <span className="text-gray-500">Last Payment</span>
// //             <span className="font-semibold text-black">$200 · Jun 28, 2025</span>
// //           </div>
// //           <div className="flex justify-between">
// //             <span className="text-gray-500">Payment Method</span>
// //             <span className="font-semibold text-black">Manual</span>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// import React from "react";
// import { Wallet } from "lucide-react";

// export default function PaymentHistoryCard({ paymentHistory }) {
//   return (
//     <div className="bg-white rounded-xl shadow p-6 min-h-64 flex flex-col justify-between">
//       <div>
//         <div className="flex items-center gap-2 mb-4">
//           <Wallet className="text-green-500 w-6 h-6" />
//           <h2 className="text-sm font-semibold">Payment History</h2>
//         </div>
//         <div className="text-sm text-gray-800 space-y-3">
//           <div className="flex justify-between">
//             <span className="text-gray-500">Total Paid</span>
//             <span className="text-green-600 font-semibold">
//               {paymentHistory?.totalPaid || "N/A"}
//             </span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-500">Op Fee</span>
//             <span className="text-red-500 font-semibold">
//               {paymentHistory?.opFee || "N/A"}
//             </span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-500">Last Payment</span>
//             <span className="font-semibold text-black">
//               {paymentHistory?.lastPayment
//                 ? `${paymentHistory.lastPayment}`
//                 : "N/A"}
//             </span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-500">Payment Method</span>
//             <span className="font-semibold text-black">
//               {paymentHistory?.paymentMethod || "N/A"}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // PaymentHistoryCard.jsx
// import React from "react";
// import { Wallet } from "lucide-react";

// export default function PaymentHistoryCard({ patientData }) {
//   // Extract payment history from the aggregated data
//   const paymentHistory = patientData?.paymentHistory || [];
  
//   // Calculate totals and get latest payment info
//   const calculatePaymentStats = () => {
//     if (!paymentHistory.length) {
//       return {
//         totalPaid: "0",
//         opFee: "0", 
//         lastPayment: "No payments",
//         paymentMethod: "N/A"
//       };
//     }

//     // Calculate total paid
//     const totalPaid = paymentHistory.reduce((sum, payment) => {
//       return sum + (payment.amount || 0);
//     }, 0);

//     // Get the most recent payment
//     const sortedPayments = paymentHistory.sort((a, b) => 
//       new Date(b.paymentDate || b.createdAt) - new Date(a.paymentDate || a.createdAt)
//     );
//     const lastPayment = sortedPayments[0];

//     // Calculate outstanding fees (you might need to adjust this logic)
//     const opFee = paymentHistory.reduce((sum, payment) => {
//       return sum + (payment.outstandingAmount || 0);
//     }, 0);

//     return {
//       totalPaid: totalPaid.toString(),
//       opFee: opFee.toString(),
//       lastPayment: lastPayment 
//         ? `$${lastPayment.amount} · ${new Date(lastPayment.paymentDate || lastPayment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
//         : "No payments",
//       paymentMethod: lastPayment?.paymentMethod || "N/A"
//     };
//   };

//   const paymentStats = calculatePaymentStats();

//   const formatCurrency = (value) => {
//     if (value === "N/A" || !value || value === "0") return value === "0" ? "$0" : "N/A";
//     return `$${value}`;
//   };

//   return (
//     <div className="bg-white rounded-xl shadow p-6 min-h-64 flex flex-col justify-between">
//       <div>
//         <div className="flex items-center gap-2 mb-4">
//           <Wallet className="text-green-500 w-6 h-6" />
//           <h2 className="text-sm font-semibold">Payment History</h2>
//         </div>
//         <div className="text-sm text-gray-800 space-y-3">
//           <div className="flex justify-between">
//             <span className="text-gray-500">Total Paid</span>
//             <span className="text-green-600 font-semibold">
//               {formatCurrency(paymentStats.totalPaid)}
//             </span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-500">Outstanding Fee</span>
//             <span className="text-red-500 font-semibold">
//               {formatCurrency(paymentStats.opFee)}
//             </span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-500">Last Payment</span>
//             <span className="font-semibold text-black">
//               {paymentStats.lastPayment}
//             </span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-gray-500">Payment Method</span>
//             <span className="font-semibold text-black">
//               {paymentStats.paymentMethod}
//             </span>
//           </div>
//         </div>
//       </div>
      
//       {/* Optional: Show number of payments */}
//       <div className="mt-4 pt-4 border-t border-gray-100">
//         <div className="text-xs text-gray-500 text-center">
//           {paymentHistory.length} payment{paymentHistory.length !== 1 ? 's' : ''} recorded
//         </div>
//       </div>
//     </div>
//   );
// }



// PaymentHistoryCard.jsx
import React from "react";
import { Wallet } from "lucide-react";

export default function PaymentHistoryCard({ patientData }) {
  //console.log("PaymentHistoryCard - patientData:", patientData); // Debug log

  // Extract payment information directly from patient data
  const getPaymentValue = (field, fallback = "-") => {
    const value = patientData?.[field];
    if (value && value !== "" && value !== null && value !== undefined) {
      return value;
    }
    return fallback;
  };

  const totalPaid = getPaymentValue('totalPaid', "0");
  const opFee = getPaymentValue('opFee', "0");
  const lastPayment = getPaymentValue('lastPayment', "No payments");
  const paymentMethod = getPaymentValue('paymentMethod', "-");

  const formatCurrency = (value) => {
    if (!value || value === "-" || value === "No payments") {
      return value;
    }
    
    // If it already has $ sign, return as is
    if (typeof value === 'string' && value.includes('')) {
      return value;
    }
    
    // If it's a number or numeric string, add $ sign
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      return `$${numValue}`;
    }
    
    return value;
  };

  // Determine if there are any payments
  const hasPayments = totalPaid && totalPaid !== "0" && totalPaid !== "" && totalPaid !== "-";
  const paymentCount = hasPayments ? 1 : 0; // Since you're storing single values, not an array

  return (
    <div className="bg-white rounded-xl shadow p-6 min-h-64 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="text-green-500 w-6 h-6" />
          <h2 className="text-sm font-semibold">Payment History</h2>
        </div>
        <div className="text-sm text-gray-800 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">Total Paid</span>
            <span className="text-green-600 font-semibold">
              {formatCurrency(totalPaid)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Outstanding Fee</span>
            <span className="text-red-500 font-semibold">
              {formatCurrency(opFee)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Last Payment</span>
            <span className="font-semibold text-black">
              {lastPayment === "No payments" ? lastPayment : formatCurrency(lastPayment)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Method</span>
            <span className="font-semibold text-black">
              {paymentMethod}
            </span>
          </div>
        </div>
      </div>
      
      {/* Show payment count */}
      {/* <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500 text-center">
          {paymentCount} payment{paymentCount !== 1 ? 's' : ''} recorded
        </div>
      </div> */}
    </div>
  );
}