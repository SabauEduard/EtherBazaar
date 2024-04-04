import { WalletProvider } from "./utils/Context";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./components/Home";
import { Profile } from "./components/Profile";
import { ChakraProvider } from "@chakra-ui/react";

function App() {
  return (
    <ChakraProvider>
      <WalletProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </ChakraProvider>
  );
}

export default App;
