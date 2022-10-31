// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./NFTFactory.sol";
import "./NFT.sol";

contract Marketplace is ReentrancyGuard {
	
    using Counters for Counters.Counter;
    Counters.Counter public tokenCount;

    NFTFactory public NFTFactoryContract;
    NFT NFTContract;

    constructor() {
        NFTFactoryContract = new NFTFactory();
    }


    //===================================//

    //              EVENTS               //

    //===================================//
    

    event newCollection (address collectionAddress,address owner);

    event nft (string action, uint id, address issuer);



    // COLLECTIONS MANAGEMENT
    
    // Template of Collection object
    // Param: Contract, which is instance of the Collection Contract. 
    // Param: Owner: The address of the Collection creator.
    // Param: ImageLink(Optional): String used to store the link or base64 encoded version of the Collection Logo.
    // Param: info(Optional): Used to store collection description.

    struct collection {
        ERC721Upgradeable Contract;
        address Owner;
        string imageLink;
        string info;
    }

    // Collections storage (Array)
    collection[] public collections;



    // Function createCollection, used to create new Collection and store it in the collections array.
    // Param: _name, the name of the new Collection.
    // Param: ImageLink(Optional): String used to store the link or base64 encoded version of the Collection Logo.
    // Param: info(Optional): Used to store collection description.

    function createCollection (string memory _name, string memory _ticker, string calldata _imageLink, string memory _info) external {
        (ERC721Upgradeable _contract, bool success) = NFTFactoryContract.createNFTContract(_name, _ticker, msg.sender);
        require (success, "Collection creation failed.");

        collections.push(
            collection(
                _contract, 
                msg.sender, 
                _imageLink, 
                _info
            )
        );

        emit newCollection (address(_contract), msg.sender);
    }
    

    // Function returnCollections, used to return all Collections tracked by the Marketplace.
    function returnCollections() external view returns (collection[] memory) {
    	return collections;
    }
    

    // Function returnCollectionsLength, used to return the length of the collections array.
    function returnCollectionsLength() external view returns (uint) {
        return collections.length;
    }


    //===================================//


    // Template of NFT object - used to store the information for each NFT.
    // Param: tokenId - Saves the NFT id from the Marketplace.
    // Notice: tokenId is the Marketplace ID of the NFT, not the one in the NFT Contract.
    // Param: nft - Instance of the NFT contract that the current NFT belongs to.
    // Param: price: The NFT Price while the NFT is for sell. The price is 0 by default.
    // Param: bidPrice - The higher bid that someone made for this NFT.
    // Param: bidAddress - The address that made the higher bid.
    // Param: forSell - Indicates if NFT is currently for sell.

    struct Item {
        uint tokenId;
        ERC721Upgradeable nft;
        uint price;
        uint bidPrice;
        address bidAddress;
        bool forSell;
    }


    // Mapping to store all the NFTs using the ID as key.
    mapping (uint256 => Item) public items;


    // Function returnItemsLength, used to return the total items count.
    function returnItemsLength() external view returns (uint) {
        return tokenCount.current();
    }


    // Function mintNFT, used to mint new NFT.
    // Param: _collectionId - The (Marketplace) ID of the collection you want to mint from.
    // Param: _tokenURI - The Uri of the new NFT.

    function mintNFT (uint _collectionId, string memory _tokenURI) external {
        require (collections[_collectionId].Owner == msg.sender, "You are not the owner of this collection.");

        NFTContract = NFT(address(collections[_collectionId].Contract));
        (uint NFTnumber, bool success) = NFTContract.mint(_tokenURI, msg.sender);
        require(success, "NFT Mint failed.");

        tokenCount.increment();
        items[tokenCount.current()] = Item (NFTnumber, NFTContract, 0, 0, address(this), false);

        emit nft ("Mint", tokenCount.current(), msg.sender);
    }


    // Function sellNFT, used to put NFT for sale in the Marketplace.
    // Param: _itemId - The NFT ID (In the Marketplace contract).
    // Param: _price - The price of the NFT.

    function sellNFT (uint _itemId, uint _price) external {
        require (_price != 0, "Price cannot be 0.");
        require (NFT(address(items[_itemId].nft)).ownerOf(items[_itemId].tokenId) == msg.sender, "This is not your NFT.");

        items[_itemId].price = _price;
        items[_itemId].forSell = true;

        emit nft ("Sell", _itemId, msg.sender);

    }


    // Function cancelSell, used to cancel the sell of a NFT.
    // Param: _itemId - The NFT ID (In the Marketplace contract).

    function cancelSell (uint _itemId) external {
        require (NFT(address(items[_itemId].nft)).ownerOf(items[_itemId].tokenId) == msg.sender, "This is not your NFT.");

        items[_itemId].forSell = false;

        emit nft ("CancelSell", _itemId, msg.sender);
    }


    // Function buyNFT, used to purchase NFT that is listed for sell.
    // Param: _itemId - The (Marketplace) ID of the NFT.

    function buyNFT (uint _itemId) external payable nonReentrant {
        require (items[_itemId].forSell == true, "NFT Not for sell.");
        require (msg.value >= items[_itemId].price, "Submitted price doesn't match nft price.");

        address currentOwner = NFT(address(items[_itemId].nft)).ownerOf(items[_itemId].tokenId);
        items[_itemId].forSell = false;
        items[_itemId].bidPrice = 0;

        NFT(address(items[_itemId].nft)).safeTransferFrom(currentOwner, msg.sender , items[_itemId].tokenId);
        
        (bool sent,) = currentOwner.call{value: items[_itemId].price}("");
        require(sent, "Unable to transfer funds.");

        emit nft ("Buy", _itemId, msg.sender);
    }


    // Function sendFunds, used to send funds to an address from the contract treasury instead of msg.sender.
    // Param: _to - The recepient address.
    // Param: _value - The value to be sent.

    function sendFunds (address _to, uint _value) internal {
        (bool _sent,) = _to.call{value: _value}("");
        require(_sent, "Unable to transfer funds.");
    }


    // Function bidOnNFT, used to Bid or outbid a price for NFT.
    // Param: _itemId - The (Marketplace) ID of the NFT.
    // Notice: The bid price is msg.value after gas costs. 
    
    function bidOnNFT (uint _itemId) external payable nonReentrant {
        require (msg.value > items[_itemId].bidPrice, "Your bid must be bigger than the current one.");
        
        //Returning the money of the latest bidder in case of outbid.
        if (items[_itemId].bidPrice > 0) {
            sendFunds(items[_itemId].bidAddress, items[_itemId].bidPrice);
        }

        items[_itemId].bidPrice = msg.value;
        items[_itemId].bidAddress = msg.sender;

        emit nft ("Bid", _itemId, msg.sender);
    }


    // Function getBalance, returns the Marketplace balance.

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }


    //Function getApproved, returns the address that is approved to manage the NFT.
    // Param: _itemId - The (Marketplace) ID of the NFT.

    function getApproved(uint _itemId) public view returns(address) {
        return NFT(address(items[_itemId].nft)).getApproved(items[_itemId].tokenId);
    }


    // Function acceptBid, used to accept current bid and transfer the NFT.
    // Param: _itemId - The (Marketplace) ID of the NFT.

    function acceptBid (uint _itemId) external payable nonReentrant {
        require (items[_itemId].bidPrice > 0, "No bids have been made on that nft.");

        //Ensuring that the caller actually has the ownership of that NFT.
        address currentOwner = NFT(address(items[_itemId].nft)).ownerOf(items[_itemId].tokenId);
        require (NFT(address(items[_itemId].nft)).ownerOf(items[_itemId].tokenId) == msg.sender, "You are not the owner of this NFT.");

        sendFunds(currentOwner, items[_itemId].bidPrice);
        NFT(address(items[_itemId].nft)).transferFrom(currentOwner, items[_itemId].bidAddress, items[_itemId].tokenId);

        items[_itemId].forSell = false;
        items[_itemId].bidPrice = 0;

        emit nft ("AcceptBid", _itemId, msg.sender);
    }

}