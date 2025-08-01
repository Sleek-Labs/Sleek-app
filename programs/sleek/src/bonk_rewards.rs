use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo, Burn, Transfer};

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

#[derive(Accounts)]
pub struct RedeemCashback<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub from: Account<'info, TokenAccount>,
    #[account(mut)]
    pub treasury: Account<'info, TokenAccount>,
    #[account(signer)]
    pub user: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CashbackRecord<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8 + 8 + 8 + 1, // discriminator + user + amount + timestamp + bump
        seeds = [b"cashback", user.key().as_ref(), &Clock::get()?.unix_timestamp.to_le_bytes()],
        bump
    )]
    pub cashback_record: Account<'info, CashbackRecordData>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct CashbackRecordData {
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
    pub bump: u8,
}

pub fn mint_cashback(
    ctx: Context<MintCashback>,
    amount: u64,
) -> Result<()> {
    // Mint BONK tokens to user's token account
    let cpi_accounts = MintTo {
        mint: ctx.accounts.mint.to_account_info(),
        to: ctx.accounts.to.to_account_info(),
        authority: ctx.accounts.authority.clone(),
    };
    
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    
    token::mint_to(cpi_ctx, amount)?;

    // Emit cashback minted event
    emit!(CashbackMinted {
        user: ctx.accounts.to.owner,
        amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

pub fn redeem_cashback(
    ctx: Context<RedeemCashback>,
    amount: u64,
) -> Result<()> {
    // Transfer BONK tokens from user to treasury
    let cpi_accounts = Transfer {
        from: ctx.accounts.from.to_account_info(),
        to: ctx.accounts.treasury.to_account_info(),
        authority: ctx.accounts.user.clone(),
    };
    
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    
    token::transfer(cpi_ctx, amount)?;

    // Emit cashback redeemed event
    emit!(CashbackRedeemed {
        user: ctx.accounts.user.key(),
        amount,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

pub fn record_cashback(
    ctx: Context<CashbackRecord>,
    amount: u64,
) -> Result<()> {
    let cashback_record = &mut ctx.accounts.cashback_record;
    cashback_record.user = ctx.accounts.user.key();
    cashback_record.amount = amount;
    cashback_record.timestamp = Clock::get()?.unix_timestamp;
    cashback_record.bump = *ctx.bumps.get("cashback_record").unwrap();

    Ok(())
}

#[event]
pub struct CashbackMinted {
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct CashbackRedeemed {
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
} 