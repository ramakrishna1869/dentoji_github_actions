// HostLogoutPage.jsx
import React, { useEffect } from "react";

export default function HostLogoutPage() {
  useEffect(() => {
    // Clear local storage (only host keys)
    localStorage.removeItem("current_user_type");
    localStorage.removeItem("host_auth_token");
    localStorage.removeItem("host_user_data");
    sessionStorage.clear();

    // Redirect after 1.5s
    const timer = setTimeout(() => {
      window.location.href = "/host/login";
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner animation */}
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-gray-700 animate-pulse">
          Logging you out...
        </p>
      </div>
    </div>
  );
}
