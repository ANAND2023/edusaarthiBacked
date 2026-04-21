const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const staffController = require('../controllers/staffController');
const leadController = require('../controllers/leadController');
const { auth, adminOnly, staffOnly } = require('../middleware/auth');

// Multer config for staff documents
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

// Staff self-routes
router.get('/me', auth, staffOnly, staffController.getMyProfile);
router.get('/me/leads', auth, staffOnly, staffController.getMyLeads);
router.patch('/me/leads/:id', auth, staffOnly, staffController.updateLeadStatus);

// Admin routes - Staff Management
router.post('/', auth, adminOnly, uploadFields, staffController.createStaff);
router.get('/all', auth, adminOnly, staffController.getAllStaff);
router.put('/:id', auth, adminOnly, uploadFields, staffController.updateStaff);
router.patch('/:id/toggle-status', auth, adminOnly, staffController.toggleStaffStatus);
router.patch('/:id/password', auth, adminOnly, staffController.resetPassword);
router.get('/:id/password', auth, adminOnly, staffController.getStaffPassword);

// Admin routes - Lead Management
router.post('/leads', auth, adminOnly, leadController.createLead);
router.get('/leads/all', auth, adminOnly, leadController.getAllLeads);
router.put('/leads/:id', auth, adminOnly, leadController.updateLead);
router.delete('/leads/:id', auth, adminOnly, leadController.deleteLead);

module.exports = router;
