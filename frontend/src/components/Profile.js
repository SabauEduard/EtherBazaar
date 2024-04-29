import { Flex, Button, Input } from "@chakra-ui/react";
import { useState } from "react";
import {
  bazcoinContract,
  bazarContract,
  nftContract,
} from "../utils/ethersConnect";

export const Profile = () => {
  const [depositSum, setDepositSum] = useState("");
  const [owner, user1, user2] = ethers.getSigners();

  const handleDepositBazcoin = async () => {
    if (bazcoinContract) {
      try {
        await bazcoinContract.connect(user1).deposit({
          value: depositSum,
        });
        console.log("All good deposit");
      } catch (error) {
        console.log("Error on deposit");
      }
    } else {
      console.log("There is no contract here.");
    }
  };

  const handleSaleNFT = async () => {
    //Giving the owner a NFT
    let tx = await nftContract.connect(owner).mint(owner.address);

    console.log("Owner minted a NFT");

    // Owner approves the bazaar to spend the NFT
    tx = await nftContract.connect(owner).approve(bazarContract.address, 1);

    console.log("Owner approved the bazaar to spend the NFT");

    // Owner puts the NFT for sale
    tx = await bazarContract
      .connect(owner)
      .startAuction(nftContract.address, 1, 0, 120, 5);

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

      <Flex gap={5}>
        <Button colorScheme="twitter" onClick={handleDepositBazcoin}>
          Deposit BazCoin
        </Button>
        <Input
          value={depositSum}
          onChange={(e) => {
            setDepositSum(e.target.value);
          }}
        />
      </Flex>
    </Flex>
  );
};
