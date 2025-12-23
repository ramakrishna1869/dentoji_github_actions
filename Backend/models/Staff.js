// // models/Staff.js
// import mongoose from "mongoose";

// const staffSchema = new mongoose.Schema({
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   email: { type: String, required: true },
//   phone: { type: String, required: true },
//   address: String,
//   role: { type: String, required: true }, // e.g., Doctor, Nurse, Anesthesiologist
//   department: String,
//   status: { type: String, default: 'Active' }, // Active, Inactive, On Leave, Suspended
//   startDate: Date,
//   emergencyContactName: String,
//   emergencyContactPhone: String,
//   notes: String,
  
//   // Match your pattern - both hospital and admin references
//   hospitalId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Hospital",
//     required: true,
//   },
//   adminId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Admin", // or "User" depending on your admin model
//     required: true,
//   },
// }, {
//   timestamps: true
// });

// export default mongoose.model("Staff", staffSchema);


//staff Modal
import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: String,
  role: { type: String, required: true },
  department: String,
  status: { type: String, default: 'Active' },
  startDate: Date,
  emergencyContactName: String,
  emergencyContactPhone: String,
  notes: String,
  
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
}, {
  timestamps: true
});

export default mongoose.model("Staff", staffSchema);

