const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, superAdminOnly } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user and send OTP
router.post('/register', authController.register);

// @route   POST /api/auth/verify-otp
// @desc    Verify the OTP sent to email
router.post('/verify-otp', authController.verifyOTP);

// @route   POST /api/auth/set-password
// @desc    Setup the password after OTP verification
router.post('/set-password', authController.setPassword);

// @route   POST /api/auth/login
// @desc    Login and get JWT token
router.post('/login', authController.login);

// @route   POST /api/auth/admins
// @desc    Create a new restricted admin (Super Admin only)
router.post('/admins', auth, superAdminOnly, authController.createAdmin);

// @route   GET /api/auth/admins
// @desc    Get all restricted admins (Super Admin only)
router.get('/admins', auth, superAdminOnly, authController.getAdmins);

// @route   DELETE /api/auth/admins/:id
// @desc    Delete an admin (Super Admin only)
router.delete('/admins/:id', auth, superAdminOnly, authController.deleteAdmin);

// @route   PATCH /api/auth/admins/:id/password
// @desc    Update admin password (Super Admin only)
router.patch('/admins/:id/password', auth, superAdminOnly, authController.updateAdminPassword);

module.exports = router;
