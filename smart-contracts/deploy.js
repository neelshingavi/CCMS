const algosdk = require('algosdk');
const fs = require('fs');
require('dotenv').config();

const algodClient = new algosdk.Algodv2(
  process.env.ALGOD_TOKEN,
  process.env.ALGOD_SERVER,
  process.env.ALGOD_PORT
);

const deployer = algosdk.mnemonicToSecretKey(process.env.DEPLOYER_MNEMONIC);

async function compileProgram(client, sourceCode) {
  const encoder = new TextEncoder();
  const programBytes = encoder.encode(sourceCode);
  const compileResponse = await client.compile(programBytes).do();
  return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
}

async function deployAttendanceContract(startTime, endTime) {
  try {
    const tealCode = fs.readFileSync('./attendance_contract.teal', 'utf8');
    const program = await compileProgram(algodClient, tealCode);
    
    // Create a dummy clear state program (simple return 1)
    // In production, you might want a specific clear program
    const clearProgramSource = "#pragma version 5\nint 1\nreturn";
    const clearProgram = await compileProgram(algodClient, clearProgramSource);
    
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeApplicationCreateTxnFromObject({
      from: deployer.addr,
      suggestedParams,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      approvalProgram: program,
      clearProgram: clearProgram,
      numLocalInts: 1,
      numLocalByteSlices: 0,
      numGlobalInts: 4,
      numGlobalByteSlices: 3,
      appArgs: [
        algosdk.encodeUint64(startTime),
        algosdk.encodeUint64(endTime)
      ]
    });
    
    const signedTxn = txn.signTxn(deployer.sk);
    const txId = txn.txID().toString();
    
    await algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(algodClient, txId, 4);
    
    const response = await algodClient.pendingTransactionInformation(txId).do();
    const appId = response['application-index'];
    
    console.log(`Attendance contract deployed with app ID: ${appId}`);
    return appId;
  } catch (error) {
    console.error('Error deploying attendance contract:', error);
  }
}

async function deployVotingContract(endTime) {
  try {
    const tealCode = fs.readFileSync('./voting_contract.teal', 'utf8');
    const program = await compileProgram(algodClient, tealCode);
    
    const clearProgramSource = "#pragma version 5\nint 1\nreturn";
    const clearProgram = await compileProgram(algodClient, clearProgramSource);
    
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeApplicationCreateTxnFromObject({
      from: deployer.addr,
      suggestedParams,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      approvalProgram: program,
      clearProgram: clearProgram,
      numLocalInts: 1,
      numLocalByteSlices: 0,
      numGlobalInts: 6,
      numGlobalByteSlices: 2,
      appArgs: [
        algosdk.encodeUint64(endTime)
      ]
    });
    
    const signedTxn = txn.signTxn(deployer.sk);
    const txId = txn.txID().toString();
    
    await algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(algodClient, txId, 4);
    
    const response = await algodClient.pendingTransactionInformation(txId).do();
    const appId = response['application-index'];
    
    console.log(`Voting contract deployed with app ID: ${appId}`);
    return appId;
  } catch (error) {
    console.error('Error deploying voting contract:', error);
  }
}

async function createCertificateASA(eventName, totalSupply) {
  try {
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: deployer.addr,
      suggestedParams,
      total: totalSupply,
      decimals: 0,
      assetName: `CERT-${eventName}`,
      unitName: 'CERT',
      assetURL: 'https://ccms.example.com/certificate',
      defaultFrozen: false,
      manager: deployer.addr,
      reserve: deployer.addr,
      freeze: deployer.addr,
      clawback: deployer.addr
    });
    
    const signedTxn = txn.signTxn(deployer.sk);
    const txId = txn.txID().toString();
    
    await algodClient.sendRawTransaction(signedTxn).do();
    await algosdk.waitForConfirmation(algodClient, txId, 4);
    
    const response = await algodClient.pendingTransactionInformation(txId).do();
    const assetId = response['asset-index'];
    
    console.log(`Certificate ASA created with asset ID: ${assetId}`);
    return assetId;
  } catch (error) {
    console.error('Error creating certificate ASA:', error);
  }
}

module.exports = {
  deployAttendanceContract,
  deployVotingContract,
  createCertificateASA
};
