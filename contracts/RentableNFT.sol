// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./IERC4907.sol";

contract RentableNFT is ERC721URIStorageUpgradeable, IERC4907 {
    
    struct UserInfo {
        address user;   // address of user role
        uint64 expires; // unix timestamp, user expires
    }

    // @notice mapping tokenId to UserIfo struct
    mapping (uint256  => UserInfo) internal _users;


    using Counters for Counters.Counter;
    Counters.Counter public tokenCount;

    // @notice address of the collection's owner.
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

    function mint(string calldata _tokenURI, address _owner) external onlyOwner returns(uint nftNumber, bool success) {
        tokenCount.increment();
        _safeMint(_owner, tokenCount.current());
        _setTokenURI(tokenCount.current(), _tokenURI);
        nftNumber = tokenCount.current();
        success = true;
    }

    /// @notice set the user and expires of a NFT
    /// @dev The zero address indicates there is no user
    /// Throws if `tokenId` is not valid NFT
    /// @param user  The new user of the NFT
    /// @param expires  UNIX timestamp, The new user could use the NFT before expires
    function setUser(uint256 tokenId, address user, uint64 expires) public virtual override {
        require(_isApprovedOrOwner(msg.sender, tokenId),"ERC721: transfer caller is not owner nor approved");
        UserInfo storage info =  _users[tokenId];
        uint64 _expires = uint64(uint64(block.timestamp) + expires);
        info.user = user;
        info.expires = _expires;
        emit UpdateUser(tokenId,user,_expires);
    }

    /// @notice Get the user address of an NFT
    /// @dev The zero address indicates that there is no user or the user is expired
    /// @param tokenId The NFT to get the user address for
    /// @return The user address for this NFT
    function userOf(uint256 tokenId)public view virtual override returns(address){
        if( uint256(_users[tokenId].expires) >=  block.timestamp){
            return  _users[tokenId].user;
        }
        else{
            return address(0);
        }
    }

    /// @notice Get the user expires of an NFT
    /// @dev The zero value indicates that there is no user
    /// @param tokenId The NFT to get the user expires for
    /// @return The user expires for this NFT
    function userExpires(uint256 tokenId) public view virtual override returns(uint256){
        return _users[tokenId].expires;
    }

    /// @dev See {IERC165-supportsInterface}.
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC4907).interfaceId || super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);

        if (from != to && _users[tokenId].user != address(0)) {
            delete _users[tokenId];
            emit UpdateUser(tokenId, address(0), 0);
        }
    }

    modifier onlyOwner() {
        require(tx.origin == owner, "You are not the owner of this collection or contract is not initialized.");
        _;
    }

}