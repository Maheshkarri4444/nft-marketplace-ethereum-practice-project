const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const PINATA_API_URL = 'https://api.pinata.cloud/pinning';

export async function uploadImage(file) {
  if (!file) throw new Error('No image file provided');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('pinataMetadata', JSON.stringify({ name: 'nft-image' }));

  const response = await fetch(`${PINATA_API_URL}/pinFileToIPFS`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${errorText}`);
  }

  const { IpfsHash } = await response.json();
  return `ipfs://${IpfsHash}`;
}

export async function uploadMetadata(imageURI, { name, description, attributes = [] }) {
  if (!PINATA_JWT) throw new Error('PINATA_JWT not set in env');

  const metadata = { name, description, image: imageURI, attributes };
  const response = await fetch(`${PINATA_API_URL}/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Metadata upload failed: ${response.status} - ${errorText}`);
  }

  const { IpfsHash } = await response.json();
  return `ipfs://${IpfsHash}`;
}