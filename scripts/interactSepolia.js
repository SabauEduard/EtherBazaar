require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");

async function deploy() {
    [owner, user1, user2] = await ethers.getSigners();

    let deployedTokenAddress = "0x9A676e781A523b5d0C0e43731313A708CB607508"
    let token = await ethers.getContractAt("BazCoin", deployedTokenAddress)

    let deployedBazaarAddress = "0x0B306BF915C4d645ff596e518fAf3F9669b97016";
    let bazaar = await ethers.getContractAt("EtherBazaar", deployedBazaarAddress);

    let deployedNFTAddress = "0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1";
    let nft = await ethers.getContractAt("TestNFT", deployedNFTAddress);

    // Giving the owner a nft;
    tx = await nft.connect(owner).mint(owner.address);
    receipt = await tx.wait();
    console.log("Owner minted a NFT");

    // Owner approves the bazaar to spend the NFT
    tx = await nft.connect(owner).approve(bazaar.address, 1);
    receipt = await tx.wait();
    console.log("Owner approved the bazaar to spend the NFT");

    // Owner puts the NFT for sale
    tx = await bazaar.connect(owner).startAuction(nft.address, 1, 0, 120, 5);
    receipt = await tx.wait();
    console.log("Owner put the NFT for sale");
    console.log(receipt.logs[0].data);

    // User1 deposits 500 tokens
    overwrite = {
        value: 500
    }
    tx = await token.connect(user1).deposit(overwrite);
    receipt = await tx.wait();
    console.log("User1 deposited 500 tokens");
    console.log(receipt.logs[0].data);

    // User1 bids 200 tokens
    tx = await token.connect(user1).approve(bazaar.address, 200);
    tx = await bazaar.connect(user1).placeBid(0, 200);
    receipt = await tx.wait();
    console.log("User1 bid 200 tokens");
    console.log(receipt.logs[0].data);

    // User2 deposits 1000 tokens
    overwrite = {
        value: 1000
    }
    tx = await token.connect(user2).deposit(overwrite);
    receipt = await tx.wait();
    console.log("User2 deposited 1000 tokens");
    console.log(receipt.logs[0].data);

    // User2 bids 300 tokens
    tx = await token.connect(user2).approve(bazaar.address, 300);
    tx = await bazaar.connect(user2).placeBid(0, 300);
    receipt = await tx.wait();
    console.log("User2 bid 300 tokens");
    console.log(receipt.logs[0].data);

    // User2 adds 100 tokens to the bid
    tx = await token.connect(user2).approve(bazaar.address, 100);
    tx = await bazaar.connect(user2).addToBid(0, 100);
    receipt = await tx.wait();
    console.log("User2 added 100 tokens to the bid");
    console.log(receipt.logs[0].data);

    // Owner looks at the auction
    tx = await bazaar.connect(owner).seeAuction(0);
    console.log("Owner looked at the auction");
}

deploy()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
