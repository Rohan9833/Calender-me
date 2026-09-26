const mongoose = require("mongoose");

const tlmSchema = new mongoose.Schema(
  {
    tlmId: {
      type: String,
      required: true,
      unique: true,
    },
    tlmPassword: {
      type: String,
      required: true,
    },

    tlmName: {
      type: String,
      required: true,
    },

    hq: String,

    zone: String,
    role: {
      type: String,
      default: "tlm",
    },

    slms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SLM",
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("TLM", tlmSchema);
