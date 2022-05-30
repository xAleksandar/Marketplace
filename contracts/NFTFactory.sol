// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./NFT.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

contract NFTFactory {
    
    NFT[] private _nfts;
    address public immutable Implementation;
    
    constructor() {
        Implementation = address(new NFT());    
    }

    function createNFTContract (string calldata _name, string calldata _ticker) external returns(ERC721Upgradeable) {
        address newNFTContract = _cloneNFTContract(_name, _ticker);
        NFT _newNFT = NFT(newNFTContract);
        _nfts.push(_newNFT);
        return(_newNFT);
    }

    function _cloneNFTContract(string calldata _name, string calldata _ticker) private returns(address) {
        address _newNFTContract = Clones.clone(Implementation);
        NFT(_newNFTContract).initialize(_name, _ticker);
        return(_newNFTContract);
    }

    function getnfts() public view returns (NFT[] memory) {
        return _nfts;
    }

}
