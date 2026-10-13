const express = require("express");
const router = express.Router();
const { listCalendars, createCalendar, deleteCalendar, requireHO } = require("../controllers/uploadedCalendarController");

router.get("/", listCalendars);
router.post("/", requireHO, createCalendar);
router.delete("/:id", requireHO, deleteCalendar);

module.exports = router;
