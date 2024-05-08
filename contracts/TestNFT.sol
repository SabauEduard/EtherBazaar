// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract TestNFT is ERC721Enumerable {
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

    function getOwnedNfts(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory ownedNfts = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            ownedNfts[i] = tokenOfOwnerByIndex(owner, i);
        }
        return ownedNfts;
    }
}
