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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bazcoinContract, bazarContract } from "../utils/ethersConnect";
import { useUser } from "../utils/UserContext";

export const Bazar = () => {
  const userAddres = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const nav = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [currentAuction, setCurrentAuction] = useState(null);
  const [bidSum, setBidSum] = useState(null);

  useEffect(() => {
    const getAuctions = async () => {
      if (!userAddres) return;
      const res = await bazarContract.seeValidAuctions();
      console.log("AUCTIONS: ", res);

      let tokens = [];
      for (let i = 0; i < res.length; i++) {
        tokens.push(res[i].toString());
      }

      setAuctions(tokens);
    };

    getAuctions();
  }, [userAddres]);

  const handleBid = async (auctionId, bidValuee = 10) => {
    let tx = await bazcoinContract.approve(
      bazarContract.target,
      parseInt(bidValuee)
    );
    await tx.wait();
    tx = await bazarContract.placeBid(auctionId, parseInt(bidValuee));
    await tx.wait();

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

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setCurrentAuction(null);
          onClose();
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Let's enter the auction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              type="number"
              width={"200px"}
              value={bidSum}
              onChange={(e) => {
                setBidSum(e.target.value);
              }}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="twitter"
              onClick={() => {
                handleBid(currentAuction, bidSum);
              }}
            >
              Bid
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Flex
        direction={"row"}
        width={"90vw"}
        gap={10}
        alignItems={"center"}
        justify={"center"}
        wrap={"wrap"}
      >
        {auctions.length === 0 ? (
          <Text>There are no auctions now.</Text>
        ) : (
          <>
            {auctions.map((auction, index) => {
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
                  <Text>Auction ID: #{auction}</Text>
                  <Button
                    colorScheme="twitter"
                    onClick={() => {
                      setCurrentAuction(auction);
                      onOpen();
                    }}
                  >
                    Bid
                  </Button>
                </Flex>
              );
            })}
          </>
        )}
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
