
//Hospital.js
import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
});

export default mongoose.model("Hospital", hospitalSchema);
