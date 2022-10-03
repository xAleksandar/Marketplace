// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./NFT.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

// Factory Contract used by marketplace to produce new collection contracts.
// Collections could also be created outside the Marketplace contract and added to id later.

contract NFTFactory {
    
    NFT[] private _nfts;
    // The address of the Implementation contract that
    // is used from the Factory to clone new contracts.
    address public immutable Implementation;
    
    constructor() {
        Implementation = address(new NFT());    
    }

    // Function createNFTContract, the main function used to create new collection contract.
    // Param: _name : The name of the new collection.
    // Param: _ticker : The ticker of the new collection.
    // Param: _collectionOwner : The address of the owner i.e the one that can mint new NFTS from that collection.
    
    function createNFTContract (string calldata _name, string calldata _ticker, address _collectionOwner) external returns(ERC721Upgradeable) {
        address newNFTContract = _cloneNFTContract(_name, _ticker, _collectionOwner);
        NFT _newNFT = NFT(newNFTContract);
        _nfts.push(_newNFT);
        return(_newNFT);
    }

    // Function _cloneNFTContract, private function that actually creates the new collection.
    // Param: _name : The name of the new collection.
    // Param: _ticker : The ticker of the new collection.
    // Param: _collectionOwner : The address of the owner i.e the one that can mint new NFTS from that collection.
    
    function _cloneNFTContract(string calldata _name, string calldata _ticker, address _collectionOwner) private returns(address) {
        address _newNFTContract = Clones.clone(Implementation);
        NFT(_newNFTContract).initialize(_name, _ticker, _collectionOwner);
        return(_newNFTContract);
    }

    function getnfts() public view returns (NFT[] memory) {
        return _nfts;
    }

}
