import { prisma } from "../lib/prisma";
import { MONETIZATION_PRODUCTS } from "../lib/monetization.constants";

export async function createStarsPayment(userId: string, productKey: keyof typeof MONETIZATION_PRODUCTS) {
  const product = MONETIZATION_PRODUCTS[productKey];
  if (!product) throw new Error("Invalid product");

  const invoicePayload = `stars:${userId}:${productKey}:${Date.now()}`;

  const payment = await prisma.payment.create({
    data: {
      userId,
      provider: "telegram_stars",
      status: "pending",
      currency: "XTR",
      amount: product.priceStars,
      productKey,
      productLabel: product.label,
      invoicePayload,
    },
  });

  return {
    paymentId: payment.id,
    invoicePayload,
    title: product.label,
    description: `${product.label} purchase`,
    currency: "XTR",
    prices: [{ label: product.label, amount: product.priceStars }],
  };
}

export async function markStarsPaymentPaid(params: {
  invoicePayload: string;
  telegramChargeId?: string | null;
  providerChargeId?: string | null;
}) {
  const payment = await prisma.payment.findUnique({
    where: { invoicePayload: params.invoicePayload },
  });

  if (!payment) throw new Error("Payment not found");
  if (payment.status === "paid") return payment;

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "paid",
      telegramChargeId: params.telegramChargeId ?? undefined,
      providerChargeId: params.providerChargeId ?? undefined,
      paidAt: new Date(),
    },
  });

  await grantPremiumFromPayment(updated.id);
  return updated;
}

export async function grantPremiumFromPayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) throw new Error("Payment not found");
  const product = MONETIZATION_PRODUCTS[payment.productKey as keyof typeof MONETIZATION_PRODUCTS];
  if (!product) throw new Error("Unknown product");

  await prisma.$transaction([
    prisma.premiumGrant.create({
      data: {
        userId: payment.userId,
        paymentId: payment.id,
        grantType: product.grantType as any,
        grantKey: product.grantKey,
        quantity: product.quantity,
      },
    }),
    prisma.userWallet.upsert({
      where: { userId: payment.userId },
      create: {
        userId: payment.userId,
        lifetimeSpentStars: product.priceStars,
        lifetimeRevenueStars: product.priceStars,
      },
      update: {
        lifetimeSpentStars: { increment: product.priceStars },
        lifetimeRevenueStars: { increment: product.priceStars },
      },
    }),
  ]);
}
