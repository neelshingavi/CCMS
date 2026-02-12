const Certificate = require('../models/Certificate');
const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const User = require('../models/User');
const AlgorandService = require('../services/algorand.service');
const AlgorandClient = require('../blockchain/algorand.client');
const HashService = require('../services/hash.service');
const ReputationService = require('../services/reputation.service');
const CCTService = require('../services/cct.service');
const logger = require('../config/logger');

const ATTENDANCE_THRESHOLD = 0.8; // 80% attendance required

exports.checkEligibility = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.id;

        const event = await Event.findOne({ where: { eventId } });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check attendance count for this user in this event/course
        const attendanceCount = await Attendance.count({
            where: { event_id: event.id, user_id: userId, status: 'CONFIRMED' }
        });

        // For demo: assume 1 attendance = eligible
        // In production: compare against total sessions
        const isEligible = attendanceCount >= 1;

        // Check if already issued
        const existingCert = await Certificate.findOne({
            where: { event_id: event.id, user_id: userId }
        });

        res.json({
            eventId,
            eligible: isEligible,
            attendanceCount,
            alreadyIssued: !!existingCert,
            certificateId: existingCert?.id
        });
    } catch (error) {
        logger.error('Check Eligibility Error:', error);
        res.status(500).json({ error: 'Failed to check eligibility' });
    }
};

exports.issueCertificate = async (req, res) => {
    try {
        const { eventId } = req.body;
        const userId = req.user.id;

        // 1. Get user and event
        const user = await User.findByPk(userId);
        const event = await Event.findOne({ where: { eventId } });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        if (!user.wallet_address) {
            return res.status(400).json({ error: 'User must have a wallet address to receive certificate' });
        }

        // 2. Check not already issued
        const existingCert = await Certificate.findOne({
            where: { event_id: event.id, user_id: userId }
        });
        if (existingCert) {
            return res.status(400).json({
                error: 'Certificate already issued',
                certificateId: existingCert.id,
                assetId: existingCert.asset_id
            });
        }

        // 3. Verify eligibility (attendance threshold)
        const attendanceCount = await Attendance.count({
            where: { event_id: event.id, user_id: userId, status: 'CONFIRMED' }
        });
        if (attendanceCount < 1) {
            return res.status(400).json({ error: 'Attendance requirement not met' });
        }

        // 4. Create certificate hash
        const certificateData = `${event.id}:${userId}:${Date.now()}`;
        const certificateHash = HashService.hashContent(certificateData);

        // 5. Create pending certificate record
        const certificate = await Certificate.create({
            event_id: event.id,
            user_id: userId,
            wallet_address: user.wallet_address,
            certificate_hash: certificateHash,
            status: 'PENDING'
        });

        // 6. Mint/Transfer Asset on blockchain
        let assetId = null;
        let txnId = null;

        if (event.certificateAssetId) {
            try {
                // Issue (Transfer) certificate to user
                // Assumes User has opted-in. If not, this might fail unless we use inner txn or specialized app.
                // For this quick start, logic assumes opt-in handled by frontend or pre-setup.
                const result = await AlgorandService.issueCertificate(
                    Number(event.certificateAssetId),
                    user.wallet_address,
                    1, // amount
                    process.env.DEPLOYER_MNEMONIC // Sender
                );
                assetId = event.certificateAssetId;
                txnId = result.txId;
                logger.info(`Issued certificate asset ${assetId} to ${user.wallet_address}, Txn: ${txnId}`);
            } catch (blockchainError) {
                logger.error('Blockchain certificate issue failed:', blockchainError);
            }
        }

        // 7. Update certificate record
        await certificate.update({
            asset_id: assetId,
            txn_id: txnId,
            status: assetId ? 'TRANSFERRED' : 'MINTED',
            issued_at: new Date()
        });

        // 8. Update on-chain reputation (+1 certification) & send CCT reward
        try {
            await ReputationService.updateUserScore(user.wallet_address, 0, 0, 0, 1);
            await CCTService.sendReward(user.wallet_address, CCTService.constructor.REWARDS.CERTIFICATE);
            logger.info(`Reputation & CCT updated for certificate: ${user.wallet_address}`);
        } catch (rewardErr) {
            logger.error('Non-critical: Certificate reputation/CCT reward failed:', rewardErr.message);
        }

        res.status(201).json({
            message: 'Certificate issued successfully',
            certificateId: certificate.id,
            certificateHash,
            assetId,
            txnId,
            explorerUrl: assetId ? `https://testnet.algoexplorer.io/asset/${assetId}` : null
        });

    } catch (error) {
        logger.error('Issue Certificate Error:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Certificate already issued' });
        }

        res.status(500).json({ error: 'Failed to issue certificate' });
    }
};

exports.getMyCertificates = async (req, res) => {
    try {
        const userId = req.user.id;

        const certificates = await Certificate.findAll({
            where: { user_id: userId },
            attributes: ['id', 'certificate_hash', 'asset_id', 'txn_id', 'status', 'issued_at']
        });

        res.json(certificates.map(cert => ({
            ...cert.toJSON(),
            explorerUrl: cert.asset_id ? `https://testnet.algoexplorer.io/asset/${cert.asset_id}` : null
        })));
    } catch (error) {
        logger.error('Get My Certificates Error:', error);
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
};

exports.verifyCertificate = async (req, res) => {
    try {
        const { certificateHash } = req.params;

        const certificate = await Certificate.findOne({
            where: { certificate_hash: certificateHash }
        });

        if (!certificate) {
            return res.status(404).json({ verified: false, reason: 'Certificate not found' });
        }

        // Verify on blockchain if asset exists
        let blockchainVerified = false;
        if (certificate.asset_id) {
            // In production: verify asset ownership
            blockchainVerified = true;
        }

        res.json({
            verified: true,
            certificateId: certificate.id,
            assetId: certificate.asset_id,
            issuedAt: certificate.issued_at,
            blockchainVerified,
            explorerUrl: certificate.asset_id ? `https://testnet.algoexplorer.io/asset/${certificate.asset_id}` : null
        });
    } catch (error) {
        logger.error('Verify Certificate Error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
};

// ========== DEMO MODE FUNCTIONS (wallet-based, no JWT) ==========

exports.checkEligibilityDemo = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { walletAddress } = req.query;

        if (!walletAddress) {
            return res.status(400).json({ error: 'walletAddress query parameter required' });
        }

        const event = await Event.findOne({ where: { eventId } });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const walletHash = HashService.hashWallet(walletAddress);

        const attendanceCount = await Attendance.count({
            where: { event_id: event.id, wallet_hash: walletHash, status: 'CONFIRMED' }
        });

        const isEligible = attendanceCount >= 1;

        const existingCert = await Certificate.findOne({
            where: { event_id: event.id, wallet_hash: walletHash }
        });

        res.json({
            eventId,
            eligible: isEligible,
            attendanceCount,
            alreadyIssued: !!existingCert,
            certificateId: existingCert?.id
        });
    } catch (error) {
        logger.error('Check Eligibility Demo Error:', error);
        res.status(500).json({ error: 'Failed to check eligibility' });
    }
};

exports.issueCertificateDemo = async (req, res) => {
    try {
        const { eventId, walletAddress } = req.body;

        if (!eventId || !walletAddress) {
            return res.status(400).json({ error: 'eventId and walletAddress required' });
        }

        const event = await Event.findOne({ where: { eventId } });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const walletHash = HashService.hashWallet(walletAddress);

        // Check not already issued
        const existingCert = await Certificate.findOne({
            where: { event_id: event.id, wallet_hash: walletHash }
        });
        if (existingCert) {
            return res.status(400).json({
                error: 'Certificate already issued',
                certificateId: existingCert.id,
                assetId: existingCert.asset_id
            });
        }

        // Verify eligibility
        const attendanceCount = await Attendance.count({
            where: { event_id: event.id, wallet_hash: walletHash, status: 'CONFIRMED' }
        });
        if (attendanceCount < 1) {
            return res.status(400).json({ error: 'Attendance requirement not met' });
        }

        // Create certificate
        const certificateData = `${event.id}:${walletHash}:${Date.now()}`;
        const certificateHash = HashService.hashContent(certificateData);

        const certificate = await Certificate.create({
            event_id: event.id,
            user_id: walletHash.substring(0, 36),
            wallet_address: walletAddress,
            wallet_hash: walletHash,
            certificate_hash: certificateHash,
            status: 'MINTED',
            issued_at: new Date()
        });

        res.status(201).json({
            message: 'Certificate issued successfully',
            certificateId: certificate.id,
            certificateHash,
            explorerUrl: null
        });

    } catch (error) {
        logger.error('Issue Certificate Demo Error:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Certificate already issued' });
        }
        res.status(500).json({ error: 'Failed to issue certificate' });
    }
};

exports.getMyCertificatesDemo = async (req, res) => {
    try {
        const { walletAddress } = req.params;

        if (!walletAddress) {
            return res.status(400).json({ error: 'walletAddress required' });
        }

        const walletHash = HashService.hashWallet(walletAddress);

        const certificates = await Certificate.findAll({
            where: { wallet_hash: walletHash },
            attributes: ['id', 'certificate_hash', 'asset_id', 'txn_id', 'status', 'issued_at']
        });

        res.json(certificates.map(cert => ({
            ...cert.toJSON(),
            explorerUrl: cert.asset_id ? `https://testnet.algoexplorer.io/asset/${cert.asset_id}` : null
        })));
    } catch (error) {
        logger.error('Get My Certificates Demo Error:', error);
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
};

