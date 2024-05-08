// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestNFT is ERC721 {
    uint256 public tokenIds;
    
    constructor() ERC721("TestNFT", "TNFT") {
        tokenIds = 0;
    }

    function getTokenIds() external view returns (uint256) {
        return tokenIds;
    }

    function mint(address to) external {
        tokenIds++;
        uint256 newTokenId = tokenIds;
        _mint(to, newTokenId);
    }
}
