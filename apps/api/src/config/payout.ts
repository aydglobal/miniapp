export const MIN_WITHDRAWAL_COINS = Number(process.env.MIN_WITHDRAWAL_COINS || 50000);
export const WITHDRAWAL_COOLDOWN_HOURS = Number(process.env.WITHDRAWAL_COOLDOWN_HOURS || 24);
export const SUPPORTED_PAYOUT_METHODS = ['ton', 'usdt_trc20', 'usdt_ton'] as const;
