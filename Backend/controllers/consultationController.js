import Consultation from '../models/consultation.js';
import Patient from '../models/Patient.js';
import mongoose from 'mongoose';

/**
 * Helper - safely resolve hospital ObjectId
 * Accepts:
 *  - a string ObjectId
 *  - an object like { _id: '...' }
 * Returns a mongoose.Types.ObjectId or null if invalid.
 */
const resolveHospitalObjectId = (hospitalId) => {
  if (!hospitalId) return null;

  // If it's an object with _id property
  if (typeof hospitalId === 'object' && hospitalId._id) {
    if (mongoose.Types.ObjectId.isValid(hospitalId._id)) {
      return new mongoose.Types.ObjectId(hospitalId._id);
    }
    return null;
  }

  // If it's a string ObjectId
  if (typeof hospitalId === 'string' && mongoose.Types.ObjectId.isValid(hospitalId)) {
    return new mongoose.Types.ObjectId(hospitalId);
  }

  // Maybe the token stored an ObjectId instance already
  if (mongoose.Types.ObjectId.isValid(hospitalId)) {
    return new mongoose.Types.ObjectId(hospitalId);
  }

  return null;
};

// Test endpoint
export const testConsultation = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Consultation endpoint is working!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test endpoint failed',
      error: error.message
    });
  }
};

// Create new consultation
export const createConsultation = async (req, res) => {
  try {
    const {
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      consultantDoctor,
      doctorPhone,
      clinicName,
      treatmentSpecialty,
      consultationType,
      status = 'Scheduled',
      appointmentDate,
      appointmentTime,
      payment = { status: 'Pending', total: 0, paid: 0 },
      referralReason,
      additionalNotes,
      customFields = [],
      patientObjectId
    } = req.body;

    const { hospitalId, adminId } = req.user;
    const createdBy = req.user.userId;

    // Validate hospitalId
    const hospitalObjectId = resolveHospitalObjectId(hospitalId);
    if (!hospitalObjectId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hospitalId in token'
      });
    }

    // Basic validation
    if (!patientName?.trim()) {
      return res.status(400).json({ success: false, message: 'Patient name is required' });
    }
    if (!consultantDoctor?.trim()) {
      return res.status(400).json({ success: false, message: 'Consultant doctor is required' });
    }
    if (!clinicName?.trim()) {
      return res.status(400).json({ success: false, message: 'Clinic name is required' });
    }
    if (!consultationType?.trim()) {
      return res.status(400).json({ success: false, message: 'Consultation type is required' });
    }
    if (!appointmentDate) {
      return res.status(400).json({ success: false, message: 'Appointment date is required' });
    }

    // Validate appointment date (not in past)
    const appointmentDateTime = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDateTime < today) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date cannot be in the past'
      });
    }

    // Handle patient linking/creation
    let finalPatientObjectId = null;
    let generatedPatientId = null;

    if (patientObjectId && mongoose.Types.ObjectId.isValid(patientObjectId)) {
      const existingPatient = await Patient.findOne({
        _id: patientObjectId,
        hospitalId: hospitalObjectId
      });

      if (existingPatient) {
        finalPatientObjectId = existingPatient._id;
        generatedPatientId = existingPatient.patientId;
      }
    } else {
      // Try to find existing patient by phone + name heuristics
      let existingPatient = null;
      if (patientPhone?.trim()) {
        existingPatient = await Patient.findOne({
          hospitalId: hospitalObjectId,
          $and: [
            {
              $or: [
                { phoneNumber: patientPhone.trim() },
                { primaryNumber: patientPhone.trim() }
              ]
            },
            {
              $or: [
                { firstName: new RegExp(patientName.split(' ')[0], 'i') },
                {
                  $and: [
                    { firstName: new RegExp(patientName.split(' ')[0] || '', 'i') },
                    { lastName: new RegExp(patientName.split(' ').slice(1).join(' ') || '', 'i') }
                  ]
                }
              ]
            }
          ]
        });
      }

      if (existingPatient) {
        finalPatientObjectId = existingPatient._id;
        generatedPatientId = existingPatient.patientId;
      } else if (patientName?.trim()) {
        // Create new patient
        try {
          const patientCount = await Patient.countDocuments({ hospitalId: hospitalObjectId });
          generatedPatientId = `PAT${(patientCount + 1).toString().padStart(4, '0')}`;

          // Ensure unique patientId if collision
          let counter = 0;
          while (
            await Patient.findOne({ patientId: generatedPatientId, hospitalId: hospitalObjectId })
          ) {
            counter++;
            generatedPatientId = `PAT${(patientCount + 1 + counter).toString().padStart(4, '0')}`;
            if (counter > 100) {
              generatedPatientId = `PAT${Date.now().toString().slice(-6)}`;
              break;
            }
          }

          const nameParts = patientName.trim().split(' ');
          const newPatient = new Patient({
            patientId: generatedPatientId,
            firstName: nameParts[0] || patientName,
            lastName: nameParts.slice(1).join(' ') || '',
            phoneNumber: patientPhone?.trim() || '',
            primaryNumber: patientPhone?.trim() || '',
            age: patientAge ? parseInt(patientAge) : null,
            gender: patientGender || '',
            hospitalId: hospitalObjectId,
            createdBy: new mongoose.Types.ObjectId(createdBy),
            email: '',
            address: '',
            emergencyContact: '',
            bloodGroup: '',
            medicalHistory: []
          });

          await newPatient.save();
          finalPatientObjectId = newPatient._id;
        } catch (patientError) {
          console.warn('Could not create patient record:', patientError.message);
        }
      }
    }

    // Payment data
    const paymentData = {
      status: payment.status || 'Pending',
      total: Number(payment.total) || 0,
      paid: Number(payment.paid) || 0
    };

    if (paymentData.paid > paymentData.total) {
      return res.status(400).json({
        success: false,
        message: 'Paid amount cannot exceed total amount'
      });
    }

    // Build consultation
    const consultationData = {
      patientId: generatedPatientId,
      patientName: patientName.trim(),
      patientPhone: patientPhone?.trim() || '',
      patientAge: patientAge ? parseInt(patientAge) : null,
      patientGender: patientGender || '',
      patientObjectId: finalPatientObjectId,
      consultantDoctor: consultantDoctor.trim(),
      doctorPhone: doctorPhone?.trim() || '',
      clinicName: clinicName.trim(),
      treatmentSpecialty: treatmentSpecialty?.trim() || '',
      consultationType,
      status,
      appointmentDate: appointmentDateTime,
      appointmentTime: appointmentTime?.trim() || '',
      payment: paymentData,
      referralReason: referralReason?.trim() || '',
      additionalNotes: additionalNotes?.trim() || '',
      hospitalId: hospitalObjectId,
      adminId: adminId ? new mongoose.Types.ObjectId(adminId) : null,
      createdBy: new mongoose.Types.ObjectId(createdBy),
      customFields: (customFields || []).filter(field => field.key?.trim() && field.value?.trim())
    };

    const consultation = new Consultation(consultationData);
    await consultation.save();

    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate('patientObjectId', 'firstName lastName phoneNumber primaryNumber email')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Consultation created successfully',
      data: populatedConsultation
    });
  } catch (error) {
   // console.error('Create consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create consultation',
      error: error.message
    });
  }
};

// Enhanced search patients for consultation
export const searchPatientsForConsultation = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const { query, limit = 10 } = req.query;

    const hospitalObjectId = resolveHospitalObjectId(hospitalId);
    if (!hospitalObjectId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hospitalId in token'
      });
    }

    if (!query || query.trim().length < 2) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchRegex = { $regex: query.trim(), $options: 'i' };
    const searchFilter = {
      hospitalId: hospitalObjectId,
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { phoneNumber: searchRegex },
        { primaryNumber: searchRegex },
        { email: searchRegex },
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ['$firstName', ' ', '$lastName'] },
              regex: query.trim(),
              options: 'i'
            }
          }
        }
      ]
    };

    const patients = await Patient.find(searchFilter)
      .select('firstName lastName phoneNumber primaryNumber email age gender address lastVisit')
      .limit(parseInt(limit))
      .sort({ firstName: 1, lastName: 1 })
      .lean();

    const enhancedPatients = patients.map(patient => ({
      ...patient,
      fullName: `${patient.firstName} ${patient.lastName}`.trim(),
      displayPhone: patient.phoneNumber || patient.primaryNumber || 'N/A'
    }));

    res.status(200).json({
      success: true,
      data: enhancedPatients,
      count: enhancedPatients.length
    });
  } catch (error) {
  //  console.error('Search patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search patients',
      error: error.message,
      data: []
    });
  }
};

// Get all consultations with enhanced filtering and pagination
export const getConsultations = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const {
      page = 1,
      limit = 10,
      search,
      status,
      paymentStatus,
      consultationType,
      treatmentSpecialty,
      startDate,
      endDate,
      sortBy = 'appointmentDate',
      sortOrder = 'desc'
    } = req.query;

    console.log('REQ USER --->', req.user);
    console.log('Hospital ID in token --->', req.user?.hospitalId);

    // Resolve hospitalId safely
    const hospitalObjectId = resolveHospitalObjectId(hospitalId);
    if (!hospitalObjectId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hospitalId in token'
      });
    }

    // Build filter query
    const filter = { hospitalId: hospitalObjectId };

    // Search filter
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      filter.$or = [
        { patientName: searchRegex },
        { consultationId: searchRegex },
        { consultantDoctor: searchRegex },
        { patientPhone: searchRegex },
        { clinicName: searchRegex }
      ];
    }

    if (status) filter.status = status;
    if (paymentStatus) filter['payment.status'] = paymentStatus;
    if (consultationType) filter.consultationType = consultationType;
    if (treatmentSpecialty) filter.treatmentSpecialty = treatmentSpecialty;

    // Date range filter
    if (startDate || endDate) {
      filter.appointmentDate = {};
      if (startDate) {
        if (startDate.includes(',')) {
          const [start, end] = startDate.split(',');
          filter.appointmentDate.$gte = new Date(start);
          filter.appointmentDate.$lte = new Date(end);
        } else {
          filter.appointmentDate.$gte = new Date(startDate);
        }
      }
      if (endDate && !startDate.includes(',')) {
        filter.appointmentDate.$lte = new Date(endDate);
      }
    }

    // Pagination & sorting
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    if (sortBy !== 'createdAt') {
      sortOptions.createdAt = -1;
    }

    // Execute query
    const consultations = await Consultation.find(filter)
      .populate('patientObjectId', 'firstName lastName phoneNumber primaryNumber email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Consultation.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Get statistics (scoped to hospital)
    const stats = await Consultation.aggregate([
      { $match: { hospitalId: hospitalObjectId } },
      {
        $group: {
          _id: null,
          totalConsultations: { $sum: 1 },
          scheduledCount: { $sum: { $cond: [{ $eq: ['$status', 'Scheduled'] }, 1, 0] } },
          inProgressCount: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          completedCount: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          cancelledCount: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] } },
          pendingPaymentCount: { $sum: { $cond: [{ $in: ['$payment.status', ['Partial', 'Pending', 'Overdue']] }, 1, 0] } },
          paidCount: { $sum: { $cond: [{ $eq: ['$payment.status', 'Paid'] }, 1, 0] } },
          totalRevenue: { $sum: '$payment.total' },
          totalPaid: { $sum: '$payment.paid' },
          pendingPayments: { $sum: { $subtract: ['$payment.total', '$payment.paid'] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        consultations,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        },
        stats: stats[0] || {
          totalConsultations: 0,
          scheduledCount: 0,
          inProgressCount: 0,
          completedCount: 0,
          cancelledCount: 0,
          pendingPaymentCount: 0,
          paidCount: 0,
          totalRevenue: 0,
          totalPaid: 0,
          pendingPayments: 0
        }
      }
    });
  } catch (error) {
   // console.error('Get consultations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve consultations',
      error: error.message
    });
  }
};

// Get consultation by ID
export const getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;
    const { hospitalId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid consultation ID' });
    }

    const hospitalObjectId = resolveHospitalObjectId(hospitalId);
    if (!hospitalObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid hospitalId in token' });
    }

    const consultation = await Consultation.findOne({
      _id: id,
      hospitalId: hospitalObjectId
    }).populate('patientObjectId', 'firstName lastName phoneNumber primaryNumber email address');

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    res.status(200).json({ success: true, data: consultation });
  } catch (error) {
   // console.error('Get consultation by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve consultation',
      error: error.message
    });
  }
};

// Update consultation
export const updateConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { hospitalId } = req.user;
    const updateData = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid consultation ID' });
    }

    const hospitalObjectId = resolveHospitalObjectId(hospitalId);
    if (!hospitalObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid hospitalId in token' });
    }

    // Cleanup immutable fields
    delete updateData.consultationId;
    delete updateData.hospitalId;
    delete updateData.createdAt;
    delete updateData._id;

    if (updateData.appointmentDate) {
      const appointmentDateTime = new Date(updateData.appointmentDate);
      if (appointmentDateTime < new Date().setHours(0, 0, 0, 0)) {
        return res.status(400).json({ success: false, message: 'Appointment date cannot be in the past' });
      }
      updateData.appointmentDate = appointmentDateTime;
    }

    if (updateData.payment) {
      if (updateData.payment.paid && updateData.payment.total &&
        updateData.payment.paid > updateData.payment.total) {
        return res.status(400).json({ success: false, message: 'Paid amount cannot exceed total amount' });
      }
    }

    if (updateData.customFields) {
      updateData.customFields = updateData.customFields.filter(field => field.key && field.value);
    }

    updateData.updatedAt = new Date();

    const consultation = await Consultation.findOneAndUpdate(
      { _id: id, hospitalId: hospitalObjectId },
      updateData,
      { new: true, runValidators: true }
    ).populate('patientObjectId', 'firstName lastName phoneNumber primaryNumber email');

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    res.status(200).json({ success: true, message: 'Consultation updated successfully', data: consultation });
  } catch (error) {
   // console.error('Update consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update consultation',
      error: error.message
    });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { hospitalId } = req.user;
    const { status, total, paid, paymentMethod, paymentDate, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid consultation ID' });
    }

    const hospitalObjectId = resolveHospitalObjectId(hospitalId);
    if (!hospitalObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid hospitalId in token' });
    }

    const totalAmount = total !== undefined ? Number(total) : undefined;
    const paidAmount = paid !== undefined ? Number(paid) : undefined;

    if (totalAmount !== undefined && (isNaN(totalAmount) || totalAmount < 0)) {
      return res.status(400).json({ success: false, message: 'Total amount must be a valid non-negative number' });
    }
    if (paidAmount !== undefined && (isNaN(paidAmount) || paidAmount < 0)) {
      return res.status(400).json({ success: false, message: 'Paid amount must be a valid non-negative number' });
    }
    if (paidAmount !== undefined && totalAmount !== undefined && paidAmount > totalAmount) {
      return res.status(400).json({ success: false, message: 'Paid amount cannot exceed total amount' });
    }

    const consultation = await Consultation.findOne({ _id: id, hospitalId: hospitalObjectId });
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    const paymentUpdate = { updatedAt: new Date() };
    const finalTotalAmount = totalAmount !== undefined ? totalAmount : consultation.payment?.total || 0;
    const finalPaidAmount = paidAmount !== undefined ? paidAmount : consultation.payment?.paid || 0;

    let calculatedStatus;
    if (finalPaidAmount === 0) calculatedStatus = 'Pending';
    else if (finalPaidAmount >= finalTotalAmount) calculatedStatus = 'Paid';
    else calculatedStatus = 'Pending';

    paymentUpdate['payment.total'] = finalTotalAmount;
    paymentUpdate['payment.paid'] = finalPaidAmount;
    paymentUpdate['payment.status'] = status || calculatedStatus;

    if (paymentMethod) paymentUpdate['payment.method'] = paymentMethod;
    if (paymentDate) paymentUpdate['payment.date'] = new Date(paymentDate);
    if (notes !== undefined) paymentUpdate['payment.notes'] = notes;

    const updatedConsultation = await Consultation.findOneAndUpdate(
      { _id: id, hospitalId: hospitalObjectId },
      paymentUpdate,
      { new: true, runValidators: true, select: '+payment' }
    ).populate('patientObjectId', 'firstName lastName phoneNumber primaryNumber email');

    if (!updatedConsultation) {
      return res.status(404).json({ success: false, message: 'Failed to update consultation' });
    }

    res.status(200).json({ success: true, message: 'Payment information updated successfully', data: updatedConsultation });
  } catch (error) {
   // console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment information',
      error: error.message
    });
  }
};

// Delete consultation
export const deleteConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const { hospitalId } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid consultation ID' });
    }

    const hospitalObjectId = resolveHospitalObjectId(hospitalId);
    if (!hospitalObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid hospitalId in token' });
    }

    const consultation = await Consultation.findOneAndDelete({
      _id: id,
      hospitalId: hospitalObjectId
    });

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Consultation deleted successfully',
      data: { id: consultation._id, patientName: consultation.patientName }
    });
  } catch (error) {
    //console.error('Delete consultation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete consultation',
      error: error.message
    });
  }
};

// Get upcoming consultations
export const getUpcomingConsultations = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const { limit = 10, days = 7 } = req.query;

    const hospitalObjectId = resolveHospitalObjectId(hospitalId);
    if (!hospitalObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid hospitalId in token' });
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));

    const consultations = await Consultation.find({
      hospitalId: hospitalObjectId,
      appointmentDate: { $gte: new Date(), $lte: endDate },
      status: { $in: ['Scheduled', 'Rescheduled'] }
    })
      .populate('patientObjectId', 'firstName lastName phoneNumber')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({ success: true, data: consultations });
  } catch (error) {
   // console.error('Get upcoming consultations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve upcoming consultations',
      error: error.message
    });
  }
};

// Get pending payments
export const getPendingPayments = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const { limit = 50 } = req.query;

    const hospitalObjectId = resolveHospitalObjectId(hospitalId);
    if (!hospitalObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid hospitalId in token' });
    }

    const consultations = await Consultation.find({
      hospitalId: hospitalObjectId,
      $or: [
        { 'payment.status': 'Partial' },
        { 'payment.status': 'Pending' },
        { 'payment.status': 'Overdue' }
      ]
    })
      .populate('patientObjectId', 'firstName lastName phoneNumber')
      .sort({ appointmentDate: -1 })
      .limit(parseInt(limit))
      .lean();

    const totalPendingAmount = consultations.reduce((sum, consultation) => {
      return sum + (consultation.payment.total - consultation.payment.paid);
    }, 0);

    res.status(200).json({
      success: true,
      data: { consultations, totalPendingAmount, count: consultations.length }
    });
  } catch (error) {
   // console.error('Get pending payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending payments',
      error: error.message
    });
  }
};

// Get consultation statistics
export const getConsultationStats = async (req, res) => {
  try {
    const { hospitalId } = req.user;
    const hospitalObjectId = resolveHospitalObjectId(hospitalId);
    if (!hospitalObjectId) {
      return res.status(400).json({ success: false, message: 'Invalid hospitalId in token' });
    }

    const stats = await Consultation.aggregate([
      { $match: { hospitalId: hospitalObjectId } },
      {
        $group: {
          _id: null,
          totalConsultations: { $sum: 1 },
          scheduledCount: { $sum: { $cond: [{ $eq: ['$status', 'Scheduled'] }, 1, 0] } },
          inProgressCount: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          completedCount: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          cancelledCount: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] } },
          pendingPaymentCount: { $sum: { $cond: [{ $in: ['$payment.status', ['Partial', 'Pending', 'Overdue']] }, 1, 0] } },
          paidCount: { $sum: { $cond: [{ $eq: ['$payment.status', 'Paid'] }, 1, 0] } },
          totalRevenue: { $sum: '$payment.total' },
          totalPaid: { $sum: '$payment.paid' },
          pendingPayments: { $sum: { $subtract: ['$payment.total', '$payment.paid'] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalConsultations: 0,
        scheduledCount: 0,
        inProgressCount: 0,
        completedCount: 0,
        cancelledCount: 0,
        pendingPaymentCount: 0,
        paidCount: 0,
        totalRevenue: 0,
        totalPaid: 0,
        pendingPayments: 0
      }
    });
  } catch (error) {
   // console.error('Get consultation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve consultation statistics',
      error: error.message
    });
  }
};
