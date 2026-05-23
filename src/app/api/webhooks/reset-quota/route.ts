import { NextResponse } from 'next/server'
import { z } from 'zod'
import { processWebhookResetQuota } from '@/services/webhook-service'
import { createHmac } from 'crypto'
import { logger } from '@/lib/logger'
import { apiLimiter } from '@/lib/rate-limit'

const webhookSchema = z.object({
  eventId: z.string().min(1)
})

export async function POST(req: Request) {
  const res = NextResponse.next()

  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    await apiLimiter.check(res, 10, ip) // Max 10 webhooks per minute per IP
  } catch {
    logger.warn({ event: "RATE_LIMIT_EXCEEDED", ip: req.headers.get('x-forwarded-for') }, "Rate limit exceeded on webhooks")
    return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429, headers: res.headers })
  }

  try {
    const rawBody = await req.text()
    
    // HMAC Signature Verification
    const signature = req.headers.get('x-webhook-signature')
    const secret = process.env.WEBHOOK_SECRET || 'test_secret'
    
    if (!signature) {
      logger.warn({ event: "WEBHOOK_MISSING_SIG" }, "Webhook rejected: missing signature")
      return NextResponse.json({ success: false, error: "Missing signature" }, { status: 401, headers: res.headers })
    }

    const expectedSignature = createHmac('sha256', secret).update(rawBody).digest('hex')
    if (signature !== expectedSignature) {
      logger.warn({ event: "WEBHOOK_INVALID_SIG" }, "Webhook rejected: invalid signature")
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 401, headers: res.headers })
    }

    const body = JSON.parse(rawBody)
    const { eventId } = webhookSchema.parse(body)

    const result = await processWebhookResetQuota(eventId)
    return NextResponse.json(result, { headers: res.headers })
  } catch (error: any) {
    logger.error({ event: "WEBHOOK_ERROR", error }, "Webhook error occurred")
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: (error as any).errors || (error as any).issues }, { status: 400, headers: res.headers })
    }
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500, headers: res.headers })
  }
}
