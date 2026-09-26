const mongoose = require("mongoose");

const flmSchema = new mongoose.Schema(
  {
    flmId: {
      type: String,
      required: true,
      unique: true,
    },
    flmPassword: {
      type: String,
      required: true,
    },

    flmName: {
      type: String,
      required: true,
    },

    hq: String,

    region: String,

    zone: String,

    slm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SLM",
    },
    role: {
      type: String,
      default: "flm",
    },

    mrs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MR",
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("FLM", flmSchema);
