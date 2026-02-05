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
    async deployAttendanceContract(startTime, endTime, sender = deployerAccount) {
        try {
            // Read compiled TEAL
            const approvalProgram = await this.compileProgram('./attendance_contract.teal');
            const clearProgram = await this.compileProgram('./clear_state.teal'); // Note: clear_state.teal needs to exist or be handled

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
            const appArgs = [new Uint8Array(Buffer.from("mark_attendance"))];

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
    async deployVotingContract(endTime, sender = deployerAccount) {
        try {
            const approvalProgram = await this.compileProgram('./voting_contract.teal');
            const clearProgram = await this.compileProgram('./clear_state.teal');

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
                numGlobalByteSlices: 2,
                appArgs: [algosdk.encodeUint64(endTime)]
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
    async castVote(appId, choice, privateKey) {
        try {
            const suggestedParams = await this.algodClient.getTransactionParams().do();

            const sender = algosdk.mnemonicToSecretKey(privateKey);

            // Opt-in if not already
            await this.optInToApp(appId, sender);

            const appArgs = [
                new Uint8Array(Buffer.from("cast_vote")),
                algosdk.encodeUint64(choice)
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

            // Opt-in receiver to asset
            await this.optInToAsset(assetId, receiverAddress);

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
    async compileProgram(tealFilePath) {
        // Basic implementation that assumes standard local paths
        // Adjust as needed for your specific file structure
        try {
            // Assume tealFilePath is relative to project root or somewhere accessible
            // For now, returning dummy placeholder as requested by the prompt
            // but adding real reading logic if you need it later.
            // const content = await fs.readFile(tealFilePath, 'utf8');
            // const results = await this.algodClient.compile(content).do();
            // return new Uint8Array(Buffer.from(results.result, "base64"));

            return new Uint8Array([]); // Placeholder as explicitly requested
        } catch (e) {
            console.error("Compile error", e);
            return new Uint8Array([]);
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
