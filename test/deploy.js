const {ethers} = require("hardhat");
const common = require("./common.js");
const {max} = require("hardhat/internal/util/bigint");
const { expect } = require("chai");

describe("Test some flows in the app", function () {
    let owner, user1, user2, user3;
    let bazCoinContract, TestNftContract, EtherBazaarContract;

    before(async function () {
        await ethers.provider.send("hardhat_setLoggingEnabled", [false]);
        await common.init()

        owner = common.owner()
        user1 = common.user1()
        user2 = common.user2()
        user3 = common.user3()
    })

    beforeEach(async function () {
        let bazCoinFactory = await ethers.getContractFactory("BazCoin")
        let bazCoin = await bazCoinFactory.deploy()
        await bazCoin.deployed()
        bazCoinContract = bazCoin;

        let TestNftFactory = await ethers.getContractFactory("TestNFT")
        let TestNft = await TestNftFactory.deploy()
        await TestNft.deployed()
        TestNftContract = TestNft;

        let EtherBazaarFactory = await ethers.getContractFactory("EtherBazaar")
        let EtherBazaar = await EtherBazaarFactory.deploy(bazCoinContract.address)
        await EtherBazaar.deployed()
        EtherBazaarContract = EtherBazaar;
    })

    it("Should simulate a bidding process of 2 users for a nft", async function () {
        // Giving the owner a nft;
        tx = await TestNftContract.connect(owner).mint(owner.address);
        await tx.wait();
        
        // Checking if owner owns nft
        expect(await TestNftContract.ownerOf(1)).to.equal(owner.address);

        // Owner approves the bazaar to spend the NFT
        tx = await TestNftContract.connect(owner).approve(EtherBazaarContract.address, 1);
        await tx.wait();

        // Owner puts the NFT for sale
        tx = await EtherBazaarContract.connect(owner).startAuction(TestNftContract.address, 1, 0, 120, 5);
        await tx.wait();

        // Checking if contract owns nft
        expect(await TestNftContract.ownerOf(1)).to.equal(EtherBazaarContract.address);

        // Checking if auction is active
        let auction = await EtherBazaarContract.auctions(0);
        expect(auction.settled).to.equal(false);
        expect(auction.tokenContract).to.equal(TestNftContract.address);
        expect(auction.tokenId.toString()).to.equal('1');
        expect(auction.seller).to.equal(owner.address);
        expect(auction.minimumBid.toString()).to.equal('5');
        expect(auction.highestBid.toString()).to.equal('0');
        expect(auction.highestBidder).to.equal(ethers.constants.AddressZero);

        // User1 deposits 500 tokens
        overwrite = {
            value: ethers.utils.parseEther('500')
        }
        tx = await bazCoinContract.connect(user1).deposit(overwrite);
        await tx.wait();

        // Checking if user1 has 500 tokens
        let balance = await bazCoinContract.balanceOf(user1.address);
        expect(balance.toString()).to.equal(ethers.utils.parseEther('500').toString());

        // User1 bids 200 tokens
        tx = await bazCoinContract.connect(user1).approve(EtherBazaarContract.address, ethers.utils.parseEther('200'));
        await tx.wait();
        tx = await EtherBazaarContract.connect(user1).placeBid(0, ethers.utils.parseEther('200'));
        await tx.wait();

        // Checking if user1 has 300 tokens
        balance = await bazCoinContract.balanceOf(user1.address);
        expect(balance.toString()).to.equal(ethers.utils.parseEther('300').toString());

        // Checking if auction has a bid
        auction = await EtherBazaarContract.auctions(0);
        expect(auction.highestBid.toString()).to.equal(ethers.utils.parseEther('200').toString());
        expect(auction.highestBidder).to.equal(user1.address);

        // User2 deposits 1000 tokens
        overwrite = {
            value: ethers.utils.parseEther('1000')
        }
        tx = await bazCoinContract.connect(user2).deposit(overwrite);
        await tx.wait();

        // Checking if user2 has 1000 tokens
        balance = await bazCoinContract.balanceOf(user2.address);
        expect(balance.toString()).to.equal(ethers.utils.parseEther('1000').toString());

        // User2 bids 300 tokens
        tx = await bazCoinContract.connect(user2).approve(EtherBazaarContract.address, ethers.utils.parseEther('300'));
        await tx.wait();
        tx = await EtherBazaarContract.connect(user2).placeBid(0, ethers.utils.parseEther('300'));
        await tx.wait();

        // Checking if user2 has 700 tokens
        balance = await bazCoinContract.balanceOf(user2.address);
        expect(balance.toString()).to.equal(ethers.utils.parseEther('700').toString());

        // Checking if auction has a bid
        auction = await EtherBazaarContract.auctions(0);
        expect(auction.highestBid.toString()).to.equal(ethers.utils.parseEther('300').toString());
        expect(auction.highestBidder).to.equal(user2.address);

        // Checking if user1 got his tokens back
        balance = await bazCoinContract.balanceOf(user1.address);
        expect(balance.toString()).to.equal(ethers.utils.parseEther('500').toString());

        // User2 adds 100 tokens to the bid
        tx = await bazCoinContract.connect(user2).approve(EtherBazaarContract.address, ethers.utils.parseEther('100'));
        await tx.wait();
        tx = await EtherBazaarContract.connect(user2).addToBid(0, ethers.utils.parseEther('100'));
        await tx.wait();

        // Checking if user2 has 600 tokens
        balance = await bazCoinContract.balanceOf(user2.address);
        expect(balance.toString()).to.equal(ethers.utils.parseEther('600').toString());

        // Checking if auction has a bid
        auction = await EtherBazaarContract.auctions(0);
        expect(auction.highestBid.toString()).to.equal(ethers.utils.parseEther('400').toString());
        expect(auction.highestBidder).to.equal(user2.address);
    });

    it("Should test most of the requirements", async function () {
        // Giving the owner a nft;
        tx = await TestNftContract.connect(owner).mint(owner.address);
        await tx.wait();

        // Trying to start an auction with a unapproved token
        try {
            await EtherBazaarContract.connect(owner).startAuction(TestNftContract.address, 1, 0, 120, 5);
            throw new Error("Should have failed");
        } catch(e) {
            expect(e.message).to.include("Contract must be approved to manage the token.");
        }

        tx = await TestNftContract.connect(owner).approve(EtherBazaarContract.address, 1);
        await tx.wait();
        
        // Trying to start an auction with a end time before the start time
        try {
            await EtherBazaarContract.connect(owner).startAuction(TestNftContract.address, 1, 120, 10, 5);
            throw new Error("Should have failed");
        } catch(e) {
            expect(e.message).to.include("End time must be after start time.");
        }

        // Trying to start an auction not as the owner
        try {
            await EtherBazaarContract.connect(user1).startAuction(TestNftContract.address, 1, 0, 10, 5);
            throw new Error("Should have failed");
        } catch(e) {
            expect(e.message).to.include("You must be the owner of the token.");
        }

        // Trying to start an auction with a minimum bid of 0
        try {
            await EtherBazaarContract.connect(owner).startAuction(TestNftContract.address, 1, 0, 120, 0);
            throw new Error("Should have failed");
        } catch(e) {
            expect(e.message).to.include("Amount must be greater than 0.");
        }

        // Starting a valid auction
        tx = await EtherBazaarContract.connect(owner).startAuction(TestNftContract.address, 1, 0, 120, 50);
        await tx.wait();

        // Trying to place a bid on a non existent auction
        try {
            await EtherBazaarContract.connect(user1).placeBid(1, 5);
            throw new Error("Should have failed");
        } catch(e) {
            expect(e.message).to.include("Auction does not exist.");
        }

        // User 1 deposits 500 tokens
        overwrite = {
            value: ethers.utils.parseEther('500')
        }
        tx = await bazCoinContract.connect(user1).deposit(overwrite);
        await tx.wait();

        // Trying to bid less than the minimum bid
        try {
            tx = await bazCoinContract.connect(user1).approve(EtherBazaarContract.address, 4);
            await tx.wait();
            tx = await EtherBazaarContract.connect(user1).placeBid(0, 4);
            await tx.wait();
            throw new Error("Should have failed");
        } catch(e) {
            expect(e.message).to.include("Bid amount must be greater than the minimum bid.");
        }

        // User1 bids 200 tokens
        tx = await bazCoinContract.connect(user1).approve(EtherBazaarContract.address, ethers.utils.parseEther('200'));
        await tx.wait();
        tx = await EtherBazaarContract.connect(user1).placeBid(0, ethers.utils.parseEther('200'));
        await tx.wait();

        // User2 deposits 1000 tokens
        overwrite = {
            value: ethers.utils.parseEther('1000')
        }
        tx = await bazCoinContract.connect(user2).deposit(overwrite);
        await tx.wait();

        // Trying to bid less than the current highest bid
        try {
            tx = await bazCoinContract.connect(user2).approve(EtherBazaarContract.address, ethers.utils.parseEther('100'));
            await tx.wait();
            tx = await EtherBazaarContract.connect(user2).placeBid(0, ethers.utils.parseEther('100'));
            await tx.wait();
            throw new Error("Should have failed");
        } catch(e) {
            expect(e.message).to.include("Bid amount must be greater than the highest bid.");
        }
    });
});
