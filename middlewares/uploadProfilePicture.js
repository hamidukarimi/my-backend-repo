const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles'); // separate folder for profile pictures
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, req.body.name + '-' + uniqueSuffix + ext);
  },
});

const uploadProfilePicture = multer({ storage });

module.exports = uploadProfilePicture;
