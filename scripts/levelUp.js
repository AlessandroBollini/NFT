const { ethers } = require("ethers");
const fs = require('fs');
require("dotenv").config();
const { log } = require("../logger/logger");

/**
 * Declaration for who pays.
 */
const privateKey = process.env.PRIVATE_KEY;
//const providerEndpoint="https://polygon-mainnet.g.alchemy.com/v2/"+process.env.ALCHEMY_PROVIDER_KEY;
const providerEndpoint = "https://polygon-mumbai.g.alchemy.com/v2/" + process.env.ALCHEMY_PROVIDER_KEY;
const provider = new ethers.providers.JsonRpcProvider(providerEndpoint);
const wallet = new ethers.Wallet(privateKey, provider);

/**
 * Declaration of the contract
 */
const contractAddress = process.env.CONTRACT;
const contractAbi = fs.readFileSync("abi.json").toString();
const contractInstance = new ethers.Contract(contractAddress, contractAbi, provider);

const maxLevel = 5;

/**
 * Method to level up an existing NFT
 * @param {*} userAddress user's wallet
 * @param {*} id user's NFT id
 * @param {*} processId a unique Id for every user's process
 */
exports.levelUpNFT = async (userAddress, id, nonce, level, processId) => {
    try {
        if (level >= maxLevel) {
            return;
        } else {
            let rawTxn = await contractInstance.populateTransaction.levelUp(id, increaseLevel(level));
            rawTxn.nonce = nonce;
            rawTxn.gasPrice=(await provider.getGasPrice()).toNumber();
            let signedTxn = await wallet.sendTransaction(rawTxn);
            let receipt = signedTxn.wait();
            log("Nonce is: " + signedTxn.nonce, "scripts/levelUp.js", "no error", "INFO", processId);
            if (receipt) {
                log("Transaction is successful!!!" + '\n' + "Transaction Hash:" + (await signedTxn).hash + '\n' + "Block Number: " + (await receipt).blockNumber + '\n' + "Navigate to https://polygonscan.com/tx/" + (await signedTxn).hash + "to see transaction for user: " + userAddress, "scripts/levelUp.js", "no error", "INFO", processId);
            } else {
                log("Error submitting transaction", "scripts/levelUp.js", "error submitting transaction for: " + userAddress, "ERROR", processId);
            }
        }
    } catch (error) {
        log(error, "scripts/levelUp.js", "error at levelUpNFT starting at line 30", "ERROR", processId);
    }
}

/**
 * Method to increase to a new level
 * @param {*} level old level in binary format
 * @returns new level in int format
 */
function increaseLevel(level) {
    return parseInt(level) + 1;
}