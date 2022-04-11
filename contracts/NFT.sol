// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFT is ERC721URIStorage {
    
    using Counters for Counters.Counter;
    Counters.Counter public tokenCount;
    
    constructor(string memory _name, string memory _ticker) ERC721(_name, _ticker) {}
    function mint(string memory _tokenURI, address _owner) external returns(uint) {
        tokenCount.increment();
        _safeMint(_owner, tokenCount.current());
        _setTokenURI(tokenCount.current(), _tokenURI);
        return(tokenCount.current());
    }

}
