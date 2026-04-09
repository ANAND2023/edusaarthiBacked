const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/schoolController');
const { auth, schoolOnly } = require('../middleware/auth');

// @route   GET /api/school/stats
// @desc    Get dashboard stats
router.get('/stats', auth, schoolOnly, schoolController.getStats);

// @route   GET /api/school/profile
// @desc    Get school profile
router.get('/profile', auth, schoolOnly, schoolController.getProfile);

// @route   PUT /api/school/profile
// @desc    Update school profile
router.put('/profile', auth, schoolOnly, schoolController.updateProfile);

// @route   POST /api/school/post-job
// @desc    Post a new job
router.post('/post-job', auth, schoolOnly, schoolController.postJob);

// @route   GET /api/school/job/:jobId/applications
// @desc    Get applications for a job
router.get('/job/:jobId/applications', auth, schoolOnly, schoolController.getJobApplications);

// @route   GET /api/school/my-jobs
// @desc    Get jobs posted by school
router.get('/my-jobs', auth, schoolOnly, schoolController.getMyJobs);

// @route   GET /api/school/applications
// @desc    Get all applications for school's jobs
router.get('/applications', auth, schoolOnly, schoolController.getAllApplications);

// @route   PATCH /api/school/application/:id
// @desc    Update application status
router.patch('/application/:id', auth, schoolOnly, schoolController.updateApplicationStatus);

// @route   POST /api/school/upgrade-package
// @desc    Upgrade subscription package
router.post('/upgrade-package', auth, schoolOnly, schoolController.upgradePackage);

module.exports = router;
