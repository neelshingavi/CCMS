const Feedback = require('../models/Feedback');
const Event = require('../models/Event');
const HashService = require('../services/hash.service');
const AIService = require('../services/ai.service');
const AlgorandService = require('../services/algorand.service');
const ReputationService = require('../services/reputation.service');
const logger = require('../config/logger');

exports.submitFeedback = async (req, res) => {
    try {
        const { eventId, feedbackText, walletAddress } = req.body;

        // 1. Validate Event
        const event = await Event.findOne({ where: { eventId } });
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // 2. Validate feedback not empty
        if (!feedbackText || feedbackText.trim().length < 10) {
            return res.status(400).json({ error: 'Feedback must be at least 10 characters' });
        }

        // 3. Anonymize wallet - CRITICAL for privacy
        const walletHash = HashService.hashWallet(walletAddress);

        // 4. Check for duplicate feedback
        const existingFeedback = await Feedback.findOne({
            where: { event_id: event.id, wallet_hash: walletHash }
        });
        if (existingFeedback) {
            return res.status(400).json({ error: 'Feedback already submitted for this event' });
        }

        // 5. Hash content for blockchain anchoring
        const contentHash = HashService.hashContent(feedbackText);

        // 6. AI Sentiment Analysis
        const sentimentResult = AIService.analyzeSentiment(feedbackText);

        // 7. Create feedback record
        const feedback = await Feedback.create({
            event_id: event.id,
            wallet_hash: walletHash, // Anonymous
            content_hash: contentHash,
            feedback_text: feedbackText,
            sentiment: sentimentResult.sentiment,
            sentiment_score: sentimentResult.score
        });

        // 8. Anchor hash + sentiment score on blockchain
        let txnId = null;
        try {
            // Anchor feedback content hash (existing logic)
            const anchorResult = await AlgorandService.anchorFeedback(contentHash);
            txnId = anchorResult.txId;
            if (txnId) {
                await feedback.update({ txn_id: txnId });
                logger.info(`Feedback anchored on-chain: ${txnId}`);
            }

            // PART 5: Anchor AI sentiment into reputation contract
            // Scale sentiment score to uint64 (0–100)
            // sentimentResult.score is from the Sentiment library (can be negative/positive integer)
            // We normalize: clamp comparative to [0, 1] range, then scale to 0–100
            const normalizedScore = Math.max(0, Math.min(1, (sentimentResult.comparative + 1) / 2));
            const sentimentScaled = Math.round(normalizedScore * 100);

            if (walletAddress) {
                await ReputationService.updateUserScore(walletAddress, 0, 0, sentimentScaled, 0);
                logger.info(`Sentiment anchored to reputation: score=${sentimentScaled} for ${walletAddress}`);
            }
        } catch (blockchainError) {
            logger.error('Failed to anchor feedback/sentiment:', blockchainError);
            // Non-critical failure, proceed
        }

        res.status(201).json({
            message: 'Feedback submitted successfully',
            feedbackId: feedback.id,
            sentiment: sentimentResult.sentiment,
            txnId
            // NEVER return wallet_hash or any identifiable info
        });

    } catch (error) {
        logger.error('Submit Feedback Error:', error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Feedback already submitted' });
        }

        res.status(500).json({ error: 'Failed to submit feedback' });
    }
};

exports.getFeedbackAnalytics = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Only return aggregated data - NEVER individual feedback with identifiers
        const feedbacks = await Feedback.findAll({
            where: { event_id: eventId },
            attributes: ['sentiment', 'sentiment_score', 'createdAt']
        });

        const analytics = {
            total: feedbacks.length,
            positive: feedbacks.filter(f => f.sentiment === 'positive').length,
            neutral: feedbacks.filter(f => f.sentiment === 'neutral').length,
            negative: feedbacks.filter(f => f.sentiment === 'negative').length,
            averageScore: feedbacks.reduce((sum, f) => sum + (f.sentiment_score || 0), 0) / feedbacks.length || 0
        };

        res.json({
            eventId,
            analytics
        });
    } catch (error) {
        logger.error('Get Feedback Analytics Error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

exports.getAllFeedbackTexts = async (req, res) => {
    try {
        const { eventId } = req.params;

        // ADMIN ONLY: Returns feedback text WITHOUT any wallet info
        // Verify admin role happens in middleware

        const feedbacks = await Feedback.findAll({
            where: { event_id: eventId },
            attributes: ['feedback_text', 'sentiment', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });

        res.json(feedbacks);
    } catch (error) {
        logger.error('Get All Feedback Error:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
};
