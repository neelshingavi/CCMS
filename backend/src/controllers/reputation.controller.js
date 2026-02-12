const ReputationService = require('../services/reputation.service');
const CCTService = require('../services/cct.service');
const logger = require('../config/logger');

/**
 * ReputationController
 *
 * Public endpoints for reading on-chain reputation and CCT balances.
 * All data comes directly from the Algorand blockchain — not from PostgreSQL.
 */

exports.getReputation = async (req, res) => {
    try {
        const { walletAddress } = req.params;

        if (!walletAddress) {
            return res.status(400).json({ error: 'walletAddress parameter required' });
        }

        const reputationData = await ReputationService.getReputation(walletAddress);

        res.json({
            walletAddress,
            reputation: reputationData.reputation,
            scores: reputationData.scores,
        });
    } catch (error) {
        logger.error('Get Reputation Error:', error);
        res.status(500).json({ error: 'Failed to fetch reputation' });
    }
};

exports.getDashboard = async (req, res) => {
    try {
        const { walletAddress } = req.params;

        if (!walletAddress) {
            return res.status(400).json({ error: 'walletAddress parameter required' });
        }

        // Fetch all data in parallel from blockchain
        const [reputationData, cctBalance] = await Promise.all([
            ReputationService.getReputation(walletAddress),
            CCTService.getBalance(walletAddress),
        ]);

        res.json({
            walletAddress,
            reputation: {
                total: reputationData.reputation,
                breakdown: reputationData.scores,
            },
            cct: {
                balance: cctBalance,
                assetId: parseInt(process.env.CCT_ASSET_ID || '0', 10),
            },
        });
    } catch (error) {
        logger.error('Get Dashboard Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
};
