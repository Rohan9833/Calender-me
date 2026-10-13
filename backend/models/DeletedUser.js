const mongoose = require("mongoose");

const deletedUserSchema = new mongoose.Schema({
  originalId: { type: mongoose.Schema.Types.ObjectId, required: true },
  role: { type: String, enum: ["mr", "flm", "slm", "tlm"], required: true },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  sourceModel: { type: String, required: true },
  snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
  deletedAt: { type: Date, default: Date.now },
  deletedBy: { type: String, default: "ho" },
}, { timestamps: true });

deletedUserSchema.index({ originalId: 1, sourceModel: 1 });

module.exports = mongoose.model("DeletedUser", deletedUserSchema);
