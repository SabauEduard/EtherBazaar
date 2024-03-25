require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");

async function deploy() {
    [owner] = await ethers.getSigners();

    let tokenFactory = await ethers.getContractFactory("BazCoin");
    let token = await tokenFactory.connect(owner).deploy();
    await token.deployed();
    console.log("ERC20 address: ", token.address)
}

deploy()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
    