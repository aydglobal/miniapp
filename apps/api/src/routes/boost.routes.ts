import { Router } from 'express';
import { z } from 'zod';
import { BOOSTS, getBoostPrice, type BoostKey } from '../config/boosts';
import { resolveBoostPriceForUser } from '../lib/experimentPricing';
import { buyBoostWithCoins, claimDailyFreeBoost } from '../services/boost.service';

const router = Router();

router.get('/', async (req, res) => {
  const userId = req.user!.id;
  const items = await Promise.all(
    Object.entries(BOOSTS).map(async ([key, value]) => {
      const pricing = await resolveBoostPriceForUser(userId, key as BoostKey, 0);
      return {
        key,
        name: value.name,
        price: pricing.price,
        pricingVariant: pricing.variant,
        pricingMultiplier: pricing.multiplier,
        durationHours: value.durationHours,
        value: value.value,
        maxLevel: value.maxLevel,
        premiumStarsPrice: value.premiumStarsPrice,
        freeClaimCooldownHours: value.freeClaimCooldownHours
      };
    })
  );

  res.json(items);
});

router.post('/buy', async (req, res) => {
  const userId = req.user!.id;
  const body = z.object({ type: z.enum(['tap_x2', 'energy_cap', 'regen_x2']) }).parse(req.body);

  try {
    const result = await buyBoostWithCoins(userId, body.type);
    res.json(result);
  } catch (error) {
    const statusCode = (error as any)?.statusCode || 400;
    res.status(statusCode).json({ message: error instanceof Error ? error.message : 'Guclendirme satin alma basarisiz' });
  }
});

router.post('/daily-claim', async (req, res) => {
  const userId = req.user!.id;
  const body = z.object({ type: z.enum(['tap_x2', 'energy_cap', 'regen_x2']) }).parse(req.body);

  try {
    const result = await claimDailyFreeBoost(userId, body.type);
    res.json(result);
  } catch (error) {
    const statusCode = (error as any)?.statusCode || 400;
    res.status(statusCode).json({ message: error instanceof Error ? error.message : 'Gunluk alim basarisiz' });
  }
});

export default router;
