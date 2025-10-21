import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import NFTCard from './NFTCard';

export default function OwnedNFTs({ nfts, loading, walletClient, publicClient }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalidate and refetch owned NFTs query on route enter/mount
    queryClient.invalidateQueries({ queryKey: ['ownedNFTs'] });
  }, [queryClient]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-center">My NFTs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nfts.length === 0 ? (
          <p className="text-center text-gray-400 col-span-full">No NFTs owned yet. Mint some!</p>
        ) : (
          nfts.map((nft) => (
            <NFTCard key={nft.id} nft={nft} type="owned" walletClient={walletClient} publicClient={publicClient} />
          ))
        )}
      </div>
    </div>
  );
}