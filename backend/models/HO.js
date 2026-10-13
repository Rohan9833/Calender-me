const mongoose = require("mongoose");

const hoSchema = new mongoose.Schema(
  {
    HOId: { type: String, required: true, unique: true, trim: true },
    HOName: { type: String, required: true, trim: true },
    HOPassword: { type: String, required: true },
    hq: { type: String, default: "" },
    zone: { type: String, default: "" },
    role: { type: String, default: "HO", uppercase: true },
    slms: [{ type: mongoose.Schema.Types.ObjectId, ref: "SLM" }],
  },
  { timestamps: true, collection: "HO" }
);

module.exports = mongoose.models.HO || mongoose.model("HO", hoSchema, "HO");
