const crypto = require('crypto');

class HashService {
    /**
     * Hash a wallet address for anonymization
     * @param {string} walletAddress - The wallet address to hash
     * @param {string} salt - Optional salt (defaults to env variable)
     * @returns {string} - SHA-256 hash
     */
    hashWallet(walletAddress, salt = process.env.HASH_SALT || 'ccms-default-salt') {
        return crypto
            .createHash('sha256')
            .update(walletAddress + salt)
            .digest('hex');
    }

    /**
     * Hash feedback content for on-chain storage
     * @param {string} content - The feedback content
     * @returns {string} - SHA-256 hash
     */
    hashContent(content) {
        return crypto
            .createHash('sha256')
            .update(content)
            .digest('hex');
    }

    /**
     * Create a vote commitment hash
     * @param {string} choice - The vote choice
     * @param {string} walletAddress - Voter's wallet
     * @param {string} nonce - Random nonce for uniqueness
     * @returns {string} - Commitment hash
     */
    createVoteCommitment(choice, walletAddress, nonce) {
        const data = `${choice}:${walletAddress}:${nonce}`;
        return crypto
            .createHash('sha256')
            .update(data)
            .digest('hex');
    }

    /**
     * Verify a hash matches the original data
     * @param {string} original - Original data
     * @param {string} hash - Hash to verify against
     * @returns {boolean}
     */
    verifyHash(original, hash, salt = process.env.HASH_SALT || 'ccms-default-salt') {
        const computed = crypto
            .createHash('sha256')
            .update(original + salt)
            .digest('hex');
        return computed === hash;
    }
}

module.exports = new HashService();
