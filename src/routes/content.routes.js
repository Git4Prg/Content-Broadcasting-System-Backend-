const express = require('express');
const { uploadContent, getTeacherContent } = require('../controllers/content.controller');
const { authenticate, authorizeRole } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

// Route for teacher to upload content
router.post('/upload', authenticate, authorizeRole('teacher'), upload.single('file'), uploadContent);

// Route for teacher to view their uploaded content
router.get('/my-content', authenticate, authorizeRole('teacher'), getTeacherContent);

module.exports = router;
