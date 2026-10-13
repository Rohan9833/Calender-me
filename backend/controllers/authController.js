const MR = require("../models/MR");
const FLM = require("../models/FLM");
const SLM = require("../models/SLM");
const TLM = require("../models/TLM");
const HO = require("../models/HO");

const login = async (req, res) => {
  try {
    const { userId, password } = req.body || {};

    if (!userId || password === undefined || password === null) {
      return res.status(400).json({
        success: false,
        message: "User ID and password are required",
      });
    }

    // HO accounts are stored in the dedicated HO collection.
    const ho = await HO.findOne({ HOId: String(userId).trim() });
    if (ho) {
      if (String(ho.HOPassword) !== String(password)) {
        return res.status(401).json({
          success: false,
          message: "Invalid Password",
        });
      }

      const safeHO = ho.toObject();
      delete safeHO.HOPassword;
      safeHO.role = "ho";
      // Compatibility aliases used by existing frontend components.
      safeHO.userId = safeHO.HOId;
      safeHO.name = safeHO.HOName;

      return res.status(200).json({
        success: true,
        message: "Login Successful",
        user: safeHO,
      });
    }

    // Preserve existing MR, FLM, SLM, and TLM authentication.
    let user = await MR.findOne({ mrId: String(userId).trim() });
    if (!user) user = await FLM.findOne({ flmId: String(userId).trim() });
    if (!user) user = await SLM.findOne({ slmId: String(userId).trim() });
    if (!user) user = await TLM.findOne({ tlmId: String(userId).trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let dbPassword = "";
    if (user.role === "mr") dbPassword = user.mrPassword;
    else if (user.role === "flm") dbPassword = user.flmPassword;
    else if (user.role === "slm") dbPassword = user.slmPassword;
    else if (user.role === "tlm") dbPassword = user.tlmPassword;

    if (String(dbPassword) !== String(password)) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const safeUser = user.toObject();
    delete safeUser.mrPassword;
    delete safeUser.flmPassword;
    delete safeUser.slmPassword;
    delete safeUser.tlmPassword;

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      user: safeUser,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { login };
