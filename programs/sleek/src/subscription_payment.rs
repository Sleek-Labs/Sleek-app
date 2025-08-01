use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_instruction;

#[derive(Accounts)]
pub struct ProcessPayment<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub treasury: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PaymentRecord<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8 + 8 + 8 + 8, // discriminator + user + subscription_id + amount + timestamp + bump
        seeds = [b"payment", user.key().as_ref(), &subscription_id.to_le_bytes()],
        bump
    )]
    pub payment_record: Account<'info, PaymentRecordData>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct PaymentRecordData {
    pub user: Pubkey,
    pub subscription_id: u64,
    pub amount: u64,
    pub timestamp: i64,
    pub bump: u8,
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

pub fn record_payment(
    ctx: Context<PaymentRecord>,
    subscription_id: u64,
    amount: u64,
) -> Result<()> {
    let payment_record = &mut ctx.accounts.payment_record;
    payment_record.user = ctx.accounts.user.key();
    payment_record.subscription_id = subscription_id;
    payment_record.amount = amount;
    payment_record.timestamp = Clock::get()?.unix_timestamp;
    payment_record.bump = *ctx.bumps.get("payment_record").unwrap();

    Ok(())
}

#[event]
pub struct PaymentProcessed {
    pub user: Pubkey,
    pub subscription_id: u64,
    pub amount: u64,
    pub timestamp: i64,
} 