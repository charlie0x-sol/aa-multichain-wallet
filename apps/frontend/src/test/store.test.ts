import { describe, it, expect, beforeEach } from 'vitest';
import { useWalletStore } from '@/lib/store';

describe('useWalletStore', () => {
  beforeEach(() => {
    // Reset state before each test if possible, 
    // but Zustand stores persist, so we manually reset.
    const { setActiveChain, setEVMAddress, setSolanaAddress } = useWalletStore.getState();
    setActiveChain('ethereum');
    setEVMAddress(null);
    setSolanaAddress(null);
  });

  it('should initialize with default values', () => {
    const state = useWalletStore.getState();
    expect(state.activeChain).toBe('ethereum');
    expect(state.evmAddress).toBeNull();
    expect(state.solanaAddress).toBeNull();
  });

  it('should update activeChain', () => {
    const { setActiveChain } = useWalletStore.getState();
    setActiveChain('solana');
    expect(useWalletStore.getState().activeChain).toBe('solana');
  });

  it('should update evmAddress', () => {
    const { setEVMAddress } = useWalletStore.getState();
    const mockAddress = '0x123...';
    setEVMAddress(mockAddress);
    expect(useWalletStore.getState().evmAddress).toBe(mockAddress);
  });

  it('should update solanaAddress', () => {
    const { setSolanaAddress } = useWalletStore.getState();
    const mockAddress = 'ABC...';
    setSolanaAddress(mockAddress);
    expect(useWalletStore.getState().solanaAddress).toBe(mockAddress);
  });
});
