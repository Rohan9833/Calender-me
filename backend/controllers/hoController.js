const Doctor = require("../models/Doctor");
const MR = require("../models/MR");
const FLM = require("../models/FLM");
const SLM = require("../models/SLM");
const TLM = require("../models/TLM");
const Activity = require("../models/activitymodel");

const visibleDoctors = () => Doctor.find({ status: { $ne: "draft" } })
  .populate({ path: "mr", select: "mrId mrName hq region zone", populate: { path: "flm", select: "flmId flmName hq region zone", populate: { path: "slm", select: "slmId slmName hq region zone", populate: { path: "tlm", select: "tlmId tlmName hq region zone" } } } })
  .sort({ createdAt: -1 });

const getDashboard = async (_req, res) => {
  try {
    const doctors = await visibleDoctors();
    const count = (fn) => doctors.filter(fn).length;
    const registered = doctors.length;
    const approved = count(d => d.approvalStatus === "approved");
    const pending = count(d => d.approvalStatus === "pending");
    const rejected = count(d => d.approvalStatus === "rejected");
    const frozen = count(d => d.calendarFrozen === true);
    const inputGiven = count(d => d.inputGivenStatus === "completed");
    const consentPending = count(d => d.approvalStatus === "approved" && (!d.consentSent || d.consentStatus === "pending"));
    const photoPending = count(d => d.consentStatus === "approved" && !d.photoUploaded);
    const calendarPending = count(d => d.photoUploaded && !d.calendarFrozen);
    const activities = await Activity.find().populate("doctor", "doctorName").sort({ createdAt: -1 }).limit(8);
    const zones = {};
    doctors.forEach(d => {
      const zone = d.mr?.zone || d.mr?.flm?.zone || d.mr?.flm?.slm?.zone || "Unassigned";
      if (!zones[zone]) zones[zone] = { name: zone, registered: 0, approved: 0, pending: 0, frozen: 0 };
      zones[zone].registered++;
      if (d.approvalStatus === "approved") zones[zone].approved++;
      if (d.approvalStatus === "pending") zones[zone].pending++;
      if (d.calendarFrozen) zones[zone].frozen++;
    });
    res.json({ success: true, stats: { registered, approved, pending, rejected, frozen, inputGiven, consentPending, photoPending, calendarPending, approvalRate: registered ? Math.round(approved / registered * 100) : 0 }, funnel: { registered, approved, frozen, inputGiven, rejected }, zones: Object.values(zones).sort((a,b) => b.registered-a.registered), recentDoctors: doctors.slice(0,8), activities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to load HO dashboard", error: error.message });
  }
};

const getDoctors = async (req, res) => {
  try {
    const doctors = await visibleDoctors();
    const { q = "", status = "all", consent = "all", input = "all" } = req.query;
    const term = q.trim().toLowerCase();
    const filtered = doctors.filter(d => {
      const searchable = [d.doctorName, d.speciality, d.mclCode, d.city, d.mr?.mrName, d.mr?.mrId, d.mr?.hq, d.mr?.region, d.mr?.zone].filter(Boolean).join(" ").toLowerCase();
      return (!term || searchable.includes(term))
        && (status === "all" || d.approvalStatus === status)
        && (consent === "all" || (consent === "pending" ? (d.approvalStatus === "approved" && (!d.consentSent || d.consentStatus === "pending")) : d.consentStatus === consent))
        && (input === "all" || (input === "completed" ? d.inputGivenStatus === "completed" : d.calendarFrozen === true && d.inputGivenStatus !== "completed"));
    });
    res.json({ success: true, count: filtered.length, doctors: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to load doctors", error: error.message });
  }
};

const getHierarchy = async (_req, res) => {
  try {
    const [tlms, slms, flms, mrs] = await Promise.all([
      TLM.find().select("-tlmPassword").sort({ tlmName: 1 }),
      SLM.find().select("-slmPassword").populate("tlm", "tlmName tlmId").sort({ slmName: 1 }),
      FLM.find().select("-flmPassword").populate("slm", "slmName slmId").sort({ flmName: 1 }),
      MR.find().select("-mrPassword").populate("flm", "flmName flmId").sort({ mrName: 1 }),
    ]);
    res.json({ success: true, counts: { tlm: tlms.length, slm: slms.length, flm: flms.length, mr: mrs.length }, users: [...tlms, ...slms, ...flms, ...mrs] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to load hierarchy", error: error.message });
  }
};

const getActivity = async (_req, res) => {
  try {
    const activities = await Activity.find()
      .populate("doctor", "doctorName mclCode")
      .populate("mr", "mrName mrId")
      .populate("flm", "flmName flmId")
      .sort({ createdAt: -1 }).limit(250);
    res.json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to load activity log", error: error.message });
  }
};

module.exports = { getDashboard, getDoctors, getHierarchy, getActivity };
