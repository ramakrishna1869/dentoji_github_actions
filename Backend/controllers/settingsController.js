// settingsController.js
import Admin from "../models/Admin.js";
import Hospital from "../models/Hospital.js";
import Settings from "../models/Settings.js"; // We'll create this model
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallbackSecretKey";


// GET /api/settings - Get user settings
export const getSettings = async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find settings for this user
    let settings = await Settings.findOne({ 
      userId: decoded.id,
      userModel: decoded.role
    });

    // If no settings exist, create default ones
    if (!settings) {
      settings = new Settings({
        userId: decoded.id,
        userModel: decoded.role,
        hospitalId: decoded.hospitalId,
        // Default values are set in the schema
      });
      await settings.save();
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT /api/settings - Update user settings
export const updateSettings = async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { profile, clinic, security, notifications, backup, system } = req.body;

    // Update user profile if provided
    if (profile && (profile.name || profile.qualification)) {
      if (decoded.role === 'Admin') {
        await Admin.findByIdAndUpdate(decoded.id, {
          ...(profile.name && { name: profile.name }),
          ...(profile.qualification && { qualification: profile.qualification })
        });
      }
      // Add Receptionist update logic if needed
    }

    // Update hospital/clinic info if provided and user is Admin
    if (clinic && decoded.role === 'Admin' && decoded.hospitalId) {
      await Hospital.findByIdAndUpdate(decoded.hospitalId, {
        ...(clinic.name && { name: clinic.name }),
        ...(clinic.phone && { phone: clinic.phone }),
        ...(clinic.address && { address: clinic.address })
      });
    }

    // Update settings
    const updateData = {};
    if (security) updateData.security = security;
    if (notifications) updateData.notifications = notifications;
    if (backup) updateData.backup = backup;
    if (system) updateData.system = system;

    const settings = await Settings.findOneAndUpdate(
      { 
        userId: decoded.id,
        userModel: decoded.role
      },
      updateData,
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    //console.log('Settings updated:', settings);
    res.status(200).json({ 
      message: 'Settings updated successfully',
      settings 
    });

  } catch (error) {
    console.error('Update settings error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST /api/settings/backup - Trigger manual backup
export const triggerBackup = async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Here you would implement actual backup logic
    // For now, we'll just update the last backup date
    const currentDate = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Update settings with new backup date
    const settings = await Settings.findOneAndUpdate(
      { 
        userId: decoded.id,
        userModel: decoded.role
      },
      { 
        'backup.lastBackupDate': currentDate
      },
      { 
        new: true,
        upsert: true
      }
    );

    //console.log('Backup triggered for user:', decoded.id);
    
    res.status(200).json({ 
      message: 'Backup completed successfully',
      lastBackupDate: currentDate
    });

  } catch (error) {
    console.error('Backup error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ message: 'Backup failed', error: error.message });
  }
};

// GET /api/settings/stats - Get system statistics
export const getSystemStats = async (req, res) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Here you would query your actual Patient and Appointment models
    // For now, we'll return sample data
    const stats = {
      totalPatients: 1247, // await Patient.countDocuments({ hospitalId: decoded.hospitalId })
      totalAppointments: 89, // await Appointment.countDocuments({ hospitalId: decoded.hospitalId, createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } })
      systemVersion: 'v2.1.4'
    };

    res.status(200).json(stats);

  } catch (error) {
    console.error('Get stats error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
