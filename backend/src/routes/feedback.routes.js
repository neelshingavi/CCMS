const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Demo Mode - wallet-based feedback (no JWT required)
router.post('/submit', feedbackController.submitFeedback);

// Admin endpoints - require authentication
router.get('/analytics/:eventId', authenticate, authorize(['ADMIN', 'FACULTY', 'SUPER_ADMIN']), feedbackController.getFeedbackAnalytics);
router.get('/all/:eventId', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), feedbackController.getAllFeedbackTexts);

module.exports = router;
