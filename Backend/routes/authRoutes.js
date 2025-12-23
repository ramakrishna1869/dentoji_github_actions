//auth routes
import express from "express";
import { 
  login, 
  signup, 
  sendOTPForEmailVerification,
  verifyEmailOTP,
  getUserProfile, 
  updateProfile,
  uploadProfileImage,

  getSubscriptionStatus,
  getUsageStats,
  deleteProfileImage,
  resetPassword,
  forgotPassword,
  verifyResetOTP


} from "../controllers/authController.js";
import { 
  verifyToken, 
  verifyTokenWithSubscription,
  checkHospitalRegistration,
  authorizeRoles,
  requireFeature,
  checkPatientLimit
} from "../middleware/authMiddleware.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads/profiles';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for profile image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${fileExtension}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// ✅ Public routes (no authentication required)
router.post("/login", login);
router.post("/signup", signup);

router.post("/send-otp", sendOTPForEmailVerification);
router.post("/verify-otp", verifyEmailOTP);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOTP);
router.post('/reset-password', resetPassword);


// ✅ Token verification endpoint (basic auth check)
router.get("/verify", verifyToken, (req, res) => {
  // Simple token verification endpoint
  res.status(200).json({ 
    message: "Token is valid",
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      hospitalId: req.user.hospitalId
    }
  });
});

// ✅ Profile routes (basic token verification)
router.get("/profile", verifyToken, getUserProfile); 
router.put("/profile", verifyToken, updateProfile);
router.post("/profile/upload-image", verifyToken, upload.single('profileImage'), uploadProfileImage);
router.delete("/profile/image", verifyToken, deleteProfileImage);

// ✅ Admin subscription management routes (require admin role)
//router.post('/create-free-trial', verifyToken, authorizeRoles(['Admin']), createFreeTrialSubscription);
router.get('/subscription-status', verifyToken, authorizeRoles(['Admin']), getSubscriptionStatus);
router.get('/usage-stats', verifyToken, authorizeRoles(['Admin']), getUsageStats);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected field name. Use "profileImage" as field name.' });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ message: error.message });
  }
  
  next(error);
});

export default router;