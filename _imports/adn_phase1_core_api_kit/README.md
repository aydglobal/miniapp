# ADN Phase 1 Core API Kit

Bu paket, ilk çalışan çekirdek oyun akışı için örnek route ve service dosyalarını içerir.

## İçerik
- profile state
- tap engine
- passive income sync/claim
- shop endpoints
- level sync
- missions
- daily reward
- economy ledger
- basit anti-cheat

## Sunucuda register et
```ts
import profileRouter from "./routes/profile";
import gameRouter from "./routes/game";
import incomeRouter from "./routes/income";
import shopRouter from "./routes/shop";
import levelsRouter from "./routes/levels";
import missionsRouter from "./routes/missions";
import dailyRouter from "./routes/daily";

app.use("/profile", authMiddleware, profileRouter);
app.use("/game", authMiddleware, gameRouter);
app.use("/income", authMiddleware, incomeRouter);
app.use("/shop", authMiddleware, shopRouter);
app.use("/levels", authMiddleware, levelsRouter);
app.use("/missions", authMiddleware, missionsRouter);
app.use("/daily", authMiddleware, dailyRouter);
```

## Beklenen Prisma modelleri
Bu örnek kod aşağıdaki model isimlerini bekler:
- User
- UserUpgrade
- UserMission
- EconomyEventLog
- TapSignal

## Not
Bu kit production tamamı değildir. Amacı ilk oynanabilir API omurgasını kurmaktır.
Bir sonraki paket:
- referral
- leaderboard
- notifications
- onboarding
