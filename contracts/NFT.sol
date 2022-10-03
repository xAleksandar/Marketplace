// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// NFT contract designed as template for Factory contract.
// Notice: Using OpenZeppelin Clones for optimized gas costs.

contract NFT is ERC721URIStorageUpgradeable {
    
    using Counters for Counters.Counter;
    Counters.Counter public tokenCount;
    
    address public owner;

    // Function initialize, used instead of constructor to set name and ticker for NFT collection.
    // Param: _name - The name of the NFT collection.
    // Param: _ticket - The ticker of the NFT collection.
    // Param: _owner - The address that will own the collection.

    function initialize(string calldata _name, string calldata _ticker, address _owner) public initializer {
        __ERC721_init(_name, _ticker);
        owner = _owner;
        }
    
    // Function mint, used to mint new NFT from that collection.
    // Param _tokenURI - The Uri of the token.
    // Param _owner - The address at that the NFT will be minted to.
    // Notice - Contract MUST be initialized before the mint function can be called.
    // The way to check that the contract is initialized is using the owner address.
    // Before calling the initialize function, the owner address is zero address, which
    // causes the OnlyOwner modifier to revert if the minting function is called.

    function mint(string calldata _tokenURI, address _owner) external onlyOwner returns(uint) {
        tokenCount.increment();
        _safeMint(_owner, tokenCount.current());
        _setTokenURI(tokenCount.current(), _tokenURI);
        return(tokenCount.current());
    }

    modifier onlyOwner() {
        require(tx.origin == owner, "You are not the owner of this collection or contract is not initialized.");
        _;
    }

}