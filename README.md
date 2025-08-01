# 🚀 Introducing Sleek – All your subscriptions under one roof.

<div align="center">
  <img src="assets/images/logoint.png" alt="Sleek Logo" width="200"/>
  <br/>
  <p><strong>All your subscriptions under one roof with GREAT discounts!</strong></p>
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.72.0-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-49.0.0-black.svg)](https://expo.dev/)
  [![Solana](https://img.shields.io/badge/Solana-1.17.0-purple.svg)](https://solana.com/)
  [![Anchor](https://img.shields.io/badge/Anchor-0.29.0-orange.svg)](https://www.anchor-lang.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org/)
</div>

---

## 📱 Overview

Sleek is a revolutionary mobile application that combines subscription management with Solana blockchain rewards. Users can browse, purchase, and manage subscriptions while earning $BONK cashback rewards and receiving subscription NFTs.

### ✨ Key Features

- **📱 Modern Mobile UI** - Beautiful React Native interface with dark theme
- **💳 Smart Contract Payments** - Direct SOL payments for subscriptions
- **🪙 $BONK Cashback Rewards** - Earn 10% BONK tokens on every purchase
- **🪪 Subscription NFTs** - Unique NFTs for each active subscription
- **👛 Wallet Integration** - Seamless Solana wallet connection
- **📊 Real-time Analytics** - Track subscriptions, rewards, and spending
- **🎯 Category-based Browsing** - 300+ brands across 10+ categories

---

## 🏗️ Architecture

### Frontend Stack
- **React Native** - Cross-platform mobile development
- **Expo** - Development platform and build tools
- **TypeScript** - Type-safe development
- **NativeWind** - Tailwind CSS for React Native
- **Expo Router** - File-based navigation

### Blockchain Stack
- **Solana** - High-performance blockchain
- **Anchor** - Rust-based smart contract framework
- **SPL Tokens** - BONK token integration
- **Metaplex** - NFT metadata standards

### Smart Contracts
- **`subscription_payment`** - SOL payment processing
- **`bonk_rewards`** - BONK cashback minting/redemption
- **`subscription_nft`** - NFT creation and management

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Solana CLI
- Anchor CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/0xdaivik/Sleek-app.git
   cd Sleek-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Solana CLI**
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
   ```

4. **Install Anchor CLI**
   ```bash
   npm install -g @coral-xyz/anchor-cli
   ```

### Development Setup

1. **Start Expo development server**
   ```bash
   npx expo start
   ```

2. **Run on iOS simulator**
   ```bash
   npx expo run:ios
   ```

3. **Run on Android emulator**
   ```bash
   npx expo run:android
   ```

### Smart Contract Deployment

1. **Build smart contracts**
   ```bash
   anchor build
   ```

2. **Deploy to devnet**
   ```bash
   anchor deploy
   ```

3. **Run tests**
   ```bash
   anchor test
   ```

---

## 📱 App Screenshots

### Home Dashboard
<img width="978" height="2000" alt="home-screen" src="https://github.com/user-attachments/assets/59070039-fbae-48bb-81e3-7f325a761aac" />
*Browse categories and discover subscriptions*

### Subscription Management
<img width="2000" height="1697" alt="sleek-screen" src="https://github.com/user-attachments/assets/d75e44e5-92b4-40c3-bda4-bc740519cfe6" />
*View active subscriptions and manage renewals*

### Rewards Center
<img width="2000" height="1259" alt="reward-screen" src="https://github.com/user-attachments/assets/dc60407a-e96c-4cc3-ac53-d1b9227d8511" />
*Track BONK cashback and redeem rewards*

### Account Settings
<img width="2000" height="1964" alt="account-screen" src="https://github.com/user-attachments/assets/165835bf-0f27-47db-96a8-35c7ad36f2e8" />
*Wallet connection and user preferences*

---

## 🧩 Smart Contract Integration

### Payment Processing
```rust
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

    Ok(())
}
```

### BONK Cashback Minting
```rust
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

### NFT Subscription Creation
```rust
pub fn mint_subscription_nft(ctx: Context<MintSubscriptionNFT>) -> Result<()> {
    // Mint NFT to user's token account
    token::mint_to(cpi_ctx, 1)?;
    
    // Create metadata for the NFT
    create_metadata_accounts_v3(cpi_ctx, metadata_args)?;
    
    Ok(())
}
```

---

## 📊 Project Structure

```
Sleek-v1/
├── app/                          # Expo Router screens
│   ├── tabs/                     # Tab navigation
│   │   ├── home.tsx             # Home dashboard
│   │   ├── sleek.tsx            # Subscription management
│   │   ├── rewards.tsx          # Rewards center
│   │   └── account.tsx          # Account settings
│   ├── index.tsx                # Welcome screen
│   └── onboarding-screen.tsx    # Onboarding flow
├── src/
│   ├── components/              # Reusable components
│   │   ├── ModernTabBar.tsx    # Custom tab bar
│   │   ├── PaymentSuccessModal.tsx
│   │   └── CashbackRedeemModal.tsx
│   ├── hooks/                   # Custom React hooks
│   │   ├── useWallet.ts        # Wallet integration
│   │   └── useSubscriptionPayment.ts
│   ├── services/                # Business logic
│   │   ├── subscriptionService.ts
│   │   ├── cashbackService.ts
│   │   └── walletService.ts
│   ├── types/                   # TypeScript definitions
│   └── idl/                     # Smart contract interfaces
│       └── sleek.ts
├── programs/                    # Smart contracts
│   └── sleek/
│       ├── src/
│       │   ├── lib.rs          # Main program
│       │   ├── subscription_payment.rs
│       │   ├── bonk_rewards.rs
│       │   └── subscription_nft.rs
│       └── Cargo.toml
├── scripts/                     # Deployment scripts
│   └── deploy.ts
├── assets/                      # Images and fonts
└── android/                     # Android configuration
```

---

## 🎯 Features

### 💳 Subscription Management
- **Browse Categories** - 10+ categories with 300+ brands
- **Smart Pricing** - Real-time SOL and USD pricing
- **One-Click Purchase** - Seamless payment processing
- **Subscription Tracking** - Monitor expiry dates and renewals

### 🪙 BONK Rewards System
- **Automatic Cashback** - 10% BONK rewards on every purchase
- **Reward Tracking** - Real-time balance and transaction history
- **Redemption** - Convert BONK to SOL or other tokens
- **Referral Bonuses** - Earn extra rewards for referrals

### 🪪 NFT Subscriptions
- **Unique NFTs** - Each subscription creates a unique NFT
- **Metadata Rich** - Subscription details embedded in NFT
- **Transferable** - Trade or gift subscription NFTs
- **Expiry Tracking** - Visual indicators for subscription status

### 👛 Wallet Integration
- **Multi-Wallet Support** - Phantom, Solflare, and more
- **Secure Connection** - Encrypted wallet communication
- **Balance Tracking** - Real-time SOL and token balances
- **Transaction History** - Complete payment and reward history

---

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Solana Network
SOLANA_NETWORK=devnet

# Smart Contract Program IDs
NEXT_PUBLIC_PAYMENT_PROGRAM_ID=sleek123456789012345678901234567890123456789
NEXT_PUBLIC_CASHBACK_PROGRAM_ID=sleek123456789012345678901234567890123456789
NEXT_PUBLIC_NFT_PROGRAM_ID=sleek123456789012345678901234567890123456789

# BONK Token Mint
NEXT_PUBLIC_BONK_MINT_ADDRESS=DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263

# Treasury Address
NEXT_PUBLIC_TREASURY_ADDRESS=treasury123456789012345678901234567890123456789
```

### Anchor Configuration
The `Anchor.toml` file is configured for:
- **Devnet** - Development and testing
- **Mainnet** - Production deployment
- **Localnet** - Local development

---

## 🧪 Testing

### Frontend Tests
```bash
# Run Expo tests
npx expo test

# Run specific test file
npx expo test --testNamePattern="WalletService"
```

### Smart Contract Tests
```bash
# Run all smart contract tests
anchor test

# Run specific test
anchor test --skip-local-validator
```

### Test Coverage
- ✅ Frontend component rendering
- ✅ Wallet integration flows
- ✅ Smart contract initialization
- ✅ Subscription payment processing
- ✅ BONK cashback minting
- ✅ Cashback redemption
- ✅ Subscription cancellation
- ✅ Error handling and edge cases

---

## 🚀 Deployment

### Frontend Deployment

1. **Build for production**
   ```bash
   npx expo build:android
   npx expo build:ios
   ```

2. **Deploy to app stores**
   ```bash
   npx expo submit:android
   npx expo submit:ios
   ```

### Smart Contract Deployment

1. **Deploy to devnet**
   ```bash
   anchor deploy --provider.cluster devnet
   ```

2. **Deploy to mainnet**
   ```bash
   anchor deploy --provider.cluster mainnet
   ```

3. **Verify deployment**
   ```bash
   npm run verify-deployment
   ```

---

## 📈 Analytics & Monitoring

### Frontend Analytics
- User engagement tracking
- Screen flow analysis
- Error reporting and crash analytics
- Performance monitoring

### Smart Contract Analytics
- Transaction volume tracking
- Gas usage optimization
- Event emission for external monitoring
- Real-time contract statistics

---

## 🔐 Security Features

### Frontend Security
- Secure wallet connection handling
- Input validation and sanitization
- Error boundary implementation
- Secure storage for sensitive data

### Smart Contract Security
- **PDA Security** - All accounts use Program Derived Addresses
- **Access Control** - Role-based permissions and ownership checks
- **Error Handling** - Comprehensive error codes and validation
- **Transaction Security** - Proper signature verification

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write comprehensive tests
- Document new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Solana Foundation** - For the amazing blockchain platform
- **Anchor Team** - For the excellent smart contract framework
- **Expo Team** - For the incredible React Native development platform
- **BONK Community** - For the vibrant token ecosystem

---

## 📞 Support & Community

### Getting Help
- 📖 **Documentation**: Check the inline code comments
- 🐛 **Issues**: Create an issue on GitHub
- 💬 **Discussions**: Join our community discussions
- 📧 **Contact**: Reach out to the development team

### Community Links
- [GitHub Repository](https://github.com/0xdaivik/Sleek-app)
- [Discord Community](https://discord.gg/sleek)
- [Twitter](https://twitter.com/sleek_app)
- [Documentation](https://docs.sleek.app)

---

<div align="center">
  <p><strong>Built with ❤️ using React Native, Expo, and Solana</strong></p>
  <p><em>Sleek - Where subscriptions meet blockchain rewards</em></p>
</div>
