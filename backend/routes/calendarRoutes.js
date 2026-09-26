const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/calendarController");

const {
  saveMonthDesign,
  freezeCalendar,
  getCalendarSelections,
  markInputGiven,
} = require("../controllers/calendarController");

// Save one month's design
router.post("/save-month", saveMonthDesign);

// Freeze all 12 months
router.post("/freeze", freezeCalendar);

// Get existing selections for a doctor
router.get("/:doctorId", getCalendarSelections);
// Add this route
router.post("/mark-input-given", calendarController.markInputGiven);

module.exports = router;