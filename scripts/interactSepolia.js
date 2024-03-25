require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");

async function deploy() {
    [owner] = await ethers.getSigners();

    let deployedTokenAddress = ""
    let token = await ethers.getContractAt("BazCoin", deployedTokenAddress)

    // Interact with token functions
}

deploy()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
