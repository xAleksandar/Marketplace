// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./NFT.sol";

contract NFTFactory {

    NFT[] private _nfts;

    function createNFTContract(string memory name, string memory ticker) public returns(ERC721) {
        NFT nft = new NFT(
            name,
            ticker
        );
        _nfts.push(nft);
        
        return nft;

    }
    function getnfts() public view returns (NFT[] memory) {
        return _nfts;
    }
}
