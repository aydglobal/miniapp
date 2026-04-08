# ADN Growth Kit

Bu paket şu modülleri ekler:

- Referral engine
- Leaderboard
- Notification / engagement queue
- Onboarding + tutorial progress
- Admin campaign / notification ekranı için API iskeleti

## Route register

```ts
import referralRouter from "./routes/referral";
import leaderboardRouter from "./routes/leaderboard";
import onboardingRouter from "./routes/onboarding";
import adminNotificationsRouter from "./routes/admin/notifications";

app.use("/referral", authMiddleware, referralRouter);
app.use("/leaderboard", authMiddleware, leaderboardRouter);
app.use("/onboarding", authMiddleware, onboardingRouter);
app.use("/admin/notifications", authMiddleware, adminOnlyMiddleware, adminNotificationsRouter);
```

## Worker

Her 10 dakikada bir:
- uygun kullanıcıları bul
- cooldown / quiet hours kontrol et
- mesajı kuyruğa al veya gönder

```ts
import { runNotificationWorker } from "./workers/notification.worker";
setInterval(() => {
  runNotificationWorker().catch(console.error);
}, 10 * 60 * 1000);
```

## Entegrasyon notları

- `User` modelinde en az şu alanlar olmalı:
  - `telegramId`
  - `username`
  - `coins`
  - `currentLevel`
  - `lastSeenAt`
  - `isBanned`
  - `suspiciousScore`
- Referral kalite kontrolü için:
  - self-referral engeli
  - aynı cihaz / aynı IP işareti
  - minimum gameplay doğrulaması
- Notification sistemi spam atmamak için cooldown tabanlıdır.
