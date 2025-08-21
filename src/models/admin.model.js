import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "admin"
  },

}, {
  timestamps: true
});

export const Admin = mongoose.model("Admin", adminSchema);
