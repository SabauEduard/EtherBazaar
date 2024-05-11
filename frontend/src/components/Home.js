import { Button, Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export const Home = () => {
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
      <Flex gap={10}>
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
