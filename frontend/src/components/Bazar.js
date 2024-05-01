import { Flex, Text, Button, Input } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  bazcoinContract,
  bazarContract,
  nftContract,
  provider,
} from "../utils/ethersConnect";

export const Bazar = () => {
  const nav = useNavigate();
  const [bidValue, setBidValue] = useState("");

  const handleBid = async () => {
    const [owner, user1, user2] = await provider.listAccounts();
    console.log(user1);
    let tx = await bazcoinContract
      .connect(user1)
      .approve(bazarContract.target, parseInt(bidValue));
    tx = await bazarContract.connect(user1).placeBid(0, parseInt(bidValue));

    console.log("Bid successfully");
  };

  return (
    <Flex
      flex={1}
      height={"100vh"}
      alignItems={"center"}
      justify={"space-evenly"}
      direction={"column"}
    >
      <Text fontSize={60} fontWeight={700}>
        Ether Bazaar
      </Text>

      <Text>Welcome to bazar</Text>

      <Flex gap={5} width={"100%"} justify={"center"}>
        <Button colorScheme="twitter" onClick={handleBid}>
          Bid
        </Button>
        <Input
          type="number"
          width={"100px"}
          value={bidValue}
          onChange={(e) => {
            setBidValue(e.target.value);
          }}
        />
      </Flex>

      <Button
        onClick={() => {
          nav("/profile");
        }}
      >
        Profile
      </Button>
    </Flex>
  );
};
