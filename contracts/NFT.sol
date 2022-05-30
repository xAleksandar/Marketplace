// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorageUpgradeable {
    
    using Counters for Counters.Counter;
    Counters.Counter public tokenCount;
    
    address public owner;

    function initialize(string memory _name, string memory _ticker) public initializer {
        __ERC721_init(_name, _ticker);
        }
    
    function mint(string memory _tokenURI, address _owner) external returns(uint) {
        tokenCount.increment();
        _safeMint(_owner, tokenCount.current());
        _setTokenURI(tokenCount.current(), _tokenURI);
        return(tokenCount.current());
    }

}
