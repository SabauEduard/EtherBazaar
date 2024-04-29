const { ethers } = require("hardhat")

let owner, user1, user2, user3;

async function init() {
    await ethers.provider.send("hardhat_reset", [])
    await preMine(300)
    await ethers.provider.send("evm_setIntervalMining", [2000]);

    [owner, user1, user2, user3] = await ethers.getSigners();
}

async function mine(blocks) {
    blocks = "0x" + blocks.toString(16)
    await ethers.provider.send("hardhat_mine", [blocks]);
}

async function preMine(blocks) {
    await ethers.provider.send("evm_setAutomine", [false]);
    await ethers.provider.send("evm_setIntervalMining", [0]);

    blocks = "0x" + blocks.toString(16)
    await ethers.provider.send("hardhat_mine", [blocks]);
    await ethers.provider.send("evm_setAutomine", [true]);
}

module.exports = {
    owner: function () {return owner},
    user1: function () {return user1},
    user2: function () {return user2},
    user3: function () {return user3},
    init,
    preMine,
    mine,
}