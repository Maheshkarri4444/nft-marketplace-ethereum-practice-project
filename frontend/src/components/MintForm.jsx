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
      alert('✅ Mint successful!');
      setStep(1);
      setMetadata({ name: '', description: '', attributes: [] });
      setImageURI('');
    } catch (err) {
      console.error(err);
      alert('❌ Mint failed.');
    }
    setLoading(false);
  };

  // 🔹 Add new attribute field
  const handleAddAttribute = () => {
    setMetadata({
      ...metadata,
      attributes: [...metadata.attributes, { trait_type: '', value: '' }],
    });
  };

  // 🔹 Update an attribute
  const handleAttributeChange = (index, field, value) => {
    const newAttrs = [...metadata.attributes];
    newAttrs[index][field] = value;
    setMetadata({ ...metadata, attributes: newAttrs });
  };

  // 🔹 Remove an attribute
  const handleRemoveAttribute = (index) => {
    const newAttrs = metadata.attributes.filter((_, i) => i !== index);
    setMetadata({ ...metadata, attributes: newAttrs });
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Mint New NFT</h2>

      {step === 1 && (
        <div className="text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mb-4 w-full"
          />
          {loading && (
            <div className="flex justify-center items-center text-purple-600">
              <svg
                className="animate-spin h-5 w-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Uploading image...
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleMetadataSubmit}>
          <input
            type="text"
            placeholder="Name"
            value={metadata.name}
            onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
            className="w-full p-2 border mb-2 rounded"
            required
          />
          <textarea
            placeholder="Description"
            value={metadata.description}
            onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
            className="w-full p-2 border mb-2 rounded"
            required
          />

          {/* 🔹 Dynamic Attributes Section */}
          <div className="mb-4">
            <label className="block font-semibold mb-2">Attributes</label>

            {metadata.attributes.map((attr, index) => (
              <div
                key={index}
                className="flex gap-2 items-center mb-2 bg-gray-50 p-2 rounded"
              >
                <input
                  type="text"
                  placeholder="Trait Type"
                  value={attr.trait_type}
                  onChange={(e) =>
                    handleAttributeChange(index, 'trait_type', e.target.value)
                  }
                  className="flex-1 p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={attr.value}
                  onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveAttribute(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddAttribute}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              + Add Attribute
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white p-2 rounded ${loading ? 'bg-gray-400' : 'bg-purple-500 hover:bg-purple-600'
              }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Minting NFT...
              </div>
            ) : (
              'Mint NFT'
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full bg-gray-500 text-white p-2 rounded mt-2 hover:bg-gray-600"
          >
            Back
          </button>
        </form>
      )}
    </div>
  );
}
