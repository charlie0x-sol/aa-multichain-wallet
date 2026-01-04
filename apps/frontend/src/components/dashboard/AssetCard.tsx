'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWalletStore } from '@/lib/store';

export function AssetCard() {
  const { activeChain } = useWalletStore();
  const { address: evmAddress, isConnected: isEVMConnected } = useAccount();
  const { publicKey: solanaPublicKey, connected: isSolanaConnected } = useWallet();
  const { connection } = useConnection();

  const [solBalance, setSolBalance] = useState<string>('0');
  const [isSolLoading, setIsSolLoading] = useState(false);
  const [solError, setSolError] = useState<string | null>(null);

  const { data: ethBalance, isLoading: isEthLoading, error: ethError } = useBalance({
    address: evmAddress,
  });

  useEffect(() => {
    if (activeChain === 'solana' && solanaPublicKey) {
      const fetchSolBalance = async () => {
        try {
          setIsSolLoading(true);
          setSolError(null);
          const balance = await connection.getBalance(solanaPublicKey);
          setSolBalance((balance / LAMPORTS_PER_SOL).toFixed(4));
        } catch (err) {
          setSolError('Failed to fetch SOL balance');
          console.error(err);
        } finally {
          setIsSolLoading(false);
        }
      };
      fetchSolBalance();
    }
  }, [activeChain, solanaPublicKey, connection]);

  if (activeChain === 'solana') {
    if (!isSolanaConnected) return <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-400">Connect Solana wallet to view balance</div>;
    if (isSolLoading) return <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse">Loading SOL balance...</div>;
    if (solError) return <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 text-red-500">{solError}</div>;
    return (
      <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
        <div className="text-zinc-400 text-sm mb-1">Native Balance</div>
        <div className="text-2xl font-bold">{solBalance} SOL</div>
      </div>
    );
  }

  if (!isEVMConnected) return <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-400">Connect EVM wallet to view balance</div>;
  if (isEthLoading) return <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 animate-pulse">Loading balance...</div>;
  if (ethError) return <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 text-red-500">Error fetching balance</div>;

  return (
    <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
      <div className="text-zinc-400 text-sm mb-1">Native Balance</div>
      <div className="text-2xl font-bold">
        {ethBalance?.formatted} {ethBalance?.symbol}
      </div>
    </div>
  );
}
