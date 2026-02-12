const algosdk = require('algosdk');
const {
    algodClient,
    deployerAccount,
    sendTransaction
} = require('../config/algorand');
const fs = require('fs').promises; // Add fs for file reading
const path = require('path');

class AlgorandService {
    constructor() {
        this.algodClient = algodClient;
    }

    // Deploy attendance contract
    async deployAttendanceContract(eventId, startTime, endTime, sender = deployerAccount) {
        try {
            // Read compiled TEAL
            const approvalProgram = await this.compileProgram('attendance_approval.teal');
            const clearProgram = await this.compileProgram('clear_state.teal');

            const suggestedParams = await this.algodClient.getTransactionParams().do();

            const txn = algosdk.makeApplicationCreateTxnFromObject({
                from: sender.addr,
                suggestedParams,
                onComplete: algosdk.OnApplicationComplete.NoOpOC,
                approvalProgram,
                clearProgram,
                numLocalInts: 1,
                numLocalByteSlices: 0,
                numGlobalInts: 4,
                numGlobalByteSlices: 3,
                appArgs: [
                    new Uint8Array(Buffer.from(eventId)), // event_id as bytes
                    algosdk.encodeUint64(startTime),
                    algosdk.encodeUint64(endTime)
                ]
            });

            const signedTxn = txn.signTxn(sender.sk);
            const result = await sendTransaction(signedTxn);

            const appId = result.result['application-index'];
            console.log(`✅ Attendance contract deployed: ${appId}`);

            return { appId, txId: result.txId };
        } catch (error) {
            console.error('❌ Error deploying attendance contract:', error);
            throw error;
        }
    }

    // Mark attendance
    async markAttendance(appId, walletAddress, privateKey) {
        try {
            const suggestedParams = await this.algodClient.getTransactionParams().do();

            const sender = algosdk.mnemonicToSecretKey(privateKey);

            // First, opt-in if not already
            await this.optInToApp(appId, sender);

            // Call mark attendance
            const appArgs = [new Uint8Array(Buffer.from("CHECK_IN"))];

            const txn = algosdk.makeApplicationNoOpTxnFromObject({
                from: sender.addr,
                suggestedParams,
                appIndex: appId,
                appArgs,
                accounts: [walletAddress]
            });

            const signedTxn = txn.signTxn(sender.sk);
            const result = await sendTransaction(signedTxn);

            return { success: true, txId: result.txId };
        } catch (error) {
            console.error('❌ Error marking attendance:', error);
            throw error;
        }
    }

    // Deploy voting contract
    async deployVotingContract(electionId, startTime, endTime, optionCount, sender = deployerAccount) {
        try {
            const approvalProgram = await this.compileProgram('voting_approval.teal');
            const clearProgram = await this.compileProgram('clear_state.teal');

            const suggestedParams = await this.algodClient.getTransactionParams().do();

            const txn = algosdk.makeApplicationCreateTxnFromObject({
                from: sender.addr,
                suggestedParams,
                onComplete: algosdk.OnApplicationComplete.NoOpOC,
                approvalProgram,
                clearProgram,
                numLocalInts: 1,
                numLocalByteSlices: 0,
                numGlobalInts: 6,
                numGlobalByteSlices: 4,
                appArgs: [
                    new Uint8Array(Buffer.from(electionId)),
                    algosdk.encodeUint64(startTime),
                    algosdk.encodeUint64(endTime),
                    algosdk.encodeUint64(optionCount)
                ]
            });

            const signedTxn = txn.signTxn(sender.sk);
            const result = await sendTransaction(signedTxn);

            const appId = result.result['application-index'];
            console.log(`✅ Voting contract deployed: ${appId}`);

            return { appId, txId: result.txId };
        } catch (error) {
            console.error('❌ Error deploying voting contract:', error);
            throw error;
        }
    }

    // Cast vote
    async castVote(appId, voteCommitment, privateKey) {
        try {
            const suggestedParams = await this.algodClient.getTransactionParams().do();

            const sender = algosdk.mnemonicToSecretKey(privateKey);

            // Opt-in if not already
            await this.optInToApp(appId, sender);

            const appArgs = [
                new Uint8Array(Buffer.from("VOTE")),
                new Uint8Array(Buffer.from(voteCommitment)) // Expects bytes/hash
            ];

            const txn = algosdk.makeApplicationNoOpTxnFromObject({
                from: sender.addr,
                suggestedParams,
                appIndex: appId,
                appArgs
            });

            const signedTxn = txn.signTxn(sender.sk);
            const result = await sendTransaction(signedTxn);

            return { success: true, txId: result.txId };
        } catch (error) {
            console.error('❌ Error casting vote:', error);
            throw error;
        }
    }

    // Create certificate ASA
    async createCertificateASA(eventName, totalSupply, sender = deployerAccount) {
        try {
            const suggestedParams = await this.algodClient.getTransactionParams().do();

            const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
                from: sender.addr,
                suggestedParams,
                total: totalSupply,
                decimals: 0,
                assetName: `CERT-${eventName}`,
                unitName: 'CERT',
                assetURL: `https://ccms.example.com/certificates/${eventName}`,
                defaultFrozen: false,
                manager: sender.addr,
                reserve: sender.addr,
                freeze: sender.addr,
                clawback: sender.addr
            });

            const signedTxn = txn.signTxn(sender.sk);
            const result = await sendTransaction(signedTxn);

            const assetId = result.result['asset-index'];
            console.log(`✅ Certificate ASA created: ${assetId}`);

            return { assetId, txId: result.txId };
        } catch (error) {
            console.error('❌ Error creating certificate ASA:', error);
            throw error;
        }
    }

    // Issue certificate to wallet
    async issueCertificate(assetId, receiverAddress, amount = 1, sender = deployerAccount) {
        try {
            const suggestedParams = await this.algodClient.getTransactionParams().do();

            // Note: Receiver must be opted-in to the asset beforehand
            // The frontend should handle the opt-in transaction signed by the user

            // Transfer asset
            const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                from: sender.addr,
                to: receiverAddress,
                amount: amount,
                assetIndex: assetId,
                suggestedParams
            });

            const signedTxn = txn.signTxn(sender.sk);
            const result = await sendTransaction(signedTxn);

            return { success: true, txId: result.txId };
        } catch (error) {
            console.error('❌ Error issuing certificate:', error);
            throw error;
        }
    }

    // Helper methods
    async compileProgram(tealFileName) {
        try {
            // tealFileName is expected to be like 'attendance_approval.teal'
            // We look in src/blockchain/contracts/
            const filePath = path.join(__dirname, '../blockchain/contracts', path.basename(tealFileName));

            // Check if file exists
            try {
                await fs.access(filePath);
            } catch (error) {
                console.error(`Teal file not found at ${filePath}`);
                throw error;
            }

            const content = await fs.readFile(filePath, 'utf8');
            const results = await this.algodClient.compile(content).do();
            return new Uint8Array(Buffer.from(results.result, "base64"));
        } catch (e) {
            console.error("Compile error", e);
            throw e;
        }
    }

    async optInToApp(appId, sender) {
        try {
            const suggestedParams = await this.algodClient.getTransactionParams().do();

            const txn = algosdk.makeApplicationOptInTxnFromObject({
                from: sender.addr,
                suggestedParams,
                appIndex: appId
            });

            const signedTxn = txn.signTxn(sender.sk);
            await sendTransaction(signedTxn);
        } catch (error) {
            // Might already be opted in
            console.log('Opt-in may have failed (already opted in):', error.message);
        }
    }

    async optInToAsset(assetId, receiverAddress) {
        try {
            const suggestedParams = await this.algodClient.getTransactionParams().do();

            const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
                from: receiverAddress,
                to: receiverAddress,
                amount: 0,
                assetIndex: assetId,
                suggestedParams
            });

            const signedTxn = txn.signTxn(
                algosdk.mnemonicToSecretKey(process.env.DEPLOYER_MNEMONIC).sk
            );
            await sendTransaction(signedTxn);
        } catch (error) {
            console.log('Asset opt-in may have failed:', error.message);
        }
    }

    // Anchor feedback content hash on-chain
    async anchorFeedback(contentHash, sender = deployerAccount) {
        try {
            const suggestedParams = await this.algodClient.getTransactionParams().do();

            // Create a 0-value transaction to self with the hash in the note
            const note = new Uint8Array(Buffer.from(`FEEDBACK_HASH:${contentHash}`));

            const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
                from: sender.addr,
                to: sender.addr,
                amount: 0,
                note: note,
                suggestedParams
            });

            const signedTxn = txn.signTxn(sender.sk);
            const result = await sendTransaction(signedTxn);

            console.log(`✅ Feedback anchored: ${result.txId}`);
            return { txId: result.txId };
        } catch (error) {
            console.error('❌ Error anchoring feedback:', error);
            // Don't throw, as this is non-critical for user experience but good for audit
            return { txId: null };
        }
    }

    // Get application state
    async getApplicationState(appId, address = null) {
        try {
            if (address) {
                const localState = await this.algodClient.accountApplicationInformation(address, appId).do();
                return localState;
            } else {
                const globalState = await this.algodClient.getApplicationByID(appId).do();
                return globalState.params['global-state'];
            }
        } catch (error) {
            console.error('Error getting application state:', error);
            return null;
        }
    }
}

module.exports = new AlgorandService();
