const HO = require("../models/HO");

const requireHO = async (req, res, next) => {
  try {
    const role = String(req.headers["x-user-role"] || "").toLowerCase();
    const hoId = String(req.headers["x-user-id"] || "").trim();
    if (role !== "ho" || !hoId) {
      return res.status(403).json({ success: false, message: "HO access required" });
    }
    const ho = await HO.findOne({ HOId: hoId }).select("_id HOId");
    if (!ho) return res.status(403).json({ success: false, message: "HO access required" });
    req.ho = ho;
    return next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Could not verify HO access" });
  }
};

module.exports = requireHO;
