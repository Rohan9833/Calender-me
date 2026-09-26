const MR = require("../models/MR");
const FLM = require("../models/FLM");
const SLM = require("../models/SLM");
const TLM = require("../models/TLM");

const ROLE_CONFIG = {
  mr: { Model: MR, idField: "mrId", nameField: "mrName" },
  flm: { Model: FLM, idField: "flmId", nameField: "flmName" },
  slm: { Model: SLM, idField: "slmId", nameField: "slmName" },
  tlm: { Model: TLM, idField: "tlmId", nameField: "tlmName" },
};

const getProfile = async (req, res) => {
  try {
    const { role, userId } = req.params;
    const config = ROLE_CONFIG[String(role).toLowerCase()];

    if (!config) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    const user = await config.Model.findOne({
      [config.idField]: userId,
    }).select("-mrPassword -flmPassword -slmPassword -tlmPassword");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get profile",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { role, userId } = req.params;
    const config = ROLE_CONFIG[String(role).toLowerCase()];

    if (!config) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }

    const { name, hq, region, zone } = req.body;

    if (
      typeof name !== "string" ||
      typeof hq !== "string" ||
      typeof region !== "string" ||
      typeof zone !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, HQ, region and zone are required",
      });
    }

    const update = {
      [config.nameField]: name.trim(),
      hq: hq.trim(),
      region: region.trim(),
      zone: zone.trim(),
    };

    const user = await config.Model.findOneAndUpdate(
      { [config.idField]: userId },
      { $set: update },
      {
        new: true,
        runValidators: true,
      },
    ).select("-mrPassword -flmPassword -slmPassword -tlmPassword");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
