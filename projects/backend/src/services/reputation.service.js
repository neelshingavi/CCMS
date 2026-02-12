const algosdk = require('algosdk');
const {
    algodClient,
    deployerAccount,
    sendTransaction,
    waitForConfirmation
} = require('../config/algorand');
const logger = require('../config/logger');

/**
 * ReputationService
 *
 * Manages interactions with the on-chain Reputation smart contract.
 * The deployer account (contract creator) is the sole authorized caller
 * for score updates, ensuring the backend is the trusted oracle bridging
 * off-chain events to on-chain reputation.
 *
 * NOTE: Reputation scores are NEVER stored in PostgreSQL.
 * The on-chain state is the single source of truth.
 */
class ReputationService {
    constructor() {
        this.algodClient = algodClient;
        this.appId = parseInt(process.env.REPUTATION_APP_ID || '0', 10);
    }

    /**
     * Opt a user's account into the Reputation app so local state can be written.
     */
    async optInUser(userAddress, userMnemonic) {
        try {
            const suggestedParams = await this.algodClient.getTransactionParams().do();
            const sender = algosdk.mnemonicToSecretKey(userMnemonic);

            const txn = algosdk.makeApplicationOptInTxnFromObject({
                from: sender.addr,
                suggestedParams,
                appIndex: this.appId,
            });

            const signedTxn = txn.signTxn(sender.sk);
            const result = await sendTransaction(signedTxn);
            logger.info(`✅ User opted into Reputation app: ${result.txId}`);
            return { success: true, txId: result.txId };
        } catch (error) {
            logger.warn(`Reputation opt-in may have failed (possibly already opted in): ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update a user's on-chain reputation scores.
     *
     * @param {string} userAddress  - Algorand address of the user
     * @param {number} attendanceDelta - Points to add for attendance (uint64)
     * @param {number} votingDelta     - Points to add for voting (uint64)
     * @param {number} feedbackDelta   - Points to add for feedback (uint64, 0–100 scaled)
     * @param {number} certDelta       - Points to add for certification (uint64)
     * @returns {{ txId: string, newReputation: number }}
     */
    async updateUserScore(userAddress, attendanceDelta = 0, votingDelta = 0, feedbackDelta = 0, certDelta = 0) {
        if (!this.appId || this.appId === 0) {
            logger.warn('Reputation app ID not configured – skipping on-chain update');
            return { txId: null, newReputation: null };
        }

        try {
            const suggestedParams = await this.algodClient.getTransactionParams().do();

            // ABI method selector for:
            // update_user_score(account,uint64,uint64,uint64,uint64)uint64
            const methodSelector = algosdk.ABIMethod.fromSignature(
                'update_user_score(account,uint64,uint64,uint64,uint64)uint64'
            );

            const appArgs = [
                methodSelector.getSelector(),
                algosdk.encodeUint64(attendanceDelta),
                algosdk.encodeUint64(votingDelta),
                algosdk.encodeUint64(feedbackDelta),
                algosdk.encodeUint64(certDelta),
            ];

            const txn = algosdk.makeApplicationNoOpTxnFromObject({
                from: deployerAccount.addr,
                suggestedParams,
                appIndex: this.appId,
                appArgs,
                accounts: [userAddress],
            });

            const signedTxn = txn.signTxn(deployerAccount.sk);
            const result = await sendTransaction(signedTxn);

            logger.info(`✅ Reputation updated for ${userAddress}: txn=${result.txId}`);
            return { txId: result.txId };
        } catch (error) {
            logger.error(`❌ Reputation update failed for ${userAddress}:`, error);
            // Non-critical — do not crash the caller
            return { txId: null, error: error.message };
        }
    }

    /**
     * Read a user's on-chain reputation score (local state lookup).
     */
    async getReputation(userAddress) {
        if (!this.appId || this.appId === 0) {
            return { reputation: 0, scores: {} };
        }

        try {
            const accountInfo = await this.algodClient
                .accountApplicationInformation(userAddress, this.appId)
                .do();

            const localState = accountInfo['app-local-state']?.['key-value'] || [];
            const scores = {};
            const keyMap = {
                rep_score: 'reputation',
                att_score: 'attendance',
                vot_score: 'voting',
                fdb_score: 'feedback',
                cer_score: 'certification',
            };

            for (const kv of localState) {
                const keyBytes = Buffer.from(kv.key, 'base64').toString('utf8');
                if (keyMap[keyBytes]) {
                    scores[keyMap[keyBytes]] = kv.value.uint || 0;
                }
            }

            return {
                reputation: scores.reputation || 0,
                scores,
            };
        } catch (error) {
            logger.error(`Error reading reputation for ${userAddress}:`, error);
            return { reputation: 0, scores: {} };
        }
    }
}

module.exports = new ReputationService();
