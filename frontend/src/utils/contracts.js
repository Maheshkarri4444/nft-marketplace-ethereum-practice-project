import { CELONFT_ABI } from '../abis/CeloNFT';
import { MARKETPLACE_ABI } from '../abis/NFTMarketplace';

export const ADDRESSES = {
  celoNFT: import.meta.env.VITE_CELONFT_ADDRESS,
  marketplace: import.meta.env.VITE_MARKETPLACE_ADDRESS,
};

export async function fetchOwnedNFTs({ address, publicClient }) {
    console.log("called fetch owned nfts")
    console.log("address: ",address);
  if (!address) return [];
  console.log("calling balance");
  console.log("public client",publicClient);
  console.log("celo nft address: ",ADDRESSES.celoNFT)
  const balance = await publicClient.readContract({
    address: ADDRESSES.celoNFT,
    abi: CELONFT_ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  console.log("balance:-",balance);
  const nfts = [];
  for (let i = 0; i < Number(balance); i++) {
    const tokenId = await publicClient.readContract({
      address: ADDRESSES.celoNFT,
      abi: CELONFT_ABI,
      functionName: 'tokenOfOwnerByIndex',
      args: [address, BigInt(i)],
    });
    const uri = await publicClient.readContract({
      address: ADDRESSES.celoNFT,
      abi: CELONFT_ABI,
      functionName: 'tokenURI',
      args: [tokenId],
    });
    const metadata = await fetchMetadata(uri);
    console.log("nfts owned: ", metadata);
    nfts.push({ id: tokenId.toString(), uri, ...metadata, owner: address });
  }
  return nfts;
}

export async function fetchAllNFTs({ publicClient }) {
  const supply = await publicClient.readContract({
    address: ADDRESSES.celoNFT,
    abi: CELONFT_ABI,
    functionName: 'totalSupply',
    args: [],
  });

  const nfts = [];
  for (let i = 0; i < Number(supply); i++) {
    const tokenId = await publicClient.readContract({
      address: ADDRESSES.celoNFT,
      abi: CELONFT_ABI,
      functionName: 'tokenByIndex',
      args: [BigInt(i)],
    });
    const owner = await publicClient.readContract({
      address: ADDRESSES.celoNFT,
      abi: CELONFT_ABI,
      functionName: 'ownerOf',
      args: [tokenId],
    });
    const uri = await publicClient.readContract({
      address: ADDRESSES.celoNFT,
      abi: CELONFT_ABI,
      functionName: 'tokenURI',
      args: [tokenId],
    });
    const metadata = await fetchMetadata(uri);
    nfts.push({ id: tokenId.toString(), uri, ...metadata, owner });
  }
  return nfts;
}

export async function fetchListing({ tokenId, publicClient }) {
  try {
    const listing = await publicClient.readContract({
      address: ADDRESSES.marketplace,
      abi: MARKETPLACE_ABI,
      functionName: 'getListing',
      args: [ADDRESSES.celoNFT, BigInt(tokenId)],
    });
    return listing.price > 0n ? { price: listing.price, seller: listing.seller } : null;
  } catch {
    return null;
  }
}

async function fetchMetadata(uri) {
    console.log("uri:",uri);
  if (!uri.startsWith('ipfs://')) return {};
  const cid = uri.replace('ipfs://', '');
  const res = await fetch(`https://ipfs.io/ipfs/${cid}`);
  return res.ok ? await res.json() : {};
}

export async function approveForMarketplace({ walletClient }) {
  return walletClient.writeContract({
    address: ADDRESSES.celoNFT,
    abi: CELONFT_ABI,
    functionName: 'setApprovalForAll',
    args: [ADDRESSES.marketplace, true],
  });
}