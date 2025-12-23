// // routes/hospitalRoutes.js
// import express from "express";
// import { createHospital } from "../controllers/hospitalController.js";
// import { verifyToken } from "../middleware/authMiddleware.js";
// import Patient from "../models/Patient.js";
// import Admin from "../models/Admin.js";
// import Hospital from "../models/Hospital.js";

// const router = express.Router();

// router.post("/", verifyToken, createHospital); // 👈 protected route


// router.get('/:hospitalId/:adminId/generate-patient-id', async (req, res) => {
//   const { hospitalId, adminId } = req.params;
//   try {
//     const admin = await Admin.findById(adminId);
//     const hospital = await Hospital.findById(hospitalId);

//     if (!admin || !hospital) {
//       return res.status(404).json({ error: 'Admin or Hospital not found' });
//     }

//     let length = 2; // start with 2 letters
//     let unique = false;
//     let patientId = "";

//     // Keep trying until unique
//     while (!unique) {
//       // Slice `length` letters (if name shorter, slice won’t break)
//       const adminPart = admin.name.slice(0, length).toUpperCase();
//       const hospitalPart = hospital.name.slice(0, length).toUpperCase();
//       const locationPart = hospital.location.slice(0, length).toUpperCase();

//       // Count patients for this hospital (to append number part)
//       const patientCount = await Patient.countDocuments({ hospitalId });
//       const paddedNumber = String(patientCount + 1).padStart(2, "0");

//       // Format ID
//       patientId = `${adminPart}${hospitalPart}${locationPart}00${paddedNumber}`;

//       // Check uniqueness in entire collection
//       const exists = await Patient.findOne({ patientId });

//       if (!exists) {
//         unique = true; // ✅ Unique, stop loop
//       } else {
//         // Increase slice length
//         length++;

//         // If fields are too short and still collisions → add random fallback
//         if (
//           length > Math.max(admin.name.length, hospital.name.length, hospital.location.length)
//         ) {
//           patientId = `${adminPart}${hospitalPart}${locationPart}00${paddedNumber}${Math.floor(
//             1000 + Math.random() * 9000
//           )}`;
//           unique = true;
//         }
//       }
//     }

//     return res.json({ patientId });
//   } catch (err) {
//     console.error("Error generating patient ID:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

//  export default router;


// routes/hospitalRoutes.js
import express from "express";
import { createHospital } from "../controllers/hospitalController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import Patient from "../models/Patient.js";
import Admin from "../models/Admin.js";
import Hospital from "../models/Hospital.js";
import Receptionist from "../models/Receptionist.js";

const router = express.Router();

router.post("/", verifyToken, createHospital); // 👈 protected route

// NEW ROUTE - Works for both Admin and Receptionist
router.get('/:hospitalId/generate-patient-id', verifyToken, async (req, res) => {
  const { hospitalId } = req.params;
  const { id: userId, role } = req.user; // From JWT token

  try {
    //console.log(`Patient ID generation request from ${role}:`, { hospitalId, userId });

    // Get hospital data
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    let admin;
    
    if (role === 'Admin') {
      // If admin is requesting, use their data
      admin = await Admin.findById(userId);
      if (!admin || admin._id.toString() !== hospital.adminId.toString()) {
        return res.status(403).json({ error: 'Access denied. You are not the admin of this hospital.' });
      }
    } else if (role === 'Receptionist') {
      // If receptionist is requesting, get the hospital's admin data
      const receptionist = await Receptionist.findById(userId);
      if (!receptionist || receptionist.hospitalId.toString() !== hospitalId) {
        return res.status(403).json({ error: 'Access denied. You do not belong to this hospital.' });
      }
      
      // Get the admin data for this hospital
      admin = await Admin.findById(hospital.adminId);
      if (!admin) {
        return res.status(404).json({ error: 'Hospital admin not found' });
      }
    } else {
      return res.status(403).json({ error: 'Access denied. Invalid role.' });
    }

    let length = 2; // start with 2 letters
    let unique = false;
    let patientId = "";

    // Keep trying until unique
    while (!unique) {
      // Slice `length` letters (if name shorter, slice won't break)
      const adminPart = admin.name.slice(0, length).toUpperCase();
      const hospitalPart = hospital.name.slice(0, length).toUpperCase();
      const locationPart = hospital.location.slice(0, length).toUpperCase();

      // Count patients for this hospital (to append number part)
      const patientCount = await Patient.countDocuments({ hospitalId });
      const paddedNumber = String(patientCount + 1).padStart(2, "0");

      // Format ID - Same format for both Admin and Receptionist
      patientId = `${adminPart}${hospitalPart}${locationPart}00${paddedNumber}`;

      // Check uniqueness in entire collection
      const exists = await Patient.findOne({ patientId });

      if (!exists) {
        unique = true; // ✅ Unique, stop loop
      } else {
        // Increase slice length
        length++;

        // If fields are too short and still collisions → add random fallback
        if (
          length > Math.max(admin.name.length, hospital.name.length, hospital.location.length)
        ) {
          patientId = `${adminPart}${hospitalPart}${locationPart}00${paddedNumber}${Math.floor(
            1000 + Math.random() * 9000
          )}`;
          unique = true;
        }
      }
    }

    //console.log(`Generated patient ID: ${patientId} for ${role}`);
    return res.json({ patientId });
  } catch (err) {
    console.error("Error generating patient ID:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// KEEP OLD ROUTE for backward compatibility (optional)
//router.get('/:hospitalId/:adminId/generate-patient-id', async (req, res) => {
  router.get('/:hospitalId/:adminId/generate-patient-id', verifyToken, async (req, res) => {
  const { hospitalId, adminId } = req.params;
  try {
    const admin = await Admin.findById(adminId);
    const hospital = await Hospital.findById(hospitalId);

    if (!admin || !hospital) {
      return res.status(404).json({ error: 'Admin or Hospital not found' });
    }

    let length = 2; // start with 2 letters
    let unique = false;
    let patientId = "";

    // Keep trying until unique
    while (!unique) {
      // Slice `length` letters (if name shorter, slice won't break)
      const adminPart = admin.name.slice(0, length).toUpperCase();
      const hospitalPart = hospital.name.slice(0, length).toUpperCase();
      const locationPart = hospital.location.slice(0, length).toUpperCase();

      // Count patients for this hospital (to append number part)
      const patientCount = await Patient.countDocuments({ hospitalId });
      const paddedNumber = String(patientCount + 1).padStart(2, "0");

      // Format ID
      patientId = `${adminPart}${hospitalPart}${locationPart}00${paddedNumber}`;

      // Check uniqueness in entire collection
      const exists = await Patient.findOne({ patientId });

      if (!exists) {
        unique = true; // ✅ Unique, stop loop
      } else {
        // Increase slice length
        length++;

        // If fields are too short and still collisions → add random fallback
        if (
          length > Math.max(admin.name.length, hospital.name.length, hospital.location.length)
        ) {
          patientId = `${adminPart}${hospitalPart}${locationPart}00${paddedNumber}${Math.floor(
            1000 + Math.random() * 9000
          )}`;
          unique = true;
        }
      }
    }

    return res.json({ patientId });
  } catch (err) {
    console.error("Error generating patient ID:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;