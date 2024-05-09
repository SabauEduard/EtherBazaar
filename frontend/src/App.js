import { Route, Routes } from "react-router-dom";
import { Home } from "./components/Home";
import { Bazar } from "./components/Bazar";
import { Profile } from "./components/Profile";
import { ChakraProvider } from "@chakra-ui/react";
import { UserProvider } from "./utils/UserContext";

function App() {
  return (
    <ChakraProvider>
      <UserProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/bazar" element={<Bazar />} />
          </Routes>
      </UserProvider>
    </ChakraProvider>
  );
}

export default App;
