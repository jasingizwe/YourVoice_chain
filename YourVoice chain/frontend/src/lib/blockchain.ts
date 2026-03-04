import { BrowserProvider, Contract, Interface } from 'ethers';

const CONTRACT_ADDRESS = import.meta.env.VITE_EVIDENCE_CONTRACT_ADDRESS as string | undefined;

const CONTRACT_ABI = [
  'function registerUser() external',
  'function createCase(string _ipfsHash) external returns (uint256 caseId)',
  'function grantAccess(uint256 _caseId, address _organization) external',
  'function revokeAccess(uint256 _caseId, address _organization) external',
  'function approveOrganization(address _org) external',
  'function approvedOrganizations(address) external view returns (bool)',
  'function caseCounter() external view returns (uint256)',
  'event CaseCreated(uint256 indexed caseId, address indexed survivor, string ipfsHash, uint256 timestamp)',
];

declare global {
  interface Window {
    ethereum?: unknown;
  }
}

function getContract() {
  if (!window.ethereum) throw new Error('MetaMask not detected');
  if (!CONTRACT_ADDRESS) throw new Error('Contract address not configured');
  const provider = new BrowserProvider(window.ethereum as never);
  return { provider };
}

export function hasBlockchainConfig() {
  return !!CONTRACT_ADDRESS;
}

async function ensureRegistered(contract: Contract) {
  try {
    const tx = await contract.registerUser();
    await tx.wait();
  } catch (err: any) {
    const message = String(err?.shortMessage || err?.message || '');
    if (!message.toLowerCase().includes('already registered')) {
      throw err;
    }
  }
}

export async function createCaseOnChain(ipfsHash: string) {
  const { provider } = getContract();
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const contract = new Contract(CONTRACT_ADDRESS as string, CONTRACT_ABI, signer);

  await ensureRegistered(contract);

  const tx = await contract.createCase(ipfsHash);
  const receipt = await tx.wait();

  let onchainCaseId: string | null = null;
  try {
    const iface = new Interface(CONTRACT_ABI);
    for (const log of receipt.logs || []) {
      try {
        const parsed = iface.parseLog(log);
        if (parsed?.name === 'CaseCreated') {
          onchainCaseId = parsed.args.caseId.toString();
          break;
        }
      } catch {
        // ignore unknown logs
      }
    }
  } catch {
    // ignore, fallback below
  }

  if (!onchainCaseId) {
    const counter = await contract.caseCounter();
    onchainCaseId = counter.toString();
  }

  return { onchainCaseId: onchainCaseId as string, txHash: tx.hash as string };
}

async function sendContractTx(method: 'grantAccess' | 'revokeAccess', onchainCaseId: string, authorityAddress: string) {
  const { provider } = getContract();
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const contract = new Contract(CONTRACT_ADDRESS as string, CONTRACT_ABI, signer);

  const tx = await contract[method](BigInt(onchainCaseId), authorityAddress);
  await tx.wait();
  return tx.hash as string;
}

export async function grantCaseAccessOnChain(onchainCaseId: string, authorityAddress: string) {
  return sendContractTx('grantAccess', onchainCaseId, authorityAddress);
}

export async function revokeCaseAccessOnChain(onchainCaseId: string, authorityAddress: string) {
  return sendContractTx('revokeAccess', onchainCaseId, authorityAddress);
}

export async function approveOrganizationOnChain(walletAddress: string) {
  const { provider } = getContract();
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  const contract = new Contract(CONTRACT_ADDRESS as string, CONTRACT_ABI, signer);
  const tx = await contract.approveOrganization(walletAddress);
  await tx.wait();
  return tx.hash as string;
}

export async function isOrganizationApprovedOnChain(walletAddress: string) {
  const { provider } = getContract();
  const signer = await provider.getSigner();
  const contract = new Contract(CONTRACT_ADDRESS as string, CONTRACT_ABI, signer);
  return (await contract.approvedOrganizations(walletAddress)) as boolean;
}
