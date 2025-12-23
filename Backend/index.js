//index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import Subscription from './models/Subscription.js';

// Route imports - including your existing routes
import authRoutes from './routes/authRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import receptionistRoutes from './routes/receptionistRoutes.js';
import labRecordRoutes from './routes/labrecordRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';
import medicationRoutes from './routes/medicationRoutes.js';
import suggestionsRoutes from './routes/suggestionsRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import customFieldsRoutes from './routes/customFieldsRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import receptionistPaymentRoutes from './routes/receptionistPaymentRoutes.js';
import patientPhotosRoutes from './routes/PhotosRoutes.js';
import dentalChartRoutes from './routes/DentalChartRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import treatmentEncounterRoutes from './routes/treatmentEncounterRoutes.js';
import hostauthRoutes from './routes/hostAuth.js';
import hostDashboardRoutes from './routes/hostDashboardRoutes.js';
import graphStatsRoutes from './routes/graphStatsRoutes.js';
import financeRoutes from './routes/financeRoutes.js'; // ✅ ADD FINANCE ROUTES
import settingsRoutes from "./routes/settingsRoutes.js";
import referralRoutes from './routes/referralRoutes.js';
import hostreferralRoutes from './routes/hostreferralroute.js';
// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

// Init Express app
const app = express();

// ✅ AUTO-UPDATE FUNCTION (moved here, before mongoose.connect)
const autoUpdatePatientLimits = async () => {
  try {
    console.log('🔄 Checking subscription limits...');
    
    const result = await Subscription.updateMany(
      { 
        planType: 'Basic Plan',
        'features.maxPatients': { $ne: 250 }
      },
      { 
        $set: { 
          'features.maxPatients': 250,
          updatedAt: new Date()
        } 
      }
    );

    if (result.modifiedCount > 0) {
      console.log(`✅ Updated ${result.modifiedCount} Basic Plan subscription(s) to 250 patients`);
    } else {
      console.log('✅ All subscriptions have correct limits');
    }
  } catch (error) {
    console.error('⚠️  Error updating limits:', error.message);
  }
};

// Middleware
app.use(cors({
  origin: '*',
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Create necessary directories function
const createDirectories = () => {
  const dirs = [
    path.join(__dirname, 'Uploads'),
    path.join(__dirname, 'Uploads', 'profiles'),
    path.join(__dirname, 'Uploads', 'patient-photos'),
    path.join(__dirname, 'Uploads', 'dental-photos')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// ✅ MODIFIED: Connect to MongoDB with auto-update
let isConnected = false;
const initializeDatabase = async () => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      console.log('✅ Database connected successfully');
      
      // 🔥 RUN AUTO-UPDATE AFTER CONNECTION
      await autoUpdatePatientLimits();
      
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }
};

// Initialize database and directories
initializeDatabase();
createDirectories();

// Routes - mount all routes
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/receptionists', receptionistRoutes);
app.use('/api/lab-records', labRecordRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/custom-fields', customFieldsRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/receptionist-payment', receptionistPaymentRoutes);
app.use('/api', patientPhotosRoutes);
app.use('/api', dentalChartRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api', treatmentEncounterRoutes);
app.use('/api/host/auth', hostauthRoutes);
app.use('/api/host', hostDashboardRoutes);
app.use('/api/graph', graphStatsRoutes);
app.use('/api', financeRoutes); // ✅ ADD FINANCE ROUTES
app.use('/api/finance', financeRoutes); // ✅ ADD FINANCE ROUTES
app.use("/api/settings", settingsRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/admin/referrals', hostreferralRoutes);
// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    routes: {
      dentalChart: '/api/dentalchart/:patientId',
      photos: '/api/dentalchart/:patientId/photos',
      upload: '/api/dentalchart/:patientId/upload-photos',
      finance: {
        patient: '/api/finance/patient/:patientId',
        hospitalSummary: '/api/finance/hospital/summary',
        topPatients: '/api/finance/hospital/top-patients',
        revenueByDate: '/api/finance/hospital/revenue-by-date',
        paymentStats: '/api/finance/hospital/payment-statistics',
        dailyRevenue: '/api/finance/hospital/daily-revenue',
        bulkSync: '/api/finance/hospital/bulk-sync'
      }
    }
  });
});

// Profile image route
app.get('/api/profile-image/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, 'Uploads', 'profiles', filename);
  
  if (fs.existsSync(imagePath)) {
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'image/jpeg';
    
    switch(ext) {
      case '.png': contentType = 'image/png'; break;
      case '.jpg':
      case '.jpeg': contentType = 'image/jpeg'; break;
      case '.gif': contentType = 'image/gif'; break;
      case '.webp': contentType = 'image/webp'; break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(imagePath);
  } else {
    res.status(404).json({ error: 'Image not found' });
  }
});

// Debug uploads directory route
app.get('/api/test-uploads', (req, res) => {
  const uploadsPath = path.join(__dirname, 'Uploads');
  const profilesPath = path.join(__dirname, 'Uploads', 'profiles');
  const patientPhotosPath = path.join(__dirname, 'Uploads', 'patient-photos');
  const dentalPhotosPath = path.join(__dirname, 'Uploads', 'dental-photos');
  
  const getDirectoryInfo = (dirPath) => {
    const exists = fs.existsSync(dirPath);
    let files = [];
    if (exists) {
      try {
        files = fs.readdirSync(dirPath);
      } catch (error) {
        console.error(`Error reading directory ${dirPath}:`, error);
      }
    }
    return { path: dirPath, exists, files };
  };
  
  res.json({
    uploadsDirectory: getDirectoryInfo(uploadsPath),
    profilesDirectory: getDirectoryInfo(profilesPath),
    patientPhotosDirectory: getDirectoryInfo(patientPhotosPath),
    dentalPhotosDirectory: getDirectoryInfo(dentalPhotosPath),
    currentDirectory: __dirname
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Dental CRM API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    uptime: process.uptime(),
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    database: isConnected ? 'connected' : 'disconnected'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.url}`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  if (err.status === 402) {
    return res.status(402).json({
      success: false,
      message: err.message || 'Subscription required',
      redirectTo: '/pricing',
      requiresSubscription: true
    });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry found',
      error: 'Resource already exists'
    });
  }
  
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n✅ Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('✅ Shutting down gracefully...');
  process.exit(0);
});

app.use('/uploads', express.static(path.join(__dirname, 'Uploads'), {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    switch (ext) {
      case '.png': contentType = 'image/png'; break;
      case '.jpg':
      case '.jpeg': contentType = 'image/jpeg'; break;
      case '.gif': contentType = 'image/gif'; break;
      case '.webp': contentType = 'image/webp'; break;
    }
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

app.use('/uploads', express.static(path.join(__dirname, 'Uploads/dental-photos')));

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Dental CRM Server Started`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`💰 Finance Routes: ENABLED`);
  console.log('='.repeat(50));
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

export default app;

