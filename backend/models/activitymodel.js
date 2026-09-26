// models/activitymodel.js
const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    mr: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MR",
    },
    flm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FLM",
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'performedByModel',
    },
    performedByModel: {
      type: String,
      enum: ['MR', 'FLM', 'SLM', 'TLM', 'User'],
    },
    role: {
      type: String,
      enum: ["mr", "flm", "slm", "tlm", "ho"],
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "In Progress", "Rejected"],
      default: "Completed",
    },
    details: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Activity", activitySchema);