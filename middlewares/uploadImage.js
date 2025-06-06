// middlewares/uploadImage.js
const multer = require("multer");
const path = require("path");

// 1) Define where to save and how to name the uploaded file:
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads")); 
  },
  filename: (req, file, cb) => {
    // e.g. "post-1627381927312.jpg"
    const ext = path.extname(file.originalname); 
    const basename = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now();
    cb(null, basename + "-" + uniqueSuffix + ext);
  }
});

// 2) (Optional) Filter only image MIME types
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // limit to 5 MB
});

module.exports = upload;
