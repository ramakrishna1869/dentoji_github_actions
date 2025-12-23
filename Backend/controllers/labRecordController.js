
import LabRecord from '../models/labrecord.js';
import Patient from '../models/Patient.js';
import fs from 'fs';
import path from 'path';
import { jwtDecode } from 'jwt-decode';

// Helper function to get user details from token with fallback
const getUserFromToken = (req) => {
  try {
    // First try to get from middleware (req.user)
    if (req.user && req.user.id) {
      //console.log('User from middleware:', req.user);
      return req.user;
    }

    // Fallback to decoding token directly
    let token = req.headers.authorization?.replace('Bearer ', '');

    // For GET requests to view-bill, token might be in query params
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      throw new Error('No token provided');
    }

    //console.log('Decoding token manually...');
    const decoded = jwtDecode(token);
    //console.log('Decoded token:', decoded);
    return decoded;
  } catch (error) {
    console.error('Error getting user from token:', error);
    throw new Error('Invalid token or authorization failed');
  }
};

// Create a new lab record
// In your labRecordController.js - Update the createLabRecord function

export const createLabRecord = async (req, res) => {
  try {
    console.log('=== CREATE LAB RECORD START ===');
    
    const user = getUserFromToken(req);
    const { hospitalId, role, id: userId } = user;

    // Validate required fields
    const { patientName, labName, crownType, tooth } = req.body;

    if (!patientName || !labName || !crownType || !tooth) {
      return res.status(400).json({
        success: false,
        message: 'Required fields missing: patientName, labName, crownType, tooth'
      });
    }

    // If patient exists, get the patient object ID and data
    let patientObjectId = null;
    let existingPatientData = null;

    if (req.body.patientId) {
      try {
        const existingPatient = await Patient.findOne({
          patientId: req.body.patientId,
          hospitalId
        });
        if (existingPatient) {
          patientObjectId = existingPatient._id;
          existingPatientData = existingPatient;
        }
      } catch (err) {
        console.log('Error finding patient:', err.message);
      }
    }

    // Calculate payment status based on amounts
    const totalAmount = req.body.totalAmount ? parseFloat(req.body.totalAmount) : 0;
    const paidAmount = req.body.paidAmount ? parseFloat(req.body.paidAmount) : 0;
    
    let calculatedPaymentStatus = 'Pending';
    if (totalAmount > 0) {
      if (paidAmount >= totalAmount) {
        calculatedPaymentStatus = 'Fully Paid';
      } else if (paidAmount > 0) {
        calculatedPaymentStatus = 'Partial';
      }
    }

    // Prepare lab record data
    const labRecordData = {
      // Patient Information
      patientId: req.body.patientId || '',
      patientName: patientName.trim(),
      patientPhone: req.body.patientPhone?.trim() || (existingPatientData ? existingPatientData.phoneNumber || existingPatientData.primaryNumber : ''),
      patientAge: req.body.patientAge ? parseInt(req.body.patientAge) : (existingPatientData ? existingPatientData.age : null),
      patientGender: req.body.patientGender || (existingPatientData ? existingPatientData.gender : ''),
      patientObjectId,

      // Lab Information
      labName: labName.trim(),
      technician: req.body.technician?.trim() || '',
      sentDate: req.body.sentDate ? new Date(req.body.sentDate) : new Date(),
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,

      // Crown Details
      crownType: crownType.trim(),
      material: req.body.material?.trim() || '',
      tooth: tooth.trim(),
      tag: req.body.tag?.trim() || '',
      traysDetails: req.body.traysDetails || '',

      // Status and Timeline
      status: req.body.status || 'Sent',
      receivedDate: req.body.receivedDate ? new Date(req.body.receivedDate) : null,

      // Payment Information - USE CALCULATED STATUS
      payment: {
        status: calculatedPaymentStatus, // Use the calculated status instead of req.body.paymentStatus
        total: totalAmount,
        paid: paidAmount
      },

      // Additional Information
      notes: req.body.notes?.trim() || '',
      billUploaded: false,
      billUrl: '',

      // Context Information
      hospitalId,
      adminId: role === 'Admin' ? userId : req.body.adminId,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creating lab record with payment status:', calculatedPaymentStatus);

    // Create and save the lab record
    const labRecord = new LabRecord(labRecordData);
    await labRecord.save();

    console.log('Lab record created successfully with ID:', labRecord.labRecordId);

    res.status(201).json({
      success: true,
      message: 'Lab record created successfully',
      labRecord
    });

  } catch (error) {
    console.error('Error creating lab record:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message,
        value: error.errors[key].value,
        kind: error.errors[key].kind
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    if (error.message === 'Invalid token or authorization failed') {
      return res.status(401).json({
        success: false,
        message: 'Authorization failed. Please login again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create lab record',
      error: error.message
    });
  }
};

// Upload bill for a lab record
export const uploadBill = async (req, res) => {
  try {
    //console.log('=== UPLOAD BILL START ===');
    //console.log('Headers:', req.headers);
    //console.log('File info:', req.file);
    //console.log('Params:', req.params);

    const user = getUserFromToken(req);
    const { hospitalId } = user;
    const { id } = req.params;

    //console.log('Uploading bill for lab record:', id, 'by user:', user.id);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Find the lab record
    const labRecord = await LabRecord.findOne({
      _id: id,
      hospitalId
    });

    if (!labRecord) {
      // Delete the uploaded file if lab record not found
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: 'Lab record not found'
      });
    }

    // Delete old bill file if it exists
    if (labRecord.billUrl) {
      const oldFilePath = path.join(process.cwd(), labRecord.billUrl);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
          //console.log('Old bill file deleted:', oldFilePath);
        } catch (err) {
          console.error('Error deleting old bill file:', err);
        }
      }
    }

    // Update lab record with new bill information
    const billUrl = req.file.path.replace(/\\/g, '/'); // Normalize path separators
    labRecord.billUploaded = true;
    labRecord.billUrl = billUrl;
    labRecord.updatedAt = new Date();

    await labRecord.save();

    /*console.log('Bill uploaded successfully:', {
      recordId: id,
      filename: req.file.filename,
      size: req.file.size,
      path: billUrl
    });*/

    res.json({
      success: true,
      message: 'Bill uploaded successfully',
      labRecord,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('Error uploading bill:', error);

    // Delete the uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file after error:', unlinkError);
      }
    }

    // Handle authorization errors
    if (error.message === 'Invalid token or authorization failed') {
      return res.status(401).json({
        success: false,
        message: 'Authorization failed. Please login again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload bill',
      error: error.message
    });
  }
};

// View bill with token authentication support
export const viewBill = async (req, res) => {
  try {
    //console.log('=== VIEW BILL START ===');
    //console.log('Headers:', req.headers);
    //console.log('Query:', req.query);
    //console.log('Params:', req.params);

    const user = getUserFromToken(req);
    const { hospitalId } = user;
    const { id } = req.params;

    //console.log('Viewing bill for record:', id, 'by user:', user.id);

    const labRecord = await LabRecord.findOne({
      _id: id,
      hospitalId
    });

    if (!labRecord) {
      return res.status(404).json({
        success: false,
        message: 'Lab record not found'
      });
    }

    if (!labRecord.billUploaded || !labRecord.billUrl) {
      return res.status(404).json({
        success: false,
        message: 'No bill uploaded for this record'
      });
    }

    const filePath = path.join(process.cwd(), labRecord.billUrl);

    if (!fs.existsSync(filePath)) {
      // Clean up the record if file doesn't exist
      labRecord.billUploaded = false;
      labRecord.billUrl = '';
      await labRecord.save();

      return res.status(404).json({
        success: false,
        message: 'Bill file not found'
      });
    }

    const fileExtension = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);

    let contentType = 'application/octet-stream';
    if (fileExtension === '.pdf') {
      contentType = 'application/pdf';
    } else if (['.jpg', '.jpeg'].includes(fileExtension)) {
      contentType = 'image/jpeg';
    } else if (fileExtension === '.png') {
      contentType = 'image/png';
    }

    //console.log('Serving file:', filePath, 'Content-Type:', contentType);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'private, max-age=0');
    res.sendFile(filePath);

  } catch (error) {
    console.error('Error viewing bill:', error);

    // Handle authorization errors
    if (error.message === 'Invalid token or authorization failed') {
      return res.status(401).json({
        success: false,
        message: 'Authorization failed. Please login again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to view bill',
      error: error.message
    });
  }
};

// Update payment for a lab record
export const updatePayment = async (req, res) => {
  try {
    //console.log('=== UPDATE PAYMENT START ===');
    //console.log('Body:', req.body);
    //console.log('Params:', req.params);

    const user = getUserFromToken(req);
    const { hospitalId } = user;
    const { id } = req.params;
    const { paidAmount, totalAmount } = req.body;

    //console.log('Updating payment for record:', id, 'Paid Amount:', paidAmount, 'Total:', totalAmount);

    if (paidAmount === undefined || isNaN(parseFloat(paidAmount))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid paid amount'
      });
    }

    const paid = parseFloat(paidAmount);
    const total = totalAmount !== undefined ? parseFloat(totalAmount) : null;

    if (paid < 0) {
      return res.status(400).json({
        success: false,
        message: 'Paid amount cannot be negative'
      });
    }

    const labRecord = await LabRecord.findOne({
      _id: id,
      hospitalId
    });

    if (!labRecord) {
      return res.status(404).json({
        success: false,
        message: 'Lab record not found'
      });
    }

    // Update total amount if provided
    if (total !== null && !isNaN(total) && total >= 0) {
      labRecord.payment.total = total;
    }

    // Validate paid amount against total
    if (paid > labRecord.payment.total) {
      return res.status(400).json({
        success: false,
        message: 'Paid amount cannot exceed total amount'
      });
    }

    // Update payment
    labRecord.payment.paid = paid;
    labRecord.payment.status = paid >= labRecord.payment.total ? "Fully Paid" :
      paid > 0 ? "Partial" : "Pending";
    labRecord.updatedAt = new Date();

    await labRecord.save();

    //console.log('Payment updated successfully for record:', id);

    res.json({
      success: true,
      message: 'Payment updated successfully',
      labRecord
    });

  } catch (error) {
    console.error('Error updating payment:', error);

    if (error.message === 'Invalid token or authorization failed') {
      return res.status(401).json({
        success: false,
        message: 'Authorization failed. Please login prognosticator'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update payment',
      error: error.message
    });
  }
};

// Test endpoint to debug authentication
export const testLabRecord = async (req, res) => {
  try {
    //console.log('=== TEST ENDPOINT ===');
    //console.log('Headers:', req.headers);
    //console.log('User from middleware:', req.user);
    //console.log('Request body:', JSON.stringify(req.body, null, 2));

    const user = getUserFromToken(req);
    //console.log('User from helper:', user);

    res.json({
      success: true,
      message: 'Test successful - Authentication working!',
      user,
      body: req.body,
      timestamp: new Date().toISOString(),
      headers: req.headers
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
};

// Get lab records with role-based filtering
export const getLabRecords = async (req, res) => {
  try {
    //console.log('=== GET LAB RECORDS START ===');

    const user = getUserFromToken(req);
    const { hospitalId, role, id: userId } = user;

    let query = { hospitalId };

    // Role-based filtering
    if (role === 'Admin') {
      query.adminId = userId;
    }

    // Additional filters
    const { status, paymentStatus, search, startDate, endDate } = req.query;

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query['payment.status'] = paymentStatus;
    }

    if (search) {
      query.$or = [
        { patientName: { $regex: search, $options: 'i' } },
        { patientPhone: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } },
        { labRecordId: { $regex: search, $options: 'i' } },
        { labName: { $regex: search, $options: 'i' } },
        { technician: { $regex: search, $options: 'i' } },
        { crownType: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    //console.log('Query:', query);

    const labRecords = await LabRecord.find(query)
      .populate('patientObjectId', 'firstName lastName phoneNumber primaryNumber')
      .sort({ createdAt: -1 });

    //console.log('Found', labRecords.length, 'lab records');

    res.json(labRecords);

  } catch (error) {
    console.error('Error fetching lab records:', error);

    if (error.message === 'Invalid token or authorization failed') {
      return res.status(401).json({
        success: false,
        message: 'Authorization failed. Please login again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab records',
      error: error.message
    });
  }
};

// Search patients for lab record creation
export const searchPatientsForLab = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const { hospitalId } = user;
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json([]);
    }

    const patients = await Patient.find({
      hospitalId,
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { phoneNumber: { $regex: query, $options: 'i' } },
        { primaryNumber: { $regex: query, $options: 'i' } },
        { patientId: { $regex: query, $options: 'i' } }
      ]
    }).limit(10).select('patientId firstName lastName phoneNumber primaryNumber age gender lastVisit');

    res.json(patients);

  } catch (error) {
    console.error('Error searching patients:', error);

    if (error.message === 'Invalid token or authorization failed') {
      return res.status(401).json({
        success: false,
        message: 'Authorization failed. Please login again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to search patients',
      error: error.message
    });
  }
};

// Get single lab record by ID
export const getLabRecordById = async (req, res) => {
  try {
    const user = getUserFromToken(req);
    const { hospitalId } = user;
    const { id } = req.params;

    const labRecord = await LabRecord.findOne({
      _id: id,
      hospitalId
    }).populate('patientObjectId');

    if (!labRecord) {
      return res.status(404).json({
        success: false,
        message: 'Lab record not found'
      });
    }

    res.json({
      success: true,
      labRecord
    });
  } catch (error) {
    console.error('Error fetching lab record:', error);

    if (error.message === 'Invalid token or authorization failed') {
      return res.status(401).json({
        success: false,
        message: 'Authorization failed. Please login again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab record',
      error: error.message
    });
  }
};

// Update lab record
export const updateLabRecord = async (req, res) => {
  try {
    console.log('=== UPDATE LAB RECORD START ===');
    console.log('Body:', req.body);
    console.log('Params:', req.params);

    const user = getUserFromToken(req);
    const { hospitalId } = user;
    const { id } = req.params;

    // Get current record first
    const currentRecord = await LabRecord.findOne({ _id: id, hospitalId });
    if (!currentRecord) {
      return res.status(404).json({
        success: false,
        message: 'Lab record not found'
      });
    }

    // Prepare update data
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    updateData.updatedAt = new Date();

    // Handle payment calculation
    const paidAmount = parseFloat(req.body.paidAmount || req.body.payment?.paid || currentRecord.payment.paid) || 0;
    const totalAmount = parseFloat(req.body.totalAmount || req.body.payment?.total || currentRecord.payment.total) || 0;
    
    // Calculate payment status
    let paymentStatus = 'Pending';
    if (totalAmount > 0) {
      if (paidAmount >= totalAmount) {
        paymentStatus = 'Fully Paid';
      } else if (paidAmount > 0) {
        paymentStatus = 'Partial';
      }
    }

    // Set payment object with calculated status
    updateData.payment = {
      status: paymentStatus,
      total: totalAmount,
      paid: paidAmount
    };

    console.log('Calculated payment status:', paymentStatus);
    console.log('Payment data:', updateData.payment);

    const labRecord = await LabRecord.findOneAndUpdate(
      { _id: id, hospitalId },
      updateData,
      { new: true, runValidators: true }
    );

    console.log('Lab record updated successfully');
    console.log('Final payment status:', labRecord.payment.status);

    res.json({
      success: true,
      message: 'Lab record updated successfully',
      labRecord
    });
  } catch (error) {
    console.error('Error updating lab record:', error);

    if (error.message === 'Invalid token or authorization failed') {
      return res.status(401).json({
        success: false,
        message: 'Authorization failed. Please login again.'
      });
    }

    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update lab record',
      error: error.message
    });
  }
};
// Delete lab record
export const deleteLabRecord = async (req, res) => {
  try {
    //console.log('=== DELETE LAB RECORD START ===');
    //console.log('Params:', req.params);

    const user = getUserFromToken(req);
    const { hospitalId } = user;
    const { id } = req.params;

    const labRecord = await LabRecord.findOne({
      _id: id,
      hospitalId
    });

    if (!labRecord) {
      return res.status(404).json({
        success: false,
        message: 'Lab record not found'
      });
    }

    // Delete associated bill file if it exists
    if (labRecord.billUploaded && labRecord.billUrl) {
      const filePath = path.join(process.cwd(), labRecord.billUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          //console.log('Bill file deleted:', filePath);
        } catch (err) {
          console.error('Error deleting bill file:', err);
        }
      }
    }

    // Delete the lab record
    await LabRecord.findByIdAndDelete(id);

    //console.log('Lab record deleted successfully');

    res.json({
      success: true,
      message: 'Lab record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lab record:', error);

    if (error.message === 'Invalid token or authorization failed') {
      return res.status(401).json({
        success: false,
        message: 'Authorization failed. Please login again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete lab record',
      error: error.message
    });
  }
};

// Get lab statistics
export const getLabStatistics = async (req, res) => {
  try {
    //console.log('=== GET LAB STATISTICS START ===');

    const user = getUserFromToken(req);
    const { hospitalId, role, id: userId } = user;

    let query = { hospitalId };

    // Role-based filtering
    if (role === 'Admin') {
      query.adminId = userId;
    }

    // Aggregate statistics
    const stats = await LabRecord.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          statusCounts: {
            $push: {
              status: '$status',
              count: { $sum: 1 }
            }
          },
          paymentStatusCounts: {
            $push: {
              status: '$payment.status',
              count: { $sum: 1 }
            }
          },
          totalAmount: { $sum: '$payment.total' },
          paidAmount: { $sum: '$payment.paid' },
          pendingAmount: {
            $sum: { $subtract: ['$payment.total', '$payment.paid'] }
          },
          crownTypes: {
            $push: {
              crownType: '$crownType',
              count: { $sum: 1 }
            }
          }
        }
      },
      {
        $project: {
          totalRecords: 1,
          statusCounts: {
            $arrayToObject: {
              $map: {
                input: '$statusCounts',
                as: 'item',
                in: {
                  k: '$$item.status',
                  v: '$$item.count'
                }
              }
            }
          },
          paymentStatusCounts: {
            $arrayToObject: {
              $map: {
                input: '$paymentStatusCounts',
                as: 'item',
                in: {
                  k: '$$item.status',
                  v: '$$item.count'
                }
              }
            }
          },
          totalAmount: 1,
          paidAmount: 1,
          pendingAmount: 1,
          crownTypes: {
            $arrayToObject: {
              $map: {
                input: '$crownTypes',
                as: 'item',
                in: {
                  k: '$$item.crownType',
                  v: '$$item.count'
                }
              }
            }
          }
        }
      }
    ]);

    //console.log('Lab statistics retrieved:', stats);

    res.json({
      success: true,
      statistics: stats.length > 0 ? stats[0] : {
        totalRecords: 0,
        statusCounts: {},
        paymentStatusCounts: {},
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        crownTypes: {}
      }
    });
  } catch (error) {
    console.error('Error fetching lab statistics:', error);

    if (error.message === 'Invalid token or authorization failed') {
      return res.status(401).json({
        success: false,
        message: 'Authorization failed. Please login again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab statistics',
      error: error.message
    });
  }
};

// Get lab statistics summary
export const getLabStatsSummary = async (req, res) => {
  try {
    //console.log('=== GET LAB STATS SUMMARY START ===');

    const user = getUserFromToken(req);
    const { hospitalId, role, id: userId } = user;

    let query = { hospitalId };

    // Role-based filtering
    if (role === 'Admin') {
      query.adminId = userId;
    }

    // Aggregate summary statistics
    const summary = await LabRecord.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalAmount: { $sum: '$payment.total' },
          paidAmount: { $sum: '$payment.paid' },
          pendingRecords: {
            $sum: { $cond: [{ $eq: ['$payment.status', 'Pending'] }, 1, 0] }
          },
          overdueRecords: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$status', 'Received'] },
                    { $lt: ['$dueDate', new Date()] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          totalRecords: 1,
          totalAmount: 1,
          paidAmount: 1,
          pendingRecords: 1,
          overdueRecords: 1,
          pendingAmount: { $subtract: ['$totalAmount', '$paidAmount'] }
        }
      }
    ]);

    //console.log('Lab stats summary retrieved:', summary);

    res.json({
      success: true,
      summary: summary.length > 0 ? summary[0] : {
        totalRecords: 0,
        totalAmount: 0,
        paidAmount: 0,
        pendingAmount: 0,
        pendingRecords: 0,
        overdueRecords: 0
      }
    });
  } catch (error) {
    console.error('Error fetching lab stats summary:', error);

    if (error.message === 'Invalid token or authorization failed') {
      return res.status(401).json({
        success: false,
        message: 'Authorization failed. Please login again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch lab stats summary',
      error: error.message
    });
  }
};