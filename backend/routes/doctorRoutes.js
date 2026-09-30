const express = require("express");
const upload = require("../middleware/upload.js");
const {
  Createdoc,
  CreatedocByFLM,
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
// Separate FLM creation flow; the existing MR endpoint remains unchanged.
router.post("/flm", CreatedocByFLM);
router.get("/dashboard/:mrId", getDashboardData);
router.get("/consent/:doctorId", giveConsent);
router.get("/:mrId", getDoctors);
router.get("/:doctorId/details", getDoctorById);
router.get("/mr/:mrId/pending-actions", getMRPendingActions);
router.get("/:doctorId/timeline", getDoctorTimeline);
router.post(
  "/:doctorId/photos",
  (req, res, next) => {
    upload.array("photos", 5)(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            success: false,
            message: "Image is too large. Maximum allowed size is 20 MB per image.",
          });
        }

        return res.status(400).json({
          success: false,
          message: err.message || "Failed to upload image.",
        });
      }

      next();
    });
  },
  uploadDoctorPhotos
);
router.get("/mr/:mrId", getDoctorsByMR);
router.delete("/:doctorId", deleteDoctor);
router.delete('/:doctorId/photos/:photoId', deleteDoctorPhoto);

// FIXED: Remove 'protect' from this line
router.post("/send-consent/:doctorId", sendConsentToDoctor);

router.put("/:doctorId", updateDoctor);

module.exports = router;