const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { auth, teacherOnly } = require('../middleware/auth');

// @route   PUT /api/teacher/profile
router.put('/profile', auth, teacherOnly, teacherController.updateProfile);

// @route   GET /api/teacher/jobs
router.get('/jobs', auth, teacherOnly, teacherController.getJobs);

// @route   POST /api/teacher/apply
router.post('/apply', auth, teacherOnly, teacherController.applyForJob);

// @route   GET /api/teacher/applications  (alias for my-applications)
router.get('/applications', auth, teacherOnly, teacherController.getMyApplications);

// @route   GET /api/teacher/my-applications
router.get('/my-applications', auth, teacherOnly, teacherController.getMyApplications);

// @route   GET /api/teacher/dashboard
router.get('/dashboard', auth, teacherOnly, teacherController.getDashboardData);

// @route   GET /api/teacher/institution/:id
router.get('/institution/:id', auth, teacherOnly, teacherController.getInstitution);

module.exports = router;
