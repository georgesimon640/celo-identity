// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


/// @title Celo Identity
/// @author George Simon
/// @notice This contract is made for the dacade celo 201 challenge
contract MyNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    Counters.Counter private allIdentity;
    uint reputationFee = 0.2 ether;

    constructor() ERC721("CELOIDENTITY", "CIDT") {}

    /// @dev struct for each identity
    struct NFT {
        uint256 tokenId;
        address payable owner;
        uint256 reputation;
    }

    mapping(uint256 => NFT) public nfts; // mapping for storing identities
    mapping(address => bool) private raters;




    /// @dev minting identities
    function mint(string calldata uri) external payable {
        require(bytes(uri).length > 0, "Empty uri");
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        newIdentity(tokenId);
    }

    /// @dev adding identity to mapping
    function newIdentity(uint256 _tokenId) private {
        uint256 _reputation = 0;
        nfts[allIdentity.current()] = NFT(
            _tokenId,
            payable(msg.sender),
            _reputation
        );
        allIdentity.increment();
        
    }


    /// @dev the owner of the contract can change the reputation fee
    function modifyRepFee(uint _newRepfee) external onlyOwner{
        reputationFee = _newRepfee;
    } 


    /// @dev increasing reputation points of an identity.
    function increaseRep(uint256 _index)
        external
        payable
    {
        require(msg.value == reputationFee, "You need to pay to increase reputation");
        require(msg.sender != nfts[_index].owner, "you can't increase the rep of your own identity");
        require(raters[msg.sender] == false, "you can only rate once");
        nfts[_index].reputation++;
        (bool success, ) = payable(owner()).call{value: reputationFee}("");
        require(success, "Transfer failed");
        raters[msg.sender] = true;
    }

    /// @dev returning an identity
    function getIdentities(uint256 _index)
        public
        view
        returns (NFT memory)
    {
        return nfts[_index];
    }



    /// @dev getting the length of identities on the mapping
    function getNFTlength() public view returns (uint256) {
        return allIdentity.current();
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /// @dev destroy an NFT
    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    /// @dev return IPFS url of NFT metadata
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
