const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/doctors");
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);

    const safeName = name
      .trim()
      .replace(/\s+/g, "_")          // Replace spaces with _
      .replace(/[^a-zA-Z0-9_-]/g, ""); // Remove special characters

    const uniqueName = `${Date.now()}-${safeName}${ext}`;

    cb(null, uniqueName);
  },
});


const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image files are allowed"),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;
