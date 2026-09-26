const mongoose = require("mongoose");

// ─── Sub-schema: one month's selection ──────────────────
const monthSelectionSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: true,
      enum: [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December",
      ],
    },
    designId:  { type: String, required: true }, // e.g. "jan-v2"
    designLabel: { type: String },               // e.g. "Jan V2"
    selectedAt: { type: Date, default: Date.now },
    selectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "MR" },
  },
  { _id: false }
);

// ─── Main schema ─────────────────────────────────────────
const calendarSelectionSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    mr: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MR",
      required: true,
    },
    year: {
      type: Number,
      required: true,
      default: 2027,
    },
    selections: [monthSelectionSchema], // one entry per saved month

    // Overall status
    status: {
      type: String,
      enum: ["in_progress", "frozen", "input_given"], // ADDED "input_given"
      default: "in_progress",
    },
    frozenAt: { type: Date },
    frozenBy: { type: mongoose.Schema.Types.ObjectId, ref: "MR" },
    
    // Input Given fields
    inputGiven: { type: Boolean, default: false },
    inputGivenAt: { type: Date },
    inputGivenBy: { type: mongoose.Schema.Types.ObjectId, ref: "MR" },
  },
  { timestamps: true }
);

// One record per doctor per year
calendarSelectionSchema.index({ doctor: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("CalendarSelection", calendarSelectionSchema);