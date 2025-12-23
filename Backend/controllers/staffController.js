
// // controllers/staffController.js
// import mongoose from 'mongoose';
// import Staff from "../models/Staff.js";
// import Receptionist from '../models/Receptionist.js';
// import Hospital from '../models/hospital.js';

// // POST /api/staff/:hospitalId - Create new staff
// export const createStaff = async (req, res) => {
//   try {
//     //console.log('📝 Creating new staff:', req.body);
//     //console.log('👤 User from token:', req.user);
    
//     const userRole = req.user.role;
//     const userId = req.user.id;
//     const { hospitalId } = req.params;

//     let staffData = { ...req.body };

//     if (userRole === 'Receptionist') {
//       const receptionist = await Receptionist.findById(userId);
//       if (!receptionist) {
//         return res.status(404).json({ message: 'Receptionist not found' });
//       }
//       staffData.hospitalId = receptionist.hospitalId;
//       staffData.adminId = receptionist.admin;
//     } else if (userRole === 'Admin') {
//       staffData.adminId = userId;
      
//       // Verify hospital belongs to this admin
//       const hospital = await Hospital.findOne({ _id: hospitalId, adminId: userId });
//       if (!hospital) {
//         return res.status(404).json({ message: 'Hospital not found or unauthorized' });
//       }
//       staffData.hospitalId = hospitalId;
//     }

//     const staff = new Staff(staffData);
//     const savedStaff = await staff.save();

//     //console.log('✅ Staff created successfully:', savedStaff._id);
//     res.status(201).json(savedStaff);
//   } catch (error) {
//     console.error('❌ Error creating staff:', error);
//     if (error.code === 11000) {
//       return res.status(400).json({ message: 'Duplicate staff entry' });
//     }
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // GET /api/staff/:hospitalId - Get staff by hospital with role-based filtering
// export const getStaffByHospital = async (req, res) => {
//   try {
//     //console.log('🔍 GET /api/staff/:hospitalId - Params:', req.params);
//     //console.log('👤 User from token:', req.user);

//     const { hospitalId } = req.params;
//     const userRole = req.user.role;
//     const userId = req.user.id;

//     if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
//       return res.status(400).json({ message: 'Invalid hospital ID format' });
//     }

//     let filter = { hospitalId: new mongoose.Types.ObjectId(hospitalId) };

//     if (userRole === 'Receptionist') {
//       const receptionist = await Receptionist.findById(userId);
//       if (!receptionist || receptionist.hospitalId.toString() !== hospitalId) {
//         return res.status(403).json({ message: 'Unauthorized access to hospital staff' });
//       }
//       filter.adminId = receptionist.admin;
//     } else if (userRole === 'Admin') {
//       filter.adminId = new mongoose.Types.ObjectId(userId);
      
//       // Verify hospital belongs to this admin
//       const hospital = await Hospital.findOne({ _id: hospitalId, adminId: userId });
//       if (!hospital) {
//         return res.status(403).json({ message: 'Unauthorized access to hospital staff' });
//       }
//     }

//     //console.log('🔎 Database filter:', filter);

//     const staff = await Staff.find(filter).sort({ createdAt: -1 });
//     //console.log(`✅ Found ${staff.length} staff members`);

//     res.json(staff);
//   } catch (error) {
//     console.error('❌ Error fetching staff:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // GET /api/staff/member/:id - Get single staff member
// export const getStaffMember = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userRole = req.user.role;
//     const userId = req.user.id;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: 'Invalid staff ID format' });
//     }

//     let filter = { _id: new mongoose.Types.ObjectId(id) };

//     // Add role-based filtering
//     if (userRole === 'Receptionist') {
//       const receptionist = await Receptionist.findById(userId);
//       if (receptionist) {
//         filter.hospitalId = receptionist.hospitalId;
//         filter.adminId = receptionist.admin;
//       }
//     } else if (userRole === 'Admin') {
//       filter.adminId = new mongoose.Types.ObjectId(userId);
//     }

//     const staff = await Staff.findOne(filter);
    
//     if (!staff) {
//       return res.status(404).json({ message: "Staff member not found" });
//     }

//     res.json(staff);
//   } catch (error) {
//     console.error('❌ Error fetching staff member:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // PUT /api/staff/:id - Update staff
// export const updateStaff = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userRole = req.user.role;
//     const userId = req.user.id;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: 'Invalid staff ID format' });
//     }

//     let filter = { _id: new mongoose.Types.ObjectId(id) };

//     // Add role-based filtering
//     if (userRole === 'Receptionist') {
//       const receptionist = await Receptionist.findById(userId);
//       if (receptionist) {
//         filter.hospitalId = receptionist.hospitalId;
//         filter.adminId = receptionist.admin;
//       }
//     } else if (userRole === 'Admin') {
//       filter.adminId = new mongoose.Types.ObjectId(userId);
//     }

//     const updatedStaff = await Staff.findOneAndUpdate(
//       filter,
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!updatedStaff) {
//       return res.status(404).json({ message: 'Staff member not found' });
//     }

//     //console.log('✅ Staff updated successfully:', updatedStaff._id);
//     res.json(updatedStaff);
//   } catch (error) {
//     console.error('❌ Error updating staff:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // DELETE /api/staff/:id - Delete staff
// export const deleteStaff = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userRole = req.user.role;
//     const userId = req.user.id;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: 'Invalid staff ID format' });
//     }

//     let filter = { _id: new mongoose.Types.ObjectId(id) };

//     // Add role-based filtering
//     if (userRole === 'Receptionist') {
//       const receptionist = await Receptionist.findById(userId);
//       if (receptionist) {
//         filter.hospitalId = receptionist.hospitalId;
//         filter.adminId = receptionist.admin;
//       }
//     } else if (userRole === 'Admin') {
//       filter.adminId = new mongoose.Types.ObjectId(userId);
//     }

//     const deletedStaff = await Staff.findOneAndDelete(filter);

//     if (!deletedStaff) {
//       return res.status(404).json({ message: 'Staff member not found' });
//     }

//     //console.log('🗑️ Staff deleted successfully:', deletedStaff._id);
//     res.json({ message: "Staff deleted successfully", staff: deletedStaff });
//   } catch (error) {
//     console.error('❌ Error deleting staff:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };



//Staff Controller

import Staff from "../models/Staff.js";
import { jwtDecode } from 'jwt-decode';
import Receptionist from '../models/Receptionist.js';

// Create new staff member
// controllers/staffController.js

export const createStaff = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
    } catch (err) {
      console.error('JWT decode error:', err);
      return res.status(401).json({ message: 'Invalid token' });
    }

    const adminId = decoded.id;

    // Log incoming data for debugging
    console.log('Creating staff with:');
    console.log('Hospital ID:', hospitalId);
    console.log('Admin ID:', adminId);
    console.log('Body:', req.body);

    // Validate required fields
    const { firstName, lastName, email, phone, role } = req.body;
    if (!firstName || !lastName || !email || !phone || !role) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['firstName', 'lastName', 'email', 'phone', 'role']
      });
    }

    // Check for duplicate email
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(409).json({ 
        message: 'Staff member with this email already exists' 
      });
    }

    const staffData = {
      firstName,
      lastName,
      email,
      phone,
      phoneCountryCode: req.body.phoneCountryCode || '+91',
      address: req.body.address,
      role,
      department: req.body.department,
      status: req.body.status || 'Active',
      startDate: req.body.startDate,
      emergencyContactName: req.body.emergencyContactName,
      emergencyContactPhone: req.body.emergencyContactPhone,
      notes: req.body.notes,
      hospitalId,
      adminId
    };

    const newStaff = new Staff(staffData);
    await newStaff.save();

    console.log('Staff created successfully:', newStaff._id);

    // Return without populate first to test
    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      staff: newStaff
    });

  } catch (error) {
    console.error('Error creating staff:', error);
    console.error('Error stack:', error.stack);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: 'Staff member with this email already exists' 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation error',
        errors: messages 
      });
    }

    // Handle cast errors (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: `Invalid ${error.path}: ${error.value}` 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create staff member',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all staff for a hospital
export const getStaff = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwtDecode(token);
    const adminId = decoded.id;

    const staff = await Staff.find({ adminId })
      .populate('hospitalId', 'name')
      .populate('adminId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ 
      message: 'Failed to fetch staff members',
      error: error.message 
    });
  }
};

// Update staff member
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwtDecode(token);
    const adminId = decoded.id;

    const updatedStaff = await Staff.findOneAndUpdate(
      { _id: id, adminId },
      req.body,
      { new: true, runValidators: true }
    ).populate('hospitalId', 'name').populate('adminId', 'name');

    if (!updatedStaff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    res.status(200).json({
      message: 'Staff member updated successfully',
      staff: updatedStaff
    });
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ 
      message: 'Failed to update staff member',
      error: error.message 
    });
  }
};


// Delete Staff Controller
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwtDecode(token);
    const adminId = decoded.id;

    console.log('🔍 Attempting to delete staff with ID:', id);

    // First, find the staff member
    const staffMember = await Staff.findOne({ _id: id, adminId });

    if (!staffMember) {
      console.log('❌ Staff not found with ID:', id);
      return res.status(404).json({ message: 'Staff member not found' });
    }

    const staffEmail = staffMember.email;
    console.log('📧 Staff email:', staffEmail);

    // Delete from Staff collection
    await Staff.findOneAndDelete({ _id: id, adminId });
    console.log('✅ Staff deleted from Staff collection');

    // ✅ DON'T delete from Receptionist collection - let frontend handle it
    // This prevents issues when frontend tries to delete receptionist separately

    res.status(200).json({
      message: 'Staff member deleted successfully',
      deletedEmail: staffEmail
    });
  } catch (error) {
    console.error('❌ Error deleting staff:', error);
    res.status(500).json({ 
      message: 'Failed to delete staff member',
      error: error.message 
    });
  }
};
