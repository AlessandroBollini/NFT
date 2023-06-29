const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const fs = require('fs');
const parseUrl = require('body-parser');
const encodeUrl = parseUrl.urlencoded({ extended: true });
require("dotenv").config();
const SELECT = require("./SELECT/getData");
const { log } = require("./logger/logger");
const { validateDate } = require("./utils/dateValidator");
const { sleep } = require("./utils/sleep");
const { mintNFT } = require("./scripts/mint");
const { levelUpNFT } = require("./scripts/levelUp");
const port = 3000 || process.env.PORT;
const contract = process.env.CONTRACT;
let nonce = parseInt(process.env.NONCE);
const { v4: uuidv4 } = require('uuid');

/**
 * Configuration for right frontend display of ejs pages
 */
app.set('view engine', 'ejs');
const myCss = {
    style: fs.readFileSync('./views/css/style.css', 'utf-8')
};

/**
 * Method to get the landing page with form
 */
app.get('/', (req, res) => {
    if (process.env.ENVISIONING_DISABLED == 0) {
        if (!req.cookies.RememberMe) {
            res.render("index", { myCss: myCss });
        } else {
            res.render("bye", { myCss: myCss, id: req.cookies.RememberMe, contract: contract });
        }
    } else {
        res.render("notNow", { myCss: myCss })
    }
});

/**
 * Method to POST user data on the blockchain and trigger NFTs' events
 */
app.post('/', encodeUrl, async (req, res) => {
    const processId = uuidv4();
    const isOwner = await SELECT.isOwner(req.body.userAddress, processId);
    let id;
    if (!isOwner) {
        try {
            await sleep(Math.floor(Math.random() * 5));
            nonce = nonce + 1;
            await mintNFT(req.body.userAddress, nonce, processId);
            id = (await SELECT.getNftMetaData(req.body.userAddress, processId)).tokenId;
        } catch (err) {
            log(err, "index.js", "error at minting at index.js at line 50 for: " + req.body.userAddress, "ERROR", processId);
            res.render("error", { myCss: myCss });
        }
    } else {
        try {
            let metadata = await SELECT.getNftMetaData(req.body.userAddress, processId);
            id = metadata.tokenId;
            console.log(metadata.lastUpdate);
            console.log(validateDate(metadata.lastUpdate));
            if (validateDate(metadata.lastUpdate)) {
                await sleep(Math.floor(Math.random() * 5));
                nonce = nonce + 1;
                await levelUpNFT(req.body.userAddress, metadata.tokenId, nonce, metadata.description, processId);
            }
        } catch (err) {
            log(err, "index.js", "error while levelling up for user starting at line 60: " + req.body.userAddress, "ERROR", processId);
            res.render("error", { myCss: myCss });
        }
    }
    //Cookies expire 1 week after their release
    res.cookie("RememberMe", id, { expires: new Date(Date.now() + 604800000) });
    res.render("bye", { myCss: myCss, id: id, contract: contract });
});

/**
 * Configuration needed to setup express server
 */
app.listen(port,async () => {
    console.log("App is listening on port: " + port);
})