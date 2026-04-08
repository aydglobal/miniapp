const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const RETRY_DELAYS = [500, 1000, 2000];

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<Response> {
  if (!navigator.onLine) {
    throw new Error('No internet connection');
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);

      // 4xx — hemen hata, retry yok
      if (res.status >= 400 && res.status < 500) {
        throw new Error(`HTTP ${res.status}`);
      }

      // 5xx — retry
      if (res.status >= 500) {
        lastError = new Error(`HTTP ${res.status}`);
        if (attempt < maxRetries) {
          await sleep(RETRY_DELAYS[attempt] ?? 2000);
          continue;
        }
        throw lastError;
      }

      return res;
    } catch (err) {
      // Network hatası — retry
      if (err instanceof TypeError) {
        lastError = err;
        if (attempt < maxRetries) {
          await sleep(RETRY_DELAYS[attempt] ?? 2000);
          continue;
        }
      }
      throw err;
    }
  }

  throw lastError ?? new Error('Request failed');
}
