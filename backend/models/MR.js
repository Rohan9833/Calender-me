// models/MR.js (UPDATED)
const mongoose = require("mongoose");

const mrSchema = new mongoose.Schema(
  {
    mrId: {
      type: String,
      required: true,
      unique: true,
    },
    mrPassword: {
      type: String,
      required: true,
    },

    mrName: {
      type: String,
      required: true,
    },

    email: String,

    hq: String,

    region: String,

    zone: String,

    businessUnit: String,

    doj: Date,

    flm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FLM",
    },
    
    // ADD THIS - doctors reference
    doctors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    }],
    
    role: {
      type: String,
      default: "mr",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("MR", mrSchema);