const express = require("express");

const router = express.Router();

const {
  getFLMDoctors,
  getSLMDoctors,
  getTLMDoctors,
  getFLMDashboard,
  updateDoctorApproval,
  getPendingApprovals,
  getSLMDashboard,
  getTLMDashboard,
  getPendingActionsCount,
  getPendingActions,
} = require("../controllers/managerController");

router.get("/flm/:flmId/doctors", getFLMDoctors);

router.get("/slm/:slmId/doctors", getSLMDoctors);

router.get("/tlm/:tlmId/doctors", getTLMDoctors);

router.get("/flm/:flmId/dashboard", getFLMDashboard);
router.patch("/doctors/:doctorId/status", updateDoctorApproval);
router.get("/flm/:flmId/pending-approvals", getPendingApprovals);
router.get("/slm/:slmId/dashboard", getSLMDashboard);

router.get("/tlm/:tlmId/dashboard", getTLMDashboard);
router.get("/pending-actions-count", getPendingActionsCount);
router.get("/pending-actions", getPendingActions);

module.exports = router;
