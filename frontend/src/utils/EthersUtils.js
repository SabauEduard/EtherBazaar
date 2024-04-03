import { useEffect, useState } from "react";

const ethers = require("ethers");

export const useEthersUtils = () => {
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    const ethProvider = new ethers.BrowserProvider(window.ethereum);
    setProvider(ethProvider);
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
    provider,
    sendTransaction,
    getBalance,
    connectWalletMetamask,
  };
};
