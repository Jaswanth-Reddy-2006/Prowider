import { EventEmitter } from 'events'

const globalForRealtime = globalThis as unknown as { eventEmitter: EventEmitter }

export const eventEmitter = globalForRealtime.eventEmitter || new EventEmitter()

if (process.env.NODE_ENV !== 'production') {
  globalForRealtime.eventEmitter = eventEmitter
}

export function emitDashboardUpdate() {
  eventEmitter.emit('dashboard-update')
}
