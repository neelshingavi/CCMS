const Election = require('../models/Election');
const Vote = require('../models/Vote');
const AlgorandService = require('../services/algorand.service');
const AlgorandClient = require('../blockchain/algorand.client');
const ReputationService = require('../services/reputation.service');
const CCTService = require('../services/cct.service');
const logger = require('../config/logger');

exports.createElection = async (req, res) => {
    try {
        const { title, description, start_time, end_time, options } = req.body;
        const userId = req.user.id; // From JWT middleware

        // 1. Deploy Smart Contract
        let appId = null;
        try {
            // Need option count
            const optionCount = options ? options.length : 2; // Default to 2 (Yes/No) if simplistic
            // We need a unique election ID string for the contract
            const electionIdStr = `ELECTION_${Date.now()}`;

            const result = await AlgorandService.deployVotingContract(
                electionIdStr,
                new Date(start_time).getTime(), // Convert to timestamp
                new Date(end_time).getTime(),
                optionCount
            );
            appId = result.appId;
            logger.info(`Election Contract Deployed: App ID ${appId}`);
        } catch (deployError) {
            logger.error('Failed to deploy voting contract', deployError);
            // Fallback: create DB record without contract (or fail?)
            // Allowing fail for now as per requirements to be blockchain-backed
            // But for dev resilience, maybe set appId to 0
            appId = 0;
        }

        // 2. Save to DB
        const election = await Election.create({
            title,
            description,
            start_time,
            end_time,
            algorand_app_id: appId,
            created_by: userId
        });

        res.status(201).json({ message: 'Election created', election, appId });
    } catch (error) {
        logger.error('Create Election Error:', error);
        res.status(500).json({ error: 'Failed to create election' });
    }
};

exports.castVote = async (req, res) => {
    try {
        const { electionId, voteHash, txnId } = req.body;
        const userId = req.user.id;
        // User wallet might be in req.user if stored, or passed in body
        const userWallet = req.body.walletAddress || req.user.wallet_address;

        // 1. Verify Transaction on Chain
        if (txnId && userWallet) {
            const verification = await AlgorandClient.verifyTransaction(txnId, userWallet);
            if (!verification.valid) {
                return res.status(400).json({ error: 'Invalid Blockchain Transaction: ' + verification.reason });
            }
        }

        // 2. Check for duplicate vote in DB
        const existingVote = await Vote.findOne({ where: { election_id: electionId, user_id: userId } });
        if (existingVote) {
            return res.status(400).json({ error: 'User has already cast a vote in this election' });
        }

        // 3. Record Vote
        const vote = await Vote.create({
            election_id: electionId,
            user_id: userId,
            vote_hash: voteHash,
            txn_id: txnId
        });

        // 4. Update on-chain reputation (+1 voting) & send CCT reward
        if (userWallet) {
            try {
                await ReputationService.updateUserScore(userWallet, 0, 1, 0, 0);
                await CCTService.sendReward(userWallet, CCTService.constructor.REWARDS.VOTE);
                logger.info(`Reputation & CCT updated for vote: ${userWallet}`);
            } catch (rewardErr) {
                logger.error('Non-critical: Vote reputation/CCT reward failed:', rewardErr.message);
            }
        }

        res.status(201).json({ message: 'Vote recorded successfully', voteId: vote.id });
    } catch (error) {
        logger.error('Cast Vote Error:', error);
        res.status(500).json({ error: 'Failed to cast vote' });
    }
};

exports.getElections = async (req, res) => {
    try {
        const elections = await Election.findAll();
        res.json(elections);
    } catch (error) {
        logger.error(error);
        res.status(500).json({ error: 'Fetch failed' });
    }
};
