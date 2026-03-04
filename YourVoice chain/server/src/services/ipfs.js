import crypto from 'crypto';
import { env } from '../config/env.js';

function makeLocalHash(buffer) {
  const digest = crypto.createHash('sha256').update(buffer).digest('hex');
  return `local-sha256-${digest}`;
}

export async function pinFileAndGetCid(file) {
  if (!file?.buffer) {
    throw new Error('No file buffer received');
  }

  if (!env.PINATA_JWT) {
    return { cid: makeLocalHash(file.buffer), source: 'local' };
  }

  const form = new FormData();
  form.append('file', new Blob([file.buffer], { type: file.mimetype || 'application/octet-stream' }), file.originalname || 'evidence');

  const metadata = JSON.stringify({
    name: file.originalname || 'evidence',
  });
  form.append('pinataMetadata', metadata);

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.PINATA_JWT}`,
    },
    body: form,
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`Pinata upload failed: ${msg || response.status}`);
  }

  const payload = await response.json();
  if (!payload?.IpfsHash) {
    throw new Error('Pinata did not return an IPFS hash');
  }

  return { cid: payload.IpfsHash, source: 'pinata' };
}
