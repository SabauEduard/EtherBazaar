import { Button, Flex, Input, Select, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useWallet } from "../utils/Context";
import { useEthersUtils } from "../utils/EthersUtils";

export const Wallet = () => {
  const { wallet, initializeWalletm } = useWallet();
  const { sendTransaction, getBalance } = useEthersUtils();

  const [transactionResponse, setTransactionResponse] = useState("");
  const [ethereumAddress, setEthereumAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [showSendFields, setShowSendFields] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amountToSend, setAmountToSend] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState("ether");

  const clearForm = (bShow) => {
    setShowSendFields(bShow);
    setShowPopup(false);
    setRecipientAddress("");
    setAmountToSend(0);
  };

  const handleSendButtonClick = () => {
    clearForm(true);
  };

  const handleCancelButtonClick = () => {
    clearForm(false);
  };

  const handleConfirmButtonClick = () => {
    const amountInWei = convertAmountToWei(amountToSend, selectedUnit);
    console.log("wei to send: " + amountInWei);
    sendTransaction(wallet, recipientAddress, amountInWei)
      .then((transactionHash) => {
        setTransactionResponse("Transation hash: " + transactionHash);
        console.log(transactionResponse);
        setShowPopup(true);
      })
      .catch((reason) => {
        setTransactionResponse("Transaction failed: " + reason);
        console.log(reason);
        setShowPopup(true);
      });
    clearForm(false);
  };

  const fetchAddress = async () => {
    if (wallet) {
      setEthereumAddress(wallet?.address);
    }
  };

  const fetchBalance = async () => {
    if (wallet) {
      getBalance(wallet?.address).then((result) => {
        setBalance(result.toString());
      });
    }
  };

  useEffect(() => {
    fetchBalance();
    const intervalId = setInterval(() => {
      fetchBalance();
    }, 3000);

    return () => clearInterval(intervalId);
  }, [wallet]);

  useEffect(() => {
    fetchAddress();
  }, [wallet]);

  const convertAmountToWei = (amount, unit) => {
    const units = {
      ether: 1e18,
      gwei: 1e9,
      finney: 1e15,
      wei: 1,
    };

    return amount * units[unit];
  };

  if (wallet === undefined || wallet == null) {
    return <></>;
  }

  return (
    <Flex
      gap={10}
      alignItems={"center"}
      justify={"center"}
      direction={"column"}
    >
      <Text>Balance: {balance}</Text>
      <Input placeholder="Address to send to" />
      <Input placeholder="Amount" />
      <Flex alignItems={"center"} gap={5}>
        <Text>Unit</Text>
        <Select>
          <option value="wei">Wei</option>
          <option value="gwei">Gwei</option>
          <option value="finney">Finney</option>
          <option value="ether">Ether</option>
        </Select>
      </Flex>
      <Flex gap={10}>
        <Button onClick={handleCancelButtonClick}>Cancel</Button>
        <Button onClick={handleConfirmButtonClick}>Confirm</Button>
      </Flex>
    </Flex>
  );
};
