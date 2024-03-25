require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");

async function deploy() {
    [owner] = await ethers.getSigners();

    let deployedTokenAddress = "0x0fEC89B0D41a76103D09DF28bf7a49fCB69B58aD"
    let token = await ethers.getContractAt("BazCoin", deployedTokenAddress)

    // Interact with token functions
}

deploy()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
