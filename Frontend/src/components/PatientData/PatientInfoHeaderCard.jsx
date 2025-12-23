// src/components/PatientInfoHeaderCard.jsx
import React from 'react';
export default function PatientInfoHeaderCard({ patientData }) {
  //console.log('PatientInfoHeaderCard rendered with data:', patientData);

  // Construct display data from patientData
  const displayData = {
    name: `${patientData.firstName || ''} ${patientData.lastName || ''}`.trim() || 'Unknown Patient',
    id: patientData.patientId || '-',
    // avatar:
    //   patientData.avatar ||
    //   'https://static.vecteezy.com/system/resources/thumbnails/005/346/410/small_2x/close-up-portrait-of-smiling-handsome-young-caucasian-man-face-looking-at-camera-on-isolated-light-gray-studio-background-photo.jpg',
   // status: patientData.status || 'Active',
    //patientType: patientData.patientType || 'Regular Patient',
    memberSince: patientData.memberSince
      ? new Date(patientData.memberSince).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'March 15, 2024',
    lastVisit: patientData.lastVisit
      ? new Date(patientData.lastVisit).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : 'March 15, 2024',
  };
return (
  <div className="bg-white rounded-xl sm:rounded-2xl shadow p-4 sm:p-6 flex flex-col sm:flex-row items-start justify-between gap-4">
    {/* Left: Image and Basic Info */}
    <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden cursor-pointer flex-shrink-0">
        {(patientData.image || patientData.profileImage || patientData.avatar || patientData.photo || patientData.picture) ? (
          <img 
            src={patientData.image || patientData.profileImage || patientData.avatar || patientData.photo || patientData.picture}
            alt={displayData.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
            onLoad={() => console.log('Image loaded successfully')}
            onError={(e) => {
              //console.log('Image failed to load:', e.target.src);
              //console.log('Available patient fields:', Object.keys(patientData));
            }}
          />
        ) : (
          <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-lg sm:text-xl font-semibold">
            {patientData.firstName?.[0]?.toUpperCase() || 'P'}
            {patientData.lastName?.[0]?.toUpperCase() || ''}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-base sm:text-lg font-semibold truncate">{displayData.name} </h2>
        <p className="text-xs sm:text-sm text-gray-500 truncate">Patient ID: {displayData.id}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {/* <span className="text-xs px-3 py-0.5 bg-green-100 text-green-700 rounded-full">
            {displayData.status}
          </span>
          <span className="text-xs px-3 py-0.5 bg-blue-100 text-blue-700 rounded-full">
            {displayData.patientType}
          </span> */}
        </div>
      </div>
    </div>

    {/* Right: Member Since and Last Visit */}
    <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2 w-full sm:w-auto sm:text-right">
      <div>
        <p className="text-xs text-gray-500">Member Since</p>
        <p className="text-xs sm:text-sm font-semibold">{displayData.memberSince}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500">Last Visit</p>
        <p className="text-xs sm:text-sm font-semibold">{displayData.lastVisit}</p>
      </div>
    </div>
  </div>
);
}