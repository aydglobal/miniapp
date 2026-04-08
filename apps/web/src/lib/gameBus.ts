type Listener<T = unknown> = (payload: T) => void;

class GameBus {
  private listeners: Record<string, Listener[]> = {};

  on<T = unknown>(event: string, fn: Listener<T>) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(fn as Listener);
    return () => {
      this.listeners[event] = (this.listeners[event] || []).filter((x) => x !== fn);
    };
  }

  emit<T = unknown>(event: string, payload?: T) {
    (this.listeners[event] || []).forEach((fn) => fn(payload));
  }
}

export const gameBus = new GameBus();
