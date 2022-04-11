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
        items[tokenCount.current()] = Item (NFTnumber, NFTContract, 0, false);
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

    }

}
