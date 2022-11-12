// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./NFT.sol";
import "./RentableNFT.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

// Factory Contract used by marketplace to produce new collection contracts.
// Collections could also be created outside the Marketplace contract and added to id later.

contract NFTFactory {
    
    NFT[] private _nfts;
    // The address of the Implementation contract that
    // is used from the Factory to clone new contracts.
    address public immutable Implementation;
    address public immutable RentableImplementation;
    
    constructor() {
        Implementation = address(new NFT());
        RentableImplementation = address(new RentableNFT());
    }

    // Function createNFTContract, the main function used to create new collection contract.
    // Param: _name : The name of the new collection.
    // Param: _ticker : The ticker of the new collection.
    // Param: _collectionOwner : The address of the owner i.e the one that can mint new NFTS from that collection.
    
    function createNFTContract (string calldata _name, string calldata _ticker, address _collectionOwner, bool _rentable) external returns(ERC721Upgradeable newNFTContract, bool success) {
        address _newNFTContract = _cloneNFTContract(_name, _ticker, _collectionOwner, _rentable);
        NFT _newNFT = NFT(_newNFTContract);
        _nfts.push(_newNFT);
        newNFTContract = _newNFT;
        success = true;
    }

    // Function _cloneNFTContract, private function that actually creates the new collection.
    // Param: _name : The name of the new collection.
    // Param: _ticker : The ticker of the new collection.
    // Param: _collectionOwner : The address of the owner i.e the one that can mint new NFTS from that collection.
    
    function _cloneNFTContract(string calldata _name, string calldata _ticker, address _collectionOwner, bool _rentable) private returns(address) {
        
        address _newNFTContract;

        if (_rentable) {
            _newNFTContract = Clones.clone(RentableImplementation);
        } else {
            _newNFTContract = Clones.clone(Implementation);
        }
        
        NFT(_newNFTContract).initialize(_name, _ticker, _collectionOwner);
        return(_newNFTContract);
    }

    function getnfts() public view returns (NFT[] memory) {
        return _nfts;
    }

}