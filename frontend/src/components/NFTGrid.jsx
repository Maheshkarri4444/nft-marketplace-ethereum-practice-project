import { useState } from 'react';
import { parseEther } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { approveForMarketplace, ADDRESSES } from '../utils/contracts';
import { MARKETPLACE_ABI } from '../abis/NFTMarketplace';

export default function NFTGrid({ nfts, type, walletClient }) {
    
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {nfts.map((nft) => {
        const isOwner =
          nft.owner?.toLowerCase() === walletClient.account.address.toLowerCase();
        const isListed = nft.price && BigInt(nft.price) > 0n; // detect from contract data

        return (
          <div key={nft.id} className="bg-white p-4 rounded shadow">
            <img
              src={`https://ipfs.io/ipfs/${nft.image?.split('ipfs://')[1] || 'QmFallback'}`}
              alt={nft.name || 'NFT'}
              className="w-full h-48 object-cover rounded mb-2"
              onError={(e) => {
                e.target.src = '/placeholder.jpg';
              }}
            />
            <h3 className="font-bold">{nft.name || `NFT #${nft.id}`}</h3>
            <p className="text-gray-600">{nft.description || 'No description available.'}</p>

            {type !== 'owned' && (
              <p className="text-sm text-gray-500">
                Owner: {nft.owner?.slice(0, 6)}...{nft.owner?.slice(-4)}
              </p>
            )}

            {nft.attributes?.map((attr, i) => (
              <p key={i} className="text-xs">
                {attr.trait_type}: {attr.value}
              </p>
            ))}

            {/* If this wallet owns the NFT, show List/Cancel */}
            {type === 'all' && isOwner && (
              isListed ? (
                <CancelButton tokenId={nft.id} walletClient={walletClient} />
              ) : (
                <ListButton tokenId={nft.id} walletClient={walletClient} />
              )
            )}
          </div>
        );
      })}
    </div>
  );
}

function ListButton({ tokenId, walletClient }) {
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleList = async () => {
    if (!price) return alert('Enter a price first!');
    if (!walletClient) return alert('Wallet not connected');

    try {
      setLoading(true);

      await approveForMarketplace({ walletClient });

      const txHash = await walletClient.writeContract({
        address: ADDRESSES.marketplace,
        abi: MARKETPLACE_ABI,
        functionName: 'createListing',
        args: [ADDRESSES.celoNFT, BigInt(tokenId), parseEther(price)],
      });

      console.log("📤 Transaction sent:", txHash);

      const receipt = await waitForTransactionReceipt(walletClient, { hash: txHash });
      console.log("📦 Transaction receipt:", receipt);

      if (receipt.status === 'success') {
        alert('✅ NFT listed successfully!');
        window.location.reload(); // reload to show Cancel button
      } else {
        alert('❌ Transaction failed or reverted.');
      }
    } catch (err) {
      console.error('❌ Listing failed:', err);
      alert('Listing failed. See console for details.');
    } finally {
      setLoading(false);
      setPrice('');
    }
  };

  return (
    <div className="mt-2">
      <input
        type="number"
        placeholder="Price (CELO)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="p-1 border w-full mb-1"
      />
      <button
        onClick={handleList}
        disabled={loading}
        className={`w-full p-1 rounded text-white transition-colors ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
        }`}
      >
        {loading ? 'Listing...' : 'List for Sale'}
      </button>
    </div>
  );
}

function CancelButton({ tokenId, walletClient }) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!walletClient) return alert('Wallet not connected');

    try {
      setLoading(true);

      const txHash = await walletClient.writeContract({
        address: ADDRESSES.marketplace,
        abi: MARKETPLACE_ABI,
        functionName: 'cancelListing',
        args: [ADDRESSES.celoNFT, BigInt(tokenId)],
      });

      console.log("🛑 Cancel tx sent:", txHash);

      const receipt = await waitForTransactionReceipt(walletClient, { hash: txHash });
      console.log("📦 Cancel receipt:", receipt);

      if (receipt.status === 'success') {
        alert('✅ Listing cancelled successfully!');
        window.location.reload(); // reload to show List button again
      } else {
        alert('❌ Transaction failed or reverted.');
      }

    } catch (err) {
      console.error('❌ Cancel failed:', err);
      alert('Cancel failed. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className={`w-full mt-2 p-1 rounded text-white transition-colors ${
        loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
      }`}
    >
      {loading ? 'Cancelling...' : 'Cancel Listing'}
    </button>
  );
}
