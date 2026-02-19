// server/routes/reports/report-routes.js
const express = require('express');
const router = express.Router();
const { uploadReport, getMyReports } = require('../../controllers/reports/report-controller');
const { authMiddleware } = require('../../controllers/auth/auth-controller');
const upload = require('../../middleware/upload');

// POST /api/reports/upload  (multipart/form-data) - protected
router.post('/upload', authMiddleware, upload.single('file'), uploadReport);

// GET /api/reports/my - protected
router.get('/my', authMiddleware, getMyReports);

module.exports = router;
