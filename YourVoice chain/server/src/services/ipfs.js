import crypto from 'crypto';
import fs from 'fs/promises';
import { env } from '../config/env.js';

export function makeLocalHash(buffer) {
  const digest = crypto.createHash('sha256').update(buffer).digest('hex');
  return `local-sha256-${digest}`;
}

async function pinBufferAndGetCid(buffer, { mimetype, originalname }) {
  if (!env.PINATA_JWT) {
    return { cid: makeLocalHash(buffer), source: 'local' };
  }

  const form = new FormData();
  form.append(
    'file',
    new Blob([buffer], { type: mimetype || 'application/octet-stream' }),
    originalname || 'evidence',
  );

  const metadata = JSON.stringify({
    name: originalname || 'evidence',
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

export async function pinFileAndGetCid(file) {
  if (!file?.buffer) {
    throw new Error('No file buffer received');
  }

  return pinBufferAndGetCid(file.buffer, {
    mimetype: file.mimetype,
    originalname: file.originalname,
  });
}

export async function pinFileFromPath(filePath, meta = {}) {
  const buffer = await fs.readFile(filePath);
  return pinBufferAndGetCid(buffer, meta);
}
