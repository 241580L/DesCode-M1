// server/middlewares/upload.js
const multer = require('multer');
const { nanoid } = require('nanoid');
const path = require('path');
require('dotenv').config();

const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || 1048576); // default 1MB

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './public/uploads/');
  },
  filename: (req, file, callback) => {
    callback(null, nanoid(10) + path.extname(file.originalname));
  }
});
// server/middlewares/upload.js
const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];

const fileFilter = (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and image files (JPG, PNG) are allowed."), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: maxFileSize },
  fileFilter
});
//.array() is absent here

// Error-handling middleware for multer
const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: `File size exceeds the limit of ${maxFileSize / (1024 * 1024)} MB`
      });
    }
    return res.status(400).json({ message: err.message });
  }
  next(err);
};

module.exports = { upload, uploadErrorHandler, maxFileSize };
