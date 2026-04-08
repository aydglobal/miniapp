import { prisma } from "../lib/prisma";
import { LEVELS } from "../static/levels.data";

export async function syncLevelState(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const levelDef = [...LEVELS].reverse().find((x) => user.xp >= x.requiredXp) ?? LEVELS[0];
  const newLevel = levelDef.level;

  if (user.level !== newLevel) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });
  }

  return {
    level: newLevel,
    xp: user.xp,
    unlocks: levelDef.unlocks,
  };
}
