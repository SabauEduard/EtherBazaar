import { Flex, Text } from "@chakra-ui/react";

export const Bazar = () => {
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
    </Flex>
  );
};
