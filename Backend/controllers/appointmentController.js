// import Appointment from '../models/appointment.js';
// import mongoose from 'mongoose';

// export const createAppointment = async (req, res) => {
//   try {
//     const { hospitalId } = req.params;
//     const appointmentData = req.body;

//     // Enhanced adminId extraction
//     const adminId = req.user?.id || 
//                    req.user?._id || 
//                    req.user?.adminId || 
//                    req.adminId || 
//                    req.userId ||
//                    appointmentData.adminId;

//     //console.log('🆕 Creating appointment:', {
//       hospitalId,
//       adminId: adminId ? 'Present' : 'Missing',
//       patientName: appointmentData.patientName,
//       userId: req.user ? JSON.stringify(req.user) : 'No user object'
//     });

//     // Validate hospitalId
//     if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
//       return res.status(400).json({ 
//         message: 'Invalid hospital ID format',
//         received: hospitalId 
//       });
//     }

//     // Enhanced validation
//     const requiredFields = {
//       patientName: appointmentData.patientName,
//       phoneNumber: appointmentData.phoneNumber,
//       doctor: appointmentData.doctor,
//       treatmentType: appointmentData.treatmentType,
//       appointmentDate: appointmentData.appointmentDate,
//       appointmentTime: appointmentData.appointmentTime,
//       duration: appointmentData.duration,
//       priority: appointmentData.priority,
//       status: appointmentData.status,
//       sendReminder: appointmentData.sendReminder
//     };

//     const missingFields = Object.entries(requiredFields)
//       .filter(([key, value]) => !value || (typeof value === 'string' && value.trim() === ''))
//       .map(([key]) => key);

//     if (missingFields.length > 0) {
//       //console.log('❌ Missing required fields:', missingFields);
//       return res.status(400).json({ 
//         message: `Missing required fields: ${missingFields.join(', ')}`,
//         missingFields,
//         received: appointmentData
//       });
//     }

//     // Validate date format
//     const appointmentDate = new Date(appointmentData.appointmentDate);
//     if (isNaN(appointmentDate.getTime())) {
//       return res.status(400).json({ 
//         message: 'Invalid appointment date format',
//         received: appointmentData.appointmentDate
//       });
//     }

//     // Validate time format (HH:MM)
//     const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
//     if (!timeRegex.test(appointmentData.appointmentTime)) {
//       return res.status(400).json({ 
//         message: 'Invalid time format. Use HH:MM format (e.g., 14:30)',
//         received: appointmentData.appointmentTime
//       });
//     }

//     // Validate duration format
//     const validDurations = ['30 mins', '45 mins', '1 hour', '1.5 hours', '2 hours'];
//     if (!validDurations.includes(appointmentData.duration)) {
//       return res.status(400).json({ 
//         message: 'Invalid duration. Must be one of: ' + validDurations.join(', '),
//         received: appointmentData.duration
//       });
//     }

//     // Validate status
//     const validStatuses = ['Scheduled', 'Pending', 'Completed', 'Cancelled', 'Confirmed', 'No-show'];
//     if (!validStatuses.includes(appointmentData.status)) {
//       return res.status(400).json({ 
//         message: 'Invalid status. Must be one of: ' + validStatuses.join(', '),
//         received: appointmentData.status
//       });
//     }

//     // Validate priority
//     const validPriorities = ['Low', 'Medium', 'High'];
//     if (!validPriorities.includes(appointmentData.priority)) {
//       return res.status(400).json({ 
//         message: 'Invalid priority. Must be one of: ' + validPriorities.join(', '),
//         received: appointmentData.priority
//       });
//     }

//     // Create appointment object
//     const appointmentObject = {
//       patientName: appointmentData.patientName.trim(),
//       phoneNumber: appointmentData.phoneNumber.trim(),
//       emailAddress: appointmentData.emailAddress ? appointmentData.emailAddress.trim() : '',
//       doctor: appointmentData.doctor.trim(),
//       treatmentType: appointmentData.treatmentType.trim(),
//       appointmentDate: appointmentDate,
//       appointmentTime: appointmentData.appointmentTime,
//       duration: appointmentData.duration,
//       priority: appointmentData.priority,
//       status: appointmentData.status,
//       sendReminder: appointmentData.sendReminder,
//       additionalNotes: appointmentData.additionalNotes ? appointmentData.additionalNotes.trim() : '',
//       hospitalId: new mongoose.Types.ObjectId(hospitalId),
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };

//     // Only add adminId if it exists and is valid
//     if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
//       appointmentObject.adminId = new mongoose.Types.ObjectId(adminId);
//     }

//     //console.log('📝 Appointment object prepared:', {
//       ...appointmentObject,
//       appointmentDate: appointmentObject.appointmentDate.toISOString(),
//       hospitalId: hospitalId,
//       adminId: adminId ? 'Set' : 'Not set'
//     });

//     const appointment = new Appointment(appointmentObject);
//     const savedAppointment = await appointment.save();

//     //console.log('✅ Appointment created successfully with ID:', savedAppointment._id);

//     // Return formatted response
//     res.status(201).json({ 
//       message: 'Appointment created successfully', 
//       appointment: savedAppointment,
//       id: savedAppointment._id
//     });

//   } catch (error) {
//     console.error('❌ Appointment creation error:', error);
    
//     // Handle mongoose validation errors
//     if (error.name === 'ValidationError') {
//       const validationErrors = Object.values(error.errors).map(err => ({
//         field: err.path,
//         message: err.message,
//         value: err.value
//       }));
      
//       return res.status(400).json({ 
//         message: 'Validation failed', 
//         errors: validationErrors,
//         type: 'ValidationError'
//       });
//     }
    
//     // Handle duplicate key errors
//     if (error.code === 11000) {
//       return res.status(400).json({ 
//         message: 'Duplicate appointment data',
//         error: error.message,
//         type: 'DuplicateError'
//       });
//     }
    
//     res.status(500).json({ 
//       message: 'Server error while creating appointment', 
//       error: error.message,
//       type: 'ServerError'
//     });
//   }
// };

// export const getAppointments = async (req, res) => {
//   try {
//     const { hospitalId } = req.params;
    
//     //console.log('🔍 Fetching appointments for hospital:', hospitalId);

//     if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
//       return res.status(400).json({ 
//         message: 'Invalid hospital ID format',
//         received: hospitalId 
//       });
//     }

//     // Extract adminId for additional filtering
//     const adminId = req.user?.id || 
//                    req.user?._id || 
//                    req.user?.adminId || 
//                    req.adminId || 
//                    req.userId;

//     // Build query - primarily by hospitalId
//     const query = { 
//       hospitalId: new mongoose.Types.ObjectId(hospitalId) 
//     };

//     // Optionally add adminId filter if available and valid
//     if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
//       //console.log('👤 AdminId available for additional filtering:', adminId);
//     }

//     //console.log('🔍 Query:', query);

//     const appointments = await Appointment.find(query)
//       .sort({ 
//         appointmentDate: -1, 
//         appointmentTime: -1,
//         createdAt: -1 
//       })
//       .lean(); // Use lean() for better performance

//     //console.log(`✅ Found ${appointments.length} appointments for hospital ${hospitalId}`);

//     // Log first few appointments for debugging
//     if (appointments.length > 0) {
//       //console.log('📋 Sample appointments:');
//       appointments.slice(0, 3).forEach((apt, index) => {
//         //console.log(`${index + 1}:`, {
//           _id: apt._id,
//           patientName: apt.patientName,
//           appointmentDate: apt.appointmentDate,
//           appointmentTime: apt.appointmentTime,
//           status: apt.status,
//           doctor: apt.doctor,
//           hospitalId: apt.hospitalId,
//           adminId: apt.adminId ? apt.adminId : 'No adminId'
//         });
//       });
//     }

//     res.json(appointments);

//   } catch (error) {
//     console.error('❌ Error fetching appointments:', error);
//     res.status(500).json({ 
//       message: 'Error fetching appointments', 
//       error: error.message,
//       type: 'ServerError'
//     });
//   }
// };

// // Enhanced updateAppointment function with comprehensive validation and update handling
// export const updateAppointment = async (req, res) => {
//   try {
//     const { hospitalId, appointmentId } = req.params;
//     const updates = req.body;

//     //console.log('🔄 Updating appointment:', {
//       appointmentId,
//       hospitalId,
//       updates: Object.keys(updates),
//       updateData: updates
//     });

//     // Validate IDs
//     if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
//       return res.status(400).json({ 
//         message: 'Invalid hospital ID format',
//         received: hospitalId 
//       });
//     }
//     if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
//       return res.status(400).json({ 
//         message: 'Invalid appointment ID format',
//         received: appointmentId 
//       });
//     }

//     // Extract adminId for authorization
//     const adminId = req.user?.id || 
//                    req.user?._id || 
//                    req.user?.adminId || 
//                    req.adminId || 
//                    req.userId;

//     // Find existing appointment
//     const existingAppointment = await Appointment.findById(appointmentId);
//     if (!existingAppointment) {
//       return res.status(404).json({ 
//         message: 'Appointment not found',
//         appointmentId: appointmentId
//       });
//     }

//     //console.log('📋 Existing appointment found:', {
//       _id: existingAppointment._id,
//       patientName: existingAppointment.patientName,
//       currentStatus: existingAppointment.status,
//       hospitalId: existingAppointment.hospitalId.toString()
//     });

//     // Verify hospital ownership
//     if (existingAppointment.hospitalId.toString() !== hospitalId) {
//       //console.log('❌ Hospital mismatch:', {
//         existingHospitalId: existingAppointment.hospitalId.toString(),
//         requestedHospitalId: hospitalId
//       });
//       return res.status(403).json({ 
//         message: 'Unauthorized access to this appointment',
//         reason: 'Hospital ID mismatch'
//       });
//     }

//     // Additional adminId check if available
//     if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
//       if (existingAppointment.adminId && 
//           existingAppointment.adminId.toString() !== adminId) {
//         //console.log('⚠️ AdminId mismatch - allowing update for hospital admin');
//         // Allow update if user is hospital admin, even if adminId doesn't match
//       }
//     }

//     // Validate and sanitize updates
//     const sanitizedUpdates = {};
//     const validationErrors = [];

//     // Handle string fields with trimming
//     const stringFields = ['patientName', 'phoneNumber', 'emailAddress', 'doctor', 'treatmentType', 'additionalNotes'];
//     stringFields.forEach(field => {
//       if (updates[field] !== undefined) {
//         if (typeof updates[field] === 'string') {
//           sanitizedUpdates[field] = updates[field].trim();
          
//           // Validate required fields are not empty after trimming
//           if (['patientName', 'phoneNumber', 'doctor', 'treatmentType'].includes(field) && 
//               sanitizedUpdates[field] === '') {
//             validationErrors.push(`${field} cannot be empty`);
//           }
//         } else if (updates[field] === null || updates[field] === '') {
//           // Allow clearing optional fields
//           if (['emailAddress', 'additionalNotes'].includes(field)) {
//             sanitizedUpdates[field] = '';
//           } else {
//             validationErrors.push(`${field} cannot be null or empty`);
//           }
//         }
//       }
//     });

//     // Handle phone number validation
//     if (sanitizedUpdates.phoneNumber) {
//       const phoneRegex = /^\+?\d{10,15}$/;
//       if (!phoneRegex.test(sanitizedUpdates.phoneNumber.replace(/\s/g, ''))) {
//         validationErrors.push('Invalid phone number format (should be 10-15 digits)');
//       }
//     }

//     // Handle email validation
//     if (sanitizedUpdates.emailAddress && sanitizedUpdates.emailAddress !== '') {
//       const emailRegex = /^\S+@\S+\.\S+$/;
//       if (!emailRegex.test(sanitizedUpdates.emailAddress)) {
//         validationErrors.push('Invalid email address format');
//       }
//     }

//     // Handle appointment date update
//     if (updates.appointmentDate !== undefined) {
//       const newDate = new Date(updates.appointmentDate);
//       if (isNaN(newDate.getTime())) {
//         validationErrors.push('Invalid appointment date format');
//       } else {
//         // Optional: Check if date is not in the past
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
        
//         if (newDate < today) {
//           //console.log('⚠️ Warning: Updating to past date:', newDate.toISOString().split('T')[0]);
//           // You can choose to allow or reject past dates based on your business logic
//           // validationErrors.push('Appointment date cannot be in the past');
//         }
        
//         sanitizedUpdates.appointmentDate = newDate;
//       }
//     }

//     // Handle appointment time validation
//     if (updates.appointmentTime !== undefined) {
//       const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
//       if (!timeRegex.test(updates.appointmentTime)) {
//         validationErrors.push('Invalid time format. Use HH:MM format (e.g., 14:30)');
//       } else {
//         sanitizedUpdates.appointmentTime = updates.appointmentTime;
//       }
//     }

//     // Validate status if being updated
//     if (updates.status !== undefined) {
//       const validStatuses = ['Scheduled', 'Pending', 'Completed', 'Cancelled', 'Confirmed', 'No-show'];
//       if (!validStatuses.includes(updates.status)) {
//         validationErrors.push(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
//       } else {
//         sanitizedUpdates.status = updates.status;
//         //console.log('📊 Status update:', {
//           from: existingAppointment.status,
//           to: updates.status
//         });
//       }
//     }

//     // Validate priority if being updated
//     if (updates.priority !== undefined) {
//       const validPriorities = ['Low', 'Medium', 'High'];
//       if (!validPriorities.includes(updates.priority)) {
//         validationErrors.push(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
//       } else {
//         sanitizedUpdates.priority = updates.priority;
//       }
//     }

//     // Validate duration if being updated
//     if (updates.duration !== undefined) {
//       const validDurations = ['30 mins', '45 mins', '1 hour', '1.5 hours', '2 hours'];
//       if (!validDurations.includes(updates.duration)) {
//         validationErrors.push(`Invalid duration. Must be one of: ${validDurations.join(', ')}`);
//       } else {
//         sanitizedUpdates.duration = updates.duration;
//       }
//     }

//     // Handle sendReminder (boolean conversion)
//     if (updates.sendReminder !== undefined) {
//       if (typeof updates.sendReminder === 'boolean') {
//         sanitizedUpdates.sendReminder = updates.sendReminder;
//       } else if (updates.sendReminder === 'Yes' || updates.sendReminder === 'true' || updates.sendReminder === true) {
//         sanitizedUpdates.sendReminder = true;
//       } else {
//         sanitizedUpdates.sendReminder = false;
//       }
//     }

//     // Check for validation errors
//     if (validationErrors.length > 0) {
//       //console.log('❌ Validation errors:', validationErrors);
//       return res.status(400).json({ 
//         message: 'Validation failed', 
//         errors: validationErrors,
//         receivedData: updates
//       });
//     }

//     // Add metadata
//     sanitizedUpdates.updatedAt = new Date();
    
//     // Preserve adminId if updating
//     if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
//       sanitizedUpdates.adminId = new mongoose.Types.ObjectId(adminId);
//     }

//     //console.log('✅ Sanitized updates prepared:', {
//       fields: Object.keys(sanitizedUpdates),
//       patientName: sanitizedUpdates.patientName,
//       status: sanitizedUpdates.status,
//       appointmentDate: sanitizedUpdates.appointmentDate ? sanitizedUpdates.appointmentDate.toISOString().split('T')[0] : 'No change',
//       appointmentTime: sanitizedUpdates.appointmentTime || 'No change'
//     });

//     // Perform the update with full validation
//     const updatedAppointment = await Appointment.findByIdAndUpdate(
//       appointmentId, 
//       { $set: sanitizedUpdates }, 
//       {
//         new: true, // Return the updated document
//         runValidators: true, // Run mongoose schema validators
//         omitUndefined: true, // Don't include undefined values
//         context: 'query' // Needed for some validators
//       }
//     );

//     if (!updatedAppointment) {
//       return res.status(404).json({ 
//         message: 'Appointment not found after update attempt',
//         appointmentId: appointmentId
//       });
//     }

//     //console.log('✅ Appointment updated successfully:', {
//       _id: updatedAppointment._id,
//       patientName: updatedAppointment.patientName,
//       status: updatedAppointment.status,
//       appointmentDate: updatedAppointment.appointmentDate.toISOString().split('T')[0],
//       appointmentTime: updatedAppointment.appointmentTime,
//       updatedAt: updatedAppointment.updatedAt
//     });

//     // Log the changes made
//     const changedFields = [];
//     Object.keys(sanitizedUpdates).forEach(field => {
//       if (field !== 'updatedAt' && field !== 'adminId') {
//         const oldValue = existingAppointment[field];
//         const newValue = updatedAppointment[field];
        
//         if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
//           changedFields.push({
//             field,
//             oldValue,
//             newValue
//           });
//         }
//       }
//     });

//     if (changedFields.length > 0) {
//       //console.log('📝 Changes made:', changedFields);
//     }

//     // Return success response with updated appointment
//     res.json({ 
//       message: 'Appointment updated successfully', 
//       appointment: updatedAppointment,
//       changes: changedFields.map(change => change.field),
//       updatedFields: Object.keys(sanitizedUpdates).filter(key => key !== 'updatedAt')
//     });

//   } catch (error) {
//     console.error('❌ Error updating appointment:', {
//       appointmentId: req.params.appointmentId,
//       error: error.message,
//       stack: error.stack
//     });
    
//     // Handle mongoose validation errors
//     if (error.name === 'ValidationError') {
//       const validationErrors = Object.values(error.errors).map(err => ({
//         field: err.path,
//         message: err.message,
//         value: err.value
//       }));
      
//       return res.status(400).json({ 
//         message: 'Database validation failed', 
//         errors: validationErrors,
//         type: 'ValidationError'
//       });
//     }
    
//     // Handle cast errors (invalid ObjectId, etc.)
//     if (error.name === 'CastError') {
//       return res.status(400).json({ 
//         message: 'Invalid data format', 
//         error: error.message,
//         type: 'CastError'
//       });
//     }
    
//     res.status(500).json({ 
//       message: 'Server error while updating appointment', 
//       error: error.message,
//       type: 'ServerError'
//     });
//   }
// };

// export const deleteAppointment = async (req, res) => {
//   try {
//     const { hospitalId, appointmentId } = req.params;
    
//     //console.log('🗑️ Deleting appointment:', {
//       appointmentId,
//       hospitalId
//     });

//     // Validate IDs
//     if (!mongoose.Types.ObjectId.isValid(hospitalId)) {
//       return res.status(400).json({ 
//         message: 'Invalid hospital ID format',
//         received: hospitalId 
//       });
//     }
//     if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
//       return res.status(400).json({ 
//         message: 'Invalid appointment ID format',
//         received: appointmentId 
//       });
//     }

//     // Extract adminId for authorization
//     const adminId = req.user?.id || 
//                    req.user?._id || 
//                    req.user?.adminId || 
//                    req.adminId || 
//                    req.userId;

//     // Build delete query - require both hospitalId match
//     const deleteQuery = {
//       _id: appointmentId,
//       hospitalId: new mongoose.Types.ObjectId(hospitalId)
//     };

//     // Additional adminId check if available and you want stricter control
//     // Uncomment the following lines if you want to restrict deletion to appointment creator:
//     /*
//     if (adminId && mongoose.Types.ObjectId.isValid(adminId)) {
//       deleteQuery.adminId = new mongoose.Types.ObjectId(adminId);
//     }
//     */

//     //console.log('🗑️ Delete query:', deleteQuery);

//     const deletedAppointment = await Appointment.findOneAndDelete(deleteQuery);

//     if (!deletedAppointment) {
//       return res.status(404).json({ 
//         message: 'Appointment not found or access denied',
//         appointmentId: appointmentId,
//         hospitalId: hospitalId
//       });
//     }

//     //console.log('✅ Appointment deleted successfully:', {
//       _id: appointmentId,
//       patientName: deletedAppointment.patientName,
//       appointmentDate: deletedAppointment.appointmentDate,
//       status: deletedAppointment.status
//     });

//     res.status(200).json({ 
//       message: 'Appointment deleted successfully',
//       deletedId: appointmentId,
//       deletedAppointment: {
//         _id: deletedAppointment._id,
//         patientName: deletedAppointment.patientName,
//         appointmentDate: deletedAppointment.appointmentDate,
//         appointmentTime: deletedAppointment.appointmentTime,
//         status: deletedAppointment.status,
//         doctor: deletedAppointment.doctor
//       }
//     });

//   } catch (error) {
//     console.error('❌ Error deleting appointment:', {
//       appointmentId: req.params.appointmentId,
//       error: error.message,
//       stack: error.stack
//     });
//     res.status(500).json({ 
//       message: 'Error deleting appointment', 
//       error: error.message,
//       type: 'ServerError'
//     });
//   }
// };

// const appointmentController = {
//   createAppointment,
//   getAppointments,
//   updateAppointment,
//   deleteAppointment
// };

// export default appointmentController; 