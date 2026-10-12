const express = require("express");
const router = express.Router();
const { getDashboard, getDoctors, getHierarchy, getActivity } = require("../controllers/hoController");

router.get("/dashboard", getDashboard);
router.get("/doctors", getDoctors);
router.get("/hierarchy", getHierarchy);
router.get("/activity", getActivity);

module.exports = router;
