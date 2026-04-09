const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const counsellorController = require('../controllers/counsellorController');
const { auth, adminOnly, counsellorOnly } = require('../middleware/auth');

// Multer config for counsellor documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profile_photo') {
      cb(null, path.join(__dirname, '../uploads/profile_pics'));
    } else {
      cb(null, path.join(__dirname, '../uploads/documents'));
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) cb(null, true);
    else cb(new Error('Only images and PDFs allowed'));
  }
});

const uploadFields = upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'aadhar_card', maxCount: 1 },
  { name: 'pan_card', maxCount: 1 },
  { name: 'qualification_proof', maxCount: 1 },
]);

// Counsellor self-routes
router.get('/me', auth, counsellorOnly, counsellorController.getMyProfile);
router.put('/me', auth, counsellorOnly, counsellorController.updateMyProfile);
router.post('/referral', auth, counsellorOnly, counsellorController.addReferral);
router.get('/me/referrals', auth, counsellorOnly, counsellorController.getMyReferrals);

// Admin routes
router.post('/', auth, adminOnly, uploadFields, counsellorController.createCounsellor);
router.get('/all', auth, adminOnly, counsellorController.getAllCounsellors);
router.put('/:id', auth, adminOnly, uploadFields, counsellorController.updateCounsellor);
router.delete('/:id', auth, adminOnly, counsellorController.deleteCounsellor);
router.patch('/:id/password', auth, adminOnly, counsellorController.resetPassword);
router.get('/:id/referrals', auth, adminOnly, counsellorController.getCounsellorReferrals);

module.exports = router;
