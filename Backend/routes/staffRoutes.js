// // routes/staffRoutes.js
// import express from "express";
// import {
//   createStaff,
//   getStaffByHospital,
//   getStaffMember,
//   updateStaff,
//   deleteStaff,
// } from "../controllers/staffController.js";
// import { verifyToken } from '../middleware/authMiddleware.js'; // Add this import

// const router = express.Router();

// // POST /api/staff/:hospitalId - Create staff (with auth middleware)
// router.post(
//   "/:hospitalId",
//   verifyToken, // Add authentication middleware
//   (req, res, next) => {
//     req.body.hospital = req.params.hospitalId;
//     next();
//   },
//   createStaff
// );

// // GET /api/staff/:hospitalId - Get staff by hospital (with auth middleware)
// router.get("/:hospitalId", verifyToken, getStaffByHospital);

// // GET /api/staff/member/:id - Get single staff member (with auth middleware)
// router.get("/member/:id", verifyToken, getStaffMember);

// // PUT /api/staff/:id - Update staff (with auth middleware)
// router.put("/:id", verifyToken, updateStaff);

// // DELETE /api/staff/:id - Delete staff (with auth middleware)
// router.delete("/:id", verifyToken, deleteStaff);

// export default router;


//Staff Routes

import express from 'express';
import { 
  createStaff, 
  getStaff, 
  updateStaff, 
  deleteStaff 
} from '../controllers/staffController.js';

const router = express.Router();

// Create staff member
router.post('/:hospitalId', createStaff);

// Get all staff members
router.get('/list', getStaff);

// Update staff member
router.put('/:id', updateStaff);

// Delete staff member
router.delete('/:id', deleteStaff);

export default router;

