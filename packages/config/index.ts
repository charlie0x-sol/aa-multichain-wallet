export const CHAINS = {
  ETHEREUM: 1,
  ARBITRUM: 42161,
  SEPOLIA: 11155111,
  SOLANA_MAINNET: 'mainnet-beta',
  SOLANA_DEVNET: 'devnet',
} as const;

export const SUPPORTED_CHAINS = [
  CHAINS.ETHEREUM,
  CHAINS.ARBITRUM,
  CHAINS.SEPOLIA,
] as const;

export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number];
