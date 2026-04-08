# ADN Control Kit

Bu paket, çekirdek API ve growth kit'ten sonra gelecek **kontrol ve güvenlik katmanını**
eklemek için hazırlanmıştır.

## İçerik
- advanced anti-cheat
- idempotency middleware
- transaction ledger genişletmesi
- admin correction tools
- manual balance edit
- suspicious cluster / device / IP kuralları
- fraud review summary endpointleri
- örnek admin sayfaları

## Route Register
```ts
import adminCorrectionsRouter from "./routes/admin/corrections";
import adminFraudOpsRouter from "./routes/admin/fraudOps";
import deviceRouter from "./routes/device";
import webhookIdempotencyRouter from "./routes/webhookIdempotency";

app.use("/device", authMiddleware, deviceRouter);
app.use("/admin/corrections", authMiddleware, adminOnlyMiddleware, adminCorrectionsRouter);
app.use("/admin/fraud-ops", authMiddleware, adminOnlyMiddleware, adminFraudOpsRouter);
```

## Middleware Kullanımı
Satın alma, günlük claim, payout request, webhook ve premium grant endpointlerinde:
```ts
import { idempotencyMiddleware } from "../middlewares/idempotency.middleware";

router.post("/daily/claim", authMiddleware, idempotencyMiddleware("daily_claim"), claimDaily);
```

## Sıra
1. Prisma şemasını ekle
2. `prisma generate`
3. migration çıkar
4. middleware ve servisleri import et
5. transaction oluşturan endpointlerde ledger yaz
6. admin correction ekranını bağla
