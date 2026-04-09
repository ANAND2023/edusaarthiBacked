const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');
const { auth } = require('../middleware/auth');

// @route   POST /api/upload/:type
// @desc    Upload a single file (type: documents, logos, resumes, profile_pics)
router.post('/:type', auth, upload.single('file'), uploadController.uploadFile);

// @route   POST /api/upload/:type/multiple
// @desc    Upload multiple files
router.post('/:type/multiple', auth, upload.array('files', 5), uploadController.uploadMultipleFiles);

// @route   DELETE /api/upload/delete
// @desc    Delete an uploaded file
router.delete('/delete', auth, uploadController.deleteFile);

module.exports = router;
