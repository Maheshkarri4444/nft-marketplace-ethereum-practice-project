// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFTMarketplace {
    struct Listing {
        uint256 price;
        address seller;
    }
    //Contract Address -> (Token ID -> Listing Data)
    mapping(address => mapping(uint256 => Listing)) public listings;

    function createListing(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external {
        // There must be a price of a listing
        require(price > 0, "MRKT: Price must be > 0");

        // Listing must not already exist
        require(
            listings[nftAddress][tokenId].price == 0,
            "MRKT: Already Listed"
        );

        //caller must be the owner of the nft , and has approved
        //the marketplace contract to transfer on their behalf
        IERC721 nftContract = IERC721(nftAddress);
        require(
            nftContract.ownerOf(tokenId) == msg.sender,
            "MRKT: Not the Owner"
        );
        require(
            nftContract.isApprovedForAll(msg.sender, address(this)) ||
                nftContract.getApproved(tokenId) == address(this),
            "MRKT: No approval for NFT"
        );

        // Add the listing to our mapping
        listings[nftAddress][tokenId] = Listing({
            price: price,
            seller: msg.sender
        });
    }
}
