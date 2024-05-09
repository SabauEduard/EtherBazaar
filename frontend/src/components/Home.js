import { Button, Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
const ethers = require("ethers");

export const Home = () => {
  const nav = useNavigate();

  const handleConnectMetaMaskButtonClick = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        nav("/bazar");
      } catch (error) {
        console.error("Failed to connect metamask wallet", error);
      }
    } else {
      alert("Please install MetaMask!");
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
        Ether Bazaar
      </Text>
      <Flex gap={10}>
        <Button
          onClick={handleConnectMetaMaskButtonClick}
          colorScheme="twitter"
          display={"none"}
        >
          Connect with Metamask
        </Button>

        <Button
          onClick={() => {
            nav("/profile");
          }}
        >
          Profile
        </Button>
      </Flex>
    </Flex>
  );
};
