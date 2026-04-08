# ADN Monetization Kit

Bu paket şu modülleri içerir:

- Telegram Stars premium purchase akışı iskeleti
- reward balance split (`coins`, `adnBalance`, `eligibleRewardBalance`, `lockedRewardBalance`)
- withdrawal lifecycle ve payout state machine
- premium grant hook yapısı
- revenue / payout admin ekranları
- temel webhook ve idempotency notları
- route register örnekleri

## Route register

```ts
import paymentsRouter from "./routes/payments";
import withdrawalsRouter from "./routes/withdrawals";
import adminRevenueRouter from "./routes/admin/revenue";
import adminPayoutsRouter from "./routes/admin/payouts";

app.use("/payments", authMiddleware, paymentsRouter);
app.use("/withdrawals", authMiddleware, withdrawalsRouter);
app.use("/admin/revenue", authMiddleware, adminOnlyMiddleware, adminRevenueRouter);
app.use("/admin/payouts", authMiddleware, adminOnlyMiddleware, adminPayoutsRouter);
```

## Env

```env
BOT_TOKEN=...
TELEGRAM_STARS_PROVIDER_TOKEN=
WEBHOOK_BASE_URL=https://api.example.com
MIN_WITHDRAWAL_TON=1
MIN_WITHDRAWAL_USDT=5
WITHDRAWAL_COOLDOWN_HOURS=24
```

## Entegrasyon sırası

1. `prisma/schema.prisma` eklerini uygula
2. migration çıkar
3. `payments.ts` ve `withdrawals.ts` route'larını bağla
4. bot tarafında Stars invoice akışını bağla
5. premium grant hook ile boost / pass / sandık ödüllerini tetikle
6. admin payout ekranını bağla

## Not

Bu kit gerçek zincir üstü transfer yapmaz. `PayoutProviderAdapter` iskelet bırakıldı.
Önce inceleme ve onay akışını çalıştırman daha güvenlidir.
