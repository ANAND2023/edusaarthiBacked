const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads/documents', 'uploads/logos', 'uploads/resumes', 'uploads/profile_pics'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Allowed file types
const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

// Multer storage config — saves to temp first, compression happens in controller
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.params.type || 'documents';
    const validTypes = ['documents', 'logos', 'resumes', 'profile_pics'];
    const folder = validTypes.includes(type) ? type : 'documents';
    const dest = path.join(__dirname, '..', 'uploads', folder);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomUUID() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WebP, GIF and PDF are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

module.exports = upload;
