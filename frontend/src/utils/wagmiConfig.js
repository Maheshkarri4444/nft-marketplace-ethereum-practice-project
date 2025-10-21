import { createConfig, http  , createPublicClient} from 'wagmi';
import { injected } from 'wagmi/connectors';
// Define Celo Sepolia manually (not included in viem/chains)
export const CELO_SEPOLIA = {
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
  rpcUrls: { default: { http: [import.meta.env.VITE_CELO_RPC] } },
  blockExplorers: { default: { name: 'CeloScan', url: 'https://sepolia.celoscan.io' } },
};

export const config = createConfig({
  chains: [CELO_SEPOLIA],
  connectors: [injected()],
  transports: {
    [CELO_SEPOLIA.id]: http(import.meta.env.VITE_CELO_RPC),
  },
});

export const publicClient = createPublicClient({
  chain: CELO_SEPOLIA,
  transport: http(import.meta.env.VITE_CELO_RPC),
})
