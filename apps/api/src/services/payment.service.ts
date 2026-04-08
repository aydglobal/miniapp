import { prisma } from '../lib/prisma';
import { BOOSTS, type BoostKey } from '../config/boosts';
import { env } from '../lib/env';
import { approveReferralOnFirstPaid } from './referral.service';

async function createTelegramStarsInvoice(params: {
  botToken: string;
  title: string;
  description: string;
  payload: string;
  currency: string;
  prices: Array<{ label: string; amount: number }>;
}): Promise<string> {
  const res = await fetch(`https://api.telegram.org/bot${params.botToken}/createInvoiceLink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: params.title,
      description: params.description,
      payload: params.payload,
      currency: params.currency,
      prices: params.prices,
      provider_token: ''
    })
  });
  const data = await res.json() as { ok: boolean; result?: string; description?: string };
  if (!data.ok) throw new Error(`Telegram invoice error: ${data.description}`);
  return data.result!;
}

export async function createPremiumBoostInvoice(userId: string, boostKey: BoostKey) {
  const cfg = BOOSTS[boostKey];
  if (!cfg.premiumStarsPrice) throw new Error('Premium purchase not available for this boost');

  const payload = `boost:${boostKey}:user:${userId}:${Date.now()}`;

  let invoiceLink: string;
  try {
    invoiceLink = await createTelegramStarsInvoice({
      botToken: env.TELEGRAM_BOT_TOKEN,
      title: cfg.name,
      description: `${cfg.name} — ${cfg.durationHours} saat aktif`,
      payload,
      currency: 'XTR',
      prices: [{ label: cfg.name, amount: cfg.premiumStarsPrice }]
    });
  } catch {
    invoiceLink = `https://t.me/${env.BOT_USERNAME}?start=pay_${encodeURIComponent(payload)}`;
  }

  const payment = await prisma.payment.create({
    data: {
      userId,
      provider: 'telegram_stars',
      status: 'pending',
      currency: 'XTR',
      amount: cfg.premiumStarsPrice,
      payload,
      itemType: 'boost',
      itemRef: boostKey,
      externalInvoiceLink: invoiceLink,
      expiresAt: new Date(Date.now() + 15 * 60_000)
    }
  });

  await prisma.boostLog.create({
    data: {
      userId,
      boostType: boostKey,
      action: 'premium_pending',
      source: 'premium',
      paymentId: payment.id,
      meta: { stars: cfg.premiumStarsPrice }
    }
  });

  return { success: true, invoiceLink, paymentId: payment.id };
}

export async function applySuccessfulPremiumPayment(payload: string, telegramChargeId: string) {
  const payment = await prisma.$transaction(async (tx) => {
    const found = await tx.payment.findUnique({ where: { payload } });
    if (!found) throw new Error('Payment not found');
    if (found.status === 'paid') return found;

    const boostKey = found.itemRef as BoostKey;
    const cfg = BOOSTS[boostKey];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + cfg.durationHours * 3600_000);

    const boost = await tx.userBoost.upsert({
      where: { userId_type: { userId: found.userId, type: boostKey } },
      create: { userId: found.userId, type: boostKey, level: 1, isActive: true, startsAt: now, expiresAt },
      update: { level: { increment: 1 }, isActive: true, startsAt: now, expiresAt }
    });

    const updated = await tx.payment.update({
      where: { id: found.id },
      data: { status: 'paid', externalChargeId: telegramChargeId }
    });

    await tx.boostLog.create({
      data: {
        userId: found.userId,
        boostType: boostKey,
        action: 'premium_paid',
        source: 'premium',
        paymentId: found.id,
        levelAfter: boost.level,
        meta: { telegramChargeId }
      }
    });

    return updated;
  });

  await approveReferralOnFirstPaid(payment.userId).catch(() => null);
  return payment;
}
