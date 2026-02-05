const Election = require('../models/Election');
const Vote = require('../models/Vote');
const AlgorandClient = require('../blockchain/algorand.client');
const logger = require('../config/logger');

exports.createElection = async (req, res) => {
    try {
        const { title, description, start_time, end_time } = req.body;
        const userId = req.user.id; // From JWT middleware

        // 1. Deploy Smart Contract (Optional / Parallel)
        // const { appId } = await AlgorandClient.deployVotingApp(...) 
        const appId = 0; // Placeholder until contract integration

        // 2. Save to DB
        const election = await Election.create({
            title,
            description,
            start_time,
            end_time,
            algorand_app_id: appId,
            created_by: userId
        });

        res.status(201).json({ message: 'Election created', election });
    } catch (error) {
        logger.error('Create Election Error:', error);
        res.status(500).json({ error: 'Failed to create election' });
    }
};

exports.castVote = async (req, res) => {
    try {
        const { electionId, voteHash, txnId } = req.body;
        const userId = req.user.id;
        const userWallet = req.user.wallet_address; // Assuming we store this

        // 1. Verify Transaction on Chain
        // We expect the frontend to have already signed and sent the txn to Algorand.
        // We verify that the txnId exists, is from the user, and calls the correct App ID.

        // const verification = await AlgorandClient.verifyTransaction(txnId, userWallet);
        // if (!verification.valid) {
        //   return res.status(400).json({ error: 'Invalid Blockchain Transaction: ' + verification.reason });
        // }

        // 2. Check for duplicate vote in DB (Fast check)
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
