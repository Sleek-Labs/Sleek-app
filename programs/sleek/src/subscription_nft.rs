use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo};
use anchor_spl::metadata::{
    create_metadata_accounts_v3,
    CreateMetadataAccountArgsV3,
    MetadataAccount,
};

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

#[derive(Accounts)]
pub struct ExtendSubscription<'info> {
    #[account(mut)]
    pub subscription_nft: Account<'info, SubscriptionNFTData>,
    #[account(signer)]
    pub user: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct SubscriptionRecord<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 1, // discriminator + user + mint + subscription_id + amount + activation_date + expiry_date + bump
        seeds = [b"subscription", user.key().as_ref(), &subscription_id.to_le_bytes()],
        bump
    )]
    pub subscription_record: Account<'info, SubscriptionRecordData>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct SubscriptionNFTData {
    pub user: Pubkey,
    pub mint: Pubkey,
    pub subscription_id: u64,
    pub amount: u64,
    pub activation_date: i64,
    pub expiry_date: i64,
    pub status: SubscriptionStatus,
    pub bump: u8,
}

#[account]
pub struct SubscriptionRecordData {
    pub user: Pubkey,
    pub mint: Pubkey,
    pub subscription_id: u64,
    pub amount: u64,
    pub activation_date: i64,
    pub expiry_date: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum SubscriptionStatus {
    Active,
    Expired,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SubscriptionData {
    pub subscription_id: u64,
    pub name: String,
    pub amount: u64,
    pub duration_days: u64,
    pub category: String,
}

pub fn mint_subscription_nft(
    ctx: Context<MintSubscriptionNFT>,
    subscription_data: SubscriptionData,
) -> Result<()> {
    let clock = Clock::get()?;
    let activation_date = clock.unix_timestamp;
    let expiry_date = activation_date + (subscription_data.duration_days as i64 * 24 * 60 * 60);

    // Mint NFT to user's token account
    let cpi_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.user_token_account.to_account_info(),
        authority: ctx.accounts.user.clone(),
    };
    
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    
    token::mint_to(cpi_ctx, 1)?;

    // Create metadata for the NFT
    let metadata_args = CreateMetadataAccountArgsV3 {
        data: anchor_spl::metadata::DataV2 {
            name: format!("Sleek Subscription - {}", subscription_data.name),
            symbol: "SLEEK",
            uri: format!("https://sleek.app/metadata/{}.json", subscription_data.subscription_id),
            seller_fee_basis_points: 0,
            creators: Some(vec![
                anchor_spl::metadata::Creator {
                    address: ctx.accounts.user.key(),
                    verified: true,
                    share: 100,
                }
            ]),
            collection: None,
            uses: None,
        },
        is_mutable: true,
        collection_details: None,
    };

    create_metadata_accounts_v3(
        CpiContext::new(
            ctx.accounts.metadata.to_account_info(),
            ctx.accounts.metadata.to_account_info(),
        ),
        metadata_args,
    )?;

    // Emit NFT minted event
    emit!(SubscriptionNFTMinted {
        user: ctx.accounts.user.key(),
        mint: ctx.accounts.mint.key(),
        subscription_id: subscription_data.subscription_id,
        activation_date,
        expiry_date,
    });

    Ok(())
}

pub fn extend_subscription(
    ctx: Context<ExtendSubscription>,
    new_expiry: i64,
) -> Result<()> {
    let subscription_nft = &mut ctx.accounts.subscription_nft;
    
    // Verify user owns the subscription
    require!(
        subscription_nft.user == ctx.accounts.user.key(),
        ErrorCode::Unauthorized
    );

    // Update expiry date
    subscription_nft.expiry_date = new_expiry;
    subscription_nft.status = SubscriptionStatus::Active;

    // Emit subscription extended event
    emit!(SubscriptionExtended {
        user: ctx.accounts.user.key(),
        mint: subscription_nft.mint,
        new_expiry,
    });

    Ok(())
}

pub fn record_subscription(
    ctx: Context<SubscriptionRecord>,
    mint: Pubkey,
    subscription_id: u64,
    amount: u64,
    duration_days: u64,
) -> Result<()> {
    let clock = Clock::get()?;
    let activation_date = clock.unix_timestamp;
    let expiry_date = activation_date + (duration_days as i64 * 24 * 60 * 60);

    let subscription_record = &mut ctx.accounts.subscription_record;
    subscription_record.user = ctx.accounts.user.key();
    subscription_record.mint = mint;
    subscription_record.subscription_id = subscription_id;
    subscription_record.amount = amount;
    subscription_record.activation_date = activation_date;
    subscription_record.expiry_date = expiry_date;
    subscription_record.bump = *ctx.bumps.get("subscription_record").unwrap();

    Ok(())
}

#[event]
pub struct SubscriptionNFTMinted {
    pub user: Pubkey,
    pub mint: Pubkey,
    pub subscription_id: u64,
    pub activation_date: i64,
    pub expiry_date: i64,
}

#[event]
pub struct SubscriptionExtended {
    pub user: Pubkey,
    pub mint: Pubkey,
    pub new_expiry: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("User is not authorized to perform this action")]
    Unauthorized,
    #[msg("Subscription has expired")]
    SubscriptionExpired,
    #[msg("Invalid subscription data")]
    InvalidSubscriptionData,
} 