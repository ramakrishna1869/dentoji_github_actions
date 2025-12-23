//PatientProfileCard.jsx
import React from 'react';
import { CheckCircle } from 'lucide-react';

// export default function PatientProfileCard({ profile }) {
//   return (
//     <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
//       <img src={''}  alt={`${patient.firstName || ''} ${patient.lastName || ''}`} className="w-16 h-16 rounded-full object-cover" />
//       <div>
//         <h2 className="text-lg font-semibold">{profile.name}</h2>
//         <p className="text-gray-500">ID: {profile.id}</p>
//         <div className="flex items-center space-x-2 mt-1">
//           <span className="text-green-600 text-xs flex items-center"><CheckCircle className="w-4 h-4 mr-1" /> {profile.status}</span>
//           <span className="text-blue-600 text-xs">{profile.type}</span>
//         </div>
//       </div>
//     </div>
//   );
// }


export default function PatientProfileCard({ profile, patientData }) {
  const patient = patientData || profile; // Use patientData if available, fallback to profile
  
  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden cursor-pointer">
        {(patient.image || patient.profileImage || patient.avatar || patient.photo || patient.picture) ? (
          <img 
            src={patient.image || patient.profileImage || patient.avatar || patient.photo || patient.picture}
            alt={`${patient.firstName || ''} ${patient.lastName || ''}`}
            className="w-16 h-16 rounded-full object-cover"
            onLoad={() => //console.log('Image loaded successfully')}
            onError={(e) => {
              //console.log('Image failed to load:', e.target.src);
              //console.log('Available patient fields:', Object.keys(patient));
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-semibold">
            {patient.firstName?.[0]?.toUpperCase() || 'P'}
            {patient.lastName?.[0]?.toUpperCase() || ''}
          </div>
        )}
      </div>
      <div>
        <h2 className="text-lg font-semibold">{patient.firstName} {patient.lastName}</h2>
        <p className="text-gray-500">ID: {patient.patientId}</p>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-green-600 text-xs flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" /> {patient.status || 'Active'}
          </span>
          <span className="text-blue-600 text-xs">{patient.patientType || 'Regular'}</span>
        </div>
      </div>
    </div>
  );
}

