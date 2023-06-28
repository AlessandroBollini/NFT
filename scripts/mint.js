const { ethers } = require("ethers");
const fs = require('fs');
require("dotenv").config();
const { log } = require("../logger/logger");

const privateKey = process.env.PRIVATE_KEY;
//const providerEndpoint="https://polygon-mainnet.g.alchemy.com/v2/"+process.env.ALCHEMY_PROVIDER_KEY;
const providerEndpoint = "https://polygon-mumbai.g.alchemy.com/v2/" + process.env.ALCHEMY_PROVIDER_KEY;
const provider = new ethers.providers.JsonRpcProvider(providerEndpoint);

/**
 * Declaration of the contract
 */
const contractAddress = process.env.CONTRACT;
const contractAbi = fs.readFileSync("abi.json").toString();
const contractInstance = new ethers.Contract(contractAddress, contractAbi, provider);

/**
 * Declaration for who pays.
 */
const wallet = new ethers.Wallet(privateKey, provider);

/**
 * Method to mint a brand new NFT.
 * @param {*} userAddress user's wallet
 * @param {*} processId a unique Id for every user's process
 */
exports.mintNFT = async (userAddress, nonce, processId) => {
    try {
        let rawTxn = await contractInstance.populateTransaction.safeMint(userAddress, 1);
        rawTxn.nonce = nonce;
        rawTxn.gasPrice=(await provider.getGasPrice()).toNumber();
        let signedTxn = await wallet.sendTransaction(rawTxn);
        let reciept = signedTxn.wait();
        log("Nonce is: " + signedTxn.nonce, "scripts/mint.js", "no error", "INFO", processId);
        if (reciept) {
            log("Transaction is successful!!!" + '\n' + "Transaction Hash:", (await signedTxn).hash + '\n' + "Block Number: " + (await reciept).blockNumber + '\n' + "Navigate to https://polygonscan.com/tx/" + (await signedTxn).hash, "to see transaction for user: " + userAddress, "scripts/mint.js", "no error", "INFO", processId);
        } else {
            log("Error submitting transaction", "scripts/mint.js", "error submitting transaction for: " + userAddress, "ERROR", processId);
        }
    } catch (error) {
        log(error, "scripts/mint.js", "error at mintNFT starting at line 28", "ERROR", processId);
    }
}