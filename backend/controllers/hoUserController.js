const MR = require("../models/MR");
const FLM = require("../models/FLM");
const SLM = require("../models/SLM");
const TLM = require("../models/TLM");
const DeletedUser = require("../models/DeletedUser");

const CONFIG = {
  mr: { Model: MR, idField: "mrId", passwordField: "mrPassword", nameField: "mrName", parentRole: "flm", parentField: "flm", parentIdField: "flmId" },
  flm: { Model: FLM, idField: "flmId", passwordField: "flmPassword", nameField: "flmName", parentRole: "slm", parentField: "slm", parentIdField: "slmId" },
  slm: { Model: SLM, idField: "slmId", passwordField: "slmPassword", nameField: "slmName", parentRole: "tlm", parentField: "tlm", parentIdField: "tlmId" },
  tlm: { Model: TLM, idField: "tlmId", passwordField: "tlmPassword", nameField: "tlmName" },
};
const requireHO = (req, res) => {
  if (String(req.headers["x-user-role"] || "").toLowerCase() !== "ho") {
    res.status(403).json({ success: false, message: "Only HO can manage users" });
    return false;
  }
  return true;
};
const safeUser = (doc, role) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  const cfg = CONFIG[role];
  delete obj[cfg.passwordField];
  return { ...obj, role };
};

exports.createUser = async (req, res) => {
  if (!requireHO(req, res)) return;
  try {
    const role = String(req.body.role || "").toLowerCase();
    const cfg = CONFIG[role];
    if (!cfg) return res.status(400).json({ success: false, message: "Role must be MR, FLM, SLM or TLM" });
    const { userId, password, name, hq = "", region = "", zone = "", parentId = "" } = req.body;
    if (![userId, password, name].every(v => typeof v === "string" && v.trim())) {
      return res.status(400).json({ success: false, message: "User ID, password and name are required" });
    }
    const duplicate = await Promise.all(Object.values(CONFIG).map(c => c.Model.exists({ [c.idField]: userId.trim() })));
    if (duplicate.some(Boolean)) return res.status(409).json({ success: false, message: "That user ID is already in use" });
    const data = { [cfg.idField]: userId.trim(), [cfg.passwordField]: password, [cfg.nameField]: name.trim(), hq: hq.trim(), region: region.trim(), zone: zone.trim(), role };
    if (cfg.parentRole && parentId) {
      const parentCfg = CONFIG[cfg.parentRole];
      const parent = await parentCfg.Model.findOne({ [parentCfg.idField]: parentId.trim() });
      if (!parent) return res.status(400).json({ success: false, message: "Selected parent account was not found" });
      data[cfg.parentField] = parent._id;
    }
    const created = await cfg.Model.create(data);
    return res.status(201).json({ success: true, user: safeUser(created, role) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Could not create user" });
  }
};

exports.deleteUser = async (req, res) => {
  if (!requireHO(req, res)) return;
  try {
    const role = String(req.params.role || "").toLowerCase();
    const cfg = CONFIG[role];
    if (!cfg) return res.status(400).json({ success: false, message: "Invalid user role" });
    const user = await cfg.Model.findOne({ [cfg.idField]: req.params.userId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const snapshot = user.toObject();
    const id = snapshot[cfg.idField];
    await DeletedUser.create({ originalId: user._id, role, userId: id, name: snapshot[cfg.nameField], sourceModel: role.toUpperCase(), snapshot, deletedBy: "ho" });
    await cfg.Model.deleteOne({ _id: user._id });
    return res.json({ success: true, message: "User moved to deleted users and can be restored" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Could not delete user" });
  }
};

exports.getDeletedUsers = async (req, res) => {
  if (!requireHO(req, res)) return;
  try {
    const users = await DeletedUser.find().select("-snapshot").sort({ deletedAt: -1 });
    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Could not load deleted users" });
  }
};

exports.restoreUser = async (req, res) => {
  if (!requireHO(req, res)) return;
  try {
    const deleted = await DeletedUser.findById(req.params.deletedId);
    if (!deleted) return res.status(404).json({ success: false, message: "Deleted user record not found" });
    const cfg = CONFIG[deleted.role];
    if (!cfg) return res.status(400).json({ success: false, message: "Unsupported deleted user role" });
    const conflict = await cfg.Model.findOne({ [cfg.idField]: deleted.userId });
    if (conflict) return res.status(409).json({ success: false, message: "An active user already uses this ID. Resolve the conflict before restoring." });
    const snapshot = { ...deleted.snapshot, _id: deleted.originalId };
    await cfg.Model.create(snapshot);
    await DeletedUser.deleteOne({ _id: deleted._id });
    return res.json({ success: true, message: "User restored successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Could not restore user" });
  }
};
