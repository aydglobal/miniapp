import { Router } from "express";
import { resolveTap, getComboMultiplier } from "../services/tapFeedback.service";
import { rollWeightedRarity, rollJackpot, buildChestRewards } from "../services/chest.service";

const router = Router();

router.post("/tap", async (req: any, res) => {
  const comboHits = Number(req.body.comboHits || 0);
  const comboMultiplier = getComboMultiplier(comboHits);

  const outcome = resolveTap({
    baseReward: 1,
    critChance: 0.04,
    critMultiplier: 4.5,
    comboHits,
    comboMultiplier,
    chestChance: 0.08,
  });

  let chest = null;
  if (outcome.chestDrop) {
    const rarity = rollWeightedRarity();
    const rewards = buildChestRewards(rarity);
    const jackpot = rollJackpot();
    chest = { rarity, rewards, jackpot };
  }

  res.json({ success: true, outcome, chest });
});

export default router;
