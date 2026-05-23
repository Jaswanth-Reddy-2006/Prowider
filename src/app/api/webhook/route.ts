import { NextResponse } from 'next/server'
import { z } from 'zod'
import { processQuotaReset } from '@/services/webhook-service'

const PayloadSchema = z.object({ eventId: z.string() })

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = PayloadSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid payload: eventId is required' },
        { status: 400 }
      )
    }
    const result = await processQuotaReset(parsed.data.eventId)
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
