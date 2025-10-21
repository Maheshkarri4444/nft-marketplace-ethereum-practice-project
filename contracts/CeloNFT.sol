// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CeloNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("CeloNFT", "cNFT") Ownable(msg.sender) {
        // Mint the 2 NFTs during deployment
        _mintWithURI(
            msg.sender,
            "ipfs://bafkreiecrpqi5gbjaclhlmp5w5btunoxvywziylzf7mojusros6q4ci52a"
        );
        _mintWithURI(
            msg.sender,
            "ipfs://bafkreicmtha4rqv4e6ult7l3ir5z36hevksb5sirj7ns4ijwhhbpwo5giq"
        );
    }

    /**
     * @dev Internal mint helper to keep logic clean
     */

    function _mintWithURI(address to, string memory uri) internal {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    /**
     * @dev Public mint function — allows anyone (or restrict to owner if you want)
     */

    function mintNFT(string memory uri) external returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }
}
