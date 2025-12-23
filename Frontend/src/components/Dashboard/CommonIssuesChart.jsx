//CommonIssuesChart
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Make sure to import jwtDecode

const CommonDentalIssuesChart = ({ hospitalId: propHospitalId }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hospitalId, setHospitalId] = useState(propHospitalId || null);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);

  useEffect(() => {
    const fetchHospitalId = async () => {
      // If hospitalId is already provided as prop, use it
      if (propHospitalId) {
        setHospitalId(propHospitalId);
        return propHospitalId;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        const decoded = jwtDecode(token);
        const role = decoded.role;
        const userId = decoded.id;

        let fetchedHospitalId = null;

        // First, try to get hospital ID from the token
        if (decoded.hospitalId) {
          fetchedHospitalId = decoded.hospitalId;
          //console.log("Hospital ID from token:", fetchedHospitalId);
        } else {
          // If not in token, fetch from profile endpoint
          //console.log("Fetching profile to get hospital ID...");
          const profileResponse = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          //console.log("Profile response:", profileResponse.data);

          if (role === "Admin" && profileResponse.data.hospital) {
            fetchedHospitalId = profileResponse.data.hospital._id;
            //console.log("Hospital ID from profile (Admin):", fetchedHospitalId);
          } else if (role === "Receptionist") {
            // For receptionists, get hospitalId directly from the receptionist object
            const receptionistData = profileResponse.data.receptionist;
            if (receptionistData && receptionistData.hospitalId) {
              fetchedHospitalId = receptionistData.hospitalId;
              //console.log("Hospital ID from profile (Receptionist):", fetchedHospitalId);
            } else {
              //console.error("Receptionist data or hospitalId not found in profile response");
            }
          }
        }

        if (!fetchedHospitalId) {
          if (role === "Admin") {
            throw new Error("No hospital found. Please complete hospital setup by going to Hospital Form.");
          } else {
            throw new Error("No hospital association found. Please contact your administrator.");
          }
        }

        setHospitalId(fetchedHospitalId);
        return fetchedHospitalId;
      } catch (err) {
       // console.error("Error fetching hospital ID:", err);
        throw err;
      }
    };

    const fetchDentalIssues = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get hospital ID (either from props or by fetching)
        const currentHospitalId = await fetchHospitalId();

        if (!currentHospitalId) {
          throw new Error("Please provide a hospital ID to view dental issues");
        }

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found. Please log in.");
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/patients/dental-issues/stats?hospitalId=${currentHospitalId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setChartData(response.data.data || []);
        setTotalPatients(response.data.totalPatients || 0);
        setTotalCategories(response.data.totalCategories || 0);
        setLoading(false);
      } catch (err) {
      //  console.error("Error fetching dental issues:", err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Failed to load dental issues data"
        );
        setLoading(false);
      }
    };

    fetchDentalIssues();
  }, [propHospitalId]); // Re-run when propHospitalId changes

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Common Dental Issues
        </h2>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm w-full h-94 mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Common Dental Issues
        </h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm w-full h-94 mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Common Dental Issues
        </h2>
        <p className="text-gray-600">No dental issues data available for this hospital</p>
      </div>
    );
  }

 return (
  <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm w-full h-full  mx-auto ">
    <div className="mb-6 sm:mb-8">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
        Common Dental Issues
      </h2>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
          <span>Total Patients: <strong className="text-gray-900">{totalPatients}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
          <span>Categories: <strong className="text-gray-900">{totalCategories}</strong></span>
        </div>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row items-center justify-between  ">
      {/* Chart */}
      <div className=" h-50 w-52  flex-shrink-0  ">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value, name, props) => [
                `${value}% (${props.payload.count} patients)`, 
                name
              ]}
              contentStyle={{
                borderRadius: "0.5rem",
                border: "none",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ display: "none" }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={1}
              dataKey="value"
              startAngle={90}
              endAngle={450}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-col sm:space-y-3 w-full sm:max-w-xs ">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2 sm:gap-3">
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-xs sm:text-sm text-gray-600 font-medium truncate">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
};

export default CommonDentalIssuesChart;