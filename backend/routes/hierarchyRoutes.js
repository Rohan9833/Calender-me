const express = require("express");

const router = express.Router();

const upload = require(
  "../middleware/uploadMiddleware"
);

const {
  uploadHierarchy,
} = require(
  "../controllers/hierarchyController"
);

router.post(
  "/upload",
  upload.single("file"),
  uploadHierarchy
);

module.exports = router;