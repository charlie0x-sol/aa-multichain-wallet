'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWalletStore } from '@/lib/store';

export function WalletButton() {
  const { activeChain } = useWalletStore();
  const { connected: solanaConnected } = useWallet();

  if (activeChain === 'solana') {
    return (
      <div className="flex items-center gap-2">
         <WalletMultiButton className="!bg-indigo-600 hover:!bg-indigo-700 !rounded-lg !h-10 !px-4 !text-sm !font-medium transition-colors" />
      </div>
    );
  }

  return (
    <ConnectButton 
      chainStatus="icon"
      showBalance={false}
      accountStatus="address"
    />
  );
}
