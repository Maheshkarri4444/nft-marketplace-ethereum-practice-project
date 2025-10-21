import { useState } from 'react';
import { uploadImage, uploadMetadata } from '../utils/pinata';
import { ADDRESSES } from '../utils/contracts';
import { CELONFT_ABI } from '../abis/CeloNFT';

export default function MintNFT({ walletClient }) {
  const [step, setStep] = useState(1);
  const [imageURI, setImageURI] = useState('');
  const [metadata, setMetadata] = useState({ name: '', description: '', attributes: [] });
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadLoading(true);
    try {
      const uri = await uploadImage(file);
      setImageURI(uri);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert('Image upload failed.');
    }
    setUploadLoading(false);
  };

  const handleMetadataSubmit = async (e) => {
    e.preventDefault();
    if (!walletClient) {
      alert('Wallet not connected');
      return;
    }
    if (!metadata.name || !metadata.description) {
      alert('Name and description are required');
      return;
    }
    setLoading(true);
    try {
      const tokenURI = await uploadMetadata(imageURI, metadata);
      const tx = await walletClient.writeContract({
        address: ADDRESSES.celoNFT,
        abi: CELONFT_ABI,
        functionName: 'mintNFT',
        args: [tokenURI],
      });
      console.log('Mint tx:', tx);
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

  const handleAddAttribute = () => {
    setMetadata({
      ...metadata,
      attributes: [...metadata.attributes, { trait_type: '', value: '' }],
    });
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttrs = [...metadata.attributes];
    newAttrs[index][field] = value;
    setMetadata({ ...metadata, attributes: newAttrs });
  };

  const handleRemoveAttribute = (index) => {
    const newAttrs = metadata.attributes.filter((_, i) => i !== index);
    setMetadata({ ...metadata, attributes: newAttrs });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Mint New NFT</h2>
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8">
        {step === 1 && (
          <div className="text-center">
            <label className="block mb-4 text-gray-300">
              Upload your NFT image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 bg-white/10 border border-white/20 rounded-lg p-4 w-full"
            />
            {uploadLoading && (
              <div className="flex justify-center items-center mt-4 text-blue-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mr-2"></div>
                Uploading image...
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleMetadataSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-gray-300">Name</label>
              <input
                type="text"
                placeholder="Enter NFT name"
                value={metadata.name}
                onChange={(e) => setMetadata({ ...metadata, name: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-300">Description</label>
              <textarea
                placeholder="Enter NFT description"
                value={metadata.description}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 h-24"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-300 font-semibold">Attributes</label>
              {metadata.attributes.map((attr, index) => (
                <div key={index} className="flex gap-2 items-center mb-2 bg-white/5 p-3 rounded-lg">
                  <input
                    type="text"
                    placeholder="Trait Type"
                    value={attr.trait_type}
                    onChange={(e) => handleAttributeChange(index, 'trait_type', e.target.value)}
                    className="flex-1 p-2 bg-white/5 border border-white/20 rounded text-white placeholder-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={attr.value}
                    onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                    className="flex-1 p-2 bg-white/5 border border-white/20 rounded text-white placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveAttribute(index)}
                    className="bg-red-500/80 hover:bg-red-600 text-white px-3 py-2 rounded transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddAttribute}
                className="bg-blue-500/80 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors mt-2"
              >
                + Add Attribute
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg transition-all ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-500/80 hover:bg-blue-600'
              } text-white font-semibold`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Minting NFT...
                </div>
              ) : (
                'Mint NFT'
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-3 bg-gray-600/80 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Back to Upload
            </button>
          </form>
        )}
      </div>
    </div>
  );
}