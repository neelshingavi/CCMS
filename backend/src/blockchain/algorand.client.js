const algosdk = require('algosdk');
const logger = require('../config/logger');

class AlgorandClient {
    constructor() {
        const token = process.env.ALGOD_TOKEN || '';
        const server = process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
        const port = process.env.ALGOD_PORT || 443;

        this.algodClient = new algosdk.Algodv2(token, server, port);
        this.indexerClient = new algosdk.Indexer(token, 'https://testnet-idx.algonode.cloud', 443);

        // Deployer account (Admin wallet for deploying contracts)
        if (process.env.DEPLOYER_MNEMONIC) {
            try {
                this.deployerAccount = algosdk.mnemonicToSecretKey(process.env.DEPLOYER_MNEMONIC);
            } catch (err) {
                logger.warn('Deployer mnemonic is invalid or missing');
            }
        }
    }

    /**
     * Check health of Algorand Node
     */
    async checkHealth() {
        try {
            const status = await this.algodClient.status().do();
            return status;
        } catch (error) {
            logger.error('Algorand Node Health Check Failed', error);
            throw new Error('Blockchain unreachable');
        }
    }

    /**
     * Verify a transaction on-chain
     * @param {string} date - date
     * @param {string} txnId - The transaction ID to verify
     * @param {string} sender - Expected sender address
     */
    async verifyTransaction(txnId, sender) {
        try {
            // Look up transaction
            const response = await this.algodClient.pendingTransactionInformation(txnId).do();

            // Check if confirmed
            if (!response || !response['confirmed-round']) {
                return { valid: false, reason: 'Transaction not confirmed yet' };
            }

            // Check sender
            if (response['sender'] !== sender) {
                return { valid: false, reason: 'Sender mismatch' };
            }

            return { valid: true, details: response };
        } catch (error) {
            logger.error(`Error verifying txn ${txnId}:`, error);
            return { valid: false, reason: 'Transaction lookup failed' };
        }
    }

    /**
     * Compile TEAL code
     * @param {string} source - PyTeal/TEAL source code
     */
    async compileProgram(source) {
        const encoder = new TextEncoder();
        const programBytes = encoder.encode(source);
        const compileResponse = await this.algodClient.compile(programBytes).do();
        return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
    }

    /**
     * Deploy Voting Contract (Generalized)
     * This is a simplified wrapper. In prod, we'd pass strict parameters.
     */
    async deployVotingApp(creatorMnemonic, startTime, endTime) {
        try {
            // Placeholder for reading actual TEAL files. 
            // In a real run, you'd read fs.readFileSync('./blockchain/contracts/voting_approval.teal')
            // For now, we stub this to return a mock App ID or fail gracefully if no files.

            // Logic would go here:
            // 1. Compile approval & clear state programs
            // 2. Build makeApplicationCreateTxn
            // 3. Sign & Send
            // 4. Wait for confirmation

            logger.info('Simulating Voting Contract Deployment...');
            return { appId: 12345678, txnId: 'MOCK_TXN_ID' };
        } catch (error) {
            logger.error('Deploy Voting App Failed', error);
            throw error;
        }
    }
}

module.exports = new AlgorandClient();
