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
import moment from "moment";
import myBackgroundImage from "./fundal.jpg";

//dummy auction for testing
// {
//     "id": 4,
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
  const [currentAuctionDetails, setCurrentAuctionDetails] = useState(null);
  const [bidSum, setBidSum] = useState("");
  const [gas, setGas] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGas, setLoadingGas] = useState(false);
  const [amountConfirmed, setAmountConfirmed] = useState(false);

  useEffect(() => {
    const getAuctions = async () => {
      if (!userAddres) return;

      try {
        setLoading(true);
        const res = await bazarContract.seeValidAuctions();
        console.log("AUCTIONS: ", res);
        const oneAuction = await bazarContract.seeAuction(0);
        console.log("ONE AUCTION: ", oneAuction);

        let tokens = [];
        for (let i = 0; i < res.length; i++) {
          let auctionId = res[i].toString();
          let auctionDetails = await bazarContract.seeAuction(auctionId);
          tokens.push({
            id: auctionId,
            ...auctionDetails,
          });
        }

        setAuctions(tokens);
        setLoading(false);
      } catch (error) {
        alert("Could not get auctions.");
        setLoading(false);
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

    bazarContract.on("AuctionSettledWithWinner", () => {
      alert("Auctions settled successfully!");
      window.location.reload();
    });

    bazarContract.on("AuctionSettledWithoutWinner", () => {
      alert("Auctions settled successfully!");
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
      minH={"100vh"}
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
          setCurrentAuctionDetails(null);
          onClose();
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Auction Id: #{currentAuctionDetails?.id}</ModalHeader>
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
                      "white"
                    }
                  >
                    {moment
                        .unix(currentAuctionDetails?.[4].toString())
                        .isBefore(moment()) ? "Finished": moment
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
                  <Text fontWeight={400}>
                    {currentAuctionDetails?.[5].toString()}
                  </Text>
                </Flex>
              </Flex>
              <Text fontWeight={700} fontSize={36}>
                Highest Bid: {currentAuctionDetails?.[7].toString()}
              </Text>
              {currentAuctionDetails?.[2] !== userAddres &&
              moment
                .unix(currentAuctionDetails?.[4].toString())
                .isAfter(moment()) && (
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
              )}
              <Text fontWeight={700} fontSize={24}>
                {moment
                  .unix(currentAuctionDetails?.[4].toString())
                  .isBefore(moment())
                  ? currentAuctionDetails?.[2] === userAddres && currentAuctionDetails?.[7].toString() === "0"
                    ? "NO BUYER :("
                    : currentAuctionDetails?.[6] === userAddres
                    ? "YOU WON THE AUCTION"
                    : "AUCTION ENDED"
                  : ""}
              </Text>
            </Flex>
          </ModalBody>

          {moment
            .unix(currentAuctionDetails?.[4].toString())
            .isBefore(moment()) ? (
            <ModalFooter>
              {(currentAuctionDetails?.[2] === userAddres ||
                currentAuctionDetails?.[6] === userAddres) && (
                <Button
                  colorScheme="twitter"
                  onClick={async () => {
                    try {
                      let tx = await bazarContract.settleAuction(
                        currentAuctionDetails?.id ?? ""
                      );
                      await tx.wait();
                      console.log("auction settled");
                    } catch (error) {
                      alert("Could not settle auction");
                      console.log(error);
                    }
                  }}
                >
                  Settle
                </Button>
              )}
            </ModalFooter>
          ) : currentAuctionDetails?.[2] !== userAddres ? (
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
                        currentAuctionDetails?.id ?? "",
                        bidSum
                      );
                    else
                      gasEst = await bazarContract.placeBid.estimateGas(
                        currentAuctionDetails?.id ?? "",
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
                  handleBid(currentAuctionDetails?.id ?? "", bidSum);
                }}
              >
                {userAddres === currentAuctionDetails?.[6].toString()
                  ? "Add to bid"
                  : "Bid"}
              </Button>
            </ModalFooter>
          ) : null}
        </ModalContent>
      </Modal>

      <AuctionRowComponent
        loading={loading}
        title={"Available auctions: "}
        list={auctions.filter(
          (auction) =>
            auction?.[2] !== userAddres && auction?.[6] !== userAddres
        )}
        setCurrentAuctionDetails={setCurrentAuctionDetails}
        onOpen={onOpen}
      />

      <AuctionRowComponent
        loading={loading}
        title={"Auctions I'm in: "}
        list={auctions.filter((auction) => auction?.[6] === userAddres)}
        setCurrentAuctionDetails={setCurrentAuctionDetails}
        onOpen={onOpen}
      />

      <AuctionRowComponent
        loading={loading}
        title={"My auctions: "}
        list={auctions.filter((auction) => auction?.[2] === userAddres)}
        setCurrentAuctionDetails={setCurrentAuctionDetails}
        onOpen={onOpen}
      />

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

const AuctionRowComponent = (props) => {
  return (
    <Flex
      width={"90vw"}
      direction={"column"}
      alignItems={"flex-start"}
      gap={5}
      overflow={"scroll"}
    >
      <Text fontWeight={900} fontSize={24}>
        {props.title}
      </Text>
      <Flex
        direction={"row"}
        width={"90vw"}
        gap={10}
        alignItems={"center"}
        justify={"flex-start"}
      >
        {props.loading ? (
          <Spinner />
        ) : props.list.length === 0 ? (
          <Text>There are no auctions now.</Text>
        ) : (
          <>
            {props.list.map((auction, index) => {
              return (
                <Flex
                  key={index}
                  direction={"column"}
                  alignItems={"center"}
                  justify={"center"}
                  gap={5}
                  padding={5}
                  borderRadius={10}
                  backgroundColor={
                    moment.unix(auction?.[4].toString()).isBefore(moment())
                      ? "rgba(255, 0, 0, 0.7)"
                      : "rgba(48, 48, 48, 0.2)"
                  }
                  backdropFilter={"blur(10px)"}
                >
                  <Text fontWeight={700} color={"white"}>
                    Auction ID: #{auction?.id}
                  </Text>

                  <Flex direction={"column"} alignItems={"center"} gap={1}>
                    <Text fontWeight={500} color={"white"}>
                      Token Contract
                    </Text>

                    <Text fontWeight={900} color={"white"}>
                      {auction?.[0]}
                    </Text>
                  </Flex>

                  <Flex direction={"column"} alignItems={"center"} gap={1}>
                    <Text fontWeight={500} color={"white"}>
                      Token Id
                    </Text>

                    <Text fontWeight={900} color={"white"} fontSize={24}>
                      {auction?.[1].toString()}
                    </Text>
                  </Flex>

                  <Flex direction={"column"} alignItems={"center"} gap={1}>
                    <Text fontWeight={500} color={"white"}>
                      Highest Bid
                    </Text>

                    <Text fontWeight={900} color={"white"} fontSize={24}>
                      {auction?.[7].toString()}
                    </Text>
                  </Flex>

                  <Button
                    onClick={async () => {
                      props.setCurrentAuctionDetails(auction);
                      props.onOpen();
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
    </Flex>
  );
};
