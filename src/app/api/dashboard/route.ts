import { NextResponse } from 'next/server'
import { eventEmitter } from '@/services/realtime-service'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const stream = new ReadableStream({
    start(controller) {
      const onUpdate = () => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ event: 'update', time: new Date().toISOString() })}\n\n`)
        } catch (e) {
          logger.warn({ event: "SSE_ENQUEUE_FAILED" }, "Failed to push to SSE stream, connection may be closed")
        }
      }

      eventEmitter.on('dashboard-update', onUpdate)

      // Send initial connection heartbeat
      controller.enqueue(`data: ${JSON.stringify({ event: 'connected' })}\n\n`)

      // 15-second ping to keep connection alive and detect dropped clients
      const interval = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({ event: 'ping', time: new Date().toISOString() })}\n\n`)
        } catch (e) {
          clearInterval(interval)
          eventEmitter.off('dashboard-update', onUpdate)
        }
      }, 15000)

      // Cleanup when connection closes
      req.signal.addEventListener('abort', () => {
        logger.info({ event: "SSE_CLIENT_DISCONNECT" }, "SSE Client disconnected, cleaning up closures")
        clearInterval(interval)
        eventEmitter.off('dashboard-update', onUpdate)
      })
    }
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  })
}
