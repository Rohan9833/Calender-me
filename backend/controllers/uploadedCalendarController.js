const fs = require("fs");
const path = require("path");
const multer = require("multer");
const UploadedCalendar = require("../models/UploadedCalendar");

const uploadDir = path.join(__dirname, "..", "uploads", "calendars");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const uploadFile = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) return cb(new Error("Only JPG, PNG, and WEBP images are allowed."));
    cb(null, true);
  },
}).single("calendarFile");

const requireHO = (req, res, next) => {
  const role = String(req.headers["x-user-role"] || "").toLowerCase();
  if (role !== "ho") return res.status(403).json({ success: false, message: "Only HO users can manage calendars." });
  next();
};

const listCalendars = async (_req, res) => {
  try {
    const calendars = await UploadedCalendar.find().sort({ year: -1, month: 1, sequence: 1, createdAt: 1 });
    res.json({ success: true, calendars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCalendar = (req, res) => {
  uploadFile(req, res, async (uploadError) => {
    if (uploadError) return res.status(400).json({ success: false, message: uploadError.message });
    if (!req.file) return res.status(400).json({ success: false, message: "Choose a calendar image to upload." });
    try {
      const { name, month, year, category, sequence } = req.body;
      const validMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];
      if (!name?.trim() || !validMonths.includes(month) || !Number.isInteger(Number(year)) || Number(year) < 2000 || Number(year) > 2100 || !Number.isInteger(Number(sequence)) || Number(sequence) < 1) {
        fs.unlink(req.file.path, () => {});
        return res.status(400).json({ success: false, message: "Enter a name, valid month, year between 2000 and 2100, and sequence number of 1 or higher." });
      }
      const calendar = await UploadedCalendar.create({
        name: name.trim(), month, year: Number(year), category: category?.trim() || "general", sequence: Number(sequence),
        fileUrl: `/uploads/calendars/${req.file.filename}`,
        originalName: req.file.originalname,
        uploadedBy: "HO",
      });
      return res.status(201).json({ success: true, calendar, message: "Calendar uploaded successfully." });
    } catch (error) {
      fs.unlink(req.file.path, () => {});
      return res.status(500).json({ success: false, message: error.message });
    }
  });
};

const deleteCalendar = async (req, res) => {
  try {
    const calendar = await UploadedCalendar.findById(req.params.id);
    if (!calendar) return res.status(404).json({ success: false, message: "Calendar not found." });
    await UploadedCalendar.findByIdAndDelete(calendar._id);
    const filePath = path.join(__dirname, "..", calendar.fileUrl.replace(/^\//, ""));
    fs.unlink(filePath, () => {});
    return res.json({ success: true, message: "Calendar deleted." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { listCalendars, createCalendar, deleteCalendar, requireHO };
