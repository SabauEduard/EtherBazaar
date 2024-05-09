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
import {
  bazcoinContract,
  bazarContract,
  nftContract,
} from "../utils/ethersConnect";
import { useUser } from "../utils/UserContext";

export const Bazar = () => {
  const userAddres = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const nav = useNavigate();
  const [bidValue, setBidValue] = useState("");
  const [auctions, setAuctions] = useState([]);
  const [currentAuction, setCurrentAuction] = useState(null);
  const [bidSum, setBidSum] = useState(null);

  useEffect(() => {
    const getAuctions = async () => {
      const res = await bazarContract.seeValidAuctions();
      console.log("AUCTIONS: ", res);

      setAuctions(res);
    };

    getAuctions();
  }, [userAddres]);

  const handleBid = async (auctionId, bidValue = 10) => {
    let tx = await bazcoinContract.approve(
      bazarContract.target,
      parseInt(bidValue)
    );
    await tx.wait();
    tx = await bazarContract.placeBid(auctionId, parseInt(bidValue));
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

      <Text>Welcome to bazar</Text>

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
              width={"100px"}
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
        gap={5}
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
                      setCurrentAuction(index);
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
