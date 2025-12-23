import PatientPhoto from "../models/PatientPhoto.js";
import Patient from "../models/Patient.js";
import fs from 'fs';
import path from 'path';

// Upload patient photos
export const uploadPatientPhotos = async (req, res) => {
  try {
    const { hospitalId, patientId } = req.params;
    const uploadedFiles = req.files;

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ message: "No photos uploaded" });
    }

    // Verify patient exists and belongs to the hospital
    const patient = await Patient.findOne({ 
      _id: patientId, 
      hospitalId: hospitalId 
    });

    if (!patient) {
      // Clean up uploaded files if patient not found
      uploadedFiles.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      return res.status(404).json({ message: "Patient not found" });
    }

    // Create photo records in database
    const photoPromises = uploadedFiles.map(async (file) => {
      const photoData = {
        patientId: patientId,
        hospitalId: hospitalId,
        filename: file.filename,
        originalName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy: req.user.id, // Store as string instead of ObjectId
        uploadedByRole: req.user.role || 'Unknown',
        uploadedAt: new Date(),
        category: req.body.category || 'general',
        description: req.body.description || '',
        isActive: true
      };

      return await PatientPhoto.create(photoData);
    });

    const savedPhotos = await Promise.all(photoPromises);

    // Update patient's photo count
    await Patient.findByIdAndUpdate(patientId, {
      $inc: { photoCount: savedPhotos.length },
      lastPhotoUpload: new Date()
    });

    res.status(201).json({
      message: "Photos uploaded successfully",
      photos: savedPhotos,
      count: savedPhotos.length
    });

  } catch (error) {
    console.error("Error uploading patient photos:", error);
    
    // Clean up uploaded files in case of error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({ 
      message: "Error uploading photos", 
      error: error.message 
    });
  }
};

// Get all photos for a patient - FIXED: No User population
export const getPatientPhotos = async (req, res) => {
  try {
    const { hospitalId, patientId } = req.params;
    const { category, limit, skip, sortBy = 'uploadedAt', sortOrder = 'desc' } = req.query;

    // Verify patient exists and user has access
    const patient = await Patient.findOne({ 
      _id: patientId, 
      hospitalId: hospitalId 
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Build query
    let query = {
      patientId: patientId,
      hospitalId: hospitalId,
      isActive: true
    };

    if (category) {
      query.category = category;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query without User population
    const photos = await PatientPhoto.find(query)
      .sort(sort)
      .limit(limit ? parseInt(limit) : 0)
      .skip(skip ? parseInt(skip) : 0)
      .select('-filePath') // Don't expose file paths for security
      .lean(); // Use lean for better performance

    // Get total count for pagination
    const totalCount = await PatientPhoto.countDocuments(query);

    // Transform photos to include URL and mock user info
    const photosWithUrls = photos.map(photo => ({
      ...photo,
      url: `/uploads/patient-photos/${patientId}/${photo.filename}`,
      thumbnailUrl: `/uploads/patient-photos/${patientId}/${photo.filename}?thumbnail=true`,
      // Mock uploadedBy object since we don't have User model
      uploadedBy: {
        _id: photo.uploadedBy,
        firstName: 'User',
        lastName: '',
        email: '',
        role: photo.uploadedByRole || 'Unknown'
      }
    }));

    res.json({
      photos: photosWithUrls,
      totalCount,
      hasMore: skip ? (parseInt(skip) + photosWithUrls.length) < totalCount : photosWithUrls.length < totalCount
    });

  } catch (error) {
    console.error("Error fetching patient photos:", error);
    res.status(500).json({ 
      message: "Error fetching photos", 
      error: error.message 
    });
  }
};

// Delete a patient photo
export const deletePatientPhoto = async (req, res) => {
  try {
    const { hospitalId, patientId, photoId } = req.params;

    // Find the photo
    const photo = await PatientPhoto.findOne({
      _id: photoId,
      patientId: patientId,
      hospitalId: hospitalId,
      isActive: true
    });

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // Check if user has permission (owner or admin)
    if (photo.uploadedBy !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: "Unauthorized to delete this photo" });
    }

    // Delete physical file
    if (fs.existsSync(photo.filePath)) {
      fs.unlinkSync(photo.filePath);
    }

    // Soft delete - mark as inactive
    await PatientPhoto.findByIdAndUpdate(photoId, {
      isActive: false,
      deletedAt: new Date(),
      deletedBy: req.user.id,
      deletedByRole: req.user.role
    });

    // Update patient's photo count
    await Patient.findByIdAndUpdate(patientId, {
      $inc: { photoCount: -1 }
    });

    res.json({ message: "Photo deleted successfully" });

  } catch (error) {
    console.error("Error deleting patient photo:", error);
    res.status(500).json({ 
      message: "Error deleting photo", 
      error: error.message 
    });
  }
};

// Update photo metadata
export const updatePhotoMetadata = async (req, res) => {
  try {
    const { hospitalId, patientId, photoId } = req.params;
    const { description, category, tags } = req.body;

    // Find the photo
    const photo = await PatientPhoto.findOne({
      _id: photoId,
      patientId: patientId,
      hospitalId: hospitalId,
      isActive: true
    });

    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    // Check if user has permission
    if (photo.uploadedBy !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: "Unauthorized to update this photo" });
    }

    // Update photo metadata
    const updateData = {
      updatedAt: new Date(),
      updatedBy: req.user.id,
      updatedByRole: req.user.role
    };

    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;

    const updatedPhoto = await PatientPhoto.findByIdAndUpdate(
      photoId,
      updateData,
      { new: true }
    );

    res.json({
      message: "Photo updated successfully",
      photo: {
        ...updatedPhoto.toObject(),
        // Mock uploadedBy info
        uploadedBy: {
          _id: updatedPhoto.updatedBy || updatedPhoto.uploadedBy,
          firstName: 'User',
          lastName: '',
          email: '',
          role: updatedPhoto.updatedByRole || updatedPhoto.uploadedByRole
        }
      }
    });

  } catch (error) {
    console.error("Error updating patient photo:", error);
    res.status(500).json({ 
      message: "Error updating photo", 
      error: error.message 
    });
  }
};

// Get photo categories and statistics
export const getPhotoStats = async (req, res) => {
  try {
    const { hospitalId, patientId } = req.params;

    const stats = await PatientPhoto.aggregate([
      {
        $match: {
          patientId: patientId,
          hospitalId: hospitalId,
          isActive: true
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalSize: { $sum: "$fileSize" },
          latestUpload: { $max: "$uploadedAt" }
        }
      }
    ]);

    const totalPhotos = await PatientPhoto.countDocuments({
      patientId: patientId,
      hospitalId: hospitalId,
      isActive: true
    });

    res.json({
      totalPhotos,
      categories: stats
    });

  } catch (error) {
    console.error("Error fetching photo stats:", error);
    res.status(500).json({ 
      message: "Error fetching photo statistics", 
      error: error.message 
    });
  }
};

// FIXED: Patient data endpoints to ensure hospitalId is included
export const getPatientById = async (req, res) => {
  try {
    const { hospitalId, patientId } = req.params;
    
    const patient = await Patient.findOne({ 
      _id: patientId,
      hospitalId: hospitalId 
    }).populate('hospitalId', 'name'); // Optional: populate hospital details
    
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Ensure hospitalId is included in the response
    const patientData = {
      ...patient.toObject(),
      hospitalId: hospitalId // Explicitly add hospitalId to response
    };
    
    res.json(patientData);
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json({ message: "Error fetching patient data" });
  }
};

// Get patients by hospital with hospitalId included
export const getPatientsByHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    
    const patients = await Patient.find({ hospitalId: hospitalId });
    
    // Ensure each patient has hospitalId field
    const patientsWithHospitalId = patients.map(patient => ({
      ...patient.toObject(),
      hospitalId: hospitalId
    }));
    
    res.json(patientsWithHospitalId);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ message: "Error fetching patients" });
  }
};