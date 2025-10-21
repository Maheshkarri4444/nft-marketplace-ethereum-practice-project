import { useState } from 'react';
import { parseEther } from 'viem';
import { approveForMarketplace, ADDRESSES } from '../utils/contracts';
import { MARKETPLACE_ABI } from '../abis/NFTMarketplace';

export default function NFTGrid({ nfts, type, walletClient }) {
    nfts.map((nft) => (
        console.log(`image link https://ipfs.io/ipfs/${nft.image?.split('ipfs://')[1]}`)
    ));
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {nfts.map((nft) => (
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
          {type === 'all' && <ListButton tokenId={nft.id} walletClient={walletClient} />}
        </div>
      ))}
    </div>
  );
}

function ListButton({ tokenId, walletClient }) {
  const [price, setPrice] = useState('');

  const handleList = async () => {
    if (!price) return alert('Enter a price first!');
    if (!walletClient) {
      alert('Wallet not connected');
      return;
    }
    try {
      await approveForMarketplace({ walletClient });
      await walletClient.writeContract({
        address: ADDRESSES.marketplace,
        abi: MARKETPLACE_ABI,
        functionName: 'createListing',
        args: [ADDRESSES.celoNFT, BigInt(tokenId), parseEther(price)],
      });
      alert('NFT listed for sale!');
      setPrice('');
    } catch (err) {
      console.error(err);
      alert('Listing failed.');
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
        className="w-full bg-yellow-500 text-white p-1 rounded hover:bg-yellow-600"
      >
        List for Sale
      </button>
    </div>
  );
}