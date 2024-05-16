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
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bazcoinContract, bazarContract } from "../utils/ethersConnect";
import { useUser } from "../utils/UserContext";
import moment, { now } from "moment";
import myBackgroundImage from "./fundal.jpg";

//dummy auction for testing
// {
//     0: "tokenContract",
//     1: "id",
//     2: "seller",
//     3: "1715675909",
//     4: "1715683109",
//     5: "5",
//     6: "highestBidder",
//     7: "234",
//     8: "Settled",
//   }

export const Bazar = () => {
  const userAddres = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const nav = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [currentAuction, setCurrentAuction] = useState("");
  const [currentAuctionDetails, setCurrentAuctionDetails] = useState(null);
  const [bidSum, setBidSum] = useState("");
  const [gas, setGas] = useState("");
  const [loadingGas, setLoadingGas] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [amountConfirmed, setAmountConfirmed] = useState(false);

  useEffect(() => {
    const getAuctions = async () => {
      if (!userAddres) return;

      try {
        const res = await bazarContract.seeValidAuctions();
        console.log("AUCTIONS: ", res);
        const oneAuction = await bazarContract.seeAuction(0);
        console.log("ONE AUCTION: ", oneAuction);

        let tokens = [];
        for (let i = 0; i < res.length; i++) {
          tokens.push(res[i].toString());
        }

        setAuctions(tokens);
      } catch (error) {
        alert("Could not get auctions.");
        console.log(error);
      }
    };

    getAuctions();
  }, [userAddres]);

  useEffect(() => {
    bazarContract.on("BidPlaced", (auctionId, bidder, amount) => {
      alert(
        `Bid placed successfully on auction #${auctionId} with amount ${amount}.`
      );
      window.location.reload();
    });
  }, []);

  const handleBid = async (auctionId, bidValuee = 10) => {
    try {
      let tx =
        userAddres === currentAuctionDetails?.[6].toString()
          ? await bazarContract.addToBid(auctionId, parseInt(bidValuee))
          : await bazarContract.placeBid(auctionId, parseInt(bidValuee));
      await tx.wait();

      console.log("Bid successfully");
    } catch (error) {
      alert("Could not place bid.");
      console.log(error);
    }
  };

  return (
    <Flex
      flex={1}
      height={"100vh"}
      width={"100%"}
      alignItems={"flex-start"}
      justify={"flex-start"}
      direction={"column"}
      gap={20}
      padding={10}
      backgroundImage={`url(${myBackgroundImage})`}
      backgroundSize="cover"
      backgroundPosition="center"
    >
      <Text fontSize={60} fontWeight={700} color={"#605d58"}>
        Ether Bazaar
      </Text>

      <Modal
        isCentered
        isOpen={isOpen}
        onClose={() => {
          setCurrentAuction("");
          setCurrentAuctionDetails(null);
          onClose();
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Auction Id: #{currentAuction}</ModalHeader>
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
                justify={"center"}
                alignItems={"center"}
                width={"100%"}
                gap={5}
              >
                <Flex
                  gap={2}
                  backgroundColor={"#114B5F"}
                  borderRadius={"10"}
                  padding={5}
                  color={"white"}
                >
                  <Text fontWeight={700}>End:</Text>
                  <Text
                    fontWeight={400}
                    color={
                      moment.unix(currentAuctionDetails?.[4].toString()).isBefore(now)
                        ? "red"
                        : "white"
                    }
                  >
                    {moment
                      .unix(currentAuctionDetails?.[4].toString())
                      .format("HH:mm DD.MM.YYYY")
                      .toLocaleString()}
                  </Text>
                </Flex>
                <Flex
                  gap={2}
                  backgroundColor={"#456990"}
                  borderRadius={"10"}
                  padding={5}
                  color={"white"}
                >
                  <Text fontWeight={700}>Minimum:</Text>
                  <Text fontWeight={400}>{currentAuctionDetails?.[5].toString()}</Text>
                </Flex>
              </Flex>
              <Text fontWeight={700} fontSize={36}>
                Highest Bid: {currentAuctionDetails?.[7].toString()}
              </Text>
              <Flex
                direction={"column"}
                alignItems={"center"}
                gap={2}
                width={"100%"}
              >
                <Input
                  placeholder="Enter sum to bid"
                  type="number"
                  width={"200px"}
                  value={bidSum}
                  onChange={(e) => {
                    setBidSum(e.target.value);
                  }}
                />
                <Text>
                  Estimate gas:{" "}
                  {loadingGas ? <Spinner size={"xs"} /> : gas.toString()}
                </Text>
              </Flex>
            </Flex>
          </ModalBody>

          <ModalFooter gap={5}>
            <Button
              isLoading={loadingGas}
              onClick={async () => {
                setLoadingGas(true);
                try {
                  let tx = await bazcoinContract.approve(
                    bazarContract.target,
                    parseInt(bidSum)
                  );
                  await tx.wait();
                  console.log("APPROVED");
                  let gasEst;
                  if (userAddres === currentAuctionDetails?.[6].toString())
                    gasEst = await bazarContract.addToBid.estimateGas(
                      currentAuction,
                      bidSum
                    );
                  else
                    gasEst = await bazarContract.placeBid.estimateGas(
                      currentAuction,
                      bidSum
                    );
                  setGas(gasEst);
                  setLoadingGas(false);
                  setAmountConfirmed(true);
                } catch (error) {
                  setLoadingGas(false);
                  setGas("");
                  alert("Something went wrong");
                  console.log(error);
                }
              }}
            >
              Confirm amount
            </Button>
            <Button
              isDisabled={!amountConfirmed}
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
                  borderRadius={10}
                  backgroundColor={"rgba(255, 255, 255, 0.2)"}
                  backdropFilter={"blur(10px)"}
                >
                  <Text fontWeight={700} color={"white"}>
                    Auction ID: #{auction}
                  </Text>
                  <Button
                    isLoading={loadingDetails}
                    // colorScheme="twitter"
                    onClick={async () => {
                      setCurrentAuction(auction);
                      setLoadingDetails(true);
                      let details = await bazarContract.seeAuction(auction);
                      setCurrentAuctionDetails(details);
                      setLoadingDetails(false);
                      onOpen();
                    }}
                  >
                    Details
                  </Button>
                </Flex>
              );
            })}
          </>
        )}
      </Flex>

      <Button
        position={"absolute"}
        top={10}
        right={10}
        onClick={() => {
          nav("/profile");
        }}
      >
        Profile
      </Button>
    </Flex>
  );
};
