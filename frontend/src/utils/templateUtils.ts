// ── Template Utilities ────────────────────────────────────────────────────────

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  path: string;
  hasReadme: boolean;
  documentationStatus: "complete" | "partial" | "missing";
  rustVersion?: string;
  features: string[];
  useCases: string[];
  exampleCode?: string;
  imageUrl?: string;
}

export interface TemplateCategory {
  name: string;
  description: string;
  count: number;
}

/**
 * Contract templates catalog with metadata
 */
export const TEMPLATES_CATALOG: TemplateMetadata[] = [
  {
    id: "hello-world",
    name: "Hello World",
    description: "Minimal Soroban contract example that returns a greeting message",
    category: "Getting Started",
    difficulty: "beginner",
    tags: ["basic", "hello", "starter"],
    path: "contracts/hello-world",
    hasReadme: true,
    documentationStatus: "complete",
    features: ["Simple function", "String return"],
    useCases: ["Learning", "Testing environment setup"],
    exampleCode: `#[contract]\npub struct Contract;\n\n#[contractimpl]\nimpl Contract {\n  pub fn hello() -> String {\n    "Hello, Soroban!".into()\n  }\n}`,
  },
  {
    id: "counter",
    name: "Counter",
    description: "Simple counter contract demonstrating state management and incrementation",
    category: "Getting Started",
    difficulty: "beginner",
    tags: ["state", "counter", "basic"],
    path: "contracts/counter",
    hasReadme: true,
    documentationStatus: "complete",
    features: ["State management", "Increment", "Decrement"],
    useCases: ["Learning state management", "Basic operations"],
  },
  {
    id: "token-contract",
    name: "Token Contract",
    description: "Full-featured token implementation with minting, burning, and transfers",
    category: "Tokens",
    difficulty: "intermediate",
    tags: ["token", "stellar", "mint", "burn"],
    path: "contracts/token_contract",
    hasReadme: true,
    documentationStatus: "complete",
    features: ["Minting", "Burning", "Transfers", "Balance tracking"],
    useCases: ["Custom token creation", "Asset issuance"],
  },
  {
    id: "amm-pool",
    name: "AMM Pool",
    description: "Automated Market Maker implementation for decentralized exchange",
    category: "DeFi",
    difficulty: "advanced",
    tags: ["dex", "amm", "trading", "liquidity"],
    path: "contracts/amm-pool",
    hasReadme: true,
    documentationStatus: "complete",
    features: ["Liquidity pools", "Swap functionality", "Price oracle"],
    useCases: ["Decentralized exchange", "Liquidity provision"],
  },
  {
    id: "lending-protocol",
    name: "Lending Protocol",
    description: "Comprehensive lending protocol with collateral management and interest rates",
    category: "DeFi",
    difficulty: "advanced",
    tags: ["lending", "collateral", "interest", "defi"],
    path: "contracts/lending-protocol",
    hasReadme: true,
    documentationStatus: "partial",
    features: ["Lending", "Borrowing", "Collateral management", "Interest calculation"],
    useCases: ["Decentralized lending", "Credit protocols"],
  },
  {
    id: "nft-marketplace",
    name: "NFT Marketplace",
    description: "Complete NFT marketplace with listing, bidding, and trading capabilities",
    category: "NFTs",
    difficulty: "advanced",
    tags: ["nft", "marketplace", "trading", "auction"],
    path: "contracts/nft-marketplace",
    hasReadme: true,
    documentationStatus: "partial",
    features: ["NFT listing", "Auction", "Bidding", "Trading"],
    useCases: ["Digital asset marketplace", "NFT trading platform"],
  },
  {
    id: "governance",
    name: "Governance",
    description: "DAO governance contract with voting, proposals, and treasury management",
    category: "Governance",
    difficulty: "advanced",
    tags: ["governance", "dao", "voting", "proposals"],
    path: "contracts/governance",
    hasReadme: true,
    documentationStatus: "complete",
    features: ["Voting", "Proposals", "Treasury", "DAO management"],
    useCases: ["Decentralized governance", "DAO operations"],
  },
  {
    id: "multisig-wallet",
    name: "Multisig Wallet",
    description: "Multi-signature wallet requiring multiple approvals for transactions",
    category: "Security",
    difficulty: "intermediate",
    tags: ["wallet", "multisig", "security", "approval"],
    path: "contracts/multisig-wallet",
    hasReadme: true,
    documentationStatus: "complete",
    features: ["Multi-signature", "Transaction approval", "Wallet management"],
    useCases: ["Secure fund management", "Team treasuries"],
  },
  {
    id: "staking",
    name: "Staking",
    description: "Staking contract with reward distribution and lockup periods",
    category: "DeFi",
    difficulty: "intermediate",
    tags: ["staking", "rewards", "lockup", "defi"],
    path: "contracts/staking",
    hasReadme: true,
    documentationStatus: "complete",
    features: ["Staking", "Reward distribution", "Lockup periods", "APY calculation"],
    useCases: ["Token incentivization", "Yield generation"],
  },
  {
    id: "escrow",
    name: "Escrow",
    description: "Escrow contract for secure asset transfer with third-party verification",
    category: "Security",
    difficulty: "intermediate",
    tags: ["escrow", "security", "settlement", "verification"],
    path: "contracts/escrow",
    hasReadme: true,
    documentationStatus: "complete",
    features: ["Escrow holding", "Release conditions", "Dispute resolution"],
    useCases: ["Secure transactions", "Conditional payments"],
  },
  {
    id: "supply-chain",
    name: "Supply Chain",
    description: "Supply chain tracking with product authentication and history logging",
    category: "Enterprise",
    difficulty: "intermediate",
    tags: ["supply-chain", "tracking", "authentication", "logistics"],
    path: "contracts/supply-chain",
    hasReadme: true,
    documentationStatus: "partial",
    features: ["Product tracking", "Authentication", "History logging", "Chain verification"],
    useCases: ["Supply chain transparency", "Product verification"],
  },
  {
    id: "did-registry",
    name: "DID Registry",
    description: "Decentralized Identity registry for identity management and verification",
    category: "Identity",
    difficulty: "advanced",
    tags: ["identity", "did", "verification", "decentralized"],
    path: "contracts/did-registry",
    hasReadme: true,
    documentationStatus: "partial",
    features: ["DID management", "Identity verification", "Credential storage"],
    useCases: ["Identity management", "Credential verification"],
  },
  {
    id: "access-control",
    name: "Access Control",
    description: "Role-based access control with permission management",
    category: "Security",
    difficulty: "beginner",
    tags: ["access-control", "rbac", "permissions", "security"],
    path: "contracts/access-control",
    hasReadme: true,
    documentationStatus: "complete",
    features: ["Role management", "Permission control", "Access verification"],
    useCases: ["Permission management", "Role-based security"],
  },
  {
    id: "quadratic-voting",
    name: "Quadratic Voting",
    description: "Quadratic voting system for fair and efficient democratic decisions",
    category: "Governance",
    difficulty: "advanced",
    tags: ["voting", "quadratic", "governance", "democracy"],
    path: "contracts/quadratic-voting",
    hasReadme: true,
    documentationStatus: "complete",
    features: ["Quadratic voting", "Fair allocation", "Vote counting"],
    useCases: ["Fair voting mechanisms", "Democratic decisions"],
  },
  {
    id: "oracle",
    name: "Price Oracle",
    description: "Price oracle contract for reliable on-chain price feeds",
    category: "Data",
    difficulty: "advanced",
    tags: ["oracle", "price-feed", "data", "reliability"],
    path: "contracts/price_feed_adapter",
    hasReadme: true,
    documentationStatus: "partial",
    features: ["Price feeds", "Data aggregation", "Consensus mechanisms"],
    useCases: ["Price information", "Data-driven contracts"],
  },
  {
    id: "synthetic-assets",
    name: "Synthetic Assets",
    description: "Synthetic asset protocol for creating derivatives and exposure to assets",
    category: "DeFi",
    difficulty: "advanced",
    tags: ["synthetic", "derivatives", "assets", "defi"],
    path: "contracts/synthetic-assets",
    hasReadme: true,
    documentationStatus: "partial",
    features: ["Synthetic creation", "Collateral management", "Price tracking"],
    useCases: ["Derivative trading", "Asset exposure without ownership"],
  },
  {
    id: "yield-farming",
    name: "Yield Farming",
    description: "Yield farming protocol with multiple reward pools and farming strategies",
    category: "DeFi",
    difficulty: "advanced",
    tags: ["yield-farming", "rewards", "pools", "defi"],
    path: "contracts/yield-farming",
    hasReadme: true,
    documentationStatus: "complete",
    features: ["Farming pools", "Reward distribution", "Strategy management"],
    useCases: ["Yield generation", "Reward incentives"],
  },
  {
    id: "flash-loan",
    name: "Flash Loan",
    description: "Flash loan protocol for uncollateralized loans within a single transaction",
    category: "DeFi",
    difficulty: "advanced",
    tags: ["flash-loan", "defi", "lending", "uncollateralized"],
    path: "contracts/flash-loan",
    hasReadme: true,
    documentationStatus: "partial",
    features: ["Flash lending", "Callback mechanism", "Atomic transactions"],
    useCases: ["Arbitrage", "Liquidation"],
  },
  {
    id: "music-royalty",
    name: "Music Royalty",
    description: "Music royalty distribution contract for fair artist compensation",
    category: "Entertainment",
    difficulty: "intermediate",
    tags: ["music", "royalty", "distribution", "artists"],
    path: "contracts/music-royalty",
    hasReadme: true,
    documentationStatus: "complete",
    features: ["Royalty tracking", "Payment distribution", "Artist management"],
    useCases: ["Music monetization", "Artist payments"],
  },
  {
    id: "stablecoin",
    name: "Stablecoin",
    description: "Stablecoin protocol with collateral management and peg mechanisms",
    category: "DeFi",
    difficulty: "advanced",
    tags: ["stablecoin", "collateral", "peg", "defi"],
    path: "contracts/stablecoin",
    hasReadme: true,
    documentationStatus: "complete",
    features: ["Minting", "Burning", "Collateral management", "Peg maintenance"],
    useCases: ["Stable value transfers", "DeFi primitive"],
  },
  {
    id: "token-vesting",
    name: "Token Vesting",
    description: "Token vesting contract with cliff and linear release schedules",
    category: "Tokens",
    difficulty: "intermediate",
    tags: ["vesting", "token", "release-schedule", "cliff"],
    path: "contracts/token-vesting",
    hasReadme: true,
    documentationStatus: "complete",
    features: ["Cliff periods", "Linear vesting", "Batch claims"],
    useCases: ["Employee incentives", "Token distribution"],
  },
];

/**
 * Extract categories from templates
 */
export function getCategories(): TemplateCategory[] {
  const categoryMap = new Map<string, number>();

  TEMPLATES_CATALOG.forEach((template) => {
    categoryMap.set(template.category, (categoryMap.get(template.category) || 0) + 1);
  });

  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({
      name,
      description: `${count} template(s)`,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Search templates by query string
 */
export function searchTemplates(query: string): TemplateMetadata[] {
  const lowerQuery = query.toLowerCase();

  return TEMPLATES_CATALOG.filter(
    (template) =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      template.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Filter templates by category
 */
export function filterTemplatesByCategory(category: string): TemplateMetadata[] {
  if (category === "all") return TEMPLATES_CATALOG;
  return TEMPLATES_CATALOG.filter((template) => template.category === category);
}

/**
 * Filter templates by difficulty
 */
export function filterTemplatesByDifficulty(
  templates: TemplateMetadata[],
  difficulty: string
): TemplateMetadata[] {
  if (difficulty === "all") return templates;
  return templates.filter((template) => template.difficulty === difficulty);
}

/**
 * Filter templates by documentation status
 */
export function filterTemplatesByDocStatus(
  templates: TemplateMetadata[],
  status: string
): TemplateMetadata[] {
  if (status === "all") return templates;
  return templates.filter((template) => template.documentationStatus === status);
}

/**
 * Get documentation status badge color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "complete":
      return "bg-emerald-400/20 text-emerald-200 border border-emerald-400/30";
    case "partial":
      return "bg-amber-400/20 text-amber-200 border border-amber-400/30";
    case "missing":
      return "bg-red-400/20 text-red-200 border border-red-400/30";
    default:
      return "bg-slate-400/20 text-slate-200 border border-slate-400/30";
  }
}

/**
 * Get difficulty badge color
 */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "beginner":
      return "bg-cyan-400/20 text-cyan-200 border border-cyan-400/30";
    case "intermediate":
      return "bg-amber-400/20 text-amber-200 border border-amber-400/30";
    case "advanced":
      return "bg-red-400/20 text-red-200 border border-red-400/30";
    default:
      return "bg-slate-400/20 text-slate-200 border border-slate-400/30";
  }
}
