const express = require('express');
const router = express.Router();
const votingController = require('../controllers/voting.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Public/Student routes
router.get('/', authenticate, votingController.getElections);
router.post('/vote', authenticate, authorize(['STUDENT', 'FACULTY', 'ADMIN']), votingController.castVote);

// Admin routes
router.post('/create', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), votingController.createElection);

module.exports = router;
