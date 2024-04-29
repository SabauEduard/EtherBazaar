import { Button, Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const nav = useNavigate();

  const handleConnectMetaMaskButtonClick = async () => {
    connectWalletMetamask(accountChangedHandler);

    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
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
