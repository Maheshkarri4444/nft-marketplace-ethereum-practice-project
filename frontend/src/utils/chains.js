export const CELO_SEPOLIA = {
  id: 11142220,
  name: 'Celo Sepolia',
  nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
  rpcUrls: { default: { http: [import.meta.env.VITE_CELO_RPC] } },
  blockExplorers: { default: { name: 'CeloScan', url: 'https://sepolia.celoscan.io' } },
};