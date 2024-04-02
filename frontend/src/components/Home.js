import { Button, Flex, Text } from "@chakra-ui/react";
import { useWallet } from "../utils/Context";
import { connectWalletMetamask } from "../utils/EthersUtils";

export const Home = () => {
  const { initializeWallet } = useWallet();

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
      <Button onClick={handleConnectMetaMaskButtonClick} colorScheme="twitter">
        Connect with Metamask
      </Button>
    </Flex>
  );
};
