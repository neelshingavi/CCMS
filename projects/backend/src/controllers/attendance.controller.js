const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const User = require('../models/User');
const AlgorandService = require('../services/algorand.service');
const AlgorandClient = require('../blockchain/algorand.client');
const HashService = require('../services/hash.service');
const ReputationService = require('../services/reputation.service');
const CCTService = require('../services/cct.service');
const logger = require('../config/logger');

exports.markAttendance = async (req, res) => {
    try {
        const { eventId, walletAddress, signature } = req.body;
        const userId = req.user.id;

        // 1. Validate Event Exists and is Active
        const event = await Event.findOne({ where: { eventId } });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // 2. Validate Time Window
        const now = new Date();
        if (now < new Date(event.startTime)) {
            return res.status(400).json({ error: 'Event has not started yet' });
        }
        if (now > new Date(event.endTime)) {
            return res.status(400).json({ error: 'Event has ended' });
        }

        // 3. Check for Duplicate Attendance (DB-level first for speed)
        const existingAttendance = await Attendance.findOne({
            where: { event_id: event.id, user_id: userId }
        });
        if (existingAttendance) {
            return res.status(400).json({ error: 'Attendance already marked for this event' });
        }

        // 4. Hash wallet for privacy
        const walletHash = HashService.hashWallet(walletAddress);

        // 5. Create pending attendance record
        const attendance = await Attendance.create({
            event_id: event.id,
            user_id: userId,
            wallet_address: walletAddress,
            wallet_hash: walletHash,
            status: 'PENDING'
        });

        // 6. Verify Blockchain Transaction (Trustless)
        let txnId = req.body.txnId;

        if (event.attendanceAppId && txnId && !txnId.startsWith('DEMO')) {
            try {
                // Verify the transaction matches: Sender=User, AppId=EventApp, Args=CHECK_IN
                const verified = await AlgorandClient.verifyTransaction(txnId, walletAddress);
                if (!verified.valid) {
                    return res.status(400).json({ error: 'Invalid blockchain transaction' });
                }
                // Optional: Check if AppId matches event.attendanceAppId in the txn detail
                // For now, AlgorandClient.verifyTransaction checks sender/receiver. 
                // We trust the frontend sent the correct one, but ideally we verify App ID too.
                logger.info(`Blockchain attendance verified: ${txnId}`);
            } catch (blockchainError) {
                logger.error('Blockchain verification failed:', blockchainError);
                return res.status(400).json({ error: 'Blockchain verification failed' });
            }
        } else if (!txnId) {
            // If no txnId provided but contract exists, fail (unless demo/fallback needed)
            if (event.attendanceAppId) {
                return res.status(400).json({ error: 'Blockchain transaction required' });
            }
        }

        // 7. Update record with txn ID
        await attendance.update({ txn_id: txnId, status: txnId ? 'CONFIRMED' : 'PENDING' });

        // 8. Update on-chain reputation (+1 attendance) & send CCT reward
        try {
            await ReputationService.updateUserScore(walletAddress, 1, 0, 0, 0);
            await CCTService.sendReward(walletAddress, CCTService.constructor.REWARDS.ATTENDANCE);
            logger.info(`Reputation & CCT updated for attendance: ${walletAddress}`);
        } catch (rewardErr) {
            logger.error('Non-critical: Reputation/CCT reward failed:', rewardErr.message);
        }

        // 9. Emit socket event for real-time updates
        const io = req.app.get('io');
        if (io) {
            io.to(`event_${eventId}`).emit('attendance_update', {
                eventId,
                totalAttendance: await Attendance.count({ where: { event_id: event.id } })
            });
        }

        res.status(201).json({
            message: 'Attendance marked successfully',
            attendanceId: attendance.id,
            txnId,
            status: attendance.status
        });

    } catch (error) {
        logger.error('Mark Attendance Error:', error);

        // Handle unique constraint violation
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Attendance already marked' });
        }

        res.status(500).json({ error: 'Failed to mark attendance' });
    }
};

// Demo Mode - Uses wallet address as identity (no JWT)
exports.markAttendanceDemo = async (req, res) => {
    try {
        const { eventId, walletAddress, timestamp } = req.body;

        // Validate inputs
        if (!eventId || !walletAddress) {
            return res.status(400).json({ error: 'Missing eventId or walletAddress' });
        }

        // 1. Validate Event Exists and is Active
        const event = await Event.findOne({ where: { eventId } });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // 2. Validate Time Window
        const now = new Date();
        if (now < new Date(event.startTime)) {
            return res.status(400).json({ error: 'Event has not started yet' });
        }
        if (now > new Date(event.endTime)) {
            return res.status(400).json({ error: 'Event has ended' });
        }

        // 3. Hash wallet for privacy and duplicate detection
        const walletHash = HashService.hashWallet(walletAddress);

        // 4. Check for Duplicate Attendance using wallet hash
        const existingAttendance = await Attendance.findOne({
            where: { event_id: event.id, wallet_hash: walletHash }
        });
        if (existingAttendance) {
            return res.status(400).json({ error: 'Attendance already marked for this event' });
        }

        // 5. Create attendance record (using wallet hash as pseudo-user-id)
        const attendance = await Attendance.create({
            event_id: event.id,
            user_id: require('uuid').v4(), // Generate valid UUID
            wallet_address: walletAddress,
            wallet_hash: walletHash,
            status: 'CONFIRMED',
            checked_in_at: new Date()
        });

        // 6. Blockchain submission placeholder
        let txnId = 'DEMO_TXN_' + Date.now();

        await attendance.update({ txn_id: txnId });

        // Update on-chain reputation & CCT reward (demo mode)
        try {
            await ReputationService.updateUserScore(walletAddress, 1, 0, 0, 0);
            await CCTService.sendReward(walletAddress, CCTService.constructor.REWARDS.ATTENDANCE);
        } catch (rewardErr) {
            logger.error('Non-critical: Demo reputation/CCT reward failed:', rewardErr.message);
        }

        res.status(201).json({
            message: 'Attendance marked successfully',
            attendanceId: attendance.id,
            txnId,
            status: 'CONFIRMED',
            explorerUrl: `https://testnet.algoexplorer.io/tx/${txnId}`
        });

    } catch (error) {
        logger.error('Mark Attendance Demo Error:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Attendance already marked' });
        }

        res.status(500).json({ error: 'Failed to mark attendance: ' + error.message });
    }
};

exports.getAttendanceByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        const attendances = await Attendance.findAll({
            where: { event_id: eventId },
            attributes: ['id', 'wallet_hash', 'status', 'checked_in_at', 'txn_id'] // Never expose raw wallet
        });

        res.json({
            eventId,
            total: attendances.length,
            attendances
        });
    } catch (error) {
        logger.error('Get Attendance Error:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
};

exports.getMyAttendance = async (req, res) => {
    try {
        const userId = req.user.id;

        const attendances = await Attendance.findAll({
            where: { user_id: userId },
            include: [{ model: Event, as: 'event', attributes: ['title', 'startTime'] }]
        });

        res.json(attendances);
    } catch (error) {
        logger.error('Get My Attendance Error:', error);
        res.status(500).json({ error: 'Failed to fetch attendance history' });
    }
};

exports.verifyAttendance = async (req, res) => {
    try {
        const { attendanceId } = req.params;

        const attendance = await Attendance.findByPk(attendanceId);
        if (!attendance) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }

        // Verify on blockchain if txn exists
        if (attendance.txn_id && attendance.txn_id !== 'PENDING_BLOCKCHAIN_TXN') {
            const verification = await AlgorandClient.verifyTransaction(
                attendance.txn_id,
                attendance.wallet_address
            );
            return res.json({
                verified: verification.valid,
                attendanceId: attendance.id,
                txnId: attendance.txn_id,
                explorerUrl: `https://testnet.algoexplorer.io/tx/${attendance.txn_id}`
            });
        }

        res.json({
            verified: false,
            reason: 'No blockchain transaction found',
            attendanceId: attendance.id
        });
    } catch (error) {
        logger.error('Verify Attendance Error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
};
