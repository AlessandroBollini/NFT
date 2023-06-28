require("dotenv").config();
const { Network, Alchemy } = require("alchemy-sdk");
const { log } = require("../logger/logger");
/**
 * Settings and setup for Alchemy provider
 */
/**const settings={
    apiKey: process.env.ALCHEMY_PROVIDER_KEY,
    network: Network.MATIC_MAINNET
}*/
const settings = {
    apiKey: process.env.ALCHEMY_PROVIDER_KEY,
    network: Network.MATIC_MUMBAI
};
const alchemy = new Alchemy(settings);

/**
 * Method to check if a user already have one of our NFTs
 * @param {*} userAddress the wallet of the user
 * @param {*} processId a unique Id for every user's process
 * @returns true/false
 */
exports.isOwner = async (userAddress, processId) => {
    let isOwner = false;
    await alchemy.nft.getOwnersForContract(process.env.CONTRACT)
        .then(data => {
            isOwner = data.owners.includes(userAddress.toLowerCase());
        })
        .catch(err => {
            log(err, "SELECT/getData.js", "error at isOwner starting at line 23", "ERROR", processId);
        });
    log("User: " + userAddress + " have NFT: " + isOwner, "SELECT/getData.js", "no error", "INFO", processId);
    return isOwner;
}

/**
 * Method to get id and level of user's NFT
 * @param {*} userAddress the wallet of the user
 * @param {*} processId a unique Id for every user's process
 * @returns a JSON containing tokenId and token's level
 */
exports.getNftMetaData = async (userAddress, processId) => {
    let metaData = {
        tokenId: -1,
        description: {},
        lastUpdate: ""
    };
    await alchemy.nft.getNftsForOwner(userAddress, { contractAddresses: [process.env.CONTRACT], tokenUriTimeoutInMs: 20000 })
        .then(res => {
            metaData.tokenId = res.ownedNfts[0].tokenId;
            metaData.description = getLevelFromDescription(res.ownedNfts[0].description);
            metaData.lastUpdate = res.ownedNfts[0].timeLastUpdated;
        })
        .catch(err => {
            log(err, "SELECT/getData.js", "error at getNftMetaData starting at line 42", "ERROR", processId);
        });
    log("Metadata retrieved for: " + userAddress, "SELECT/getData.js", "no error", "INFO", processId);
    return metaData;
}

/**
 * Method to parse NFT's level informations from its description.
 * @param {*} description raw description in format: TEXT-BINLEVEL-STARTER
 * @returns NFT's level informations
 */
function getLevelFromDescription(description) {
    switch(description){
        case "NFT che attesta la partecipazione in presenza agli eventi di formazione interna, dedicati all’innovazione. Sei un Newbie degli Envisioning Day! ​Puoi solo migliorare." :
            return 1;
        case "NFT che attesta la partecipazione in presenza agli eventi di formazione interna, dedicati all’innovazione. La tua passione per l'innovazione è pervasiva!" :
            return 2;
        case "NFT che attesta la partecipazione in presenza agli eventi di formazione interna, dedicati all’innovazione. Sei un vero fanatico dell'innovazione!" :
            return 3;
        case "NFT che attesta la partecipazione in presenza agli eventi di formazione interna, dedicati all’innovazione. Che l'innovazione sia con te!" :
            return 4;
        case "NFT che attesta la partecipazione in presenza agli eventi di formazione interna, dedicati all’innovazione. Steve Jobs chi?" :
            return 5;
           
    }
}

exports.refreshAllMetadata=async()=>{
    const contract=process.env.CONTRACT;
    const collection=await alchemy.nft.getOwnersForContract(contract);
    for(let i=0; i<collection.owners.length; i++){
        await alchemy.nft.refreshNftMetadata(contract,i);
    }
    log("All metadata refreshed","SELECT/getData.js","refreshAllMetadata","no error");
}