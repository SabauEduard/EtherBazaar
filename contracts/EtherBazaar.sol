// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BazCoin.sol";

contract EtherBazaar is IERC721Receiver, Ownable {
    struct Auction {
        address tokenContract;
        uint256 tokenId;
        address seller;
        uint256 startTime;
        uint256 endTime;
        uint256 minimumBid;
        address highestBidder;
        uint256 highestBid;
        bool settled;
    }

    mapping(uint256 => Auction) public auctions;
    mapping(address => uint256[]) public userAuctions; // Maps user to their auctions (for easy retrieval of all auctions a user has created)
    uint256 public auctionCounter;
    uint256 public AUCTION_SETTLE_FEE_PERCENTAGE = 5; // % fee that is taken from the winner's bid when the auction ends
    uint256 public AUCTION_CANCEL_FEE_PERCENTAGE = 2; // % of the current highest bid that the seller has to pay to cancel the auction

    BazCoin public bazCoin;

    event AuctionCreated(uint256 indexed auctionId, address tokenContract, uint256 indexed tokenId, address indexed seller, uint256 startTime, uint256 endTime, uint256 minimumBid);
    event AuctionEnded(uint256 indexed auctionId, address indexed winner, uint256 amount);
    event AuctionCancelled(uint256 indexed auctionId, address indexed seller, uint256 amount);
    event AuctionSettled(uint256 indexed auctionId, address indexed winner, uint256 amount);
    event SettleFeePercentageUpdated(uint256 newFee);
    event CancelFeePercentageUpdated(uint256 newFee);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount);
    
    constructor(address _bazCoinAddress) Ownable(msg.sender) {
        
        bazCoin = BazCoin(_bazCoinAddress);
    }

    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function exchangeBazCoinToEther(uint256 _amount) external onlyOwner {
        bazCoin.withdraw(_amount);
    }

    function updateAuctionFeePercentage(uint256 _newFee) external onlyOwner {
        AUCTION_SETTLE_FEE_PERCENTAGE = _newFee;
        emit SettleFeePercentageUpdated(_newFee);
    }

    function seeAuctionFeePercentage() external view returns(uint256) {
        return AUCTION_SETTLE_FEE_PERCENTAGE;
    }

    function updateCancelFeePercentage(uint256 _newFee) external onlyOwner {
        AUCTION_CANCEL_FEE_PERCENTAGE = _newFee;
        emit CancelFeePercentageUpdated(_newFee);
    }

    function seeCancelFeePercentage() external view returns(uint256) {
        return AUCTION_CANCEL_FEE_PERCENTAGE;
    }

    modifier validAuction(address _tokenContract, uint256 _tokenId, uint256 _startTime, uint256 _endTime) {
        IERC721 token = IERC721(_tokenContract);
        require(_startTime > block.timestamp, "Start time must be in the future.");
        require(_endTime > _startTime, "End time must be after start time.");
        require(token.ownerOf(_tokenId) == msg.sender, "You must be the owner of the token.");
        require(token.getApproved(_tokenId) == address(this), "Contract must be approved to manage the token.");
        _;
    }

    modifier positiveAmount(uint256 _amount) {
        require(_amount > 0, "Amount must be greater than 0.");
        _;
    }

    function startAuction(address _tokenContract, uint256 _tokenId, uint256 _startTime, uint256 _endTime, uint256 _minimumBid) external 
            validAuction(_tokenContract, _tokenId, _startTime, _endTime) positiveAmount(_minimumBid) returns (uint256) {

        IERC721(_tokenContract).safeTransferFrom(msg.sender, address(this), _tokenId);

        auctions[auctionCounter] = Auction({
            tokenContract: _tokenContract,
            tokenId: _tokenId,
            seller: msg.sender,
            startTime: _startTime,
            endTime: _endTime,
            minimumBid: _minimumBid,
            highestBidder: address(0),
            highestBid: 0,
            settled: false
        });

        emit AuctionCreated(auctionCounter, _tokenContract, _tokenId, msg.sender, _startTime, _endTime, _minimumBid);

        auctionCounter++;
        userAuctions[msg.sender].push(auctionCounter);

        return auctionCounter - 1;
    }

    function seeAuction(uint256 _auctionId) external view returns(Auction memory) {
        return auctions[_auctionId];
    }

    function seeUserAuctions(address _user) external view returns(uint256[] memory) {
        return userAuctions[_user];
    }

    modifier auctionStarted(uint256 _auctionId) {
        require(block.timestamp >= auctions[_auctionId].startTime, "Auction has not started yet.");
        _;
    }

    modifier auctionNotEnded(uint256 _auctionId) {
        require(block.timestamp < auctions[_auctionId].endTime, "Auction has ended.");
        _;
    }

    modifier checkBid(uint256 _auctionId, uint256 _bidAmount) {
        require(_bidAmount > auctions[_auctionId].highestBid, "Bid amount must be greater than the highest bid.");
        require(_bidAmount >= auctions[_auctionId].minimumBid, "Bid amount must be greater than the minimum bid.");
        require(bazCoin.allowance(msg.sender, address(this)) >= _bidAmount, "You must approve the bid amount.");
        _;
    }

    function placeBid(uint256 _auctionId, uint256 _bidAmount) external positiveAmount(_bidAmount) auctionStarted(_auctionId) 
            auctionNotEnded(_auctionId) checkBid(_auctionId, _bidAmount) {
        Auction storage auction = auctions[_auctionId];

        // If there was a previous bid, return the funds to the previous bidder
        if(auction.highestBidder != address(0)) {
            bazCoin.transfer(auction.highestBidder, auction.highestBid);
        }

        // Transfer the new bid to the contract
        bazCoin.transferFrom(msg.sender, address(this), _bidAmount);

        auction.highestBidder = msg.sender;
        auction.highestBid = _bidAmount;

        emit BidPlaced(_auctionId, msg.sender, _bidAmount);
    }

    modifier onlySeller(uint256 _auctionId) {
        require(msg.sender == auctions[_auctionId].seller, "You must be the seller to do this.");
        _;
    }

    modifier approvedCancelFee(uint256 _auctionId) {
        require(bazCoin.allowance(msg.sender, address(this)) >= auctions[_auctionId].highestBid * AUCTION_CANCEL_FEE_PERCENTAGE / 100, "You must approve the fee.");
        _;
    }

    function cancelAuction(uint256 _auctionId) external onlySeller(_auctionId) auctionNotEnded(_auctionId) approvedCancelFee(_auctionId){
        uint256 cancelFee = auctions[_auctionId].highestBid * AUCTION_CANCEL_FEE_PERCENTAGE / 100;
        // Transfer the fee to the contract
        bazCoin.transferFrom(msg.sender, address(this), cancelFee);

        Auction storage auction = auctions[_auctionId];
        
        // Transfer the token back to the seller
        IERC721 token = IERC721(auction.tokenContract);
        token.safeTransferFrom(address(this), auction.seller, auction.tokenId);

        // Transfer the highest bid back to the highest bidder
        bazCoin.transfer(auction.highestBidder, auction.highestBid);

        auction.settled = true;
        emit AuctionCancelled(_auctionId, msg.sender, cancelFee);
    }

    function seeCancelFee(uint256 _auctionId) external auctionNotEnded(_auctionId) view returns(uint256) {
        Auction storage auction = auctions[_auctionId];
        return auction.highestBid * AUCTION_CANCEL_FEE_PERCENTAGE / 100;
    }

    modifier auctionNotSettled(uint256 _auctionId) {
        require(!auctions[_auctionId].settled, "Auction has already been settled.");
        _;
    }

    modifier auctionEnded(uint256 _auctionId) {
        require(block.timestamp >= auctions[_auctionId].endTime, "Auction has not ended yet.");
        _;
    }

    modifier onlySellerOrHighestBidder(uint256 _auctionId) {
        require(msg.sender == auctions[_auctionId].seller || msg.sender == auctions[_auctionId].highestBidder, "You must be the seller or the highest bidder to do this.");
        _;
    }

    function settleAuction(uint256 _auctionId) external onlySellerOrHighestBidder(_auctionId) auctionNotSettled(_auctionId) auctionEnded(_auctionId) {
        Auction storage auction = auctions[_auctionId];
        uint256 settleFee = auction.highestBid * AUCTION_SETTLE_FEE_PERCENTAGE / 100;

        bazCoin.transfer(auction.seller, auction.highestBid - settleFee);

        IERC721 token = IERC721(auction.tokenContract);
        token.safeTransferFrom(address(this), auction.highestBidder, auction.tokenId);

        auction.settled = true;
        emit AuctionSettled(_auctionId, auction.highestBidder, auction.highestBid - settleFee);
    }
}