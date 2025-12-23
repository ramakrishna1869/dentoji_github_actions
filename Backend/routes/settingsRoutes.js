// settingsRoutes.js
import express from "express";
import { 
  getSettings, 
  updateSettings, 
  triggerBackup, 
  getSystemStats 
} from "../controllers/settingsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user settings
router.get("/", verifyToken, getSettings);

// Update user settings
router.put("/", verifyToken, updateSettings);

// Trigger manual backup
router.post("/backup", verifyToken, triggerBackup);

// Get system statistics
router.get("/stats", verifyToken, getSystemStats);

export default router;
