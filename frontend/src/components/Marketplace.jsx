import { useState, useEffect } from 'react';
import { fetchListing, ADDRESSES } from '../utils/contracts';
import { MARKETPLACE_ABI } from '../abis/NFTMarketplace';
import NFTCard from './NFTCard';

export default function Marketplace({ nfts, loading, walletClient, publicClient }) {
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);

  useEffect(() => {
    async function loadListings() {
      if (!nfts.length) {
        setListingsLoading(false);
        return;
      }
      setListingsLoading(true);
      const withListings = await Promise.all(
        nfts.map(async (nft) => {
          const listing = await fetchListing({ tokenId: nft.id, publicClient });
          return listing ? { ...nft, ...listing } : null;
        })
      );
      setListings(withListings.filter(Boolean));
      setListingsLoading(false);
    }
    loadListings();
  }, [nfts, publicClient]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-center">Marketplace</h2>
      {listingsLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.length === 0 ? (
            <p className="text-center text-gray-400 col-span-full">No active listings.</p>
          ) : (
            listings.map((nft) => (
              <NFTCard key={nft.id} nft={nft} type="marketplace" walletClient={walletClient} publicClient={publicClient} />
            ))
          )}
        </div>
      )}
    </div>
  );
}