import { Button, Flex, Text } from "@chakra-ui/react";
import { useWallet } from "../utils/Context";
import { useEthersUtils } from "../utils/EthersUtils";
import { Wallet } from "./Wallet";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const nav = useNavigate();
  const { initializeWallet } = useWallet();
  const { connectWalletMetamask } = useEthersUtils();

  const accountChangedHandler = async (signer) => {
    initializeWallet(signer);
  };

  const handleConnectMetaMaskButtonClick = () => {
    connectWalletMetamask(accountChangedHandler);
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
      <Wallet />
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
