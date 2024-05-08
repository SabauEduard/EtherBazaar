import { Flex, Button, Input } from "@chakra-ui/react";
import { useState } from "react";
import {
  bazcoinContract,
  bazarContract,
  nftContract,
  provider,
  signer,
} from "../utils/ethersConnect";

export const Profile = () => {
  const [depositSum, setDepositSum] = useState("");

  const handleDepositBazcoin = async () => {
    const [owner, user1, user2] = await provider.listAccounts();
    if (bazcoinContract) {
      try {
        console.log(user1);
        await bazcoinContract.connect(user1).deposit({
          value: depositSum,
        });
        console.log("All good deposit");
      } catch (error) {
        console.log("Error on deposit", error);
      }
    } else {
      console.log("There is no contract here.");
    }
  };

  const handleSaleNFT = async () => {
    console.log(signer);
    console.log(bazarContract);
    //Giving the owner a NFT
    let tx = await nftContract.mint(signer.address);
    await tx.wait();

    console.log("Owner minted a NFT");

    // Owner approves the bazaar to spend the NFT
    tx = await nftContract.approve(bazarContract.target, 1);
    await tx.wait();
    console.log("Owner approved the bazaar to spend the NFT");

    // Owner puts the NFT for sale
    tx = await bazarContract.startAuction(nftContract.target, 1, 0, 120, 5);
    await tx.wait();

    console.log("Owner put the NFT for sale");
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
        Sell NFT
      </Button>

      <Flex gap={5} width={"100%"} justify={"center"}>
        <Button colorScheme="twitter" onClick={handleDepositBazcoin}>
          Deposit BazCoin
        </Button>
        <Input
          type="number"
          width={"100px"}
          value={depositSum}
          onChange={(e) => {
            setDepositSum(e.target.value);
          }}
        />
      </Flex>
    </Flex>
  );
};
