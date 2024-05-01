import { ethers } from "ethers";
import BazCoinABI from "../contractsABI/BazCoinABI.json";
import EtherBazaarABI from "../contractsABI/EtherBazaarABI.json";
import TestNFTABI from "../contractsABI/TestNFTABI.json";

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const bazcoinContract = new ethers.Contract(
  "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  BazCoinABI,
  signer
);

const bazarContract = new ethers.Contract(
  "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  EtherBazaarABI,
  signer
);

const nftContract = new ethers.Contract(
  "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  TestNFTABI,
  signer
);

export { bazcoinContract, bazarContract, nftContract, provider };
