import { Flex, Button } from "@chakra-ui/react";
import { useEthersUtils } from "../utils/EthersUtils";
import { useState } from "react";

export const Profile = () => {
  const { bazcoinContract, etherBazzarContract, nftContract, provider } =
    useEthersUtils();
  const [receipt, setReceipt] = useState(null);

  const handleDepositBazcoin = async () => {
    if (bazcoinContract) {
      try {
        await bazcoinContract.deposit();
      } catch (error) {
        console.log("Error on deposit bazCoin");
      }
    } else {
      console.log("There is no contract here.");
    }
  };

  const handleSaleNFT = async () => {
    const [owner] = await provider.listAccounts();

    //Giving the owner a NFT
    let tx = await nftContract.connect(owner).mint(owner);
    let receiptt = await tx.wait();
    setReceipt(receiptt);
    console.log("Owner minted a NFT");

    // Owner approves the bazaar to spend the NFT
    tx = await nftContract
      .connect(owner)
      .approve(etherBazzarContract.address, 1);
    receiptt = await tx.wait();
    setReceipt(receiptt);
    console.log("Owner approved the bazaar to spend the NFT");

    // Owner puts the NFT for sale
    tx = await etherBazzarContract
      .connect(owner)
      .startAuction(nftContract.address, 1, 0, 120, 5);
    receiptt = await tx.wait();
    setReceipt(receiptt);
    console.log("Owner put the NFT for sale");
    console.log(receiptt.logs[0].data);
  };

  return (
    <Flex
      flex={1}
      height={"100vh"}
      alignItems={"center"}
      justify={"space-evenly"}
      direction={"column"}
    >
      <Button colorScheme="twitter" onClick={handleSaleNFT}>
        Sale NFT 🤑
      </Button>

      <Button colorScheme="twitter" onClick={handleDepositBazcoin}>
        Deposit BazCoin
      </Button>
    </Flex>
  );
};
