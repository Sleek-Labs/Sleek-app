use anchor_lang::prelude::*;

declare_id!("sleek123456789012345678901234567890123456789");

pub mod subscription_payment;
pub mod bonk_rewards;
pub mod subscription_nft;

use subscription_payment::*;
use bonk_rewards::*;
use subscription_nft::*;

#[program]
pub mod sleek {
    use super::*;

    // Subscription Payment Functions
    pub fn process_subscription_payment(
        ctx: Context<ProcessPayment>,
        subscription_id: u64,
        amount: u64,
    ) -> Result<()> {
        subscription_payment::process_payment(ctx, subscription_id, amount)
    }

    // BONK Rewards Functions
    pub fn mint_cashback(
        ctx: Context<MintCashback>,
        amount: u64,
    ) -> Result<()> {
        bonk_rewards::mint_cashback(ctx, amount)
    }

    pub fn redeem_cashback(
        ctx: Context<RedeemCashback>,
        amount: u64,
    ) -> Result<()> {
        bonk_rewards::redeem_cashback(ctx, amount)
    }

    // Subscription NFT Functions
    pub fn mint_subscription_nft(
        ctx: Context<MintSubscriptionNFT>,
        subscription_data: SubscriptionData,
    ) -> Result<()> {
        subscription_nft::mint_subscription_nft(ctx, subscription_data)
    }

    pub fn extend_subscription(
        ctx: Context<ExtendSubscription>,
        new_expiry: i64,
    ) -> Result<()> {
        subscription_nft::extend_subscription(ctx, new_expiry)
    }
} 