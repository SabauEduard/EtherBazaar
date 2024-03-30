// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BazCoin is ERC20, Ownable {
    uint256 public constant EXCHANGE_RATE = 1; // 1 ETH = 1 BZC

    event AuctionContractSet(address indexed auctionContract);
    event TokensDeposited(address indexed user, uint256 ethAmount, uint256 tokenAmount);
    event TokensWithdrawn(address indexed user, uint256 tokenAmount, uint256 ethAmount);

    constructor() ERC20("BazCoin", "BZC") Ownable(msg.sender) {}

    modifier positiveAmount(uint256 tokenAmount) {
        require(tokenAmount > 0, "Token Amount must be greater than 0.");
        _;
    }

    modifier positiveDeposit() {
        require(msg.value > 0, "Deposit must be greater than 0.");
        _;
    }

    function deposit() external payable positiveDeposit {
        uint256 tokenAmount = msg.value * EXCHANGE_RATE;
        _mint(msg.sender, tokenAmount);
        emit TokensDeposited(msg.sender, msg.value, tokenAmount);
    }

    modifier enoughBalance(uint256 tokenAmount, address user) {
        require(tokenAmount <= balanceOf(msg.sender), "Insufficient balance.");
        _;
    }

    function withdraw(uint256 tokenAmount) external enoughBalance(tokenAmount, msg.sender) {
        uint256 ethAmount = tokenAmount / EXCHANGE_RATE;
        _burn(msg.sender, tokenAmount);
        emit TokensWithdrawn(msg.sender, tokenAmount, ethAmount);
        payable(msg.sender).transfer(ethAmount);
    }
}
