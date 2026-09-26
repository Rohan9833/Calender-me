const CalendarSelection = require("../models/CalendarSelection");
const Doctor = require("../models/Doctor");
const MR = require("../models/MR");

// ─── POST /api/calendar/save-month ───────────────────────
const saveMonthDesign = async (req, res) => {
  console.log("========== SAVE MONTH API ==========");
  console.log("📥 BODY =>", req.body);
  
  try {
    const { 
      mrId, 
      doctorId, 
      year, 
      month, 
      designId, 
      designLabel, 
      unfreeze 
    } = req.body;

    console.log("🔍 unfreeze received:", unfreeze);
    console.log("🔍 unfreeze type:", typeof unfreeze);
    console.log("🔍 unfreeze === true:", unfreeze === true);

    if (!mrId || !doctorId || !month || !designId) {
      return res.status(400).json({
        success: false,
        message: "mrId, doctorId, month and designId are required",
      });
    }
    
    const mr = await MR.findOne({ mrId });
    if (!mr) {
      return res.status(404).json({ success: false, message: "MR not found" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // Find existing record or create new one
    let record = await CalendarSelection.findOne({
      doctor: doctor._id,
      year: year || 2027,
    });

    if (!record) {
      record = await CalendarSelection.create({
        doctor: doctor._id,
        mr: mr._id,
        year: year || 2027,
        selections: [],
        status: "in_progress",
      });
    }

    console.log("📋 Current record status:", record.status);

    // ✅ FIX: Check unfreeze FIRST before blocking
    // If unfreeze is true, allow editing and set status to in_progress
    if (unfreeze === true) {
      // Allow editing and set status to in_progress
      record.status = "in_progress";
      console.log("✅ Calendar unfrozen - status set to in_progress");
    } else if (record.status === "frozen") {
      // Block editing only if not unfreeze
      console.log("❌ Calendar is frozen and unfreeze is false - blocking edit");
      return res.status(400).json({
        success: false,
        message: "Calendar is already frozen. Raise a change request.",
      });
    }

    // Upsert this month inside the selections array
    const existingIdx = record.selections.findIndex((s) => s.month === month);

    const monthEntry = {
      month,
      designId,
      designLabel: designLabel || designId,
      selectedAt: new Date(),
      selectedBy: mr._id,
    };

    if (existingIdx > -1) {
      record.selections[existingIdx] = monthEntry;
    } else {
      record.selections.push(monthEntry);
    }

    await record.save();
    console.log("💾 Record saved. New status:", record.status);

    // Update Doctor flag
    if (!doctor.calendarSelected) {
      doctor.calendarSelected = true;
      await doctor.save();
    }

    // ✅ Also update doctor status if unfreeze
    if (unfreeze === true) {
      doctor.calendarStatus = "in_progress";
      doctor.calendarFrozen = false;
      await doctor.save();
      console.log("👨‍⚕️ Doctor status updated to in_progress");
    }

    return res.status(200).json({
      success: true,
      message: `Design saved for ${month}`,
      record,
      unfreeze: unfreeze || false,
    });
  } catch (error) {
    console.error("saveMonthDesign error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/calendar/freeze ───────────────────────────
const freezeCalendar = async (req, res) => {
  try {
    const { mrId, doctorId, year } = req.body;

    if (!mrId || !doctorId) {
      return res.status(400).json({
        success: false,
        message: "mrId and doctorId are required",
      });
    }

    const mr = await MR.findOne({ mrId });
    if (!mr) {
      return res.status(404).json({ 
        success: false, 
        message: "MR not found" 
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: "Doctor not found" 
      });
    }

    const record = await CalendarSelection.findOne({
      doctor: doctor._id,
      year: year || 2027,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "No calendar selections found for this doctor",
      });
    }

    if (record.status === "frozen") {
      return res.status(400).json({
        success: false,
        message: "Calendar is already frozen",
      });
    }

    if (record.selections.length < 12) {
      return res.status(400).json({
        success: false,
        message: `Only ${record.selections.length}/12 months selected. Please complete all months before freezing.`,
        completedMonths: record.selections.length,
        missingMonths: 12 - record.selections.length,
      });
    }

    record.status = "frozen";
    record.frozenAt = new Date();
    record.frozenBy = mr._id;
    await record.save();

    doctor.calendarStatus = "frozen";
    doctor.calendarSelected = true;
    doctor.calendarFrozen = true;
    doctor.calendarFrozenAt = new Date();
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Calendar frozen successfully",
      record,
      doctor: {
        id: doctor._id,
        name: doctor.doctorName,
        speciality: doctor.speciality,
        calendarFrozen: doctor.calendarFrozen,
      },
    });
  } catch (error) {
    console.error("freezeCalendar error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// ─── GET /api/calendar/:doctorId ─────────────────────────
const getCalendarSelections = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const year = req.query.year || 2027;
    const mongoose = require("mongoose");

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: `Invalid doctorId: ${doctorId}`,
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const record = await CalendarSelection.findOne({
      doctor: doctor._id,
      year: parseInt(year),
    }).populate("mr", "mrName mrId");

    if (!record) {
      return res.status(200).json({
        success: true,
        record: null,
        selections: [],
        status: "in_progress",
        message: "No calendar found, starting new one",
      });
    }

    return res.status(200).json({
      success: true,
      record,
      selections: record.selections,
      status: record.status,
    });
  } catch (error) {
    console.error("getCalendarSelections error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── POST /api/calendar/mark-input-given ─────────────────
const markInputGiven = async (req, res) => {
  try {
    const { mrId, doctorId, year, inputGivenAt, inputGivenBy } = req.body;

    if (!mrId || !doctorId) {
      return res.status(400).json({
        success: false,
        message: "mrId and doctorId are required",
      });
    }

    const mr = await MR.findOne({ mrId });
    if (!mr) {
      return res.status(404).json({ success: false, message: "MR not found" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const record = await CalendarSelection.findOne({
      doctor: doctor._id,
      year: year || 2027,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "No calendar found for this doctor",
      });
    }

    if (record.status !== "frozen") {
      return res.status(400).json({
        success: false,
        message: "Calendar must be frozen first before marking Input Given",
      });
    }

    record.inputGiven = true;
    record.inputGivenAt = inputGivenAt || new Date();
    record.inputGivenBy = inputGivenBy || mr._id;
    record.status = "input_given";
    await record.save();

    doctor.inputGiven = true;
    doctor.inputGivenStatus = "completed";
    doctor.inputGivenAt = new Date();
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Input Given marked successfully",
      record,
    });
  } catch (error) {
    console.error("markInputGiven error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  saveMonthDesign,
  freezeCalendar,
  getCalendarSelections,
  markInputGiven,
};