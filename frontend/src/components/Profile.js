import { Flex, Button } from "@chakra-ui/react";
import { useEthersUtils } from "../utils/EthersUtils";

export const Profile = () => {
  const { bazcoinContract } = useEthersUtils();

  const handleDepositBazcoin = async () => {
    if (bazcoinContract) {
      try {
        await bazcoinContract.deposit();
      } catch (error) {
        console.log("Error on deposit bazCoin");
      }
    } else {
      console.log("There is no contract here.");
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
      <Button colorScheme="twitter" onClick={handleDepositBazcoin}>
        Deposit BazCoin
      </Button>
    </Flex>
  );
};
