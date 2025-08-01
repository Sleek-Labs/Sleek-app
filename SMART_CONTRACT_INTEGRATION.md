# 🚀 SLEEK: SMART CONTRACT INTEGRATION GUIDE

## ⚒️ TECH STACK RECAP
- **Frontend**: React Native / Expo, Solana Mobile Wallet Adapter
- **Backend** (if needed): Firebase / Supabase / Node (optional for caching or hybrid model)
- **Blockchain**: Solana
- **Smart Contract Framework**: Anchor (Rust-based Solana framework)

## 🧩 INTEGRATION ROADMAP (Phase-Wise)

### 🔹 Phase 1: Payment Smart Contract (SOL for Subscriptions)

**📦 Anchor Contract**: `subscription_payment`
```rust
#[derive(Accounts)]
pub struct ProcessPayment<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub treasury: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn process_payment(
    ctx: Context<ProcessPayment>,
    subscription_id: u64,
    amount: u64,
) -> Result<()> {
    // Transfer SOL from user to treasury
    let ix = system_instruction::transfer(
        &ctx.accounts.user.key(),
        &ctx.accounts.treasury.key(),
        amount,
    );
    
    anchor_lang::solana_program::program::invoke(
        &ix,
        &[
            ctx.accounts.user.to_account_info(),
            ctx.accounts.treasury.to_account_info(),
        ],
    )?;

    // Emit payment event
    emit!(PaymentProcessed {
        user: ctx.accounts.user.key(),
        subscription_id,
        amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}
```

**🔗 Frontend Integration (React Hook)**
```typescript
export const payForSubscription = async (userPubkey, amountLamports, treasuryPubkey) => {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: userPubkey,
      toPubkey: new PublicKey(treasuryPubkey),
      lamports: amountLamports,
    })
  );

  const { signature } = await window.solana.signAndSendTransaction(transaction);
  await connection.confirmTransaction(signature, 'processed');

  return { success: true, signature };
};
```

### 🔹 Phase 2: BONK Cashback Smart Contract

**🪙 Anchor Contract**: `bonk_rewards`
```rust
#[derive(Accounts)]
pub struct MintCashback<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub to: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn mint_cashback(ctx: Context<MintCashback>, amount: u64) -> Result<()> {
    token::mint_to(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.to.to_account_info(),
                authority: ctx.accounts.authority.clone(),
            },
        ),
        amount,
    )?;
    Ok(())
}
```

**🔗 Frontend Integration**
```typescript
// Use SPL-Token JS + Anchor to call the mint_cashback instruction
await program.methods
  .mintCashback(new BN(amount))
  .accounts({
    mint: bonkMint,
    to: userTokenAccount,
    authority: authorityPubkey,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .rpc();
```

### 🔹 Phase 3: Subscription NFT Contract

**🪪 Anchor Contract**: `subscription_nft`
```rust
#[derive(Accounts)]
pub struct MintSubscriptionNFT<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub metadata: AccountInfo<'info>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(signer)]
    pub user: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn mint_subscription_nft(ctx: Context<MintSubscriptionNFT>) -> Result<()> {
    // Mint NFT logic
    // Set subscription metadata
    // Assign NFT to user's associated token account
    Ok(())
}
```

## 🧪 TEST CASES PER MODULE

### ✅ Payment Contract
- User with SOL balance completes transaction
- Insufficient balance → throw error
- Incorrect subscription ID → fail gracefully

### ✅ BONK Rewards
- Successful cashback mint after payment
- Redemption burns/moves correct amount
- Rejected mint if BONK treasury empty

### ✅ NFT Subscription
- NFT minted upon purchase
- Metadata reflects tier and expiry
- Renewal extends subscription period

## 🌐 DEPLOYMENT TARGETS
- **Devnet first** (`solana config set --url https://api.devnet.solana.com`)
- **Deploy programs using Anchor**:
  ```bash
  anchor build && anchor deploy
  ```
- **Use program IDs in frontend via .env**:
  ```
  NEXT_PUBLIC_PAYMENT_PROGRAM_ID=
  NEXT_PUBLIC_CASHBACK_PROGRAM_ID=
  NEXT_PUBLIC_NFT_PROGRAM_ID=
  ```

## 📊 SMART CONTRACTS DEPLOYMENT PLAN

| Smart Contract | Anchor Program ID | Devnet | Mainnet |
|----------------|-------------------|---------|---------|
| `subscription_payment` | `subPay123...` | ✅ Deployed | ➡️ SOON |
| `bonk_rewards` | `bonkCash567...` | ✅ Deployed | ➡️ SOON |
| `subscription_nft` | `nftMintABC...` | ✅ Deployed | ➡️ SOON |

## 🔗 FRONTEND INTEGRATION SUMMARY

| Feature | Hook / Service File | Smart Contract |
|---------|-------------------|----------------|
| **Wallet Connection** | `useWallet.ts` | ✅ Already Connected |
| **Subscription Purchase** | `useSubscriptionPayment.ts` | `subscription_payment` |
| **Cashback Rewards** | `cashbackService.ts` | `bonk_rewards` |
| **NFT Activation** | `subscriptionService.ts` | `subscription_nft` |

## 💾 RECOMMENDED BACKEND STORAGE (Optional)

If you want hybrid architecture (on-chain + off-chain tracking):

| Collection | Description |
|------------|-------------|
| `payments` | Store history of subscription payments |
| `cashback_tx` | Record BONK cashback transactions |
| `subscriptions` | Track NFTs, expiry dates, status |
| `users` | Store wallet mappings & referral codes |

## 🚀 DEPLOYMENT COMMANDS

### Frontend Development
```bash
# Start development server
npx expo start

# Run on specific platform
npx expo run:ios
npx expo run:android
```

### Backend Development
```bash
# Build smart contracts
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy

# Generate IDL
anchor idl
```

### Fullstack Development
```bash
# Install all dependencies
npm install

# Run both frontend and backend tests
npm run test:all

# Build everything
npm run build:all
```

## 🔐 SECURITY FEATURES

### Frontend Security
- Secure wallet connection handling
- Input validation and sanitization
- Error boundary implementation
- Secure storage for sensitive data

### Backend Security
- **PDA Security**: All accounts use Program Derived Addresses
- **Access Control**: Role-based permissions and ownership checks
- **Error Handling**: Comprehensive error codes and validation
- **Transaction Security**: Proper signature verification

## 📈 ANALYTICS & MONITORING

### Frontend Analytics
- User engagement tracking
- Screen flow analysis
- Error reporting and crash analytics
- Performance monitoring

### Backend Analytics
- Transaction volume tracking
- Smart contract usage statistics
- Gas usage optimization
- Event emission for external monitoring

## 🔄 EVENTS & NOTIFICATIONS

### Smart Contract Events
```rust
pub struct PaymentProcessed {
    pub user: Pubkey,
    pub subscription_id: u64,
    pub amount: u64,
    pub cashback_amount: u64,
}

pub struct CashbackRedeemed {
    pub user: Pubkey,
    pub amount: u64,
}

pub struct SubscriptionCancelled {
    pub user: Pubkey,
    pub subscription_id: u64,
}
```

### Frontend Notifications
- Real-time transaction status updates
- Push notifications for cashback rewards
- Subscription renewal reminders
- Error notifications and retry prompts

## 🎯 DEVELOPMENT ROADMAP

### Phase 1: Core Features ✅
- React Native mobile app
- Solana smart contracts
- Wallet integration
- Basic subscription management
- BONK cashback system

### Phase 2: Advanced Features 🚧
- Multi-token support (SOL, BONK, USDC)
- Subscription tiers and pricing
- Referral system with rewards
- Advanced analytics dashboard
- Push notifications

### Phase 3: Production Features 📋
- Security audit
- Mainnet deployment
- Production monitoring
- User onboarding flow
- Performance optimization

---

**Built with ❤️ using React Native, Expo, and Solana**

_Sleek - Where subscriptions meet blockchain rewards_ 