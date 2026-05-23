import { NextResponse } from 'next/server'
import { z } from 'zod'
import { processQuotaReset } from '@/services/webhook-service'

export const dynamic = 'force-dynamic'

const webhookSchema = z.object({
  eventId: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { eventId } = webhookSchema.parse(body)
    const result = await processQuotaReset(eventId)
    return NextResponse.json(result)
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
