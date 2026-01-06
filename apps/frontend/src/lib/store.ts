import { create } from 'zustand';

interface WalletState {
  activeChain: 'ethereum' | 'arbitrum' | 'solana';
  evmAddress: string | null;
  solanaAddress: string | null;
  setActiveChain: (chain: 'ethereum' | 'arbitrum' | 'solana') => void;
  setEVMAddress: (address: string | null) => void;
  setSolanaAddress: (address: string | null) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  activeChain: 'ethereum',
  evmAddress: null,
  solanaAddress: null,
  setActiveChain: (chain) => set({ activeChain: chain }),
  setEVMAddress: (address) => set({ evmAddress: address }),
  setSolanaAddress: (address) => set({ solanaAddress: address }),
}));
