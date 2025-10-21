// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CeloNFT is ERC721Enumerable, Ownable {
    uint256 private _nextTokenId;
    mapping(uint256 => string) private _tokenURIs;

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
        _tokenURIs[tokenId] = uri;
    }

    /**
     * @dev Public mint function — allows anyone (or restrict to owner if you want)
     */

    function mintNFT(string memory uri) external returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        _mint(msg.sender, tokenId);
        _tokenURIs[tokenId] = uri;
        return tokenId;
    }

    /**
     * @dev Standard ERC721 `tokenURI` getter
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Query for nonexistent token"); //checking token exists , if not its owner will be oxoooo = address(0)
        return _tokenURIs[tokenId];
    }

    /**
     * @dev Helper: total NFTs owned by a user
     */

    function getTokensOfOwner(
        address owner
    ) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner); //Returns how many NFTs this wallet owns.
        uint256[] memory tokenIds = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i); //lets you fetch the tokenId at a specific index for that owner.
        }
        return tokenIds;
    }
}
