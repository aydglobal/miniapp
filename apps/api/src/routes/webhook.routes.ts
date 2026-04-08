import { Router } from 'express';
import { env } from '../lib/env';
import { logger } from '../lib/logger';
import { applySuccessfulPremiumPayment } from '../services/payment.service';

const router = Router();

router.post('/telegram', async (req, res) => {
  // Webhook secret token doğrulaması
  const secretToken = req.header('x-telegram-bot-api-secret-token');
  if (env.WEBHOOK_SECRET && secretToken !== env.WEBHOOK_SECRET) {
    logger.warn({ secretToken }, 'webhook_invalid_secret');
    return res.status(401).json({ ok: false });
  }

  try {
    const body = req.body;
    logger.info({ type: Object.keys(body).join(',') }, 'webhook_received');

    // pre_checkout_query — Telegram Stars ödeme onayı
    const preCheckout = body?.pre_checkout_query;
    if (preCheckout?.id) {
      try {
        await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/answerPreCheckoutQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pre_checkout_query_id: preCheckout.id, ok: true })
        });
        logger.info({ queryId: preCheckout.id }, 'pre_checkout_approved');
      } catch (err) {
        logger.error({ err, queryId: preCheckout.id }, 'pre_checkout_error');
        await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/answerPreCheckoutQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pre_checkout_query_id: preCheckout.id, ok: false, error_message: 'Internal error' })
        }).catch(() => null);
      }
      return res.json({ ok: true });
    }

    // successful_payment — ödeme tamamlandı, boost aktif et
    const message = body?.message;
    const successful = message?.successful_payment;
    if (successful?.invoice_payload && successful?.telegram_payment_charge_id) {
      await applySuccessfulPremiumPayment(
        successful.invoice_payload,
        successful.telegram_payment_charge_id
      );
      logger.info({ payload: successful.invoice_payload }, 'payment_applied');
    }

    res.json({ ok: true });
  } catch (error) {
    logger.error({ err: error }, 'webhook_error');
    res.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : 'Webhook error'
    });
  }
});

export default router;
