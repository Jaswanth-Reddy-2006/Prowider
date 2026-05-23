import { EventEmitter } from 'events';

// Global singleton for realtime events (SSR compatible)
const globalForRealtime = globalThis as unknown as { eventEmitter?: EventEmitter };

export const realtimeService: EventEmitter =
  globalForRealtime.eventEmitter ?? new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
  // expose for hot‑reload / tests
  globalForRealtime.eventEmitter = realtimeService;
}

/** Emit a generic event with optional payload */
export function emit(event: string, data: any): void {
  realtimeService.emit(event, data);
}

/** Convenience for dashboard updates (no payload) */
export function emitDashboardUpdate(): void {
  realtimeService.emit('dashboard-update');
}
