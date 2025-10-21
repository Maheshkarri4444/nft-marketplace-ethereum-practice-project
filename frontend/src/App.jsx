import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { createPublicClient, http, createWalletClient, custom } from 'viem';
import { CELO_SEPOLIA } from './utils/chains';
import ConnectWallet from './components/ConnectWallet';
import OwnedNFTs from './components/OwnedNFTs';
import AllNFTs from './components/AllNFTs';
import Marketplace from './components/Marketplace';
import MintNFT from './components/MintNFT';
import { fetchOwnedNFTs, fetchAllNFTs } from './utils/contracts';

function App() {
  const [address, setAddress] = useState(null);
  const [walletClient, setWalletClient] = useState(null);
  const navigate = useNavigate();

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
      console.log("account", account);
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Connection failed. Make sure MetaMask is on Celo Sepolia.');
    }
  };

  const disconnect = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        });
        console.log('Permissions revoked');
      } catch (error) {
        console.error('Failed to revoke permissions:', error);
        alert('Disconnect attempted. If still connected on refresh, manually revoke in MetaMask > Settings > Connected sites.');
      }
    }
    setAddress(null);
    setWalletClient(null);
    navigate('/');
  };

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAddress(null);
        setWalletClient(null);
        navigate('/');
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
  }, [navigate]);

  const { data: ownedNFTs = [], isLoading: ownedLoading } = useQuery({
    queryKey: ['ownedNFTs', address],
    queryFn: () => fetchOwnedNFTs({ address, publicClient }),
    enabled: !!address,
  });

  const { data: allNFTs = [], isLoading: allLoading } = useQuery({
    queryKey: ['allNFTs'],
    queryFn: () => fetchAllNFTs({ publicClient }),
    staleTime: 60000,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-400">Celo NFT Marketplace</h1>
          <ConnectWallet address={address} connect={connect} disconnect={disconnect} />
        </div>
      </header>

      {address ? (
        <>
          <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 p-4">
            <div className="container mx-auto flex justify-center space-x-6">
              <NavLink
                to="/owned"
                className={({ isActive }) =>
                  `px-6 py-3 rounded-lg border border-white/20 transition-all duration-300 ${
                    isActive ? 'bg-blue-500/80 text-white shadow-lg' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                My NFTs
              </NavLink>
              <NavLink
                to="/all"
                className={({ isActive }) =>
                  `px-6 py-3 rounded-lg border border-white/20 transition-all duration-300 ${
                    isActive ? 'bg-blue-500/80 text-white shadow-lg' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                All NFTs
              </NavLink>
              <NavLink
                to="/marketplace"
                className={({ isActive }) =>
                  `px-6 py-3 rounded-lg border border-white/20 transition-all duration-300 ${
                    isActive ? 'bg-blue-500/80 text-white shadow-lg' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                Marketplace
              </NavLink>
              <NavLink
                to="/mint"
                className={({ isActive }) =>
                  `px-6 py-3 rounded-lg border border-white/20 transition-all duration-300 ${
                    isActive ? 'bg-blue-500/80 text-white shadow-lg' : 'text-gray-300 hover:text-white'
                  }`
                }
              >
                Mint New
              </NavLink>
            </div>
          </nav>
          <main className="container mx-auto p-8">
            <Routes>
              <Route path="/" element={<Navigate to="/owned" />} />
              <Route
                path="/owned"
                element={
                  <OwnedNFTs
                    nfts={ownedNFTs}
                    loading={ownedLoading}
                    walletClient={walletClient}
                    publicClient={publicClient}
                  />
                }
              />
              <Route
                path="/all"
                element={
                  <AllNFTs
                    nfts={allNFTs}
                    loading={allLoading}
                    walletClient={walletClient}
                    publicClient={publicClient}
                  />
                }
              />
              <Route
                path="/marketplace"
                element={
                  <Marketplace
                    nfts={allNFTs}
                    loading={allLoading}
                    walletClient={walletClient}
                    publicClient={publicClient}
                  />
                }
              />
              <Route path="/mint" element={<MintNFT walletClient={walletClient} />} />
            </Routes>
          </main>
        </>
      ) : (
        <main className="flex items-center justify-center min-h-[calc(100vh-120px)] p-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-300">Connect your wallet</h2>
            <p className="text-gray-400">To explore the marketplace and mint NFTs</p>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;