'use client';

interface Transaction {
  id: string;
  type: 'Stake' | 'Unstake' | 'Transfer' | 'Receive';
  amount: string;
  token: string;
  timestamp: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

const mockTransactions: Transaction[] = [
  { id: '1', type: 'Transfer', amount: '0.5', token: 'ETH', timestamp: '2 hours ago', status: 'Completed' },
  { id: '2', type: 'Receive', amount: '100', token: 'USDC', timestamp: '5 hours ago', status: 'Completed' },
  { id: '3', type: 'Stake', amount: '1.2', token: 'ETH', timestamp: '1 day ago', status: 'Completed' },
];

export function TransactionHistory() {
  return (
    <div className="space-y-4">
      {mockTransactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              tx.type === 'Receive' ? 'bg-green-500/10 text-green-500' : 'bg-indigo-500/10 text-indigo-500'
            }`}>
              {tx.type[0]}
            </div>
            <div>
              <div className="text-sm font-medium">{tx.type} {tx.token}</div>
              <div className="text-xs text-zinc-500">{tx.timestamp}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">{tx.type === 'Receive' ? '+' : '-'}{tx.amount}</div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{tx.status}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
