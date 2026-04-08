# ADN Token Telegram Mini App

Bu repo, `ADN token` icin hazirlanmis Telegram Mini App + API + bot + admin panel iskeletidir.

## Uygulama Bolumleri
- `apps/web`: kullanici mini app arayuzu
- `apps/api`: auth, game, boosts, admin, payout ve referral API
- `apps/bot`: Telegram bot giris akisi

## Guvenlik
- `.env` dosyalari commit edilmez
- sadece `.env.example` dosyalari paylasilir
- gerçek token, secret ve webhook bilgilerini repoda tutma
- eger bir token daha once paylasildiysa mutlaka yenile

## Kurulum
1. `pnpm install`
2. PostgreSQL baslat
3. `apps/api/.env`, `apps/bot/.env`, `apps/web/.env` dosyalarini kendi degerlerinle doldur
4. `pnpm prisma:generate`
5. `pnpm --filter api prisma migrate dev`
6. `pnpm dev`

## Railway
- `apps/api` ve `apps/bot` klasorlerinde Railway config dosyalari hazir.
- Railway'de `Deploy from GitHub` sec ve monorepo icin `Root Directory` olarak `apps/api` sec.
- API env:
  `DATABASE_URL`, `TELEGRAM_BOT_TOKEN`, `JWT_SECRET`, `MINIAPP_URL`, `ADMIN_SECRET`, `ADMIN_TELEGRAM_USERNAME`
- API canliya cikinca `VITE_API_URL` degerini `https://your-api.up.railway.app` yapip web'i yeniden deploy et.
- Bot icin ikinci servis olustur ve `Root Directory` olarak `apps/bot` sec.
- Bot env:
  `BOT_TOKEN`, `BOT_USERNAME`, `MINIAPP_URL`

## Gerekli Env

### `apps/api/.env`
```env
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/adn_airdrop
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
JWT_SECRET=replace_with_a_long_random_secret
MINIAPP_URL=https://your-miniapp-domain.com
ADMIN_SECRET=replace_with_a_private_admin_secret
ADMIN_TELEGRAM_USERNAME=aydinsagban
MIN_WITHDRAWAL_COINS=50000
WITHDRAWAL_COOLDOWN_HOURS=24
```

### `apps/bot/.env`
```env
BOT_TOKEN=YOUR_BOT_TOKEN
BOT_USERNAME=adntoken_bot
MINIAPP_URL=https://your-miniapp-domain.com
```

### `apps/web/.env`
```env
VITE_API_URL=http://localhost:4000
VITE_ADMIN_SECRET=replace_with_a_private_admin_secret
```

## Aktif Ana Route Gruplari
- `/auth`
- `/profile`, `/api/profile`
- `/game`, `/api/game`
- `/boosts`, `/api/boosts`
- `/payments`, `/api/payments`
- `/withdrawals`, `/api/withdrawals`
- `/referral-quests`, `/api/referral-quests`
- `/admin/*`, `/api/admin/*`
- `/webhooks/telegram`

## Not
- Admin panel sadece admin kullanici + `ADMIN_SECRET` ile acilir
- Telegram Mini App icin `MINIAPP_URL` mutlaka `https` olmalidir
