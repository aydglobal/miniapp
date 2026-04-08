# Integration Notes

## User modelinde beklenen alanlar
- id
- username
- isAdmin
- level
- xp
- coins
- adnBalance
- energy
- energyMax
- tapReward
- tapXpReward
- passiveIncomePerHour
- pendingPassiveIncome
- lastPassiveIncomeAt
- totalPassiveClaimed
- lastSeenAt
- offlineCapHours
- dailyStreak
- lastDailyClaimAt

## İlişkiler
- ownedUpgrades
- activeBoosts
- referralProfile

## İlk entegrasyon sırası
1. profile route
2. game tap
3. income sync
4. shop
5. missions
6. daily
