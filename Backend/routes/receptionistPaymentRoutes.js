import express from 'express';
import { createOrder, verifyPayment } from '../controllers/receptionistPaymentController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
 
const router = express.Router();
 
router.post('/create-order', verifyToken, createOrder);
router.post('/verify-payment', verifyToken, verifyPayment);
 
export default router;