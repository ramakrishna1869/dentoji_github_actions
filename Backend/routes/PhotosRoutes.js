// patientPhotosRoutes.js
import express from "express";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyToken } from "../middleware/authMiddleware.js";
import PatientPhoto from "../models/PatientPhoto.js";
import Patient from "../models/Patient.js";

const router = express.Router();

// Create uploads directory for patient photos if it doesn't exist
const uploadsDir = 'uploads/patient-photos';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for patient photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const patientId = req.params.patientId;
    const patientDir = `uploads/patient-photos/${patientId}`;
    
    // Create patient-specific directory if it doesn't exist
    if (!fs.existsSync(patientDir)) {
      fs.mkdirSync(patientDir, { recursive: true });
    }
    
    cb(null, patientDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `dental-${uniqueSuffix}-${sanitizedOriginalName}${fileExtension}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/gif', 
    'image/webp',
    'image/bmp',
    'image/tiff'
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, BMP, and TIFF images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 20 // Maximum 20 files at once
  },
  fileFilter: fileFilter
});

// Upload multiple photos for a patient
router.post(
  "/patients/:hospitalId/:patientId/photos", 
  verifyToken, 
  upload.array('photos', 20),
  async (req, res) => {
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
          uploadedBy: req.user.id, // Store as string
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
  }
);

// Get all photos for a patient - FIXED: No User population
router.get(
  "/patients/:hospitalId/:patientId/photos", 
  verifyToken, 
  async (req, res) => {
    try {
      const { hospitalId, patientId } = req.params;
      const { category, limit, skip, sortBy = 'uploadedAt', sortOrder = 'desc' } = req.query;

      //console.log('Fetching photos for:', { hospitalId, patientId });

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

      //console.log('Query:', query);

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query WITHOUT population to avoid User schema error
      const photos = await PatientPhoto.find(query)
        .sort(sort)
        .limit(limit ? parseInt(limit) : 0)
        .skip(skip ? parseInt(skip) : 0)
        .select('-filePath') // Don't expose file paths for security
        .lean(); // Use lean() for better performance

      //console.log('Found photos:', photos.length);

      // Get total count for pagination
      const totalCount = await PatientPhoto.countDocuments(query);

      // Transform photos to include URL and handle uploadedBy info
      const photosWithUrls = photos.map(photo => ({
        ...photo,
        url: `/uploads/patient-photos/${patientId}/${photo.filename}`,
        thumbnailUrl: `/uploads/patient-photos/${patientId}/${photo.filename}?thumbnail=true`,
        // Create uploadedBy object with available info
        uploadedBy: {
          _id: photo.uploadedBy,
          firstName: 'User', // Default since we don't have User model
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
  }
);

// Delete a patient photo
router.delete(
  "/patients/:hospitalId/:patientId/photos/:photoId", 
  verifyToken, 
  async (req, res) => {
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
  }
);

// Update photo metadata
router.put(
  "/patients/:hospitalId/:patientId/photos/:photoId", 
  verifyToken, 
  async (req, res) => {
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
        photo: updatedPhoto
      });

    } catch (error) {
      console.error("Error updating patient photo:", error);
      res.status(500).json({ 
        message: "Error updating photo", 
        error: error.message 
      });
    }
  }
);

// Get photo statistics
router.get(
  "/patients/:hospitalId/:patientId/photos/stats", 
  verifyToken, 
  async (req, res) => {
    try {
      const { hospitalId, patientId } = req.params;

      const stats = await PatientPhoto.aggregate([
        {
          $match: {
            patientId: new mongoose.Types.ObjectId(patientId),
            hospitalId: new mongoose.Types.ObjectId(hospitalId),
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
  }
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File too large. Maximum size is 10MB per file.' 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        message: 'Too many files. Maximum 20 files allowed at once.' 
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        message: 'Unexpected field name. Use "photos" as field name.' 
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ message: error.message });
  }
  
  next(error);
});

export default router;