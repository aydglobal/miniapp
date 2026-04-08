import { runAutoTapTick } from '../services/autoTap.service';

async function main() {
  const result = await runAutoTapTick();
  console.log(`[autoTap.worker] processed=${result.processed} enabled=${String(result.enabled)}`);
}

main().catch((error) => {
  console.error('[autoTap.worker] failed', error);
  process.exit(1);
});
