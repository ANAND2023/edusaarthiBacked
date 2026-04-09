const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');

// @route   GET /api/admin/stats
router.get('/stats', auth, adminOnly, adminController.getStats);

// @route   GET /api/admin/unverified-schools
router.get('/unverified-schools', auth, adminOnly, adminController.getUnverifiedSchools);

// @route   GET /api/admin/all-schools
router.get('/all-schools', auth, adminOnly, adminController.getAllSchools);

// @route   GET /api/admin/all-teachers
router.get('/all-teachers', auth, adminOnly, adminController.getAllTeachers);

// @route   PATCH /api/admin/verify-school/:id
router.patch('/verify-school/:id', auth, adminOnly, adminController.verifySchool);

module.exports = router;
