import { useEffect, useState } from "react";
import BazCoinABI from "../../../contracts/BazCoinABI.json";
import EtherBazaarABI from "../../../contracts/EtherBazaarABI.json";
import TestNFTABI from "../../../contracts/TestNFTABI.json";
const ethers = require("ethers");

/*
FLOW:
  - deposit in bazcoin
  - allowance la contract cu amount-ul cat vreau sa licitez
  - licitez si contractul transfera bazcoinu in contul celuilalt
*/

export const useEthersUtils = () => {
  const [provider, setProvider] = useState(null);
  const [bazcoinContract, setBazcoinContract] = useState(null);
  const [etherBazzarContract, setEtherBazaarContract] = useState(null);
  const [nftContract, setNftContract] = useState(null);

  useEffect(() => {
    const ethProvider = new ethers.BrowserProvider(window.ethereum);
    setProvider(ethProvider);

    //need some help here
    const contractAddress = "YOUR_CONTRACT_ADDRESS";
    const contractInstance = new ethers.Contract(
      contractAddress,
      BazCoinABI,
      ethProvider.getSigner()
    );
    setBazcoinContract(contractInstance);

    const contractAddress2 = "YOUR_CONTRACT_ADDRESS";
    const contractInstance2 = new ethers.Contract(
      contractAddress2,
      EtherBazaarABI,
      ethProvider.getSigner()
    );
    setEtherBazaarContract(contractInstance2);

    const contractAddress3 = "YOUR_CONTRACT_ADDRESS";
    const contractInstance3 = new ethers.Contract(
      contractAddress3,
      TestNFTABI,
      ethProvider.getSigner()
    );
    setNftContract(contractInstance3);
  }, []);

  const connectWalletMetamask = (accountChangedHandler) => {
    if (window.ethereum) {
      provider
        .send("eth_requestAccounts", [])
        .then(async () => {
          provider.getSigner().then(async (account) => {
            accountChangedHandler(account);
          });
        })
        .catch(async () => {
          console.log("err");
        });
    } else {
      console.log("err");
    }
  };

  const getBalance = (address) => {
    return provider.getBalance(address);
  };

  const sendTransaction = async (sender, to, amount) => {
    console.log("sender: " + sender.provider);
    console.log("amount " + ethers.parseUnits(amount.toString(), "wei"));
    const transactionResponse = await sender.sendTransaction({
      to,
      value: ethers.parseUnits(amount.toString(), "wei"),
    });

    return transactionResponse.hash;
  };

  return {
    bazcoinContract,
    etherBazzarContract,
    nftContract,
    provider,
    sendTransaction,
    getBalance,
    connectWalletMetamask,
  };
};
