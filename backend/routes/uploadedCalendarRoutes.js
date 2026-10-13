const express = require("express");
const { listCalendars, createCalendar, deleteCalendar, requireHO } = require("../controllers/uploadedCalendarController");
const router = express.Router();

router.get("/", listCalendars);
router.post("/", requireHO, createCalendar);
router.delete("/:id", requireHO, deleteCalendar);

module.exports = router;
