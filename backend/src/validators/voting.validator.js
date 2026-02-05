const { z } = require('zod');

const createElectionSchema = z.object({
    title: z.string().min(3).max(200),
    description: z.string().max(1000).optional(),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    options: z.array(z.string()).min(2).max(10).optional()
});

const castVoteSchema = z.object({
    electionId: z.string().uuid(),
    voteHash: z.string().length(64), // SHA-256 hex
    txnId: z.string().min(52).max(52) // Algorand txn IDs are 52 chars
});

const validateCreateElection = (req, res, next) => {
    try {
        createElectionSchema.parse(req.body);
        // Additional validation: end_time must be after start_time
        if (new Date(req.body.end_time) <= new Date(req.body.start_time)) {
            return res.status(400).json({ error: 'end_time must be after start_time' });
        }
        next();
    } catch (error) {
        return res.status(400).json({
            error: 'Validation failed',
            details: error.errors
        });
    }
};

const validateCastVote = (req, res, next) => {
    try {
        castVoteSchema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            error: 'Validation failed',
            details: error.errors
        });
    }
};

module.exports = {
    createElectionSchema,
    castVoteSchema,
    validateCreateElection,
    validateCastVote
};
