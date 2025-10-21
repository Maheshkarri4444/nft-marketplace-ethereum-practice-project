export default function ConnectWallet({ address, connect, disconnect }) {
  const isConnected = !!address;

  return (
    <div className="flex justify-center mb-8">
      {isConnected ? (
        <div className="flex items-center bg-green-500 text-white p-2 rounded">
          <span>{address.slice(0,6)}...{address.slice(-4)}</span>
          <button onClick={disconnect} className="ml-4 bg-red-500 px-4 py-1 rounded">Disconnect</button>
        </div>
      ) : (
        <button onClick={connect} className="bg-blue-500 text-white p-2 rounded">Connect MetaMask</button>
      )}
    </div>
  );
}