const mongoose = require("mongoose");

const slmSchema = new mongoose.Schema(
  {
    slmId: {
      type: String,
      required: true,
      unique: true,
    },
    slmPassword: {
      type: String,
      required: true,
    },

    slmName: {
      type: String,
      required: true,
    },

    hq: String,

    region: String,

    zone: String,

    tlm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TLM",
    },

    role: {
      type: String,
      default: "slm",
    },

    flms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FLM",
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("SLM", slmSchema);
