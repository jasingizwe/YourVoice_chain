import { ethers } from 'ethers';
import { env } from '../config/env.js';
import { logError, logInfo } from './logger.js';

const CONTRACT_ABI = [
  'function registerUser() external',
  'function createCase(string _ipfsHash) external returns (uint256 caseId)',
  'function grantAccess(uint256 _caseId, address _organization) external',
  'function revokeAccess(uint256 _caseId, address _organization) external',
  'event CaseCreated(uint256 indexed caseId, address indexed survivor, string ipfsHash, uint256 timestamp)',
];

function getContract() {
  if (!env.WALLET_PRIVATE_KEY || !env.EVIDENCE_CONTRACT_ADDRESS) return null;
  const provider = new ethers.JsonRpcProvider(env.RPC_URL);
  const wallet = new ethers.Wallet(env.WALLET_PRIVATE_KEY, provider);
  return new ethers.Contract(env.EVIDENCE_CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
}

/**
 * Anchor a case's IPFS hash on-chain.
 * Returns { onchainCaseId, txHash } or null if blockchain is not configured / fails.
 */
export async function anchorEvidenceOnChain(ipfsHash) {
  const contract = getContract();
  if (!contract) return null;

  try {
    // Register the server wallet as a user if not already (safe to call multiple times)
    try {
      const regTx = await contract.registerUser();
      await regTx.wait();
    } catch (err) {
      const msg = String(err?.shortMessage || err?.message || '');
      if (!msg.toLowerCase().includes('already registered')) throw err;
    }

    const tx = await contract.createCase(ipfsHash);
    const receipt = await tx.wait();

    // Parse the CaseCreated event to get the on-chain case ID
    let onchainCaseId = null;
    const iface = new ethers.Interface(CONTRACT_ABI);
    for (const log of receipt.logs || []) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed?.name === 'CaseCreated') {
          onchainCaseId = parsed.args.caseId.toString();
          break;
        }
      } catch {
        // skip unrelated logs
      }
    }

    if (!onchainCaseId) {
      const counter = await contract.caseCounter().catch(() => null);
      if (counter) onchainCaseId = counter.toString();
    }

    logInfo('Evidence anchored on-chain', { ipfsHash, txHash: tx.hash, onchainCaseId });
    return { onchainCaseId, txHash: tx.hash };
  } catch (err) {
    logError('Blockchain anchoring failed', err instanceof Error ? err : new Error(String(err)));
    return null;
  }
}

/**
 * Record an access grant on-chain.
 * Returns txHash or null.
 */
export async function grantAccessOnChain(onchainCaseId, authorityWalletAddress) {
  const contract = getContract();
  if (!contract || !onchainCaseId || !authorityWalletAddress) return null;

  try {
    const tx = await contract.grantAccess(BigInt(onchainCaseId), authorityWalletAddress);
    await tx.wait();
    logInfo('Access granted on-chain', { onchainCaseId, authorityWalletAddress, txHash: tx.hash });
    return tx.hash;
  } catch (err) {
    logError('On-chain grant failed', err instanceof Error ? err : new Error(String(err)));
    return null;
  }
}

/**
 * Record an access revocation on-chain.
 * Returns txHash or null.
 */
export async function revokeAccessOnChain(onchainCaseId, authorityWalletAddress) {
  const contract = getContract();
  if (!contract || !onchainCaseId || !authorityWalletAddress) return null;

  try {
    const tx = await contract.revokeAccess(BigInt(onchainCaseId), authorityWalletAddress);
    await tx.wait();
    logInfo('Access revoked on-chain', { onchainCaseId, authorityWalletAddress, txHash: tx.hash });
    return tx.hash;
  } catch (err) {
    logError('On-chain revoke failed', err instanceof Error ? err : new Error(String(err)));
    return null;
  }
}
