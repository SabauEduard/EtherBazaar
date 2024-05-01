import { Flex, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export const Bazar = () => {
  const nav = useNavigate();
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
