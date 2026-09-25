import { RiskItem } from '../types/risk';

export interface BlockchainBlock {
  blockNumber: number;
  timestamp: string;
  txHash: string;
  previousHash: string;
  merkleRoot: string;
  contractAddress: string;
  gasUsed: number;
  action: string;
  riskId: string;
  author: string;
  verified: boolean;
}

// Simple SHA-256 string hash generator simulation
export function generateHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `0x${hex}${hex}${hex}${hex}`.slice(0, 42);
}

export function computeRiskMerkleRoot(risks: RiskItem[]): string {
  const combined = risks.map(r => `${r.id}:${r.score}:${r.status}:${r.mitigationProgress}:${r.lastUpdated}`).join('|');
  return generateHash(combined || 'genesis-block');
}

export function buildBlockchainLedger(risks: RiskItem[]): BlockchainBlock[] {
  const blocks: BlockchainBlock[] = [];
  const merkleRoot = computeRiskMerkleRoot(risks);
  const contractAddress = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

  let prevHash = '0x0000000000000000000000000000000000000000';

  // Genesis block
  blocks.push({
    blockNumber: 100001,
    timestamp: '2026-09-01T00:00:00Z',
    txHash: generateHash('genesis-block-mnb-research'),
    previousHash: prevHash,
    merkleRoot,
    contractAddress,
    gasUsed: 21000,
    action: 'Genesis Block Initialized - Risk Register Copilot Smart Contract Deployed',
    riskId: 'SYS-GENESIS',
    author: 'Smart Contract',
    verified: true
  });

  prevHash = blocks[0].txHash;

  risks.forEach((risk, index) => {
    const txContent = `${risk.id}:${risk.title}:${risk.score}:${risk.status}:${risk.lastUpdated}`;
    const txHash = generateHash(txContent);

    blocks.push({
      blockNumber: 100002 + index,
      timestamp: risk.createdAt || new Date().toISOString(),
      txHash,
      previousHash: prevHash,
      merkleRoot,
      contractAddress,
      gasUsed: 42000 + (index * 150),
      action: `State Mutation Sealed: [${risk.id}] ${risk.title} (Status: ${risk.status}, Progress: ${risk.mitigationProgress}%)`,
      riskId: risk.id,
      author: risk.ownerName || 'Governance Lead',
      verified: true
    });

    prevHash = txHash;
  });

  return blocks;
}
