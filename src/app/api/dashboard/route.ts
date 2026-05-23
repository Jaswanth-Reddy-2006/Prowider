import { NextResponse } from 'next/server'
import prisma from '@/db/prisma'
import { realtimeService } from '@/services/realtime-service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function formatSSE(data: any): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

export async function GET() {
  const encoder = new TextEncoder()
  let listenerCleanups: (() => void)[] = []

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial provider state
        const providers = await prisma.provider.findMany({
          include: { assignments: { select: { leadId: true, assignmentType: true } } },
          orderBy: { id: 'asc' },
        })
        controller.enqueue(encoder.encode(formatSSE({ event: 'init', data: { providers } })))
      } catch (err) {
        // DB might not be ready yet, send empty init
        controller.enqueue(encoder.encode(formatSSE({ event: 'init', data: { providers: [] } })))
      }

      // Keep-alive heartbeat every 30s to prevent connection timeouts
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch {
          clearInterval(heartbeat)
        }
      }, 30000)

      // Listen for lead_created events
      const onLeadCreated = (payload: any) => {
        try {
          controller.enqueue(encoder.encode(formatSSE({ event: 'lead_created', data: payload })))
        } catch {
          // Client disconnected
        }
      }

      // Listen for quota_reset events
      const onQuotaReset = (payload: any) => {
        try {
          controller.enqueue(encoder.encode(formatSSE({ event: 'quota_reset', data: payload })))
        } catch {
          // Client disconnected
        }
      }

      realtimeService.on('lead_created', onLeadCreated)
      realtimeService.on('quota_reset', onQuotaReset)

      listenerCleanups = [
        () => clearInterval(heartbeat),
        () => realtimeService.off('lead_created', onLeadCreated),
        () => realtimeService.off('quota_reset', onQuotaReset),
      ]
    },
    cancel() {
      // Cleanup when client disconnects
      listenerCleanups.forEach(fn => fn())
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
