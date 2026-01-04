# AA-Enabled Multichain Wallet Dashboard

A production-ready multichain wallet dashboard supporting EVM (Ethereum, Arbitrum) and Solana, featuring Account Abstraction (ERC-4337) for gasless transactions.

## 🚀 Features
- **Multichain Support**: Connect with RainbowKit (EVM) and Solana Wallet Adapter.
- **Account Abstraction**: Integrated with Pimlico/Permissionless for gasless UserOps.
- **Portfolio Analytics**: Real-time charts using Chart.js and mock data (Dune API ready).
- **Staking Vault**: Smart contracts for ETH and ERC-20 staking.
- **Solana Programs**: Anchor-based token transfer program.

## 🛠 Tech Stack
- **Monorepo**: Turborepo
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Zustand, SWR
- **EVM**: Solidity, Foundry, OpenZeppelin
- **Solana**: Rust, Anchor
- **AA Infrastructure**: Safe, Pimlico, Permissionless

## 📁 Structure
- `apps/frontend`: Next.js application.
- `packages/contracts-evm`: Solidity smart contracts and Forge tests.
- `packages/programs-solana`: Anchor programs.
- `packages/config`: Shared multichain configuration.

## 🚦 Getting Started
1. **Install dependencies**: `npm install`
2. **Setup environment**: Copy `.env.example` to `.env` and fill in API keys.
3. **Run development server**: `npx turbo dev`
4. **Run frontend tests**: `cd apps/frontend && npm test`

## 🔒 Security
A manual security audit has been performed. See `SECURITY_AUDIT.md` for details.

## 📝 Next Steps for Production
- Deploy EVM contracts to Sepolia/Mainnet using Foundry `forge script`.
- Deploy Solana programs to Devnet/Mainnet using `anchor deploy`.
- Configure Pimlico paymaster for gasless sponsorship.
- Connect real Dune API queries for analytics.
