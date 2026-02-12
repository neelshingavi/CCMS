const algosdk = require('algosdk');
require('dotenv').config();

// Algorand configuration
const config = {
    algodToken: process.env.ALGOD_TOKEN || '',
    algodServer: process.env.ALGOD_SERVER || 'https://testnet-api.algonode.cloud',
    algodPort: process.env.ALGOD_PORT || 443,
    indexerServer: process.env.INDEXER_SERVER || 'https://testnet-idx.algonode.cloud',
    indexerPort: process.env.INDEXER_PORT || 443,
    deployerMnemonic: process.env.DEPLOYER_MNEMONIC || ''
};

// Initialize clients
const algodClient = new algosdk.Algodv2(
    config.algodToken,
    config.algodServer,
    config.algodPort
);

const indexerClient = new algosdk.Indexer(
    config.algodToken,
    config.indexerServer,
    config.indexerPort
);

// Initialize deployer account
let deployerAccount = null;
if (config.deployerMnemonic) {
    try {
        deployerAccount = algosdk.mnemonicToSecretKey(config.deployerMnemonic);
    } catch (error) {
        console.warn('⚠️  Could not initialize deployer account:', error.message);
    }
}

// Utility functions
async function waitForConfirmation(txId) {
    let status = await algodClient.status().do();
    let lastRound = status['last-round'];
    while (true) {
        const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
        if (pendingInfo['confirmed-round'] !== null && pendingInfo['confirmed-round'] > 0) {
            return pendingInfo;
        }
        lastRound++;
        await algodClient.statusAfterBlock(lastRound).do();
    }
}

async function getAccountInfo(address) {
    try {
        const accountInfo = await algodClient.accountInformation(address).do();
        return accountInfo;
    } catch (error) {
        console.error('Error getting account info:', error);
        return null;
    }
}

async function sendTransaction(signedTxn) {
    try {
        const txId = signedTxn.txID().toString();
        await algodClient.sendRawTransaction(signedTxn).do();
        const result = await waitForConfirmation(txId);
        return { txId, result };
    } catch (error) {
        console.error('Error sending transaction:', error);
        throw error;
    }
}

module.exports = {
    algodClient,
    indexerClient,
    deployerAccount,
    waitForConfirmation,
    getAccountInfo,
    sendTransaction,
    config
};
