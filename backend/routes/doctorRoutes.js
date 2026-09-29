const express = require("express");
const upload = require("../middleware/upload.js");
const {
  Createdoc,
  getDashboardData,
  giveConsent,
  getDoctors,
  getDoctorById,
  getDoctorTimeline,
  getMRPendingActions,
  uploadDoctorPhotos,
  getDoctorsByMR,
  sendConsentToDoctor,
  updateDoctor,
  deleteDoctor,
  deleteDoctorPhoto,
} = require("../controllers/doctorController.js");

const router = express.Router();

// Remove 'protect' from all routes if it's not defined
router.post("/", Createdoc);
router.get("/dashboard/:mrId", getDashboardData);
router.get("/consent/:doctorId", giveConsent);
router.get("/:mrId", getDoctors);
router.get("/:doctorId/details", getDoctorById);
router.get("/mr/:mrId/pending-actions", getMRPendingActions);
router.get("/:doctorId/timeline", getDoctorTimeline);
router.post("/:doctorId/photos", upload.array("photos", 5), uploadDoctorPhotos);
router.get("/mr/:mrId", getDoctorsByMR);
router.delete("/:doctorId", deleteDoctor);
router.delete('/:doctorId/photos/:photoId', deleteDoctorPhoto);

// FIXED: Remove 'protect' from this line
router.post("/send-consent/:doctorId", sendConsentToDoctor);

router.put("/:doctorId", updateDoctor);

module.exports = router;