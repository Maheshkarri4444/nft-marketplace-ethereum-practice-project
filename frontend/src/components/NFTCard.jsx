import React, { useState, useEffect } from 'react';
import { parseEther, formatEther } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { approveForMarketplace, ADDRESSES } from '../utils/contracts';
import { MARKETPLACE_ABI } from '../abis/NFTMarketplace';
import { fetchListing } from '../utils/contracts';

export default function NFTCard({ nft, type, walletClient, publicClient }) {
  const [isListed, setIsListed] = useState(false);
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [listingPrice, setListingPrice] = useState(null);
  const [cardLoading, setCardLoading] = useState(true);

  useEffect(() => {
    async function checkListing() {
      if (!nft.id) return;
      setCardLoading(true);
      const listing = await fetchListing({ tokenId: nft.id, publicClient });
      if (listing) {
        setIsListed(true);
        setListingPrice(listing.price);
      }
      setCardLoading(false);
    }
    checkListing();
  }, [nft.id, publicClient]);

  const isOwner = nft.owner?.toLowerCase() === walletClient?.account.address.toLowerCase();

  if (cardLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 animate-pulse">
        <div className="h-48 bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-700 rounded mb-2 w-3/4"></div>
      </div>
    );
  }

const handleList = async () => {
  if (!price) return alert('Enter a price first!');
  if (!walletClient) return alert('Wallet not connected');
  setLoading(true);
  try {
    // 1️⃣ Approve and wait for mining
    const approveHash = await approveForMarketplace({ walletClient });
    const approveReceipt = await waitForTransactionReceipt(walletClient, { hash: approveHash });
    if (approveReceipt.status !== 'success') {
      throw new Error('Approval failed');
    }

    // 2️⃣ Then call createListing
    const txHash = await walletClient.writeContract({
      address: ADDRESSES.marketplace,
      abi: MARKETPLACE_ABI,
      functionName: 'createListing',
      args: [ADDRESSES.celoNFT, BigInt(nft.id), parseEther(price)],
    });

    const receipt = await waitForTransactionReceipt(walletClient, { hash: txHash });
    if (receipt.status === 'success') {
      alert('✅ NFT listed successfully!');
      setIsListed(true);
      setListingPrice(parseEther(price));
    } else {
      alert('❌ Transaction failed.');
    }
  } catch (err) {
    console.error('Listing failed:', err);
    alert('Listing failed.');
  }
  setLoading(false);
};


  const handleCancel = async () => {
    if (!walletClient) return alert('Wallet not connected');
    setLoading(true);
    try {
      const txHash = await walletClient.writeContract({
        address: ADDRESSES.marketplace,
        abi: MARKETPLACE_ABI,
        functionName: 'cancelListing',
        args: [ADDRESSES.celoNFT, BigInt(nft.id)],
      });
      const receipt = await waitForTransactionReceipt(walletClient, { hash: txHash });
      if (receipt.status === 'success') {
        alert('✅ Listing cancelled!');
        setIsListed(false);
        setListingPrice(null);
      } else {
        alert('❌ Cancel failed.');
      }
    } catch (err) {
      console.error('Cancel failed:', err);
      alert('Cancel failed.');
    }
    setLoading(false);
  };

  const handleBuy = async () => {
    if (!listingPrice || !walletClient) return;
    setLoading(true);
    try {
      const txHash = await walletClient.writeContract({
        address: ADDRESSES.marketplace,
        abi: MARKETPLACE_ABI,
        functionName: 'purchaseListing',
        args: [ADDRESSES.celoNFT, BigInt(nft.id)],
        value: listingPrice,
      });
      const receipt = await waitForTransactionReceipt(walletClient, { hash: txHash });
      if (receipt.status === 'success') {
        alert('✅ Purchase successful!');
        setIsListed(false);
        setListingPrice(null);
      } else {
        alert('❌ Purchase failed.');
      }
    } catch (err) {
      console.error('Purchase failed:', err);
      alert('Purchase failed.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
      <img
        src={`https://ipfs.io/ipfs/${nft.image?.split('ipfs://')[1] || 'QmY8v8zQ7yZ4w5x6y7z8'}`}
        alt={nft.name || `NFT #${nft.id}`}
        className="w-full h-48 object-cover rounded-lg mb-4"
        onError={(e) => {
          e.target.src = '/placeholder.svg'; // Assume you have a placeholder
        }}
      />
      <h3 className="font-bold text-xl mb-2">{nft.name || `NFT #${nft.id}`}</h3>
      <p className="text-gray-300 mb-4 line-clamp-2">{nft.description || 'No description available.'}</p>
      {type !== 'owned' && (
        <p className="text-sm text-gray-400 mb-4">
          Owner: {nft.owner?.slice(0, 6)}...{nft.owner?.slice(-4)}
        </p>
      )}
      {nft.attributes?.length > 0 && (
        <div className="mb-4 space-y-1">
          {nft.attributes.map((attr, i) => (
            <p key={i} className="text-xs text-gray-300">
              {attr.trait_type}: {attr.value}
            </p>
          ))}
        </div>
      )}

      {type === 'owned' && isOwner && (
        <>
          {!isListed ? (
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Price (CELO)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400"
              />
              <button
                onClick={handleList}
                disabled={loading}
                className={`w-full py-2 rounded transition-colors ${
                  loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-500/80 hover:bg-yellow-600'
                } text-white`}
              >
                {loading ? 'Listing...' : 'List for Sale'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleCancel}
              disabled={loading}
              className={`w-full py-2 rounded transition-colors ${
                loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-500/80 hover:bg-red-600'
              } text-white`}
            >
              {loading ? 'Cancelling...' : 'Cancel Listing'}
            </button>
          )}
        </>
      )}

      {(type === 'all' || type === 'marketplace') && isListed && !isOwner && listingPrice && (
        <button
          onClick={handleBuy}
          disabled={loading}
          className={`w-full py-2 rounded transition-colors ${
            loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-500/80 hover:bg-green-600'
          } text-white`}
        >
          {loading ? 'Buying...' : `Buy for ${formatEther(listingPrice)} CELO`}
        </button>
      )}
    </div>
  );
}