const express = require("express");

const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

const router = express.Router();

router.get("/:role/:userId", getProfile);
router.patch("/:role/:userId", updateProfile);

module.exports = router;
