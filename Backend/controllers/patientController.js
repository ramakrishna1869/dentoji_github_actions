//patientController.js
import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import Receptionist from '../models/Receptionist.js';
import Hospital from '../models/Hospital.js';

// Validate ObjectId - Updated to handle different cases
const validateObjectId = (id, name) => {
  if (!id) {
    throw new Error(`${name} ID is required`);
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ${name} ID format: ${id}`);
  }
  return new mongoose.Types.ObjectId(id);
};

// Helper function to get user filter based on role
const getUserFilter = async (userRole, userId, providedHospitalId = null) => {
  let filter = {};
  
  if (userRole === 'Receptionist') {
    const receptionist = await Receptionist.findById(userId)
      .select('admin adminId hospitalId')
      .populate('admin', '_id')
      .lean();
      
    if (!receptionist) {
      throw new Error('Receptionist not found');
    }
    
    // ✅ Get doctor's adminId
    let doctorAdminId = receptionist.admin?._id?.toString() 
      || receptionist.admin?.toString()
      || receptionist.adminId?.toString();
    
    // Fallback to hospital lookup
    if (!doctorAdminId && receptionist.hospitalId) {
      const hospital = await Hospital.findById(receptionist.hospitalId)
        .select('adminId')
        .lean();
      doctorAdminId = hospital?.adminId?.toString();
    }
    
    if (!doctorAdminId) {
      throw new Error('Unable to determine doctor ID for receptionist');
    }
    
    filter.adminId = new mongoose.Types.ObjectId(doctorAdminId);
    
  } else if (userRole === 'Admin') {
    filter.adminId = new mongoose.Types.ObjectId(userId);
    
    if (providedHospitalId) {
      filter.hospitalId = validateObjectId(providedHospitalId, 'hospital');
    }
  }
  
  return filter;
};
// Helper function for image upload handling
const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validImageTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPEG, PNG, or GIF).');
      return;
    }

    // Validate file size (e.g., max 5MB)
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSizeBytes) {
      toast.error(`Image size exceeds ${maxSizeMB}MB. Please choose a smaller file.`);
      return;
    }

    // Compress image
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 800; // Max width for compressed image
        const maxHeight = 800; // Max height for compressed image
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression (quality: 0.7)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFormData((prev) => ({ ...prev, avatar: compressedDataUrl }));
        toast.success('Image uploaded successfully!');
      };
      img.onerror = () => {
        toast.error('Failed to process image. Please try another file.');
      };
    };
    reader.onerror = () => {
      toast.error('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  }
};
export const updatePatient = async (req, res) => {
  try {
    const { hospitalId, patientId } = req.params;
    const updateData = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    //console.log('📝 Updating patient with appointment sync:', { hospitalId, patientId, updateData, userRole, userId });

    // Validate patient ID
    validateObjectId(patientId, 'patient');

    // Validate hospital ID if provided
    if (hospitalId) {
      validateObjectId(hospitalId, 'hospital');
    }

    if (!Object.keys(updateData).length) {
      return res.status(400).json({ message: 'No update data provided' });
    }

    // Get the current patient data before update
    const filter = await getUserFilter(userRole, userId, hospitalId);
    filter._id = patientId;
    
    const currentPatient = await Patient.findOne(filter);
    if (!currentPatient) {
      return res.status(404).json({ message: 'Patient not found or unauthorized' });
    }

    // Clean and validate update data (keeping existing validation logic)
    const cleanUpdateData = { ...updateData };

    // Handle string fields - trim and validate required fields
    const stringFields = [
      'firstName', 'lastName', 'patientId', 'gender', 'bloodType',
      'patientType', 'primaryNumber', 'emailAddress', 'address', 'city',
      'phoneNumber', 'stateProvince', 'zipPostalCode', 'emergencyContactName',
      'relationship', 'emergencyContactNumber', 'emergencyContactEmail',
      'primaryDentalIssue', 'currentSymptoms', 'allergies', 'medicalHistory',
      'currentMedications', 'paymentMethod', 'lastPayment'
    ];

    const requiredFields = ['firstName', 'lastName', 'patientId', 'gender', 'primaryNumber', 'stateProvince', 'zipPostalCode'];

    stringFields.forEach(field => {
      if (cleanUpdateData[field] !== undefined) {
        if (typeof cleanUpdateData[field] === 'string') {
          cleanUpdateData[field] = cleanUpdateData[field].trim();

          if (requiredFields.includes(field) && cleanUpdateData[field] === '') {
            throw new Error(`${field} is required and cannot be empty`);
          }

          // Validate phone numbers for exactly 10 digits
          if (['primaryNumber', 'phoneNumber', 'emergencyContactNumber'].includes(field) && cleanUpdateData[field] !== '') {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(cleanUpdateData[field])) {
              throw new Error(`${field} must be exactly 10 digits`);
            }
          }

          if (!requiredFields.includes(field) && cleanUpdateData[field] === '') {
            if (['emailAddress', 'emergencyContactEmail'].includes(field)) {
              cleanUpdateData[field] = null;
            } else if (['bloodType', 'patientType', 'paymentMethod', 'lastPayment'].includes(field)) {
              cleanUpdateData[field] = '';
            } else {
              cleanUpdateData[field] = null;
            }
          }
        }
      }
    });

    // Validate lastPayment format
    if (cleanUpdateData.lastPayment && cleanUpdateData.lastPayment !== '') {
      const [amount, date] = cleanUpdateData.lastPayment.split(' · ');
      if (!amount || isNaN(parseFloat(amount.replace(/,/g, ''))) || parseFloat(amount.replace(/,/g, '')) < 0) {
        throw new Error('lastPayment amount must be a non-negative number');
      }
      if (!date || isNaN(new Date(date).getTime())) {
        throw new Error('lastPayment date is invalid');
      }
      cleanUpdateData.lastPayment = cleanUpdateData.lastPayment.trim();
    }

    // Handle numeric fields
    const numericFields = ['age', 'totalPaid', 'opFee'];
    numericFields.forEach(field => {
      if (cleanUpdateData[field] !== undefined) {
        if (cleanUpdateData[field] === '' || cleanUpdateData[field] === null) {
          cleanUpdateData[field] = 0;
        } else {
          const numValue = Number(cleanUpdateData[field]);
          if (isNaN(numValue) || numValue < 0) {
            throw new Error(`${field} must be a non-negative number`);
          }
          cleanUpdateData[field] = numValue;
        }
      }
    });

    // Handle date fields
    const dateFields = ['dateOfBirth', 'memberSince', 'lastVisit'];
    dateFields.forEach(field => {
      if (cleanUpdateData[field] !== undefined) {
        if (cleanUpdateData[field] === '' || cleanUpdateData[field] === null) {
          if (field === 'dateOfBirth') {
            throw new Error('Date of birth is required');
          } else {
            cleanUpdateData[field] = null;
          }
        } else if (cleanUpdateData[field]) {
          try {
            const date = new Date(cleanUpdateData[field]);
            if (isNaN(date.getTime())) {
              throw new Error(`Invalid date format for ${field}`);
            }

            if (field === 'dateOfBirth') {
              const today = new Date();
              if (date > today) {
                throw new Error('Date of birth cannot be in the future');
              }
            }

            cleanUpdateData[field] = date;
          } catch (error) {
            throw new Error(`Invalid date format for ${field}: ${error.message}`);
          }
        }
      }
    });

    // Handle enum fields validation
    const enumValidations = {
      gender: ['male', 'female', 'other'],
     // status: ['pending', 'completed'],
      patientType: ['regular', 'new', 'emergency', ''],
      bloodType: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      paymentMethod: ['cash', 'card', 'upi', 'bank_transfer', 'insurance', 'manual', '']
    };

    Object.keys(enumValidations).forEach(field => {
      if (cleanUpdateData[field] !== undefined && cleanUpdateData[field] !== null) {
        if (!enumValidations[field].includes(cleanUpdateData[field])) {
          throw new Error(`Invalid ${field}: ${cleanUpdateData[field]}`);
        }
      }
    });

    // Handle appointments array - ENHANCED WITH PROPER ID GENERATION
    let appointmentChanges = [];
    if (cleanUpdateData.appointments && Array.isArray(cleanUpdateData.appointments)) {
      const currentAppointments = currentPatient.appointments || [];
      const newAppointments = cleanUpdateData.appointments;

      // Track changes for each appointment
      newAppointments.forEach((newAppointment, index) => {
        if (newAppointment._id) {
          // Existing appointment - check for changes
          const currentAppointment = currentAppointments.find(
            apt => apt._id.toString() === newAppointment._id.toString()
          );
          
          if (currentAppointment) {
            const hasChanges = 
              currentAppointment.appointmentDate?.toISOString()?.split('T')[0] !== newAppointment.appointmentDate ||
              currentAppointment.appointmentTime !== newAppointment.appointmentTime ||
              currentAppointment.treatment !== newAppointment.treatment ||
              currentAppointment.doctor !== newAppointment.doctor ||
              currentAppointment.status !== newAppointment.status ||
              currentAppointment.priority !== newAppointment.priority;

            if (hasChanges) {
              appointmentChanges.push({
                type: 'updated',
                appointmentId: newAppointment._id,
                changes: {
                  appointmentDate: newAppointment.appointmentDate ? new Date(newAppointment.appointmentDate) : null,
                  appointmentTime: newAppointment.appointmentTime,
                  treatment: newAppointment.treatment,
                  doctor: newAppointment.doctor,
                  status: newAppointment.status,
                  priority: newAppointment.priority,
                  patientName: `${cleanUpdateData.firstName || currentPatient.firstName} ${cleanUpdateData.lastName || currentPatient.lastName}`,
                  patientPhone: cleanUpdateData.primaryNumber || currentPatient.primaryNumber
                }
              });
            }
          }
        } else {
          // New appointment - ALWAYS GENERATE ID
          appointmentChanges.push({
            type: 'created',
            appointment: {
              _id: new mongoose.Types.ObjectId(), // Ensure ID is generated
              appointmentDate: newAppointment.appointmentDate ? new Date(newAppointment.appointmentDate) : null,
              appointmentTime: newAppointment.appointmentTime,
              treatment: newAppointment.treatment,
              doctor: newAppointment.doctor,
              status: newAppointment.status || 'Scheduled',
              priority: newAppointment.priority || 'Medium',
              patientName: `${cleanUpdateData.firstName || currentPatient.firstName} ${cleanUpdateData.lastName || currentPatient.lastName}`,
              patientPhone: cleanUpdateData.primaryNumber || currentPatient.primaryNumber
            }
          });
        }
      });

      // Check for deleted appointments
      currentAppointments.forEach(currentAppointment => {
        const stillExists = newAppointments.find(
          apt => apt._id && apt._id.toString() === currentAppointment._id.toString()
        );
        
        if (!stillExists) {
          appointmentChanges.push({
            type: 'deleted',
            appointmentId: currentAppointment._id
          });
        }
      });

      // Clean appointments data and ENSURE ALL HAVE IDs
      cleanUpdateData.appointments = newAppointments.map(appointment => {
        const hasDate = appointment.appointmentDate && appointment.appointmentDate !== '';
        const hasTime = appointment.appointmentTime && appointment.appointmentTime.trim() !== '';
        const hasTreatment = appointment.treatment && appointment.treatment.trim() !== '';
        const hasDoctor = appointment.doctor && appointment.doctor.trim() !== '';

        // Only process appointments with meaningful data
        if (hasDate || hasTime || hasTreatment || hasDoctor) {
          const cleanAppointment = { ...appointment };
          
          // CRITICAL: Ensure appointment has an ID
          if (!cleanAppointment._id) {
            cleanAppointment._id = new mongoose.Types.ObjectId();
            //console.log('🆔 Generated new appointment ID:', cleanAppointment._id);
          } else {
            // Ensure existing ID is a proper ObjectId
            if (typeof cleanAppointment._id === 'string') {
              cleanAppointment._id = new mongoose.Types.ObjectId(cleanAppointment._id);
            }
          }
          
          if (cleanAppointment.appointmentDate && cleanAppointment.appointmentDate !== '') {
            try {
              cleanAppointment.appointmentDate = new Date(cleanAppointment.appointmentDate);
            } catch (error) {
              throw new Error('Invalid appointment date format');
            }
          } else {
            delete cleanAppointment.appointmentDate;
          }

          ['appointmentTime', 'treatment', 'doctor'].forEach(field => {
            if (cleanAppointment[field]) {
              cleanAppointment[field] = cleanAppointment[field].toString().trim();
              if (cleanAppointment[field] === '') {
                delete cleanAppointment[field];
              }
            } else {
              delete cleanAppointment[field];
            }
          });

          if (cleanAppointment.appointmentTime) {
            const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeRegex.test(cleanAppointment.appointmentTime)) {
              throw new Error('Invalid appointment time format. Use HH:MM format (e.g., 14:30)');
            }
          }

          // Set defaults
          cleanAppointment.status = cleanAppointment.status || 'Scheduled';
          cleanAppointment.priority = cleanAppointment.priority || 'Medium';
          
          // Add timestamps for tracking
          if (!appointment._id) {
            cleanAppointment.createdAt = new Date();
          }
          cleanAppointment.updatedAt = new Date();
          
          return cleanAppointment;
        }
        return null;
      }).filter(appointment => appointment !== null);

      //console.log(`🔧 Processed ${cleanUpdateData.appointments.length} appointments, all with IDs`);
    }

    // Handle custom fields
    if (cleanUpdateData.customFields && Array.isArray(cleanUpdateData.customFields)) {
      cleanUpdateData.customFields = cleanUpdateData.customFields
        .filter(field => field.label && field.label.trim() !== '')
        .map(field => ({
          label: field.label.trim(),
          value: field.value ? field.value.toString().trim() : '',
          type: field.type || 'text', 
          section : field.section
        }));
    }

    // Remove undefined values
    Object.keys(cleanUpdateData).forEach(key => {
      if (cleanUpdateData[key] === undefined) {
        delete cleanUpdateData[key];
      }
    });

    //console.log('📝 Clean update data after validation:', cleanUpdateData);
    //console.log('🔄 Appointment changes detected:', appointmentChanges);

    // Update the patient
    const updatedPatient = await Patient.findOneAndUpdate(
      filter,
      { $set: cleanUpdateData },
      {
        new: true,
        runValidators: false,
        context: 'query'
      }
    ).populate('hospitalId', 'name');

    if (!updatedPatient) {
      return res.status(404).json({ message: 'Patient not found or unauthorized' });
    }

    // Manually validate the updated document
    try {
      await updatedPatient.validate();
    } catch (validationError) {
      console.error('❌ Post-update validation failed:', validationError);
      throw validationError;
    }

    //console.log('✅ Patient updated successfully with appointment IDs:', updatedPatient._id);

    // Log appointment IDs for verification
    if (updatedPatient.appointments && updatedPatient.appointments.length > 0) {
      //console.log('📋 Appointment IDs in updated patient:');
      updatedPatient.appointments.forEach((apt, index) => {
        //console.log(`  ${index + 1}. ${apt._id} - ${apt.doctor || 'No doctor'} - ${apt.treatment || 'No treatment'}`);
      });
    }

    // Return response with appointment sync information
    res.status(200).json({
      message: 'Patient updated successfully',
      patient: {
        ...updatedPatient.toObject(),
        hospitalName: updatedPatient.hospitalId?.name || 'N/A',
      },
      appointmentSync: {
        changesDetected: appointmentChanges.length > 0,
        changes: appointmentChanges,
        message: appointmentChanges.length > 0 
          ? `${appointmentChanges.length} appointment changes synchronized`
          : 'No appointment changes detected',
        appointmentIdsGenerated: cleanUpdateData.appointments ? 
          cleanUpdateData.appointments.filter(apt => apt._id).length : 0
      }
    });
  } catch (error) {
    console.error('❌ Update patient error:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value,
        kind: err.kind
      }));

      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors,
        details: 'Please check the highlighted fields and correct any errors'
      });
    }

    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: 'Duplicate field value',
        error: `A patient with this ${duplicateField} already exists`
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid data type',
        error: `Invalid ${error.path}: ${error.value}`
      });
    }

    if (error.message.includes('is required') ||
        error.message.includes('Invalid') ||
        error.message.includes('must be') ||
        error.message.includes('cannot be')) {
      return res.status(400).json({
        message: 'Validation failed',
        error: error.message
      });
    }

    res.status(500).json({
      message: 'Error updating patient',
      error: error.message,
    });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const { hospitalId, patientId, appointmentId } = req.params;
    const updateData = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    /*console.log('📝 Updating appointment:', { 
      hospitalId, patientId, appointmentId, 
      updateData, userRole, userId 
    });*/

    // Validate IDs
    validateObjectId(patientId, 'patient');
    validateObjectId(appointmentId, 'appointment');

    // Get filter based on user role
    const filter = await getUserFilter(userRole, userId, hospitalId);
    filter._id = patientId;

    // Get current patient data
    const currentPatient = await Patient.findOne(filter);
    if (!currentPatient) {
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found or unauthorized' 
      });
    }

    // Find the current appointment
    const currentAppointment = currentPatient.appointments.id(appointmentId);
    if (!currentAppointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found' 
      });
    }

    // Extract and validate data
    const { patientName, patientPhone, status, appointmentDate, appointmentTime, 
            treatment, doctor, priority, notes } = updateData;
    
    // Validate status if provided
    const validStatuses = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Pending', 'Rescheduled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: `Invalid status: ${status}. Must be one of ${validStatuses.join(', ')}` 
      });
    }

    // Build update fields
    const updateFields = {};
    
    if (appointmentDate) {
      const date = new Date(appointmentDate);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid appointment date format' 
        });
      }
      updateFields['appointments.$.appointmentDate'] = date;
    }
    
    if (appointmentTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(appointmentTime)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid appointment time format. Use HH:MM format (e.g., 14:30)' 
        });
      }
      updateFields['appointments.$.appointmentTime'] = appointmentTime.trim();
    }
    
    if (treatment) updateFields['appointments.$.treatment'] = treatment.trim();
    if (doctor) updateFields['appointments.$.doctor'] = doctor.trim();
    
    if (status) {
      updateFields['appointments.$.status'] = status;
      /*console.log('🔄 Status being updated:', { 
        from: currentAppointment.status, 
        to: status 
      });*/
    }
    
    if (priority) {
      const validPriorities = ['Low', 'Medium', 'High', 'Urgent'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ 
          success: false,
          message: `Invalid priority: ${priority}. Must be one of ${validPriorities.join(', ')}` 
        });
      }
      updateFields['appointments.$.priority'] = priority;
    }
    
    if (notes !== undefined) {
      updateFields['appointments.$.notes'] = notes ? notes.trim() : '';
    }

    // CRITICAL: Always update the updatedAt timestamp
    updateFields['appointments.$.updatedAt'] = new Date();

    // Check if we have any updates
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No valid update data provided' 
      });
    }

    //console.log('📝 Applying update fields:', updateFields);

    // Perform the update
    const updatedPatient = await Patient.findOneAndUpdate(
      { ...filter, 'appointments._id': appointmentId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ 
        success: false,
        message: 'Failed to update appointment' 
      });
    }

    // Update patient details if provided
    if (patientName || patientPhone) {
      const patientUpdates = {};
      if (patientName) {
        const nameParts = patientName.trim().split(' ');
        patientUpdates.firstName = nameParts[0] || '';
        patientUpdates.lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      }
      if (patientPhone) {
        patientUpdates.primaryNumber = patientPhone.trim();
      }
      
      await Patient.findByIdAndUpdate(
        patientId, 
        { $set: patientUpdates }, 
        { runValidators: true }
      );
    }

    // Fetch the final updated data
    const finalPatient = await Patient.findById(patientId);
    const updatedAppointmentData = finalPatient.appointments.id(appointmentId);

    const appointmentResponse = {
      ...updatedAppointmentData.toObject(),
      patientName: `${finalPatient.firstName} ${finalPatient.lastName}`,
      patientPhone: finalPatient.primaryNumber || finalPatient.phoneNumber || 'N/A',
      patientId: finalPatient._id,
      patientCustomId: finalPatient.patientId,
      hospitalId: finalPatient.hospitalId,
      adminId: finalPatient.adminId
    };

    /*console.log('✅ Appointment updated successfully:', {
      appointmentId,
      oldStatus: currentAppointment.status,
      newStatus: updatedAppointmentData.status,
      updatedAt: updatedAppointmentData.updatedAt
    });*/

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment: appointmentResponse
    });

  } catch (error) {
    console.error('❌ Error updating appointment:', error);
    res.status(error.message.includes('Invalid') ? 400 : 500).json({ 
      success: false,
      message: error.message.includes('Invalid') ? error.message : 'Error updating appointment', 
      error: error.message 
    });
  }
};


//     const userRole = req.user.role;
//     const userId = req.user.id;
//     const { hospitalId, page = 1, limit = 10, includeSyncInfo = false } = req.query;

//     //console.log('🔍 Getting all appointments with sync info:', { userRole, userId, hospitalId, page, limit });

//     // Get filter based on user role
//     const filter = await getUserFilter(userRole, userId, hospitalId);

//     //console.log('🔎 Database filter for getAllAppointments:', filter);

//     // Use aggregation to get all appointments with patient info and sync information
//     const pipeline = [
//   { $match: { ...filter, status: { $ne: 'deleted' } } }, // Add status filter here
//   { $unwind: { path: '$appointments', preserveNullAndEmptyArrays: false } },
//   {
//     $project: {
//       _id: '$appointments._id',
//       appointmentDate: '$appointments.appointmentDate',
//       appointmentTime: '$appointments.appointmentTime',
//       treatment: '$appointments.treatment',
//       doctor: '$appointments.doctor',
//       status: '$appointments.status',
//       priority: '$appointments.priority',
//       notes: '$appointments.notes',
//       patientId: '$_id',
//       patientName: { $concat: ['$firstName', ' ', '$lastName'] },
//       patientPhone: { $ifNull: ['$primaryNumber', '$phoneNumber'] },
//       hospitalId: '$hospitalId',
//       adminId: '$adminId',
//       createdAt: '$appointments.createdAt',
//       updatedAt: '$appointments.updatedAt',
//       lastSyncedAt: '$appointments.lastSyncedAt',
//       syncVersion: { $ifNull: ['$appointments.syncVersion', 1] },
//       patientStatus: '$status' // Add patient status to identify deleted patients
//     }
//   },
//   { $sort: { appointmentDate: -1, appointmentTime: -1 } },
//   { $skip: (page - 1) * parseInt(limit) },
//   { $limit: parseInt(limit) }
// ];

//     const appointments = await Patient.aggregate(pipeline);
    
//     // Get total count for pagination
//     const countPipeline = [
//   { $match: { ...filter, status: { $ne: 'deleted' } } }, // Add status filter here
//   { $unwind: { path: '$appointments', preserveNullAndEmptyArrays: false } },
//   { $count: 'total' }
// ];

//     const totalResult = await Patient.aggregate(countPipeline);
//     const totalAppointments = totalResult.length > 0 ? totalResult[0].total : 0;
//     const totalPages = Math.ceil(totalAppointments / limit);

//     //console.log(`✅ Found ${appointments.length} appointments with sync info`);

//     res.json({
//       appointments,
//       totalAppointments,
//       totalPages,
//       currentPage: parseInt(page),
//       syncInfo: includeSyncInfo === 'true' ? {
//         lastSyncCheck: new Date(),
//         syncEnabled: true,
//         appointmentsWithSync: appointments.filter(apt => apt.lastSyncedAt).length
//       } : undefined
//     });
//   } catch (error) {
//     console.error('❌ Error fetching appointments:', error);
//     res.status(error.message.includes('Invalid') ? 400 : 500).json({ message: error.message });
//   }
// };
// GET ALL APPOINTMENTS WITH ENHANCED SYNC INFO AND APPOINTMENT ID
// GET ALL APPOINTMENTS WITH ENHANCED SYNC INFO AND CORRECT PATIENT ID
// GET ALL APPOINTMENTS WITH ENHANCED SYNC INFO AND CORRECT PATIENT ID
export const getAllAppointments = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    const { hospitalId, page = 1, limit = 10, includeSyncInfo = false } = req.query;

    //console.log('🔍 Getting all appointments with sync info:', { userRole, userId, hospitalId, page, limit });

    // Get filter based on user role
    const filter = await getUserFilter(userRole, userId, hospitalId);

    //console.log('🔎 Database filter for getAllAppointments:', filter);

    // Use aggregation to get all appointments with patient info and sync information
    const pipeline = [
      { $match: { ...filter, status: { $ne: 'deleted' } } }, // Add status filter here
      { $unwind: { path: '$appointments', preserveNullAndEmptyArrays: false } },
      {
        $project: {
          _id: '$appointments._id', // This is the appointment ID
          appointmentId: '$appointments._id', // Explicit appointment ID field
          appointmentDate: '$appointments.appointmentDate',
          appointmentTime: '$appointments.appointmentTime',
          treatment: '$appointments.treatment',
          doctor: '$appointments.doctor',
          status: '$appointments.status',
          priority: '$appointments.priority',
          notes: '$appointments.notes',
          patientId: '$_id', // This is the patient's MongoDB _id
          patientCustomId: '$patientId', // This is the custom patient ID (like "KOSERA0001")
          patientName: { 
            $concat: [
              { $ifNull: ['$firstName', ''] },
              ' ',
              { $ifNull: ['$lastName', ''] }
            ]
          },
          patientPhone: { $ifNull: ['$primaryNumber', '$phoneNumber'] },
          hospitalId: '$hospitalId',
          adminId: '$adminId',
          createdAt: '$appointments.createdAt',
          updatedAt: '$appointments.updatedAt',
          lastSyncedAt: '$appointments.lastSyncedAt',
          syncVersion: { $ifNull: ['$appointments.syncVersion', 1] },
          patientStatus: '$status', // Add patient status to identify deleted patients
          // Add filtering criteria for scheduled appointments
          hasScheduledData: {
            $or: [
              { $and: [
                { $ne: ['$appointments.appointmentDate', null] },
                { $ne: ['$appointments.appointmentTime', null] },
                { $ne: ['$appointments.appointmentTime', ''] }
              ]},
              { $and: [
                { $ne: ['$appointments.doctor', null] },
                { $ne: ['$appointments.doctor', ''] }
              ]},
              { $and: [
                { $ne: ['$appointments.treatment', null] },
                { $ne: ['$appointments.treatment', ''] }
              ]}
            ]
          }
        }
      },
      // Filter to only include appointments with scheduling data
      { $match: { hasScheduledData: true } },
      { $sort: { appointmentDate: -1, appointmentTime: -1 } },
      { $skip: (page - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    ];

    const appointments = await Patient.aggregate(pipeline);
    
    // Get total count for pagination - only scheduled appointments
    const countPipeline = [
      { $match: { ...filter, status: { $ne: 'deleted' } } },
      { $unwind: { path: '$appointments', preserveNullAndEmptyArrays: false } },
      {
        $project: {
          hasScheduledData: {
            $or: [
              { $and: [
                { $ne: ['$appointments.appointmentDate', null] },
                { $ne: ['$appointments.appointmentTime', null] },
                { $ne: ['$appointments.appointmentTime', ''] }
              ]},
              { $and: [
                { $ne: ['$appointments.doctor', null] },
                { $ne: ['$appointments.doctor', ''] }
              ]},
              { $and: [
                { $ne: ['$appointments.treatment', null] },
                { $ne: ['$appointments.treatment', ''] }
              ]}
            ]
          }
        }
      },
      { $match: { hasScheduledData: true } },
      { $count: 'total' }
    ];

    const totalResult = await Patient.aggregate(countPipeline);
    const totalAppointments = totalResult.length > 0 ? totalResult[0].total : 0;
    const totalPages = Math.ceil(totalAppointments / limit);

    //console.log(`✅ Found ${appointments.length} scheduled appointments with custom patient IDs`);

    // Debug log first appointment to verify structure
    if (appointments.length > 0) {
      /*console.log('Sample appointment structure:', {
        appointmentId: appointments[0]._id,
        patientMongoId: appointments[0].patientId,
        patientCustomId: appointments[0].patientCustomId,
        patientName: appointments[0].patientName,
        doctor: appointments[0].doctor,
        treatment: appointments[0].treatment
      });*/
    }

    res.json({
      appointments,
      totalAppointments,
      totalPages,
      currentPage: parseInt(page),
      syncInfo: includeSyncInfo === 'true' ? {
        lastSyncCheck: new Date(),
        syncEnabled: true,
        appointmentsWithSync: appointments.filter(apt => apt.lastSyncedAt).length
      } : undefined
    });
  } catch (error) {
    console.error('❌ Error fetching appointments:', error);
    res.status(error.message.includes('Invalid') ? 400 : 500).json({ message: error.message });
  }
};
// Add a new endpoint for manual sync verification
export const syncAppointments = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    const { hospitalId } = req.params;

    //console.log('🔄 Manual appointment sync requested:', { userRole, userId, hospitalId });

    // Get filter based on user role
    const filter = await getUserFilter(userRole, userId, hospitalId);

    // Find all patients with appointments
    const patients = await Patient.find(filter).select('appointments firstName lastName primaryNumber');
    
    let syncResults = {
      patientsProcessed: 0,
      appointmentsProcessed: 0,
      inconsistenciesFound: 0,
      inconsistencies: []
    };

    for (const patient of patients) {
      if (patient.appointments && patient.appointments.length > 0) {
        syncResults.patientsProcessed++;
        
        for (const appointment of patient.appointments) {
          syncResults.appointmentsProcessed++;
          
          // Check for inconsistencies (example checks)
          const expectedPatientName = `${patient.firstName} ${patient.lastName}`;
          
          // Mark appointment as synced
          appointment.lastSyncedAt = new Date();
          appointment.syncVersion = (appointment.syncVersion || 1) + 1;
        }
        
        // Save patient with updated sync info
        await patient.save();
      }
    }

    //console.log('✅ Manual sync completed:', syncResults);

    res.json({
      message: 'Appointment sync completed successfully',
      results: syncResults,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Error in manual sync:', error);
    res.status(500).json({ message: 'Error performing sync', error: error.message });
  }
};

// Generate patient ID
export const generatePatientId = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    //console.log('🔢 Generating patient ID for hospital:', hospitalId);

    // Validate hospital ID
    validateObjectId(hospitalId, 'hospital');

    // Get filter based on user role
    const filter = await getUserFilter(userRole, userId, hospitalId);
    
    // Get the count of patients for this hospital
    const patientCount = await Patient.countDocuments(filter);
    const nextPatientNumber = patientCount + 1;
    const patientId = `D${nextPatientNumber.toString().padStart(3, '0')}`;

    //console.log('✅ Generated patient ID:', patientId);
    res.json({ patientId });
  } catch (error) {
    console.error('❌ Error generating patient ID:', error);
    res.status(error.message.includes('Invalid') ? 400 : 500).json({ 
      message: 'Error generating patient ID', 
      error: error.message 
    });
  }
};

// Add custom field to all patients
export const addCustomFieldToAllPatients = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { label, value } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    //console.log('📝 Adding custom field to all patients:', { hospitalId, label, value });

    if (!label || label.trim() === '') {
      return res.status(400).json({ message: 'Label is required' });
    }

    // Validate hospital ID
    validateObjectId(hospitalId, 'hospital');

    // Get filter based on user role
    const filter = await getUserFilter(userRole, userId, hospitalId);

    // Add the custom field to all patients in this hospital
    const result = await Patient.updateMany(
      filter,
      { $push: { customFields: { label: label.trim(), value: value || '' } } }
    );

    //console.log('✅ Custom field added to patients:', result.modifiedCount);
    res.json({ 
      message: 'Custom field added to all patients successfully',
      patientsUpdated: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Error adding custom field to all patients:', error);
    res.status(error.message.includes('Invalid') ? 400 : 500).json({ 
      message: 'Error adding custom field', 
      error: error.message 
    });
  }
};

// Get all patients
// Get all patients - FIXED VERSION
// patientController.js - COMPLETE FIXED getPatients function

// patientController.js - EMERGENCY FIX for getPatients

export const getPatients = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    const tokenAdminId = req.user.adminId;

    console.log("🔍 getPatients() Called:", { 
      userRole, 
      userId, 
      tokenAdminId,
      hospitalId: req.user.hospitalId
    });

    let filter = {};
    let doctorAdminId = null;

    // ------------------------------------------------------------
    // 1️⃣ ADMIN → Use their own adminId
    // ------------------------------------------------------------
    if (userRole === "Admin") {
      doctorAdminId = userId;
      
      console.log("👨‍⚕️ Admin Login - Using Admin's Own ID:", doctorAdminId);

      if (!mongoose.Types.ObjectId.isValid(doctorAdminId)) {
        return res.status(400).json({
          message: `Invalid admin ID format: ${doctorAdminId}`,
        });
      }

      filter.adminId = new mongoose.Types.ObjectId(doctorAdminId);
    }

    // ------------------------------------------------------------
    // 2️⃣ RECEPTIONIST → Find doctor via hospital
    // ------------------------------------------------------------
    else if (userRole === "Receptionist") {
      console.log("👩‍💼 Receptionist Login Detected");

      // 🔥 EMERGENCY FIX: If adminId is missing from token, find via receptionist record
      if (!tokenAdminId) {
        console.log("⚠️ AdminId missing from token, fetching from receptionist record...");

        const receptionist = await Receptionist.findById(userId)
          .select('admin adminId hospitalId')
          .populate('admin', '_id')
          .lean();

        if (!receptionist) {
          return res.status(404).json({
            success: false,
            message: "Receptionist account not found.",
          });
        }

        console.log("🔍 Receptionist Record:", {
          admin: receptionist.admin,
          adminId: receptionist.admin_Id,
          hospitalId: receptionist.hospitalId
        });

        // Try to get doctor ID from receptionist.admin or receptionist.adminId
        doctorAdminId = receptionist.admin?._id?.toString() 
          || receptionist.admin?.toString()
          || receptionist.adminId?.toString();

        // 🔥 FALLBACK: If still not found, get doctor from hospital
        if (!doctorAdminId && receptionist.hospitalId) {
          console.log("⚠️ Doctor ID not in receptionist record, finding via hospital...");

          const hospital = await Hospital.findById(receptionist.hospitalId)
            .select('adminId')
            .lean();

          if (hospital && hospital.adminId) {
            doctorAdminId = hospital.adminId.toString();
            console.log("✅ Found doctor ID from hospital:", doctorAdminId);
          }
        }

        if (!doctorAdminId) {
          return res.status(400).json({
            success: false,
            message: "Unable to determine doctor ID. Please contact support.",
            debug: {
              receptionistId: userId,
              hasAdmin: !!receptionist.admin,
              hasAdminId: !!receptionist.adminId,
              hasHospitalId: !!receptionist.hospitalId
            }
          });
        }

        console.log("✅ Doctor ID resolved:", doctorAdminId);
      } else {
        // AdminId exists in token
        doctorAdminId = tokenAdminId;
        console.log("✅ Using doctor ID from token:", doctorAdminId);
      }

      // Validate doctor ID
      if (!mongoose.Types.ObjectId.isValid(doctorAdminId)) {
        return res.status(400).json({
          message: `Invalid doctor admin ID format: ${doctorAdminId}`,
        });
      }

      filter.adminId = new mongoose.Types.ObjectId(doctorAdminId);
    }

    // ------------------------------------------------------------
    // 3️⃣ Query Patients
    // ------------------------------------------------------------
    console.log("🔎 MongoDB Filter:", filter);

    const patients = await Patient.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Patients Found: ${patients.length}`);

    return res.json(patients);

  } catch (error) {
    console.error("❌ getPatients Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching patients",
      error: error.message,
    });
  }
};

// Fixed createPatient function



export const createPatient = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const tokenAdminId = req.user?.adminId;

    // ✅ STEP 1: Determine the correct adminId (doctor's ID)
    let targetAdminId;

    if (userRole === "Admin") {
      targetAdminId = userId;
    } else if (userRole === "Receptionist") {
      if (tokenAdminId) {
        targetAdminId = tokenAdminId;
      } else {
        const receptionist = await Receptionist.findById(userId)
          .select('admin adminId hospitalId')
          .populate('admin', '_id')
          .lean();

        if (!receptionist) {
          return res.status(404).json({
            success: false,
            message: "Receptionist account not found.",
          });
        }

        targetAdminId = receptionist.admin?._id?.toString() 
          || receptionist.admin?.toString()
          || receptionist.adminId?.toString();

        if (!targetAdminId && receptionist.hospitalId) {
          const hospital = await Hospital.findById(receptionist.hospitalId)
            .select('adminId')
            .lean();
          targetAdminId = hospital?.adminId?.toString();
        }
      }

      if (!targetAdminId) {
        return res.status(400).json({
          success: false,
          message: "Unable to determine doctor ID.",
        });
      }
    } else {
      targetAdminId = userId;
    }

    console.log("👤 Creating patient - Role:", userRole, "Target AdminId:", targetAdminId);

    // ✅ STEP 2: Destructure request body (removed adminId from here)
    const {
      patientId,
      firstName,
      lastName,
      dateOfBirth,
      age,
      gender,
      bloodType,
      patientType,
      memberSince,
      lastVisit,
      primaryNumber,
      emailAddress,
      address,
      city,
      phoneNumber,
      stateProvince,
      zipPostalCode,
      emergencyContactName,
      relationship,
      emergencyContactNumber,
      emergencyContactEmail,
      primaryDentalIssue,
      currentSymptoms,
      allergies,
      medicalHistory,
      currentMedications,
      totalPaid,
      opFee,
      lastPayment,
      paymentMethod,
      customFields,
      avatar,
      appointments,
    } = req.body;

    // Helper functions for validation
    const validateEmail = (email) => {
      if (!email) return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const validateDate = (dateString) => {
      if (!dateString) return true;
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    };

    const validatePhoneNumber = (phone) => {
      if (!phone) return true;
      const phoneRegex = /^\d{10}$/;
      return phoneRegex.test(phone);
    };

    const validateTextOnly = (text) => {
      if (!text) return true;
      const textRegex = /^[a-zA-Z\s\-']+$/;
      return textRegex.test(text);
    };

    const validateNumericOnly = (value) => {
      if (!value || value === '') return true;
      const numericRegex = /^\d+(\.\d+)?$/;
      return numericRegex.test(value.toString());
    };

    // Validate hospitalId format
    if (hospitalId && !mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ message: 'Invalid hospital ID format' });
    }

    // Validate email fields
    if (emailAddress && !validateEmail(emailAddress)) {
      return res.status(400).json({ message: 'Invalid email address format' });
    }
    if (emergencyContactEmail && !validateEmail(emergencyContactEmail)) {
      return res.status(400).json({ message: 'Invalid emergency contact email format' });
    }

    // Validate date fields
    if (dateOfBirth && !validateDate(dateOfBirth)) {
      return res.status(400).json({ message: 'Invalid date of birth format' });
    }
    if (memberSince && !validateDate(memberSince)) {
      return res.status(400).json({ message: 'Invalid member since date format' });
    }
    if (lastVisit && !validateDate(lastVisit)) {
      return res.status(400).json({ message: 'Invalid last visit date format' });
    }

    // Validate phone numbers
    if (primaryNumber && !validatePhoneNumber(primaryNumber)) {
      return res.status(400).json({ message: 'Invalid primary phone number. Use only digits (10-12 digits after country code)' });
    }
    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number. Use only digits (10-12 digits after country code)' });
    }
    if (emergencyContactNumber && !validatePhoneNumber(emergencyContactNumber)) {
      return res.status(400).json({ message: 'Invalid emergency contact number. Use only digits (10-12 digits after country code)' });
    }

    // Validate text-only fields
    if (firstName && !validateTextOnly(firstName)) {
      return res.status(400).json({ message: 'First name should contain only letters and spaces' });
    }
    if (lastName && !validateTextOnly(lastName)) {
      return res.status(400).json({ message: 'Last name should contain only letters and spaces' });
    }
    if (emergencyContactName && !validateTextOnly(emergencyContactName)) {
      return res.status(400).json({ message: 'Emergency contact name should contain only letters and spaces' });
    }
    if (city && !validateTextOnly(city)) {
      return res.status(400).json({ message: 'City should contain only letters and spaces' });
    }

    // Validate numeric fields
    if (totalPaid && !validateNumericOnly(totalPaid)) {
      return res.status(400).json({ message: 'Total paid should contain only numbers' });
    }
    if (opFee && !validateNumericOnly(opFee)) {
      return res.status(400).json({ message: 'OP fee should contain only numbers' });
    }
    if (lastPayment && !validateNumericOnly(lastPayment)) {
      return res.status(400).json({ message: 'Last payment should contain only numbers' });
    }

    // Check if patient with same patientId already exists
    if (patientId && hospitalId) {
      const existingPatient = await Patient.findOne({ patientId, hospitalId });
      if (existingPatient) {
        return res.status(409).json({ message: 'Patient with this ID already exists' });
      }
    }

    // Calculate age if dateOfBirth is provided
    const calculatedAge = age || (dateOfBirth ? calculateAge(dateOfBirth) : null);

    // ✅ STEP 3: Use targetAdminId (NOT adminId from req.body)
    const patientData = {
      hospitalId: hospitalId || req.user?.hospitalId,
      adminId: targetAdminId,  // ✅ FIXED - uses doctor's ID
    };

    // Add fields only if they are provided and not empty
    if (patientId) patientData.patientId = patientId;
    if (firstName) patientData.firstName = firstName.trim();
    if (lastName) patientData.lastName = lastName.trim();
    if (dateOfBirth) patientData.dateOfBirth = new Date(dateOfBirth);
    if (calculatedAge !== null) patientData.age = calculatedAge;
    if (gender) patientData.gender = gender;
    if (bloodType) patientData.bloodType = bloodType;
    if (patientType) patientData.patientType = patientType;
    if (memberSince) patientData.memberSince = new Date(memberSince);
    if (lastVisit) patientData.lastVisit = new Date(lastVisit);
    if (primaryNumber) patientData.primaryNumber = primaryNumber.trim();
    if (emailAddress) patientData.emailAddress = emailAddress.trim();
    if (address) patientData.address = address.trim();
    if (city) patientData.city = city.trim();
    if (phoneNumber) patientData.phoneNumber = phoneNumber.trim();
    if (stateProvince) patientData.stateProvince = stateProvince.trim();
    if (zipPostalCode) patientData.zipPostalCode = zipPostalCode.trim();
    if (emergencyContactName) patientData.emergencyContactName = emergencyContactName.trim();
    if (relationship) patientData.relationship = relationship;
    if (emergencyContactNumber) patientData.emergencyContactNumber = emergencyContactNumber.trim();
    if (emergencyContactEmail) patientData.emergencyContactEmail = emergencyContactEmail.trim();
    if (primaryDentalIssue) patientData.primaryDentalIssue = primaryDentalIssue.trim();
    if (currentSymptoms) patientData.currentSymptoms = currentSymptoms.trim();
    if (allergies) patientData.allergies = allergies.trim();
    if (medicalHistory) patientData.medicalHistory = medicalHistory.trim();
    if (currentMedications) patientData.currentMedications = currentMedications.trim();
    if (totalPaid) patientData.totalPaid = totalPaid.toString();
    else patientData.totalPaid = '0';
    if (opFee) patientData.opFee = opFee.toString();
    else patientData.opFee = '0';
    if (lastPayment) patientData.lastPayment = lastPayment.toString();
    if (paymentMethod) patientData.paymentMethod = paymentMethod;
    if (customFields && Array.isArray(customFields)) patientData.customFields = customFields;
    if (avatar) patientData.avatar = avatar;
    if (appointments && Array.isArray(appointments)) patientData.appointments = appointments;

    // Create and save patient
    const newPatient = new Patient(patientData);
    const savedPatient = await newPatient.save();

    console.log('✅ Patient created:', savedPatient._id, 'with adminId:', targetAdminId);

    res.status(201).json({
      message: 'Patient created successfully',
      patient: savedPatient,
      _id: savedPatient._id,
      patientId: savedPatient.patientId,
    });
  } catch (error) {
    console.error('❌ Error creating patient:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Patient with this information already exists',
      });
    }

    res.status(500).json({
      message: 'Internal server error while creating patient',
      error: error.message,
    });
  }
};

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Delete patient
// export const deletePatient = async (req, res) => {
//   try {
//     const { hospitalId, patientId } = req.params;
//     const userRole = req.user.role;
//     const userId = req.user.id;

//     // Validate patient ID
//     validateObjectId(patientId, 'patient');

//     // Get filter based on user role
//     const filter = await getUserFilter(userRole, userId, hospitalId);
//     filter._id = patientId;

//     const deletedPatient = await Patient.findOneAndDelete(filter);

//     if (!deletedPatient) {
//       return res.status(404).json({ message: 'Patient not found or unauthorized' });
//     }

//     res.json({ message: 'Patient deleted successfully', patient: deletedPatient });
//   } catch (error) {
//     console.error('❌ Error deleting patient:', error);
//     res.status(error.message.includes('Invalid') ? 400 : 500).json({ message: error.message });
//   }
// };


export const deletePatient = async (req, res) => {
  try {
    const { hospitalId, patientId } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    console.log('🗑️ DELETE REQUEST:', { hospitalId, patientId, userRole, userId });

    // Validate IDs
    if (!hospitalId || !patientId) {
      return res.status(400).json({
        success: false,
        message: 'Hospital ID and Patient ID are required'
      });
    }

    // Validate patient ID format
    validateObjectId(patientId, 'patient');

    // Get filter based on user role
    const filter = await getUserFilter(userRole, userId, hospitalId);
    filter._id = patientId;

    console.log('🔍 DELETE FILTER:', filter);

    // HARD DELETE - Actually remove from database
    const deletedPatient = await Patient.findOneAndDelete(filter);

    console.log('🔍 DELETE RESULT:', deletedPatient ? 'Found and deleted' : 'Not found');

    if (!deletedPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found or does not belong to this hospital'
      });
    }

    console.log('✅ Patient deleted permanently from database');

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully',
      deletedPatient: {
        id: deletedPatient._id,
        name: `${deletedPatient.firstName} ${deletedPatient.lastName}`,
        patientId: deletedPatient.patientId
      }
    });

  } catch (error) {
    console.error('❌ DELETE ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete patient',
      error: error.message
    });
  }
};

// Add CORS and fresh data headers helper
const setFreshDataHeaders = (res) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
    'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
    'Access-Control-Allow-Credentials': 'true'
  });
};

// Get patient by ID
// export const getPatientById = async (req, res) => {
//   try {
//     const { hospitalId, patientId } = req.params;
//     const userRole = req.user.role;
//     const userId = req.user.id;

//     //console.log('🔍 Getting patient by ID (FRESH DATA):', { hospitalId, patientId, userRole, userId });

//     // Check if patientId is actually a valid ObjectId
//     if (!mongoose.Types.ObjectId.isValid(patientId)) {
//       //console.log('❌ Invalid patient ID format:', patientId);
//       return res.status(400).json({ message: `Invalid patient ID format: ${patientId}` });
//     }

//     // Validate patient ID
//     validateObjectId(patientId, 'patient');

//     // Get filter based on user role
//     const filter = await getUserFilter(userRole, userId, hospitalId);
//     filter._id = patientId;
//     filter.status = { $ne: 'deleted' };

//     //console.log('🔎 Database filter for getPatientById (FRESH):', filter);

//     // FORCE FRESH DATA: Use findOne without any caching
//     const patient = await Patient.findOne(filter).lean();

//     if (!patient) {
//       //console.log('❌ Patient not found with filter:', filter);
//       return res.status(404).json({ message: 'Patient not found or unauthorized' });
//     }

//     // Add timestamp to indicate fresh data
//     const patientWithTimestamp = {
//       ...patient,
//       _fetchedAt: new Date().toISOString(),
//       _cacheControl: 'no-cache'
//     };

//     // Set headers to prevent caching
//     res.set({
//       'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
//       'Pragma': 'no-cache',
//       'Expires': '0',
//       'Surrogate-Control': 'no-store'
//     });

//     //console.log('✅ Fresh patient data found:', patient._id);
//     res.json({
//       success: true,
//       data: patientWithTimestamp,
//       message: 'Fresh patient data retrieved',
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     console.error('❌ Error fetching fresh patient data:', error);
//     res.status(error.message.includes('Invalid') ? 400 : 500).json({ 
//       message: error.message,
//       timestamp: new Date().toISOString()
//     });
//   }
// };




export const getPatientById = async (req, res) => {
  try {
    const { hospitalId, patientId } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    //console.log('🔍 Getting patient by ID (FRESH DATA):', { hospitalId, patientId, userRole, userId });

    // Check if patientId is actually a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      //console.log('❌ Invalid patient ID format:', patientId);
      return res.status(400).json({ 
        success: false,
        message: `Invalid patient ID format: ${patientId}` 
      });
    }

    // Build filter - more flexible for debugging
    let filter = { _id: patientId, status: { $ne: 'deleted' } };
    
    // Add role-based filtering only if user context exists
    if (userRole && userId) {
      try {
        const roleFilter = await getUserFilter(userRole, userId, hospitalId);
        filter = { ...filter, ...roleFilter };
      } catch (roleError) {
        console.warn('Role-based filtering failed, using basic filter:', roleError.message);
      }
    }

    //console.log('🔎 Database filter for getPatientById (FRESH):', filter);

    // FORCE FRESH DATA: Use findOne with lean() for performance
    const patient = await Patient.findOne(filter).lean().exec();

    if (!patient) {
      //console.log('❌ Patient not found with filter:', filter);
      setFreshDataHeaders(res);
      return res.status(404).json({ 
        success: false,
        message: 'Patient not found or unauthorized',
        searchedId: patientId,
        hospitalId
      });
    }

    // Add debug timestamps
    const patientWithTimestamp = {
      ...patient,
      _fetchedAt: new Date().toISOString(),
      _freshData: true,
      _source: 'Patient Collection'
    };

    // Set aggressive no-cache headers
    setFreshDataHeaders(res);

    //console.log('✅ Fresh patient data found:', patient._id);
    res.json({
      success: true,
      data: patientWithTimestamp,
      message: 'Fresh patient data retrieved from Patient Collection',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching fresh patient data:', error);
    setFreshDataHeaders(res);
    res.status(error.message.includes('Invalid') ? 400 : 500).json({ 
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};


// Get patient statistics
export const getPatientStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    // Get filter based on user role
    const filter = await getUserFilter(userRole, userId);

    filter.status = { $ne: 'deleted' };
    const totalPatients = await Patient.countDocuments(filter);
    const malePatients = await Patient.countDocuments({ ...filter, gender: 'male' });
    const femalePatients = await Patient.countDocuments({ ...filter, gender: 'female' });
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const newThisMonth = await Patient.countDocuments({
      ...filter,
      createdAt: { $gte: startOfMonth },    });

    res.json({
      totalPatients,
      malePatients,
      femalePatients,
      newThisMonth,
    });
  } catch (error) {
    console.error('❌ Error fetching patient stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointment statistics
export const getAppointmentStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    const { hospitalId } = req.query;

    //console.log('🔍 Getting appointment stats:', { userRole, userId, hospitalId });

    // Get filter based on user role
    const filter = await getUserFilter(userRole, userId, hospitalId);

    //console.log('🔎 Database filter for getAppointmentStats:', filter);

    filter.status = { $ne: 'deleted' };
   const pipeline = [
  { $match: { ...filter, status: { $ne: 'deleted' } } }, // Add status filter here
  { $unwind: { path: '$appointments', preserveNullAndEmptyArrays: false } },
  // ... rest of pipeline

      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          upcoming: {
            $sum: {
              $cond: [
                { $gte: ['$appointments.appointmentDate', new Date()] },
                1,
                0
              ]
            }
          },
          past: {
            $sum: {
              $cond: [
                { $lt: ['$appointments.appointmentDate', new Date()] },
                1,
                0
              ]
            }
          }
        }
      }
    ];

    const result = await Patient.aggregate(pipeline);
    const stats = result.length > 0 ? result[0] : { total: 0, upcoming: 0, past: 0 };

    //console.log('✅ Appointment stats:', stats);

    res.json({
      totalAppointments: stats.total,
      upcomingAppointments: stats.upcoming,
      pastAppointments: stats.past,
    });
  } catch (error) {
    console.error('❌ Error fetching appointment stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create appointment for a patient
export const createAppointment = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const {
      patientName,
      patientId,
      phoneNumber,
      emailAddress,
      doctor,
      treatmentType,
      appointmentDate,
      appointmentTime,
      duration,
      priority,
      status,
      sendReminder,
      additionalNotes,
      adminId
    } = req.body;

    //console.log('📅 Creating new appointment for hospital:', hospitalId);
    //console.log('📅 Request body:', JSON.stringify(req.body, null, 2));

    // Validate required fields
    if (!patientName || !patientId || !phoneNumber || !doctor || !treatmentType || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        message: 'Missing required fields: patientName, patientId, phoneNumber, doctor, treatmentType, appointmentDate, appointmentTime',
      });
    }

    // Validate hospitalId and patientId format
    if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
      return res.status(400).json({ message: 'Invalid hospital ID format' });
    }

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: 'Invalid patient ID format' });
    }

    // Validate appointmentTime format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(appointmentTime)) {
      return res.status(400).json({
        message: 'Invalid appointment time format. Please use HH:MM format (e.g., 14:30)',
      });
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check for appointment conflicts (same date and time with same doctor)
    const conflictingAppointment = await Appointment.findOne({
      hospitalId,
      doctor: doctor.trim(),
      appointmentDate: new Date(appointmentDate),
      appointmentTime: appointmentTime.trim(),
      status: { $nin: ['Cancelled', 'Completed'] }
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        message: 'Appointment conflict: This time slot is already booked for this doctor',
      });
    }

    // Create new appointment
    const newAppointment = new Appointment({
      patientName: patientName.trim(),
      patientId: patientId,
      phoneNumber: phoneNumber.trim(),
      emailAddress: emailAddress ? emailAddress.trim() : '',
      doctor: doctor.trim(),
      treatmentType: treatmentType.trim(),
      appointmentDate: new Date(appointmentDate),
      appointmentTime: appointmentTime.trim(),
      duration: duration || '45 mins',
      priority: priority || 'Medium',
      status: status || 'Scheduled',
      sendReminder: sendReminder || 'Yes',
      additionalNotes: additionalNotes || '',
      hospitalId: hospitalId,
      adminId: adminId || req.user.id,
    });

    // Save the appointment
    const savedAppointment = await newAppointment.save();

    /*console.log('✅ Appointment created successfully:', {
      id: savedAppointment._id,
      patientName: savedAppointment.patientName,
      date: savedAppointment.appointmentDate,
      time: savedAppointment.appointmentTime,
      doctor: savedAppointment.doctor,
      timestamp: new Date().toISOString(),
    });*/

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: savedAppointment,
      _id: savedAppointment._id,
    });
  } catch (error) {
    console.error('❌ Error creating appointment:', error);

    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    res.status(500).json({
      message: 'Internal server error while creating appointment',
      error: error.message,
    });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { hospitalId, patientId, appointmentId } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Validate IDs
    validateObjectId(patientId, 'patient');
    validateObjectId(appointmentId, 'appointment');

    // Get filter based on user role
    const filter = await getUserFilter(userRole, userId, hospitalId);
    filter._id = patientId;

    // Find patient and get appointment details before deletion
    const patient = await Patient.findOne(filter);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found or unauthorized' });
    }

    const appointment = patient.appointments.id(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Remove appointment from patient's appointments array
    const updatedPatient = await Patient.findOneAndUpdate(
      filter,
      { $pull: { appointments: { _id: appointmentId } } },
      { new: true }
    );

    res.json({
      message: 'Appointment deleted successfully',
      appointment: {
        ...appointment.toObject(),
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientPhone: patient.primaryNumber || patient.phoneNumber || 'N/A'
      },
    });
  } catch (error) {
    console.error('❌ Error deleting appointment:', error);
    res.status(error.message.includes('Invalid') ? 400 : 500).json({ message: error.message });
  }
};

// Get dental issues statistics
export const getDentalIssuesStats = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    const { hospitalId } = req.query;

    //console.log('📊 Getting dental issues statistics:', { userRole, userId, hospitalId });

    // Validate hospitalId if provided
    let filter = {};
    if (hospitalId) {
      filter = await getUserFilter(userRole, userId, hospitalId);
    } else if (userRole === 'Receptionist') {
      // Receptionists must have a hospitalId from their profile
      filter = await getUserFilter(userRole, userId);
    } else {
      throw new Error('hospitalId is required for Admin role when not provided in query');
    }

    // Aggregate dental issues data
    filter.status = { $ne: 'deleted' };
    const pipeline = [
      { $match: filter },
      {
        $match: {
          primaryDentalIssue: {
            $exists: true,
            $ne: null,
            $ne: ""
          }
        }
      },
      {
        $group: {
          _id: { $toLower: "$primaryDentalIssue" }, // Group by lowercase for case-insensitive aggregation
          count: { $sum: 1 },
          originalCase: { $first: "$primaryDentalIssue" } // Preserve original case for display
        }
      },
      {
        $sort: { count: -1 } // Sort by count in descending order
      },
      {
        $limit: 10 // Limit to top 10 issues
      }
    ];

    const issuesData = await Patient.aggregate(pipeline);

    // Calculate total patients with issues for percentage
    const totalPatientsWithIssues = issuesData.reduce((sum, item) => sum + item.count, 0);

    // If no issues found, return empty response
    if (totalPatientsWithIssues === 0) {
      //console.log('⚠️ No dental issues found for hospital:', hospitalId || 'all');
      return res.status(200).json({
        data: [],
        totalPatients: 0,
        totalCategories: 0,
        metadata: {
          generatedAt: new Date(),
          userRole,
          hospitalId: hospitalId || 'all'
        }
      });
    }

    // Define color palette for the chart
    const colors = [
      "#06B6D4", // Cyan
      "#FB923C", // Orange
      "#EF4444", // Red
      "#10B981", // Green
      "#8B5CF6", // Purple
      "#F59E0B", // Amber
      "#EC4899", // Pink
      "#6366F1", // Indigo
      "#84CC16", // Lime
      "#6B7280"  // Gray
    ];

    // Transform data for chart
    const chartData = issuesData.map((item, index) => ({
      name: item.originalCase,
      value: Math.round((item.count / totalPatientsWithIssues) * 100),
      count: item.count,
      color: colors[index % colors.length]
    }));

    // Group smaller issues into "Others" if more than 6 categories
    let finalData = chartData;
    if (chartData.length > 6) {
      const mainIssues = chartData.slice(0, 5);
      const otherIssues = chartData.slice(5);

      const othersCount = otherIssues.reduce((sum, item) => sum + item.count, 0);
      const othersPercentage = Math.round((othersCount / totalPatientsWithIssues) * 100);

      finalData = [
        ...mainIssues,
        {
          name: "Others",
          value: othersPercentage,
          count: othersCount,
          color: "#6B7280"
        }
      ];
    }

    /*console.log('✅ Dental issues stats calculated:', {
      totalCategories: issuesData.length,
      totalPatients: totalPatientsWithIssues,
      chartCategories: finalData.length
    });*/

    res.status(200).json({
      data: finalData,
      totalPatients: totalPatientsWithIssues,
      totalCategories: issuesData.length,
      metadata: {
        generatedAt: new Date(),
        userRole,
        hospitalId: hospitalId || 'all'
      }
    });

  } catch (error) {
    console.error('❌ Error fetching dental issues stats:', error);
    res.status(error.message.includes('Invalid') || error.message.includes('required') ? 400 : 500).json({
      message: 'Error fetching dental issues statistics',
      error: error.message
    });
  }
};


// Create appointment for a specific patient
export const createPatientAppointment = async (req, res) => {
  try {
    const { hospitalId, patientId } = req.params;
    const {
      patientName,
      patientPhone,
      appointmentDate,
      appointmentTime,
      treatmentType,
      treatment,
      doctor,
      status,
      priority,
      notes,
      firstName,
      lastName
    } = req.body;

    const userRole = req.user.role;
    const userId = req.user.id;

    //console.log('📅 Creating appointment for patient:', { hospitalId, patientId, req: req.body });

    // Validate required fields
    const missingFields = [];
    if (!patientName && !firstName) missingFields.push('patientName or firstName');
    if (!patientId) missingFields.push('patientId'); 
    if (!appointmentDate) missingFields.push('appointmentDate');
    if (!appointmentTime) missingFields.push('appointmentTime');
    if (!treatmentType && !treatment) missingFields.push('treatmentType or treatment');

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate IDs
    validateObjectId(patientId, 'patient');
    if (hospitalId) {
      validateObjectId(hospitalId, 'hospital');
    }

    // Get filter based on user role
    const filter = await getUserFilter(userRole, userId, hospitalId);
    filter._id = patientId;
    filter.status = { $ne: 'deleted' };

    // Find the patient
    const patient = await Patient.findOne(filter);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found or unauthorized' });
    }

    // Validate appointment time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(appointmentTime)) {
      return res.status(400).json({
        message: 'Invalid appointment time format. Use HH:MM format (e.g., 14:30)'
      });
    }

    // Validate appointment date
    const appointmentDateObj = new Date(appointmentDate);
    if (isNaN(appointmentDateObj.getTime())) {
      return res.status(400).json({
        message: 'Invalid appointment date format'
      });
    }

    // Create new appointment object
    const newAppointment = {
      _id: new mongoose.Types.ObjectId(),
      appointmentDate: appointmentDateObj,
      appointmentTime: appointmentTime.trim(),
      treatment: (treatmentType || treatment).trim(),
      doctor: doctor ? doctor.trim() : '',
      status: status || 'Scheduled',
      priority: priority || 'Medium',
      notes: notes ? notes.trim() : '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    //console.log('📅 New appointment object:', newAppointment);

    // Add appointment to patient's appointments array
    const updatedPatient = await Patient.findOneAndUpdate(
      filter,
      { 
        $push: { appointments: newAppointment },
        $set: {
          // Update patient details if provided
          ...(firstName && { firstName: firstName.trim() }),
          ...(lastName && { lastName: lastName.trim() }),
          ...(patientPhone && { primaryNumber: patientPhone.trim() })
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: 'Failed to create appointment' });
    }

    // Get the created appointment from the updated patient
    const createdAppointment = updatedPatient.appointments.id(newAppointment._id);

    const appointmentResponse = {
      ...createdAppointment.toObject(),
      patientId: patient._id,
      patientName: patientName || `${firstName || patient.firstName} ${lastName || patient.lastName}`.trim(),
      patientPhone: patientPhone || patient.primaryNumber || patient.phoneNumber || '',
      hospitalId: patient.hospitalId,
      adminId: patient.adminId
    };

    //console.log('✅ Appointment created successfully:', appointmentResponse._id);

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: appointmentResponse
    });

  } catch (error) {
    console.error('❌ Error creating patient appointment:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    if (error.message.includes('Invalid') || error.message.includes('Missing')) {
      return res.status(400).json({
        message: error.message
      });
    }

    res.status(500).json({
      message: 'Error creating appointment',
      error: error.message
    });
  }
};


// ADD THESE FUNCTIONS TO YOUR patientController.js file

// Update appointment by appointment ID (for EditAppointmentModal)
export const updateAppointmentById = async (req, res) => {
  try {
    const { hospitalId, appointmentId } = req.params;
    const appointmentData = req.body;

    //console.log('Updating appointment:', { hospitalId, appointmentId, appointmentData });

    // Find the patient that contains this appointment
    const patient = await Patient.findOne({
      hospitalId,
      'appointments._id': appointmentId
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Find and update the specific appointment
    const appointmentIndex = patient.appointments.findIndex(
      apt => apt._id.toString() === appointmentId
    );

    if (appointmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found in patient record'
      });
    }

    // Update the appointment with new data, preserving the original _id
    const updatedAppointment = {
      ...patient.appointments[appointmentIndex].toObject(),
      ...appointmentData,
      _id: appointmentId // Preserve the original ID
    };

    patient.appointments[appointmentIndex] = updatedAppointment;
    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    });
  }
};

// Get appointment by ID (for fetching appointment details)
export const getAppointmentById = async (req, res) => {
  try {
    const { hospitalId, appointmentId } = req.params;

    //console.log('Fetching appointment:', { hospitalId, appointmentId });

    const patient = await Patient.findOne({
      hospitalId,
      'appointments._id': appointmentId
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const appointment = patient.appointments.find(
      apt => apt._id.toString() === appointmentId
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Return appointment with patient information
    res.status(200).json({
      success: true,
      appointment: {
        ...appointment.toObject(),
        patientId: {
          _id: patient._id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          patientId: patient.patientId
        }
      }
    });

  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: error.message
    });
  }
};

// Delete appointment by ID
export const deleteAppointmentById = async (req, res) => {
  try {
    const { hospitalId, appointmentId } = req.params;

    //console.log('Deleting appointment:', { hospitalId, appointmentId });

    const patient = await Patient.findOne({
      hospitalId,
      'appointments._id': appointmentId
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Remove the appointment from the appointments array
    const initialLength = patient.appointments.length;
    patient.appointments = patient.appointments.filter(
      apt => apt._id.toString() !== appointmentId
    );

    if (patient.appointments.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found in patient record'
      });
    }

    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: error.message
    });
  }
};

// Add custom field to all appointments in a hospital
export const addCustomFieldToAllAppointments = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { label, value, section } = req.body;

    //console.log('Adding custom field to all appointments:', { hospitalId, label, value, section });

    if (!label || !label.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Field label is required'
      });
    }

    const newField = {
      label: label.trim(),
      value: value || '',
      type: 'text',
      section: section || undefined
    };

    // Find all patients in the hospital that have appointments
    const patients = await Patient.find({ 
      hospitalId,
      'appointments.0': { $exists: true } // Only patients with at least one appointment
    });

    let updatedCount = 0;
    let totalAppointments = 0;

    for (const patient of patients) {
      let patientUpdated = false;
      
      for (let i = 0; i < patient.appointments.length; i++) {
        totalAppointments++;
        
        // Check if the field already exists in this appointment
        const existingField = patient.appointments[i].customFields?.find(
          field => field.label === newField.label
        );

        if (!existingField) {
          // Initialize customFields array if it doesn't exist
          if (!patient.appointments[i].customFields) {
            patient.appointments[i].customFields = [];
          }
          
          patient.appointments[i].customFields.push(newField);
          patientUpdated = true;
        }
      }

      if (patientUpdated) {
        await patient.save();
        updatedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Custom field "${label}" added to appointments successfully`,
      stats: {
        patientsUpdated: updatedCount,
        totalAppointments,
        fieldLabel: label
      }
    });

  } catch (error) {
    console.error('Error adding custom field to appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add custom field to appointments',
      error: error.message
    });
  }
};