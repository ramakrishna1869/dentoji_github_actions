//hospitalController
import Hospital from "../models/Hospital.js";
import mongoose from "mongoose"; // Import mongoose for validation

export const createHospital = async (req, res) => {
  try {
    const { name, location, adminId: bodyAdminId } = req.body; // Extract adminId from body if sent
    const userId = req.user?.id; // Use the authenticated user's ID from middleware

    //console.log("🟡 Body:", req.body);
    //console.log("🟡 Authenticated User ID:", userId);

    // Validate required fields
    if (!name || !location) {
      return res.status(400).json({ message: "Hospital name and location are required" });
    }

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Valid authenticated user ID is required" });
    }

    // If adminId is sent in the body, validate it matches the authenticated user
    if (bodyAdminId && bodyAdminId !== userId) {
      return res.status(403).json({ message: "Unauthorized: adminId does not match authenticated user" });
    }

    // Use the authenticated userId as adminId if not provided in body
    const adminId = bodyAdminId || userId;

    const existingHospital = await Hospital.findOne({ adminId });
    if (existingHospital) {
      return res.status(400).json({ message: "Hospital already exists for this admin" });
    }

    const newHospital = new Hospital({ name, location, adminId });
    await newHospital.save();

    res.status(201).json({
      message: "Hospital created successfully",
      hospital: newHospital,
    });
  } catch (error) {
    console.error("❌ Hospital creation error:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      message: "Server error while creating hospital",
      error: error.message,
    });
  }
};
