import { prisma } from '../lib/prisma';

export type VipLevel = 0 | 1 | 2 | 3;

export const VIP_PERKS = {
  1: { coinBonus: 0.20, dailyEnergyRefill: true, exclusiveMissions: true, chestLuckBonus: 0.10, label: 'Silver VIP' },
  2: { coinBonus: 0.40, dailyEnergyRefill: true, exclusiveMissions: true, chestLuckBonus: 0.20, label: 'Gold VIP' },
  3: { coinBonus: 0.75, dailyEnergyRefill: true, exclusiveMissions: true, chestLuckBonus: 0.35, label: 'Diamond VIP' },
};

export async function getVipStatus(userId: string) {
  const boost = await prisma.userBoost.findUnique({
    where: { userId_type: { userId, type: 'vip_weekly' } }
  });

  const isActive = boost?.isActive && boost.expiresAt && boost.expiresAt > new Date();
  const vipLevel: VipLevel = isActive ? 1 : 0;
  const perks = vipLevel > 0 ? VIP_PERKS[vipLevel] : null;

  return {
    vipLevel,
    isActive: Boolean(isActive),
    expiresAt: boost?.expiresAt ?? null,
    perks,
    label: perks?.label ?? 'Free'
  };
}

export function applyVipCoinBonus(coins: number, vipLevel: VipLevel): number {
  if (vipLevel === 0) return coins;
  const bonus = VIP_PERKS[vipLevel]?.coinBonus ?? 0;
  return Math.floor(coins * (1 + bonus));
}
