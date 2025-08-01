import { AnchorProvider, BN, Program, web3 } from '@coral-xyz/anchor';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from '@solana/web3.js';
import { IDL } from '../idl/sleek';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  solPrice: number;
  period: string;
  estimated?: boolean;
  region?: string;
  category: string;
}

export interface ActivatedSubscription {
  id: string;
  name: string;
  price: number;
  solPrice: number;
  period: string;
  category: string;
  activatedAt: Date;
  expiresAt: Date;
  cashbackEarned?: number;
  nftMint?: string;
}

// Smart Contract Integration
const PROGRAM_ID = new PublicKey('sleek123456789012345678901234567890123456789');
const TREASURY_ADDRESS = new PublicKey('treasury123456789012345678901234567890123456789');

export class SubscriptionService {
  private connection: Connection;
  private program: Program;
  private provider: AnchorProvider;

  constructor(connection: Connection, wallet: any) {
    this.connection = connection;
    this.provider = new AnchorProvider(connection, wallet, {});
    this.program = new Program(IDL, PROGRAM_ID, this.provider);
  }

  // Process subscription payment with smart contract
  async processSubscriptionPayment(
    subscription: Subscription,
    userPublicKey: PublicKey
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      const amountLamports = new BN(subscription.solPrice * LAMPORTS_PER_SOL);
      const subscriptionId = new BN(Date.now()); // Use timestamp as subscription ID

      // Create payment transaction
      const tx = await this.program.methods
        .processSubscriptionPayment(subscriptionId, amountLamports)
        .accounts({
          user: userPublicKey,
          treasury: TREASURY_ADDRESS,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Mint BONK cashback (10% of subscription price)
      const cashbackAmount = new BN(subscription.price * 0.1 * 1000000); // Convert to BONK decimals
      await this.mintCashback(userPublicKey, cashbackAmount);

      // Mint subscription NFT
      await this.mintSubscriptionNFT(subscription, userPublicKey, subscriptionId);

      return { success: true, signature: tx };
    } catch (error) {
      console.error('Payment processing error:', error);
      return { success: false, error: error.message };
    }
  }

  // Mint BONK cashback tokens
  private async mintCashback(
    userPublicKey: PublicKey,
    amount: BN
  ): Promise<void> {
    try {
      const bonkMint = new PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'); // BONK mint address
      const userTokenAccount = await this.getAssociatedTokenAccount(userPublicKey, bonkMint);

      await this.program.methods
        .mintCashback(amount)
        .accounts({
          mint: bonkMint,
          to: userTokenAccount,
          authority: this.provider.wallet.publicKey,
          tokenProgram: web3.TokenProgram.programId,
        })
        .rpc();
    } catch (error) {
      console.error('Cashback minting error:', error);
      throw error;
    }
  }

  // Mint subscription NFT
  private async mintSubscriptionNFT(
    subscription: Subscription,
    userPublicKey: PublicKey,
    subscriptionId: BN
  ): Promise<void> {
    try {
      const mint = web3.Keypair.generate();
      const userTokenAccount = await this.getAssociatedTokenAccount(userPublicKey, mint.publicKey);

      await this.program.methods
        .mintSubscriptionNft({
          subscriptionId,
          name: subscription.name,
          amount: new BN(subscription.price * 100), // Convert to cents
          durationDays: new BN(this.getDurationDays(subscription.period)),
          category: subscription.category,
        })
        .accounts({
          mint: mint.publicKey,
          metadata: await this.getMetadataAccount(mint.publicKey),
          userTokenAccount,
          user: userPublicKey,
          tokenProgram: web3.TokenProgram.programId,
          systemProgram: SystemProgram.programId,
          rent: web3.SYSVAR_RENT_PUBKEY,
          associatedTokenProgram: web3.AssociatedTokenProgram.programId,
        })
        .signers([mint])
        .rpc();
    } catch (error) {
      console.error('NFT minting error:', error);
      throw error;
    }
  }

  // Get associated token account
  private async getAssociatedTokenAccount(
    owner: PublicKey,
    mint: PublicKey
  ): Promise<PublicKey> {
    return await web3.getAssociatedTokenAddress(mint, owner);
  }

  // Get metadata account
  private async getMetadataAccount(mint: PublicKey): Promise<PublicKey> {
    const [metadataAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
        mint.toBuffer(),
      ],
      new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
    );
    return metadataAccount;
  }

  // Get duration in days from period string
  private getDurationDays(period: string): number {
    switch (period.toLowerCase()) {
      case 'month':
        return 30;
      case 'year':
        return 365;
      case 'week':
        return 7;
      default:
        return 30;
    }
  }

  // Get activated subscriptions from local storage (for demo)
  getActivatedSubscriptions(): ActivatedSubscription[] {
    try {
      const stored = localStorage.getItem('activatedSubscriptions');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading activated subscriptions:', error);
      return [];
    }
  }

  // Store activated subscription locally (for demo)
  private storeActivatedSubscription(subscription: ActivatedSubscription): void {
    try {
      const existing = this.getActivatedSubscriptions();
      existing.push(subscription);
      localStorage.setItem('activatedSubscriptions', JSON.stringify(existing));
    } catch (error) {
      console.error('Error storing activated subscription:', error);
    }
  }

  // Get subscription statistics
  getSubscriptionStats(): { activeSubscriptions: number; totalValue: number } {
    const subscriptions = this.getActivatedSubscriptions();
    const activeSubscriptions = subscriptions.filter(sub => {
      const now = new Date();
      const expiry = new Date(sub.expiresAt);
      return expiry > now;
    });

    const totalValue = activeSubscriptions.reduce((sum, sub) => sum + sub.price, 0);

    return {
      activeSubscriptions: activeSubscriptions.length,
      totalValue,
    };
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService(
  new Connection('https://api.devnet.solana.com'),
  null // Will be set when wallet is connected
); 