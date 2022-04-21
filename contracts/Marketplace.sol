// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./NFTFactory.sol";
import "./NFT.sol";

contract Marketplace is ReentrancyGuard {
	
    using Counters for Counters.Counter;
    Counters.Counter public tokenCount;

    NFTFactory NFTFactoryContract;
    NFT NFTContract;
    uint NFTnumber;

    constructor(address NFTFactoryAddress) {
        NFTFactoryContract = NFTFactory(NFTFactoryAddress);
    }


    //===================================//
    
    //   COLLECTIONS MANAGEMENT
    

    // Collections storage (Array)
    ERC721[] private collections;

    //Create new collection and store it (=) Mint new NFT contract.
    function createCollection (string memory _name, string memory _ticker) public nonReentrant {
        collections.push(NFTFactoryContract.createNFTContract(_name, _ticker));
    }
    
    //Return all collections
    function returnCollections() external view returns (ERC721[] memory) {
    	return collections;
    }
    
    //Get Collections length.
    function lengthCollections () public view returns (uint) {
        return collections.length;
    }


    //===================================//


    //Used to store info about all existing NFTs.
    struct Item {
        uint tokenId;
        ERC721 nft;
        uint price;
        uint bidPrice;
        address bidAddress;
        bool forSell;
    }
    //Uses NFT address + tokenId as unique identifier.
    mapping (uint256 => Item) public items;

    //Returns size of items struct
    function lengthItems() public view returns (uint) {
        return tokenCount.current();
    }


    //Mint new nft.
    function mintNFT (uint _collectionId, string memory _tokenURI) public nonReentrant {

        NFTContract = NFT(address(collections[_collectionId]));
        NFTnumber = NFTContract.mint(_tokenURI, msg.sender);

        tokenCount.increment();
        items[tokenCount.current()] = Item (NFTnumber, NFTContract, 0, 0, address(this), false);
    }

    //Puts NFT for sell.
    function sellNFT (uint _itemId, uint _price) public nonReentrant {
        require (_price != 0, "Price cannot be 0.");
        require (NFT(address(items[_itemId].nft)).ownerOf(items[_itemId].tokenId) == msg.sender, "This is not your NFT.");

        items[_itemId].price = _price;
        items[_itemId].forSell = true;

    }


    //Cancell sell.
    function cancelSell (uint _itemId) public nonReentrant {
        require (NFT(address(items[_itemId].nft)).ownerOf(items[_itemId].tokenId) == msg.sender, "This is not your NFT.");

        items[_itemId].forSell = false;
    }


    //Buy NFT.
    function buyNFT (uint _itemId) public payable nonReentrant {
        require (items[_itemId].forSell == true, "Not for sell.");
        require (msg.value >= items[_itemId].price, "Submitted price doesn't match nft price.");

        address currentOwner = NFT(address(items[_itemId].nft)).ownerOf(items[_itemId].tokenId);
        payable(currentOwner).transfer(items[_itemId].price);
        NFT(address(items[_itemId].nft)).transferFrom(currentOwner, msg.sender, items[_itemId].tokenId);

        items[_itemId].forSell = false;
        items[_itemId].bidPrice = 0;

    }

    //Used to send money to an address from the contract treasury instead msg.sender.
    function sendMoney (address to, uint value) internal {
        address payable receiver = payable(to);
        receiver.transfer(value);
    }
    
    //Place bid on NFT.
    function bidOnNFT (uint _itemId) public payable {
        //require(msg.value >= _price, "Not enough eth to cover gas fees");
        require (msg.value > items[_itemId].bidPrice, "Your bid must be bigger than the current one.");
        
        //Returning the money of the latest bidder in case of outbid.
        if (items[_itemId].bidPrice > 0) {
            sendMoney(items[_itemId].bidAddress, items[_itemId].bidPrice);
        }

        items[_itemId].bidPrice = msg.value;
        items[_itemId].bidAddress = msg.sender;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getApproved(uint _itemId) public view returns(address) {
        return NFT(address(items[_itemId].nft)).getApproved(items[_itemId].tokenId);
    }

    //Accept bid and transfer NFT.
    function acceptBid (uint _itemId) public payable nonReentrant {
        require (items[_itemId].bidPrice > 0, "No any bids.");

        //Ensuring that the caller actually has the ownership of that NFT.
        address currentOwner = NFT(address(items[_itemId].nft)).ownerOf(items[_itemId].tokenId);
        require (currentOwner == msg.sender, "You are not the owner of this NFT.");

        sendMoney(currentOwner, items[_itemId].bidPrice);
        NFT(address(items[_itemId].nft)).transferFrom(currentOwner, items[_itemId].bidAddress, items[_itemId].tokenId);

        items[_itemId].forSell = false;
        items[_itemId].bidPrice = 0;
    }

}


