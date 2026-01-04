'use client';

import { useWalletStore } from '@/lib/store';
import { clsx } from 'clsx';

const chains = [
  { id: 'ethereum', name: 'Ethereum' },
  { id: 'arbitrum', name: 'Arbitrum' },
  { id: 'solana', name: 'Solana' },
] as const;

export function ChainSwitcher() {
  const { activeChain, setActiveChain } = useWalletStore();

  return (
    <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
      {chains.map((chain) => (
        <button
          key={chain.id}
          onClick={() => setActiveChain(chain.id)}
          className={clsx(
            "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
            activeChain === chain.id 
              ? "bg-zinc-800 text-zinc-50 shadow-sm" 
              : "text-zinc-400 hover:text-zinc-200"
          )}
        >
          {chain.name}
        </button>
      ))}
    </div>
  );
}
