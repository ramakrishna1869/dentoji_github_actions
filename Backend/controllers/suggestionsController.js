// controllers/suggestionsController.js
import mongoose from 'mongoose';
import Suggestion from '../models/Suggestions.js';
import Patient from '../models/Patient.js';
import Receptionist from '../models/Receptionist.js';
import Hospital from '../models/Hospital.js';

// CREATE - Add new suggestions for a patient
export const createSuggestions = async (req, res) => {
  try {
    const { hospitalId, patientId } = req.params;
    const { suggestions } = req.body; // Array of suggestions
    const userRole = req.user.role;
    const userId = req.user.id;

    /*console.log('📝 Creating suggestions:', {
      hospitalId,
      patientId,
      suggestionsCount: suggestions?.length,
      userRole,
      userId
    });*/

    // Validate input
    if (!suggestions || !Array.isArray(suggestions) || suggestions.length === 0) {
      return res.status(400).json({ 
        message: 'Suggestions array is required and cannot be empty' 
      });
    }

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(patientId) || !mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ message: 'Invalid patient or hospital ID format' });
    }

    // Get user details and validate access
    let adminId, receptionistId = null;
    
    if (userRole === 'Admin') {
      adminId = userId;
      
      // Verify the hospital belongs to this admin
      const hospital = await Hospital.findOne({ 
        _id: hospitalId, 
        adminId: userId 
      });
      
      if (!hospital) {
        return res.status(403).json({ 
          message: 'Access denied: Hospital does not belong to this admin' 
        });
      }
    } else if (userRole === 'Receptionist') {
      const receptionist = await Receptionist.findById(userId).populate('admin');
      
      if (!receptionist) {
        return res.status(404).json({ message: 'Receptionist not found' });
      }
      
      // Verify the receptionist works at this hospital
      if (receptionist.hospitalId.toString() !== hospitalId) {
        return res.status(403).json({ 
          message: 'Access denied: You do not have access to this hospital' 
        });
      }
      
      adminId = receptionist.admin._id;
      receptionistId = userId;
    } else {
      return res.status(403).json({ message: 'Access denied: Invalid role' });
    }

    // Verify patient exists and belongs to the hospital
    const patient = await Patient.findOne({
      _id: patientId,
      hospitalId: hospitalId,
      adminId: adminId
    });

    if (!patient) {
      return res.status(404).json({ 
        message: 'Patient not found in the specified hospital' 
      });
    }

    // Prepare suggestions for database insertion
    const suggestionDocs = suggestions.map(suggestion => ({
      title: suggestion.title.trim(),
      description: suggestion.description.trim(),
      patientId: new mongoose.Types.ObjectId(patientId),
      hospitalId: new mongoose.Types.ObjectId(hospitalId),
      adminId: new mongoose.Types.ObjectId(adminId),
      receptionistId: receptionistId ? new mongoose.Types.ObjectId(receptionistId) : null,
      createdBy: userRole,
    }));

    // Validate each suggestion
    for (const suggestion of suggestionDocs) {
      if (!suggestion.title || !suggestion.description) {
        return res.status(400).json({ 
          message: 'Each suggestion must have both title and description' 
        });
      }
    }

    // Insert suggestions into database
    const createdSuggestions = await Suggestion.insertMany(suggestionDocs);

    //console.log('✅ Suggestions created successfully:', createdSuggestions.length);

    res.status(201).json({
      message: 'Suggestions created successfully',
      suggestions: createdSuggestions,
      count: createdSuggestions.length
    });

  } catch (error) {
    console.error('❌ Error creating suggestions:', error);
    res.status(500).json({ 
      message: 'Error creating suggestions', 
      error: error.message 
    });
  }
};

// GET - Fetch suggestions for a specific patient
export const getPatientSuggestions = async (req, res) => {
  try {
    const { hospitalId, patientId } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    //console.log('🔍 Fetching suggestions for patient:', { hospitalId, patientId, userRole });

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(patientId) || !mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ message: 'Invalid patient or hospital ID format' });
    }

    // Build query filter based on user role
    let filter = {
      patientId: new mongoose.Types.ObjectId(patientId),
      hospitalId: new mongoose.Types.ObjectId(hospitalId)
    };

    if (userRole === 'Admin') {
      filter.adminId = new mongoose.Types.ObjectId(userId);
    } else if (userRole === 'Receptionist') {
      const receptionist = await Receptionist.findById(userId);
      if (!receptionist || receptionist.hospitalId.toString() !== hospitalId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      filter.adminId = receptionist.admin;
    }

    // Fetch suggestions from database
    const suggestions = await Suggestion.find(filter)
      .sort({ createdAt: -1 }) // Most recent first
      .populate('receptionistId', 'firstName lastName')
      .lean();

    //console.log('✅ Found suggestions:', suggestions.length);

    res.status(200).json({
      suggestions: suggestions,
      count: suggestions.length
    });

  } catch (error) {
    console.error('❌ Error fetching suggestions:', error);
    res.status(500).json({ 
      message: 'Error fetching suggestions', 
      error: error.message 
    });
  }
};

// GET - Fetch all suggestions for a hospital (admin/receptionist view)
export const getHospitalSuggestions = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;
    const { page = 1, limit = 20, patientId } = req.query;

    //console.log('🔍 Fetching hospital suggestions:', { hospitalId, userRole, page, limit });

    // Validate hospital ID
    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ message: 'Invalid hospital ID format' });
    }

    // Build query filter
    let filter = {
      hospitalId: new mongoose.Types.ObjectId(hospitalId)
    };

    // Add patient filter if specified
    if (patientId) {
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        return res.status(400).json({ message: 'Invalid patient ID format' });
      }
      filter.patientId = new mongoose.Types.ObjectId(patientId);
    }

    // Role-based access control
    if (userRole === 'Admin') {
      filter.adminId = new mongoose.Types.ObjectId(userId);
    } else if (userRole === 'Receptionist') {
      const receptionist = await Receptionist.findById(userId);
      if (!receptionist || receptionist.hospitalId.toString() !== hospitalId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      filter.adminId = receptionist.admin;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch suggestions with pagination
    const suggestions = await Suggestion.find(filter)
      .populate('patientId', 'firstName lastName patientId')
      .populate('receptionistId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Suggestion.countDocuments(filter);

    //console.log('✅ Found hospital suggestions:', suggestions.length);

    res.status(200).json({
      suggestions: suggestions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: suggestions.length,
        totalRecords: total
      }
    });

  } catch (error) {
    console.error('❌ Error fetching hospital suggestions:', error);
    res.status(500).json({ 
      message: 'Error fetching hospital suggestions', 
      error: error.message 
    });
  }
};

// UPDATE - Update a specific suggestion
export const updateSuggestion = async (req, res) => {
  try {
    const { suggestionId } = req.params;
    const { title, description, status, priority, tags } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    //console.log('🔄 Updating suggestion:', { suggestionId, userRole });

    // Validate suggestion ID
    if (!mongoose.Types.ObjectId.isValid(suggestionId)) {
      return res.status(400).json({ message: 'Invalid suggestion ID format' });
    }

    // Find the suggestion
    const suggestion = await Suggestion.findById(suggestionId);
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    // Role-based access control
    if (userRole === 'Admin' && suggestion.adminId.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    } else if (userRole === 'Receptionist') {
      const receptionist = await Receptionist.findById(userId);
      if (!receptionist || suggestion.adminId.toString() !== receptionist.admin.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Update fields
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (tags) updateData.tags = tags;
    updateData.updatedAt = new Date();

    const updatedSuggestion = await Suggestion.findByIdAndUpdate(
      suggestionId,
      updateData,
      { new: true, runValidators: true }
    );

    //console.log('✅ Suggestion updated successfully');

    res.status(200).json({
      message: 'Suggestion updated successfully',
      suggestion: updatedSuggestion
    });

  } catch (error) {
    console.error('❌ Error updating suggestion:', error);
    res.status(500).json({ 
      message: 'Error updating suggestion', 
      error: error.message 
    });
  }
};

// DELETE - Delete a specific suggestion
export const deleteSuggestion = async (req, res) => {
  try {
    const { suggestionId } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    //console.log('🗑️ Deleting suggestion:', { suggestionId, userRole });

    // Validate suggestion ID
    if (!mongoose.Types.ObjectId.isValid(suggestionId)) {
      return res.status(400).json({ message: 'Invalid suggestion ID format' });
    }

    // Find the suggestion
    const suggestion = await Suggestion.findById(suggestionId);
    if (!suggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    // Role-based access control
    if (userRole === 'Admin' && suggestion.adminId.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    } else if (userRole === 'Receptionist') {
      const receptionist = await Receptionist.findById(userId);
      if (!receptionist || suggestion.adminId.toString() !== receptionist.admin.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Delete the suggestion
    await Suggestion.findByIdAndDelete(suggestionId);

    //console.log('✅ Suggestion deleted successfully');

    res.status(200).json({
      message: 'Suggestion deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting suggestion:', error);
    res.status(500).json({ 
      message: 'Error deleting suggestion', 
      error: error.message 
    });
  }
};
