import {
  Flex,
  Text,
  Button,
  Input,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  InputGroup,
  InputRightAddon,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  bazcoinContract,
  bazarContract,
  nftContract,
} from "../utils/ethersConnect";
import { useUser } from "../utils/UserContext";
import { useNavigate } from "react-router-dom";
import myBackgroundImage from "./fundal.jpg";

export const Profile = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const userAddres = useUser();
  const nav = useNavigate();
  const [depositSum, setDepositSum] = useState("");
  const [myTokens, setMyTokens] = useState([]);
  const [myBalance, setMyBalance] = useState(0);
  const [currentToken, setCurrentToken] = useState(null);
  const [minBid, setMinBid] = useState("");
  const [duration, setDuration] = useState("");

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

  useEffect(() => {
    bazarContract.on("AuctionCreated", (auctionId, token, tokenId, seller) => {
      alert(`Auction with ID #${auctionId} created successfully.`);
      window.location.reload();
    });

    bazcoinContract.on("TokensDeposited", () => {
      alert(`Deposit successfully!`);
      window.location.reload();
    });
  }, []);

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
        duration,
        +minBid
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
      alignItems={"flex-start"}
      justify={"flex-start"}
      direction={"column"}
      gap={20}
      padding={10}
      backgroundImage={`url(${myBackgroundImage})`}
      backgroundSize="cover"
      backgroundPosition="center"
    >
      <Modal
        isCentered
        isOpen={isOpen}
        onClose={() => {
          setCurrentToken(null);
          setMinBid("");
          setDuration("");
          onClose();
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create auction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex
              direction={"column"}
              alignItems={"center"}
              justifyContent={"center"}
              width={"100%"}
              gap={5}
              pb={10}
            >
              <Flex
                direction={"column"}
                alignItems={"center"}
                gap={10}
                width={"100%"}
              >
                <Input
                  placeholder="Minimum bid"
                  type="number"
                  width={"200px"}
                  value={minBid}
                  onChange={(e) => {
                    setMinBid(e.target.value);
                  }}
                />

                <InputGroup width={"100%"} justifyContent={"center"}>
                  <Input
                    placeholder="Duration"
                    type="number"
                    width={"200px"}
                    value={duration}
                    onChange={(e) => {
                      setDuration(e.target.value);
                    }}
                  />
                  <InputRightAddon>min</InputRightAddon>
                </InputGroup>
              </Flex>
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button
              isDisabled={minBid === "" || duration === ""}
              colorScheme="twitter"
              onClick={() => {
                handleSaleNFT(currentToken, minBid);
              }}
            >
              Sell
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Flex direction={"column"}>
        <Text fontSize={60} fontWeight={700} color={"#605d58"}>
          Profile
        </Text>

        <Text fontSize={24} fontWeight={500} color={"#605d58"}>
          User address: {userAddres}
        </Text>
      </Flex>

      <Flex direction={"column"} alignItems={"center"} gap={5}>
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
                    borderRadius={10}
                    backgroundColor={"rgba(255, 255, 255, 0.2)"}
                    backdropFilter={"blur(10px)"}
                  >
                    <Text fontWeight={700} color={"white"}>
                      Token ID: #{token}
                    </Text>
                    <Button
                      onClick={() => {
                        setCurrentToken(token);
                        onOpen();
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

      <Flex width={"90%"} position={"absolute"} bottom={100} justify={"center"}>
        <Flex
          direction={"column"}
          alignItems={"center"}
          gap={5}
          borderRadius={10}
          padding={10}
          backgroundColor={"rgba(66, 133, 200, 0.2)"}
          backdropFilter={"blur(10px)"}
        >
          <Button>Balance: {myBalance}</Button>
          <Flex gap={5} width={"100%"} justify={"center"}>
            <Input
              placeholder="100"
              colorScheme="twitter"
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
      </Flex>

      <Button
        position={"absolute"}
        top={10}
        right={10}
        onClick={() => {
          nav("/bazar");
        }}
      >
        Bazar
      </Button>
    </Flex>
  );
};
