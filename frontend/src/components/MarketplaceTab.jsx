import { useEffect, useState } from 'react';
import { formatEther } from 'viem';
import { fetchListing, ADDRESSES } from '../utils/contracts';
import { MARKETPLACE_ABI } from '../abis/NFTMarketplace';

export default function MarketplaceTab({ nfts, walletClient, publicClient }) {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    async function loadListings() {
      const withListings = await Promise.all(
        nfts.map(async (nft) => {
          const listing = await fetchListing({ tokenId: nft.id, publicClient });
          return listing ? { ...nft, ...listing } : null;
        })
      );
      setListings(withListings.filter(Boolean));
    }
    if (nfts.length) loadListings();
  }, [nfts, publicClient]);
  console.log("listings in market place",listings);
  return (
    <div>
      <h2 className="text-2xl mb-4">Active Listings</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {listings.map((nft) => (
          <div key={nft.id} className="bg-white p-4 rounded shadow">
            <img
              src={`https://ipfs.io/ipfs/${nft.image.split('ipfs://')[1]}`}
              alt={nft.name}
              className="w-full h-48 object-cover rounded mb-2"
            />
            <h3 className="font-bold">{nft.name}</h3>
            <p className="text-gray-600">Seller: {nft.owner?.slice(0, 6)}...{nft.owner?.slice(-4)}</p>
            <p className="text-gray-600">{nft.description || 'No description available.'}</p>

            {nft.attributes?.map((attr, i) => (
              <p key={i} className="text-xs">
                {attr.trait_type}: {attr.value}
              </p>
            ))}
            {
                nft.owner?.toLowerCase() !== walletClient.account.address.toLowerCase() && (
                    <BuyButton tokenId={nft.id} price={nft.price} walletClient={walletClient} />
                )
            }
           
          </div>
        ))}
      </div>
    </div>
  );
}

function BuyButton({ tokenId, price, walletClient }) {
  const handleBuy = async () => {
    if (!walletClient) {
      alert('Wallet not connected');
      return;
    }
    try {
      await walletClient.writeContract({
        address: ADDRESSES.marketplace,
        abi: MARKETPLACE_ABI,
        functionName: 'purchaseListing',
        args: [ADDRESSES.celoNFT, BigInt(tokenId)],
        value: price,
      });
      alert('Purchase successful!');
    } catch (err) {
      console.error(err);
      alert('Purchase failed.');
    }
  };

  return (
    <button
      onClick={handleBuy}
      className="w-full bg-green-500 text-white p-2 rounded mt-2 hover:bg-green-600"
    >
      Buy for {formatEther(price)} CELO
    </button>
  );
}