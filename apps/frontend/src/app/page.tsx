import { ChainSwitcher } from "@/components/wallet/ChainSwitcher";
import { WalletButton } from "@/components/wallet/WalletButton";
import { AssetCard } from "@/components/dashboard/AssetCard";
import { PortfolioChart } from "@/components/dashboard/PortfolioChart";
import { TransactionHistory } from "@/components/dashboard/TransactionHistory";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Multichain Wallet</h1>
          <p className="text-zinc-400 text-sm">Manage assets across EVM and Solana</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <ChainSwitcher />
          <WalletButton />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-4 text-zinc-50">Portfolio Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AssetCard />
              <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-500 italic">
                Stake feature coming soon...
              </div>
            </div>
          </section>

          <section className="h-80 p-6 bg-zinc-900 rounded-xl border border-zinc-800">
            <h2 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Performance</h2>
            <div className="h-64">
              <PortfolioChart />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="p-6 bg-zinc-900 rounded-xl border border-zinc-800">
            <h2 className="text-lg font-semibold mb-4 text-zinc-50">Recent Activity</h2>
            <TransactionHistory />
          </section>
        </aside>
      </div>
    </main>
  );
}