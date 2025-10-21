export default function ConnectWallet({ address, connect, disconnect }) {
  const isConnected = !!address;

  return (
    <div className="flex items-center space-x-4">
      {isConnected ? (
        <div className="flex items-center bg-green-500/20 text-green-300 p-2 rounded-lg border border-green-500/30">
          <span className="text-sm">{address.slice(0, 6)}...{address.slice(-4)}</span>
          <button
            onClick={disconnect}
            className="ml-4 bg-red-500/80 hover:bg-red-600 px-4 py-1 rounded transition-colors text-white text-sm"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          className="bg-blue-500/80 hover:bg-blue-600 px-6 py-2 rounded-lg transition-colors text-white font-semibold"
        >
          Connect MetaMask
        </button>
      )}
    </div>
  );
}