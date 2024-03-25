require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");

async function deploy() {
    [owner] = await ethers.getSigners();

    // Deploy BazCoin ERC20 token
    let bazCoinFactory = await ethers.getContractFactory("BazCoin");
    let bazCoin = await bazCoinFactory.connect(owner).deploy();
    await bazCoin.deployed();
    console.log("BazCoin ERC20 address: ", bazCoin.address);

    // Deploy EtherBazaar contract
    let etherBazaarFactory = await ethers.getContractFactory("EtherBazaar");
    let etherBazaar = await etherBazaarFactory.connect(owner).deploy(bazCoin.address);
    await etherBazaar.deployed();
    console.log("EtherBazaar contract address: ", etherBazaar.address);
}

deploy()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
    