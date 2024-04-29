import { useEffect, useState } from "react";
import BazCoinABI from "../contractsABI/BazCoinABI.json";
import EtherBazaarABI from "../contractsABI/EtherBazaarABI.json";
import TestNFTABI from "../contractsABI/TestNFTABI.json";
const ethers = require("ethers");

export const useEthersUtils = () => {
  const [provider, setProvider] = useState(null);
  const [bazcoinContract, setBazcoinContract] = useState(null);
  const [etherBazzarContract, setEtherBazaarContract] = useState(null);
  const [nftContract, setNftContract] = useState(null);

  useEffect(() => {
    const ethProvider = new ethers.BrowserProvider(window.ethereum);
    setProvider(ethProvider);

    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const contractInstance = new ethers.Contract(
      contractAddress,
      BazCoinABI,
      ethProvider.getSigner()
    );
    setBazcoinContract(contractInstance);

    const contractAddress2 = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const contractInstance2 = new ethers.Contract(
      contractAddress2,
      EtherBazaarABI,
      ethProvider.getSigner()
    );
    setEtherBazaarContract(contractInstance2);

    const contractAddress3 = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
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
