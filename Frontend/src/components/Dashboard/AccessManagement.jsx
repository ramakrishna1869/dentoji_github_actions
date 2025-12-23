//AccessManagament.jsx
import React, { useState } from "react";

const AccessManagement = () => {
  const [users, setUsers] = useState([
    { name: "Sowmya", lastActive: "2 hours ago", status: "revoked" },
    { name: "Akhil", lastActive: "10 minutes ago", status: "granted" },
    { name: "Venu", lastActive: "1 day ago", status: "revoked" },
  ]);

  const handleGrantAccess = (index) => {
    const updatedUsers = [...users];
    updatedUsers[index].status = "granted";
    setUsers(updatedUsers);
  };

  const handleRevokeAccess = (index) => {
    const updatedUsers = [...users];
    updatedUsers[index].status = "revoked";
    setUsers(updatedUsers);
  };

  const getStatusBadge = (status) => {
    if (status === "granted") {
      return (
        <span
          className="px-4 py-2 rounded-full text-sm font-medium"
          style={{ backgroundColor: "#E8F5E8", color: "#16A353" }}
        >
          Access Granted
        </span>
      );
    } else {
      return (
        <span
          className="px-4 py-2 rounded-full text-sm font-medium"
          style={{ backgroundColor: "#FEE8E6", color: "#DF3226" }}
        >
          Access Revoked
        </span>
      );
    }
  };

  const getActionButton = (status, index) => {
    if (status === "granted") {
      return (
        <button
          onClick={() => handleRevokeAccess(index)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer"
          style={{ backgroundColor: "#DF3226" }}
        >
          Revoke Access
        </button>
      );
    } else {
      return (
        <button
          onClick={() => handleGrantAccess(index)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white cursor-pointer"
          style={{ backgroundColor: "#0EA5E9" }}
        >
          Grant Access
        </button>
      );
    }
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto rounded-2xl shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-900 mb-4 pb-4 border-b border-gray-100">
        Receptionist Access Management
      </h1>

      <div className="space-y-2">
        {users.map((user, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex-1">
              <h3 className="text-md font-medium text-gray-900 mb-2">
                {user.name}
              </h3>
              <p className="text-gray-500">Last Active : {user.lastActive}</p>
            </div>

            <div className="flex items-center space-x-4">
              {getStatusBadge(user.status)}
              {getActionButton(user.status, index)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccessManagement;
