import { Flex, Button, Input, Text } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import {
  bazcoinContract,
  bazarContract,
  nftContract,
} from "../utils/ethersConnect";
import UserContext from "../utils/UserContext";

export const Profile = () => {
  const userAddres = useContext(UserContext);
  const [depositSum, setDepositSum] = useState("");
  const [myTokens, setMyTokens] = useState([]);

  useEffect(() => {
    const getMyTokens = async () => {
      const res = await nftContract.getOwnedNfts(userAddres);
      console.log("MY TOKENS: ", res);
      setMyTokens(res);
    };

    getMyTokens();
  }, [userAddres]);

  const handleDepositBazcoin = async () => {
    try {
      let tx = await bazcoinContract.deposit({
        value: depositSum,
      });
      await tx.wait();
      console.log("All good deposit");
    } catch (error) {
      console.log("Error on deposit", error);
    }
  };

  const handleSaleNFT = async (tokenId) => {
    console.log(userAddres);
    console.log(bazarContract);

    // Owner approves the bazaar to spend the NFT
    let tx = await nftContract.approve(bazarContract.target, tokenId);
    await tx.wait();
    console.log("Owner approved the bazaar to spend the NFT");

    // Owner puts the NFT for sale
    tx = await bazarContract.startAuction(
      nftContract.target,
      tokenId,
      0,
      120,
      5
    );
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
      <Flex
        direction={"row"}
        width={"90vw"}
        gap={5}
        alignItems={"center"}
        justify={"center"}
        wrap={"wrap"}
      >
        {myTokens.length === 0 ? (
          <Text>You have no NFTs for now</Text>
        ) : (
          <>
            {myTokens.map((token, index) => {
              return (
                <Flex
                  direction={"column"}
                  alignItems={"center"}
                  justify={"center"}
                  gap={2}
                  padding={5}
                  border={"1px solid black"}
                  borderRadius={10}
                >
                  <Text>{index}</Text>
                  <Button
                    colorScheme="twitter"
                    onClick={() => {
                      handleSaleNFT(index + 1);
                    }}
                  >
                    Sell
                  </Button>
                </Flex>
              );
            })}
          </>
        )}
      </Flex>

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
