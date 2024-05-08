require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");

async function deploy() {
    [owner, user1, user2] = await ethers.getSigners();

    let deployedTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    let token = await ethers.getContractAt("BazCoin", deployedTokenAddress)

    let deployedBazaarAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    let bazaar = await ethers.getContractAt("EtherBazaar", deployedBazaarAddress);

    let deployedNFTAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    let nft = await ethers.getContractAt("TestNFT", deployedNFTAddress);

    // Giving the owner a nft;
    tx = await nft.connect(owner).mint(owner.address);
    receipt = await tx.wait();
    console.log("Owner minted a NFT");

    // Giving nfts to users
    tx = await nft.connect(owner).mint(user1.address);
    receipt = await tx.wait();
    tx= await nft.connect(owner).mint(user2.address);
    receipt = await tx.wait();
    console.log("Owner minted NFTs for users");

    // See owner's nfts
    let nfts = await nft.connect(owner).getOwnedNfts(owner.address);
    console.log("Owner's NFTs: ")
    console.log(nfts)

    // Owner approves the bazaar to spend the NFT
    tx = await nft.connect(owner).approve(bazaar.address, 1);
    receipt = await tx.wait();
    console.log("Owner approved the bazaar to spend the NFT");

    // Owner puts the NFT for sale
    tx = await bazaar.connect(owner).startAuction(nft.address, 1, 0, 120, 5);
    receipt = await tx.wait();
    console.log("Owner put the NFT for sale");
    console.log(receipt.logs[0].data);

    // See the NFTs for sale
    let auctions = await bazaar.seeValidAuctions();
    console.log("Auctions: ")
    console.log(auctions)


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
}

deploy()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
