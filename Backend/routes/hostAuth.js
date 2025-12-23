// //hostAuth.js
// import express from 'express';
// import { hostLogin, getHostProfile } from '../controllers/hostAuthController.js';
// import hostAuthMiddleware from '../middleware/hostAuth.js';


// const router = express.Router();

// // Public routes
// router.post('/login', hostLogin);

// // Protected routes
// router.get('/profile', hostAuthMiddleware, getHostProfile);
// // Dashboard header statistics


// export default router;

// routes/hostAuth.js
import express from 'express';
import { hostLogin, getHostProfile } from '../controllers/hostAuthController.js';
import hostAuthMiddleware from '../middleware/hostAuth.js';

const router = express.Router();

// Public route - no middleware
router.post('/login', hostLogin);

// Protected route - with hostAuthMiddleware
router.get('/profile', hostAuthMiddleware, getHostProfile);

export default router;