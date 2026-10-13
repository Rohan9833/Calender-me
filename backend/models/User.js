const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    name: { type: String, default: "" },
    hq: { type: String, default: "" },
    region: { type: String, default: "" },
    zone: { type: String, default: "" },

    role: {
      type: String,
      enum: ["mr", "manager", "ho"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "User",
  userSchema
);