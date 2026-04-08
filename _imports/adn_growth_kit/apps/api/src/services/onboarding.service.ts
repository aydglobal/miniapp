import { prisma } from "../lib/prisma";

export async function getTutorialState(userId: string) {
  const existing = await prisma.tutorialProgress.findUnique({
    where: { userId },
  });

  if (existing) return existing;

  return prisma.tutorialProgress.create({
    data: { userId },
  });
}

export async function markTutorialStep(input: {
  userId: string;
  step: "introSeen" | "firstTapDone" | "firstUpgradeDone" | "firstMissionDone" | "referralSeen";
}) {
  const state = await getTutorialState(input.userId);
  const data: Record<string, any> = {
    [input.step]: true,
  };

  const preview = { ...state, ...data };
  const completed =
    preview.introSeen &&
    preview.firstTapDone &&
    preview.firstUpgradeDone &&
    preview.firstMissionDone &&
    preview.referralSeen;

  return prisma.tutorialProgress.update({
    where: { id: state.id },
    data: {
      ...data,
      completed,
    },
  });
}
