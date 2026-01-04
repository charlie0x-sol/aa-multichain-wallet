# Master Build Instructions: AA-Enabled Multichain Wallet Dashboard

## CRITICAL PRINCIPLES - READ FIRST

1. **Build vertically, never horizontally**: Complete ONE feature end-to-end (contract → API → UI) before touching another feature
2. **Working code over perfect code**: Deliver functional implementations first, optimize later
3. **Test as you build**: Every contract function gets a test before moving on
4. **No placeholders**: Every component must be functional, not a "TODO" skeleton
5. **Explicit error handling**: Every async operation must have try/catch with user-facing error messages

## TECH STACK - NON-NEGOTIABLE

- **Monorepo**: Turborepo
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **EVM Contracts**: Solidity 0.8.20+, Foundry, OpenZeppelin
- **Solana Programs**: Anchor 0.29+, Rust 1.75+
- **Wallet Adapters**: RainbowKit (EVM), @solana/wallet-adapter-react (Solana)
- **AA Infrastructure**: Safe SDK, Pimlico (bundler/paymaster)
- **State Management**: Zustand (NOT Redux, NOT Context for complex state)
- **Charts**: Chart.js with react-chartjs-2
- **Testing**: Foundry (Solidity), Anchor test (Rust), Vitest (Frontend), Playwright (E2E)

## BUILD ORDER - STRICT SEQUENCE

### PHASE 0: Setup (Complete before ANY code)
1. Initialize Turborepo with exact structure:
   ```
   /apps/frontend          (Next.js app)
   /packages/contracts-evm (Foundry project)
   /packages/programs-solana (Anchor project)
   /packages/config        (Shared TS configs)
   ```
2. Install ALL dependencies in one shot - provide complete package.json files
3. Set up Git with `.gitignore` for node_modules, .env, target/, out/
4. Create `.env.example` with ALL required keys: ALCHEMY_API_KEY, HELIUS_API_KEY, PIMLICO_API_KEY, NEXT_PUBLIC_WALLET_CONNECT_ID

**Checkpoint**: `turbo dev` runs without errors, all packages visible

### PHASE 1: EVM Smart Contracts (Days 3-5)

**Order of Implementation:**
1. **First**: SimpleSmartAccount.sol (basic AA account with ERC-4337 interfaces)
2. **Second**: Tests for SimpleSmartAccount (forge test)
3. **Third**: StakingVault.sol (ETH/ERC-20 staking with AA compatibility)
4. **Fourth**: Tests for StakingVault
5. **Fifth**: Deploy scripts for Sepolia

**Mandatory Contract Patterns:**

```solidity
// ALWAYS include in every contract:
// 1. SPDX license
// 2. NatSpec comments (@notice, @param, @return)
// 3. Custom errors (not revert strings)
// 4. Events for state changes
// 5. ReentrancyGuard on external functions handling value
// 6. Input validation with descriptive errors

// Example template:
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @notice Smart account implementing ERC-4337 for gasless transactions
contract SimpleSmartAccount is ReentrancyGuard {
    error InvalidUserOp();
    error InsufficientFunds(uint256 required, uint256 available);
    
    event UserOpExecuted(bytes32 indexed userOpHash, bool success);
    
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external returns (uint256 validationData) {
        // Implementation
    }
}
```

**Testing Requirements:**
- Every function needs at least 2 tests: success case + failure case
- Use fuzz testing for numeric inputs: `function testFuzz_stake(uint256 amount)`
- Test gas costs: `assertTrue(gasleft() < 100000, "Ops too expensive")`

**Deploy Checklist:**
- Verify on Etherscan immediately after deploy
- Save deployed addresses to `/packages/config/deployments.json`
- Test at least one transaction on testnet before marking complete

**Anti-patterns to AVOID:**
- ❌ No Hardhat (we use Foundry)
- ❌ No console.log in contracts (use forge debug)
- ❌ No floating pragma (always ^0.8.20)
- ❌ No unchecked math without explicit reasoning

### PHASE 2: Solana Programs (Days 6-7)

**Order of Implementation:**
1. Initialize Anchor project with correct Anchor.toml
2. Implement token_transfer instruction with full error handling
3. Write Rust tests (at least 3 per instruction)
4. Deploy to devnet and test with Solana CLI

**Mandatory Anchor Patterns:**

```rust
// ALWAYS structure programs like this:
use anchor_lang::prelude::*;

declare_id!("YourProgramIDHere"); // Update after first build

#[program]
pub mod multichain_wallet {
    use super::*;
    
    pub fn transfer_token(
        ctx: Context<TransferToken>,
        amount: u64,
    ) -> Result<()> {
        // 1. Input validation FIRST
        require!(amount > 0, ErrorCode::InvalidAmount);
        
        // 2. Business logic
        let cpi_accounts = anchor_spl::token::Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        
        // 3. Log for debugging
        msg!("Transferring {} tokens", amount);
        
        // 4. Execute
        anchor_spl::token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
            amount
        )?;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferToken<'info> {
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Amount must be greater than 0")]
    InvalidAmount,
}
```

**Testing Requirements:**
- Test with `anchor test --skip-local-validator` (uses actual devnet)
- Include error tests: `assert!(result.is_err())`
- Test PDA derivations explicitly

**Checkpoint**: Successfully transfer SPL tokens on devnet using program

### PHASE 3: Frontend Foundation (Days 8-10)

**Order of Implementation:**
1. Set up providers (Wagmi + RainbowKit + Solana Wallet Adapter)
2. Build WalletConnect component (with chain switcher)
3. Create Zustand store for wallet state
4. Build dashboard layout with mock data
5. Implement ONE full feature: View ETH balance (contract query → display)

**Mandatory Frontend Structure:**

```
/apps/frontend/
├── app/
│   ├── layout.tsx          (Providers wrapper)
│   ├── page.tsx            (Dashboard)
│   └── providers.tsx       (All wallet providers)
├── components/
│   ├── wallet/
│   │   ├── WalletButton.tsx
│   │   └── ChainSwitcher.tsx
│   ├── dashboard/
│   │   ├── AssetCard.tsx
│   │   └── PortfolioChart.tsx
│   └── ui/                 (shadcn components)
├── lib/
│   ├── contracts/          (ABIs and contract helpers)
│   ├── solana/             (Solana connection helpers)
│   └── store.ts            (Zustand store)
└── hooks/
    ├── useEVMBalance.ts
    └── useSolanaBalance.ts
```

**Zustand Store Pattern:**

```typescript
// lib/store.ts
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
```

**Component Pattern (ALWAYS follow):**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export function AssetCard() {
  const { address } = useAccount();
  const [balance, setBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    
    async function fetchBalance() {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch logic here
        const bal = await getBalance(address);
        setBalance(bal);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch balance');
        console.error('Balance fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBalance();
  }, [address]);

  if (isLoading) return <div className="animate-pulse">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  
  return <div>Balance: {balance} ETH</div>;
}
```

**UI/UX Non-Negotiables:**
- Every async action shows loading state (spinner or skeleton)
- Every error shows user-friendly message (not raw error.message)
- All buttons have hover states and disabled states
- Mobile-first: test every component at 375px width
- Dark mode: use Tailwind's `dark:` classes everywhere
- Accessibility: every interactive element has aria-label

**Anti-patterns:**
- ❌ No useEffect for data fetching (use SWR or TanStack Query)
- ❌ No inline styles (Tailwind only)
- ❌ No `any` types (use proper TypeScript)
- ❌ No unhandled promises (always await or .catch())

### PHASE 4: AA Integration (Days 11-12)

**Implementation Order:**
1. Install Safe SDK and Pimlico SDK
2. Create SmartAccountProvider component
3. Implement createSmartAccount function
4. Build gasless transaction flow for ONE action (e.g., stake)
5. Test on Sepolia with real paymaster

**Critical AA Implementation Pattern:**

```typescript
// lib/aa/smartAccount.ts
import { createPimlicoBundlerClient } from 'permissionless/clients/pimlico';
import { http } from 'viem';

export async function sendGaslessTransaction(
  userOp: UserOperation,
  chainId: number
) {
  try {
    const bundlerUrl = `https://api.pimlico.io/v1/${chainId}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`;
    
    const bundler = createPimlicoBundlerClient({
      transport: http(bundlerUrl),
    });

    const userOpHash = await bundler.sendUserOperation({
      userOperation: userOp,
    });

    console.log('UserOp sent:', userOpHash);
    
    // Wait for confirmation
    const receipt = await bundler.waitForUserOperationReceipt({
      hash: userOpHash,
    });

    return { success: true, receipt };
  } catch (error) {
    console.error('Gasless tx failed:', error);
    throw new Error('Transaction failed. Please try again.');
  }
}
```

**Testing AA:**
- Test with testnet USDC paymaster (Pimlico docs)
- Verify no ETH deducted from user wallet
- Test recovery flow with 2 guardians

**Checkpoint**: Successfully execute one gasless transaction on Sepolia

### PHASE 5: Analytics & Charts (Days 13-14)

**Order:**
1. Set up Dune API integration (one query first)
2. Set up Helius DAS API for Solana
3. Build PortfolioChart component with real data
4. Add TransactionHistory component
5. Implement caching (SWR with 30s revalidation)

**Chart Implementation Pattern:**

```typescript
'use client';

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import useSWR from 'swr';

ChartJS.register(...registerables);

export function PortfolioChart({ address }: { address: string }) {
  const { data, error, isLoading } = useSWR(
    `/api/portfolio/${address}`,
    fetcher,
    { refreshInterval: 30000 } // 30s
  );

  if (isLoading) return <div>Loading chart...</div>;
  if (error) return <div>Failed to load chart</div>;

  const chartData = {
    labels: data.timestamps,
    datasets: [
      {
        label: 'Portfolio Value (USD)',
        data: data.values,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return <Line data={chartData} options={{ responsive: true }} />;
}
```

**API Route Pattern:**

```typescript
// app/api/portfolio/[address]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    
    // Validate address
    if (!address || address.length !== 42) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      );
    }

    // Fetch from Dune
    const response = await fetch(
      `https://api.dune.com/api/v1/query/${QUERY_ID}/results?address=${address}`,
      {
        headers: {
          'X-Dune-API-Key': process.env.DUNE_API_KEY!,
        },
      }
    );

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
```

### PHASE 6: Testing & Security (Days 15-17)

**Testing Checklist (in order):**

1. **Smart Contract Tests**:
   - Run `forge coverage` - must be >90%
   - Run `forge test --gas-report` - identify expensive functions
   - Run `slither .` - fix all HIGH/MEDIUM issues

2. **Frontend Tests**:
   - Write Vitest tests for all hooks and utilities
   - Write Playwright tests for critical flows:
     - Connect wallet
     - View balance
     - Execute gasless transaction
   - Test on mobile viewport (375px)

3. **Integration Tests**:
   - Test full flow: connect → stake → view transaction
   - Test chain switching (EVM ↔ Solana)
   - Test error scenarios (rejected tx, network error)

4. **Security Audit**:
   - Manual review of all contract logic
   - Check for common vulnerabilities: reentrancy, integer overflow, access control
   - Verify all user inputs are validated
   - Test rate limiting on API routes

**Playwright Test Pattern:**

```typescript
// e2e/wallet-connect.spec.ts
import { test, expect } from '@playwright/test';

test('user can connect wallet and view balance', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Click connect button
  await page.click('[aria-label="Connect Wallet"]');
  
  // Select MetaMask (in test env, use mock)
  await page.click('text=MetaMask');
  
  // Verify connected state
  await expect(page.locator('text=/0x[a-fA-F0-9]{40}/')).toBeVisible();
  
  // Verify balance loads
  await expect(page.locator('text=/Balance:/')).toBeVisible({ timeout: 5000 });
});
```

### PHASE 7: Deployment (Days 18-20)

**Deployment Checklist:**

1. **Smart Contracts to Mainnet**:
   ```bash
   # Verify you're on mainnet
   forge script script/Deploy.s.sol \
     --rpc-url $MAINNET_RPC \
     --broadcast \
     --verify
   ```
   - Save addresses immediately to deployments.json
   - Verify on Etherscan
   - Fund paymaster with USDC

2. **Frontend to Vercel**:
   ```bash
   vercel --prod
   ```
   - Set environment variables in Vercel dashboard
   - Test production build locally first: `npm run build && npm start`
   - Verify CSP headers are set

3. **Monitoring Setup**:
   - Add Sentry: `npx @sentry/wizard@latest -i nextjs`
   - Set up Vercel Analytics
   - Create alerts for error rates >1%

**Post-Deploy Verification:**
- Test on mainnet with small amounts (0.001 ETH)
- Verify gasless tx works with real paymaster
- Test from mobile device
- Check Lighthouse score (>90 required)

## RESPONSE FORMAT RULES

When providing code:
1. **Always provide COMPLETE files**, never snippets with "// rest of code here"
2. **Include ALL imports** at the top
3. **Add comments for complex logic**, but don't over-comment obvious code
4. **Show file path** as a comment at the top: `// app/components/WalletButton.tsx`
5. **Include error handling** in every async function
6. **Provide the command to run/test** the code after the code block

When updating existing code:
1. Show the FULL updated file, not just the changed lines
2. Mark changes with comments like `// CHANGED:` and `// NEW:`
3. Explain WHY the change was made

When something fails:
1. Show the full error message
2. Explain the root cause
3. Provide the fix
4. Provide a command to verify the fix worked

## DECISION RULES

**When to use client vs server components:**
- Server: Data fetching, static content, SEO-critical
- Client: User interactions, hooks (useState, useEffect), wallet connections

**When to use Solana vs EVM:**
- EVM: When gasless is critical, when AA features needed
- Solana: For high-frequency operations, lower base costs

**When to cache data:**
- Always cache RPC responses (>1s load time)
- Cache API responses for 30s minimum
- Never cache wallet balances (staleness issues)

**When to add dependencies:**
- Only add if it saves >100 lines of code
- Check bundle size impact: `npm run analyze`
- Prefer lighter alternatives (date-fns over moment)

## COMMON MISTAKES TO AVOID

1. **DON'T** build all contracts, then all frontend - interleave them
2. **DON'T** skip tests "to move faster" - they save time later
3. **DON'T** use mainnet for testing - always use testnets until Phase 7
4. **DON'T** hardcode addresses - use config files
5. **DON'T** commit .env files - use .env.example
6. **DON'T** use `any` type in TypeScript - use `unknown` then narrow
7. **DON'T** forget to handle mobile - test at 375px constantly
8. **DON'T** ignore TypeScript errors - fix them immediately
9. **DON'T** use inline event handlers - use named functions
10. **DON'T** fetch data on every render - use SWR/React Query

## SUCCESS CRITERIA

After each phase, verify:
- [ ] Code runs without errors
- [ ] Tests pass (>90% coverage)
- [ ] TypeScript has zero errors
- [ ] Mobile view works
- [ ] Dark mode works
- [ ] Loading states present
- [ ] Error handling present
- [ ] Git committed with clear message

## REFERENCE LINKS

- Foundry Docs: https://book.getfoundry.sh/
- Anchor Docs: https://www.anchor-lang.com/
- Safe SDK: https://docs.safe.global/
- Pimlico Docs: https://docs.pimlico.io/
- Dune API: https://docs.dune.com/api-reference/
- Helius API: https://docs.helius.dev/

## FINAL NOTES

- **Pace yourself**: Complete one phase fully before starting the next
- **Ask for clarification**: If requirements are ambiguous, ask before implementing
- **Show your work**: Explain decisions when deviating from the plan
- **Be honest about limitations**: If something is too complex, say so and propose alternatives
- **Celebrate wins**: Mark phases complete with a summary of what works
