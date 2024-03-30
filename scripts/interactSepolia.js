require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");

async function deploy() {
    [owner, user1, user2] = await ethers.getSigners();

    let deployedTokenAddress = "0x5eb3Bc0a489C5A8288765d2336659EbCA68FCd00"
    let token = await ethers.getContractAt("BazCoin", deployedTokenAddress)

    let deployedBazaarAddress = "0x36C02dA8a0983159322a80FFE9F24b1acfF8B570";
    let bazaar = await ethers.getContractAt("EtherBazaar", deployedBazaarAddress);

    let deployedNFTAddress = "0x809d550fca64d94Bd9F66E60752A544199cfAC3D";
    let nft = await ethers.getContractAt("TestNFT", deployedNFTAddress);

    // Giving the owner a nft;
    tx = await nft.connect(owner).mint(owner.address);
    receipt = tx.wait();
    console.log("Owner minted a NFT");

    // Owner approves the bazaar to spend the NFT
    tx = await nft.connect(owner).approve(bazaar.address, 1);
    receipt = tx.wait();
    console.log("Owner approved the bazaar to spend the NFT");

    // Owner puts the NFT for sale
    tx = await bazaar.connect(owner).startAuction(nft.address, 1, 0, 120, 5);
    receipt = tx.wait();
    console.log("Owner put the NFT for sale");

    // User1 deposits 500 tokens
    overwrite = {
        value: 500
    }
    tx = await token.connect(user1).deposit(overwrite);
    receipt = tx.wait();
    console.log("User1 deposited 500 tokens");

    // User1 bids 200 tokens
    tx = await token.connect(user1).approve(bazaar.address, 200);
    tx = await bazaar.connect(user1).placeBid(0, 200);
    receipt = tx.wait();
    console.log("User1 bid 200 tokens");

    // User2 deposits 1000 tokens
    overwrite = {
        value: 1000
    }
    tx = await token.connect(user2).deposit(overwrite);
    receipt = tx.wait();
    console.log("User2 deposited 1000 tokens");

    // User2 bids 300 tokens
    tx = await token.connect(user2).approve(bazaar.address, 300);
    tx = await bazaar.connect(user2).placeBid(0, 300);
    receipt = tx.wait();
    console.log("User2 bid 300 tokens");

    // User2 adds 100 tokens to the bid
    tx = await token.connect(user2).approve(bazaar.address, 100);
    tx = await bazaar.connect(user2).addToBid(0, 100);
    receipt = tx.wait();
    console.log("User2 added 100 tokens to the bid");

    // Owner looks at the auction
    tx = await bazaar.connect(owner).seeAuction(0);
    receipt = tx.wait();
    console.log("Owner looked at the auction");
}

deploy()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
