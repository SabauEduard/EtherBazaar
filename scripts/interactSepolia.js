require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");

async function deploy() {
    [owner, user1, user2] = await ethers.getSigners();

    let deployedTokenAddress = "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318"
    let token = await ethers.getContractAt("BazCoin", deployedTokenAddress)

    let deployedBazaarAddress = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
    let bazaar = await ethers.getContractAt("EtherBazaar", deployedBazaarAddress);

    let deployedNFTAddress = "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";
    let nft = await ethers.getContractAt("TestNFT", deployedNFTAddress);

    // Giving the owner a nft;
    tx = await nft.connect(owner).mint(owner.address);
    receipt = tx.wait();
    console.log("Owner minted a NFT");

    // Owner approves the bazaar to spend the NFT
    tx = await nft.connect(owner).approve(bazaar.address, 0);
    receipt = tx.wait();
    console.log("Owner approved the bazaar to spend the NFT");
    console.log(receipt.events[0]);

    // Owner puts the NFT for sale
    tx = await bazaar.connect(owner).startAuction(nft.address, 0, 5, 120, 5);
    receipt = tx.wait();
    console.log("Owner put the NFT for sale");
    console.log(receipt.events[0]);

    // User1 deposits 500 tokens
    overwrite = {
        value: 500
    }
    tx = await token.connect(user1).deposit(overwrite);
    receipt = tx.wait();
    console.log("User1 deposited 500 tokens");
    console.log(receipt.events[0]);

    // User1 bids 200 tokens
    tx = await token.connect(user1).approve(bazaar.address, 200);
    tx = await bazaar.connect(user1).bid(0, 200);
    receipt = tx.wait();
    console.log("User1 bid 200 tokens");
    console.log(receipt.events[0]);

    // User2 deposits 1000 tokens
    overwrite = {
        value: 1000
    }
    tx = await token.connect(user2).deposit(overwrite);
    receipt = tx.wait();
    console.log("User2 deposited 1000 tokens");
    console.log(receipt.events[0]);

    // User2 bids 300 tokens
    tx = await token.connect(user2).approve(bazaar.address, 300);
    tx = await bazaar.connect(user2).bid(0, 300);
    receipt = tx.wait();
    console.log("User2 bid 300 tokens");

    // User2 adds 100 tokens to the bid
    tx = await token.connect(user2).approve(bazaar.address, 100);
    tx = await bazaar.connect(user2).addToBid(0, 100);
    receipt = tx.wait();
    console.log("User2 added 100 tokens to the bid");
    console.log(receipt.events[0]);

    // User1 tries to bid 300 tokens
    tx = await token.connect(user1).approve(bazaar.address, 300);
    tx = await bazaar.connect(user1).bid(0, 300);
    receipt = tx.wait();
    console.log("User1 tried to bid 300 tokens");
    console.log(receipt.events[0]);

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
