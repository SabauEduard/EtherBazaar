import { Flex, Button, Input, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  bazcoinContract,
  bazarContract,
  nftContract,
} from "../utils/ethersConnect";
import { useUser } from "../utils/UserContext";
import { useNavigate } from "react-router-dom";

export const Profile = () => {
  const userAddres = useUser();
  const nav = useNavigate();
  const [depositSum, setDepositSum] = useState("");
  const [myTokens, setMyTokens] = useState([]);
  const [myBalance, setMyBalance] = useState(0);

  useEffect(() => {
    const getMyTokens = async () => {
      if (!userAddres) return;

      try {
        const res = await nftContract.getOwnedNfts(userAddres);
        const bazCoinTokens = await bazcoinContract.balanceOf(userAddres);
        let tokens = [];
        for (let i = 0; i < res.length; i++) {
          tokens.push(res[i].toString());
        }
        setMyTokens(tokens);
        setMyBalance(bazCoinTokens.toString());
      } catch (error) {
        alert("Could not get my tokens.");
        console.log(error);
      }
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
      alert("Could not deposit");
      console.log("Error on deposit", error);
    }
  };

  const handleSaleNFT = async (tokenId) => {
    console.log(userAddres);
    console.log(bazarContract);

    try {
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
    } catch (error) {
      alert("Could not put token to sell.");
      console.log(error);
    }
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
        Profile
      </Text>

      <Flex direction={"column"} alignItems={"center"} gap={5}>
        <Text>Tokens available to sell:</Text>
        <Flex
          direction={"row"}
          width={"90vw"}
          gap={10}
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
                    key={index}
                    direction={"column"}
                    alignItems={"center"}
                    justify={"center"}
                    gap={10}
                    padding={5}
                    border={"1px solid black"}
                    borderRadius={10}
                  >
                    <Text>Token ID: #{token}</Text>
                    <Button
                      colorScheme="twitter"
                      onClick={() => {
                        handleSaleNFT(token);
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
      </Flex>

      <Flex direction={"column"} alignItems={"center"} gap={5} width={"100%"}>
        <Button>Balance: {myBalance}</Button>
        <Flex gap={5} width={"100%"} justify={"center"}>
          <Input
            type="number"
            width={"100px"}
            value={depositSum}
            onChange={(e) => {
              setDepositSum(e.target.value);
            }}
          />
          <Button colorScheme="twitter" onClick={handleDepositBazcoin}>
            Deposit BazCoin
          </Button>
        </Flex>
      </Flex>

      <Button
        onClick={() => {
          nav("/bazar");
        }}
      >
        Bazar
      </Button>
    </Flex>
  );
};
