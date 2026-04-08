import { Router } from "express";
import { createWithdrawalRequest } from "../services/withdrawal.service";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req: any, res) => {
  const items = await prisma.withdrawalRequest.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const wallet = await prisma.userWallet.findUnique({ where: { userId: req.user.id } });

  res.json({
    success: true,
    wallet,
    items,
  });
});

router.post("/", async (req: any, res) => {
  try {
    const { currency, amount, destinationAddress } = req.body;
    const request = await createWithdrawalRequest({
      userId: req.user.id,
      currency,
      amount: Number(amount),
      destinationAddress,
    });

    res.json({ success: true, request });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
