const mongoose = require("mongoose");

const uploadedCalendarSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  month: { type: String, required: true, enum: ["January","February","March","April","May","June","July","August","September","October","November","December"] },
  year: { type: Number, required: true, min: 2000, max: 2100 },
  category: { type: String, trim: true, default: "general" },
  fileUrl: { type: String, required: true },
  originalName: { type: String, required: true },
  uploadedBy: { type: String, default: "HO" },
}, { timestamps: true });

uploadedCalendarSchema.index({ month: 1, year: 1, name: 1 });

module.exports = mongoose.model("UploadedCalendar", uploadedCalendarSchema);
