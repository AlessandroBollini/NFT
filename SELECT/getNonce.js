const ethers = require("ethers");
require("dotenv").config();

const publicAddress = process.env.WALLET;
//const providerEndpoint="https://polygon-mainnet.g.alchemy.com/v2/"+process.env.ALCHEMY_PROVIDER_KEY;
const providerEndpoint = "https://polygon-mumbai.g.alchemy.com/v2/" + process.env.ALCHEMY_PROVIDER_KEY;
const provider = new ethers.providers.JsonRpcProvider(providerEndpoint);

/**
 * Run this method to set the nonce when the process starts, set NONCE in the .env file as the value that gets displayed in the console
 */
async function getNonce() {
    const nonce = await provider.getTransactionCount(publicAddress);
    console.log(nonce - 1);
    return (nonce - 1);
}

getNonce();