import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createPublicClient, http, createWalletClient, custom } from 'viem';
import { CELO_SEPOLIA } from './utils/chains';
import ConnectWallet from './components/ConnectWallet';
import NFTGrid from './components/NFTGrid';
import MintForm from './components/MintForm';
import MarketplaceTab from './components/MarketPlaceTab';
import { fetchOwnedNFTs, fetchAllNFTs } from './utils/contracts';

function App() {
  const [address, setAddress] = useState(null);
  const [walletClient, setWalletClient] = useState(null);
  const [tab, setTab] = useState('owned');

  const publicClient = createPublicClient({
    chain: CELO_SEPOLIA,
    transport: http(import.meta.env.VITE_CELO_RPC),
  });

  const connect = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        console.log('No accounts found');
        return;
      }

      const account = accounts[0];
      setAddress(account);
      setWalletClient(
        createWalletClient({
          account,
          chain: CELO_SEPOLIA,
          transport: custom(window.ethereum),
        })
      );
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Connection failed. Make sure MetaMask is on Celo Sepolia.');
    }
  };

  const disconnect = async () => {
    if (window.ethereum) {
      try {
        // Revoke permissions to truly disconnect (persists across refreshes)
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        });
        console.log('Permissions revoked');
      } catch (error) {
        console.error('Failed to revoke permissions:', error);
        // Fallback: User may need to manually disconnect in MetaMask settings
        alert('Disconnect attempted. If still connected on refresh, manually revoke in MetaMask > Settings > Connected sites.');
      }
    }
    setAddress(null);
    setWalletClient(null);
  };

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAddress(null);
        setWalletClient(null);
      } else {
        const account = accounts[0];
        setAddress(account);
        setWalletClient(
          createWalletClient({
            account,
            chain: CELO_SEPOLIA,
            transport: custom(window.ethereum),
          })
        );
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    const checkConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        handleAccountsChanged(accounts);
      } catch (error) {
        console.error('Failed to get accounts:', error);
      }
    };

    checkConnection();
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  const { data: ownedNFTs = [] } = useQuery({
    queryKey: ['ownedNFTs', address],
    queryFn: () => fetchOwnedNFTs({ address, publicClient }),
    enabled: !!address,
  });

  const { data: allNFTs = [] } = useQuery({
    queryKey: ['allNFTs'],
    queryFn: () => fetchAllNFTs({ publicClient }),
    staleTime: 60000,
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Celo NFT Marketplace</h1>
      <ConnectWallet address={address} connect={connect} disconnect={disconnect} />
      {address ? (
        <>
          <div className="flex justify-center mb-8">
            {['owned', 'all', 'marketplace', 'mint'].map((tabName) => (
              <button
                key={tabName}
                onClick={() => setTab(tabName)}
                className={`p-2 mx-2 rounded ${
                  tab === tabName ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {tabName === 'owned' && 'My NFTs'}
                {tabName === 'all' && 'All NFTs'}
                {tabName === 'marketplace' && 'Marketplace'}
                {tabName === 'mint' && 'Mint New'}
              </button>
            ))}
          </div>

          {tab === 'owned' && (
            <NFTGrid nfts={ownedNFTs} type="owned" walletClient={walletClient} />
          )}
          {tab === 'all' && (
            <NFTGrid nfts={allNFTs} type="all" walletClient={walletClient} />
          )}
          {tab === 'marketplace' && (
            <MarketplaceTab
              nfts={allNFTs}
              walletClient={walletClient}
              publicClient={publicClient}
            />
          )}
          {tab === 'mint' && <MintForm walletClient={walletClient} />}
        </>
      ) : (
        <p className="text-center">Connect wallet to get started</p>
      )}
    </div>
  );
}

export default App;