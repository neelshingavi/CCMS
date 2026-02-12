const algosdk = require('algosdk');
const {
    algodClient,
    deployerAccount,
    sendTransaction,
} = require('../config/algorand');
const logger = require('../config/logger');

/**
 * CCTService — Campus Credit Token (CCT) Manager
 *
 * Handles creation of the CCT ASA and reward distribution.
 * CCT is a fungible token (decimals: 0) used as an incentive layer:
 *   - Attendance → 1 CCT
 *   - Vote       → 2 CCT
 *   - Certificate → 5 CCT
 *
 * Uses the existing ASA transfer patterns from AlgorandService.
 */
class CCTService {
    constructor() {
        this.algodClient = algodClient;
        this.assetId = parseInt(process.env.CCT_ASSET_ID || '0', 10);
    }

    /**
     * Create the Campus Credit Token ASA.
     * Should be called once during initial deployment.
     */
    async createCCT(totalSupply = 1000000) {
        try {
            const suggestedParams = await this.algodClient.getTransactionParams().do();

            const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
                from: deployerAccount.addr,
                suggestedParams,
                total: totalSupply,
                decimals: 0,
                assetName: 'Campus Credit Token',
                unitName: 'CCT',
                assetURL: 'https://ccms.example.com/cct',
                defaultFrozen: false,
                manager: deployerAccount.addr,
                reserve: deployerAccount.addr,
                freeze: deployerAccount.addr,
                clawback: deployerAccount.addr,
            });

            const signedTxn = txn.signTxn(deployerAccount.sk);
            const result = await sendTransaction(signedTxn);

            const assetId = result.result['asset-index'];
            this.assetId = assetId;
            logger.info(`✅ CCT Token created: Asset ID ${assetId}`);

            return { assetId, txId: result.txId };
        } catch (error) {
            logger.error('❌ Error creating CCT token:', error);
            throw error;
        }
    }

    /**
     * Send CCT reward to a user's wallet.
     *
     * @param {string} receiverAddress - User's Algorand address
     * @param {number} amount          - Number of CCT tokens to send
     * @returns {{ success: boolean, txId: string }}
     */
    async sendReward(receiverAddress, amount) {
        if (!this.assetId || this.assetId === 0) {
            logger.warn('CCT asset ID not configured – skipping reward');
            return { success: false, txId: null };
        }

        try {
            const suggestedParams = await this.algodClient.getTransactionParams().do();

            const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                from: deployerAccount.addr,
                to: receiverAddress,
                amount: amount,
                assetIndex: this.assetId,
                suggestedParams,
            });

            const signedTxn = txn.signTxn(deployerAccount.sk);
            const result = await sendTransaction(signedTxn);

            logger.info(`✅ Sent ${amount} CCT to ${receiverAddress}: ${result.txId}`);
            return { success: true, txId: result.txId };
        } catch (error) {
            logger.error(`❌ CCT reward failed for ${receiverAddress}:`, error);
            // Non-critical — don't crash the caller
            return { success: false, txId: null, error: error.message };
        }
    }

    /**
     * Read a user's CCT balance from the chain.
     */
    async getBalance(userAddress) {
        if (!this.assetId || this.assetId === 0) {
            return 0;
        }

        try {
            const accountInfo = await this.algodClient.accountInformation(userAddress).do();
            const assets = accountInfo['assets'] || [];
            const cctAsset = assets.find(a => a['asset-id'] === this.assetId);
            return cctAsset ? cctAsset.amount : 0;
        } catch (error) {
            logger.error(`Error reading CCT balance for ${userAddress}:`, error);
            return 0;
        }
    }

    /**
     * Reward amounts by action type.
     */
    static get REWARDS() {
        return {
            ATTENDANCE: 1,
            VOTE: 2,
            CERTIFICATE: 5,
        };
    }
}

module.exports = new CCTService();
