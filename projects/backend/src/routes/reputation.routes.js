const express = require('express');
const router = express.Router();
const reputationController = require('../controllers/reputation.controller');

// Public endpoints — all reads come from the blockchain
router.get('/:walletAddress', reputationController.getReputation);
router.get('/dashboard/:walletAddress', reputationController.getDashboard);

module.exports = router;
