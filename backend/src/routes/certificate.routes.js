const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificate.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Demo Mode - wallet-based (no JWT required)
router.get('/eligibility/:eventId', certificateController.checkEligibilityDemo);
router.post('/issue', certificateController.issueCertificateDemo);
router.get('/my/:walletAddress', certificateController.getMyCertificatesDemo);

// Authenticated endpoints (for production)
router.get('/eligibility/auth/:eventId', authenticate, certificateController.checkEligibility);
router.post('/issue/auth', authenticate, certificateController.issueCertificate);
router.get('/my/auth', authenticate, certificateController.getMyCertificates);

// Public verification - always accessible
router.get('/verify/:certificateHash', certificateController.verifyCertificate);

module.exports = router;
