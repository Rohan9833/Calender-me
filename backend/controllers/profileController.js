const MR = require("../models/MR");
const FLM = require("../models/FLM");
const SLM = require("../models/SLM");
const TLM = require("../models/TLM");
const HO = require("../models/HO");

const ROLE_CONFIG = {
  ho: { Model: HO, idField: "HOId", nameField: "HOName", passwordField: "HOPassword" },
  mr: { Model: MR, idField: "mrId", nameField: "mrName", passwordField: "mrPassword" },
  flm: { Model: FLM, idField: "flmId", nameField: "flmName", passwordField: "flmPassword" },
  slm: { Model: SLM, idField: "slmId", nameField: "slmName", passwordField: "slmPassword" },
  tlm: { Model: TLM, idField: "tlmId", nameField: "tlmName", passwordField: "tlmPassword" },
};

const serializeUser = (user, role, config) => {
  const result = user.toObject();
  delete result[config.passwordField];
  if (role === "ho") {
    result.role = "ho";
    result.userId = result.HOId;
    result.name = result.HOName;
  }
  return result;
};

const getProfile = async (req, res) => {
  try {
    const role = String(req.params.role || "").toLowerCase();
    const config = ROLE_CONFIG[role];
    if (!config) return res.status(400).json({ success: false, message: "Invalid user role" });

    const user = await config.Model.findOne({ [config.idField]: req.params.userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, user: serializeUser(user, role, config) });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ success: false, message: "Failed to get profile" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const role = String(req.params.role || "").toLowerCase();
    const config = ROLE_CONFIG[role];
    if (!config) return res.status(400).json({ success: false, message: "Invalid user role" });

    const name = req.body.name ?? req.body.HOName;
    const { hq, region, zone } = req.body;
    if (typeof name !== "string" || typeof hq !== "string" || typeof zone !== "string") {
      return res.status(400).json({ success: false, message: "Name, HQ and zone are required" });
    }
    if (role !== "ho" && typeof region !== "string") {
      return res.status(400).json({ success: false, message: "Region is required" });
    }

    const update = { [config.nameField]: name.trim(), hq: hq.trim(), zone: zone.trim() };
    if (role !== "ho") update.region = region.trim();

    const user = await config.Model.findOneAndUpdate(
      { [config.idField]: req.params.userId },
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: serializeUser(user, role, config),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

module.exports = { getProfile, updateProfile };
