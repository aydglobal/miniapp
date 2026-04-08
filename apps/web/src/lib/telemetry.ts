const PII_KEYS = ['email', 'phone', 'address', 'name', 'password', 'token'];
const BATCH_SIZE = 50;
const FLUSH_INTERVAL_MS = 10_000;
const QUEUE_KEY = 'telemetry_queue';

export interface TelemetryEvent {
  type: string;
  payload?: Record<string, unknown>;
  timestamp: number;
}

export interface TelemetryClient {
  track(type: string, payload?: Record<string, unknown>): void;
  captureError(error: Error, context?: Record<string, unknown>): void;
  flush(): Promise<void>;
}

function filterPii(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (PII_KEYS.some(pii => key.toLowerCase().includes(pii))) continue;
    result[key] = value;
  }
  return result;
}

function loadQueue(): TelemetryEvent[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: TelemetryEvent[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch { /* ignore */ }
}

class TelemetryClientImpl implements TelemetryClient {
  private buffer: TelemetryEvent[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.buffer = loadQueue();
    this.timer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);
  }

  track(type: string, payload?: Record<string, unknown>) {
    const event: TelemetryEvent = {
      type,
      payload: payload ? filterPii(payload) : undefined,
      timestamp: Date.now()
    };
    this.buffer.push(event);
    saveQueue(this.buffer);

    if (this.buffer.length >= BATCH_SIZE) {
      this.flush();
    }
  }

  captureError(error: Error, context?: Record<string, unknown>) {
    this.track('error', {
      message: error.message,
      stack: error.stack?.slice(0, 500),
      ...(context ? filterPii(context) : {})
    });
  }

  async flush() {
    if (this.buffer.length === 0) return;

    const batch = this.buffer.splice(0, BATCH_SIZE);
    saveQueue(this.buffer);

    if (!navigator.onLine) {
      // Offline — geri koy
      this.buffer.unshift(...batch);
      saveQueue(this.buffer);
      return;
    }

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch })
      });
    } catch {
      // Başarısız — geri koy
      this.buffer.unshift(...batch);
      saveQueue(this.buffer);
    }
  }

  destroy() {
    if (this.timer) clearInterval(this.timer);
  }
}

// Singleton
let _client: TelemetryClientImpl | null = null;

export function initTelemetry(endpoint: string): TelemetryClient {
  if (_client) _client.destroy();
  _client = new TelemetryClientImpl(endpoint);
  (window as any).__telemetry = _client;
  return _client;
}

export function getTelemetry(): TelemetryClient | null {
  return _client;
}
