/** @type import('hardhat/config').HardhatUserConfig */
require('@nomiclabs/hardhat-ethers');

require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
      gas: "auto",
      mining: {
        interval: 2000, //ms
      }
    },
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: [process.env.PRIVATE_KEY1, process.env.PRIVATE_KEY2]
    }
  },
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: '0.8.24',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000
          }
        }
      }
    ]
  }
};
