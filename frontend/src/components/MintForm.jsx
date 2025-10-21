import { useState } from 'react';
import { uploadImage, uploadMetadata } from '../utils/pinata';
import { ADDRESSES } from '../utils/contracts';
import { CELONFT_ABI } from '../abis/CeloNFT';

export default function MintForm({ walletClient }) {
  const [step, setStep] = useState(1);
  const [imageURI, setImageURI] = useState('');
  const [metadata, setMetadata] = useState({ name: '', description: '', attributes: [] });
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const uri = await uploadImage(file);
      setImageURI(uri);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert('Image upload failed.');
    }
    setLoading(false);
  };

  const handleMetadataSubmit = async (e) => {
    e.preventDefault();
    if (!walletClient) {
      alert('Wallet not connected');
      return;
    }
    setLoading(true);
    try {
      const tokenURI = await uploadMetadata(imageURI, metadata);
      await walletClient.writeContract({
        address: ADDRESSES.celoNFT,
        abi: CELONFT_ABI,
        functionName: 'mintNFT',
        args: [tokenURI],
      });
      alert('Mint successful!');
      setStep(1);
      setMetadata({ name: '', description: '', attributes: [] });
      setImageURI('');
    } catch (err) {
      console.error(err);
      alert('Mint failed.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl mb-4">Mint New NFT</h2>

      {step === 1 && (
        <div>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />
          {loading && <p>Uploading image...</p>}
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleMetadataSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={metadata.name}
            onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
            className="w-full p-2 border mb-2"
            required
          />
          <textarea
            placeholder="Description"
            value={metadata.description}
            onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
            className="w-full p-2 border mb-2"
            required
          />
          <div className="mb-2">
            <label>Attributes (optional, JSON array):</label>
            <textarea
              placeholder='[{"trait_type":"Artist","value":"Mahesh"}]'
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value || '[]');
                  setMetadata({ ...metadata, attributes: parsed });
                } catch {
                  alert('Invalid JSON');
                }
              }}
              className="w-full p-2 border"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-500 text-white p-2 rounded"
          >
            {loading ? 'Uploading Metadata...' : 'Mint NFT'}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full bg-gray-500 text-white p-2 rounded mt-2"
          >
            Back
          </button>
        </form>
      )}
    </div>
  );
}