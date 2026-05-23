import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createLeadAndAllocate } from '@/services/lead-service'

export const dynamic = 'force-dynamic'

const generateSchema = z.object({
  count: z.number().int().positive().max(50),
  serviceId: z.number().int().positive(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { count, serviceId } = generateSchema.parse(body)

    const promises = Array.from({ length: count }).map((_, i) => {
      return createLeadAndAllocate({
        customerName: `Test User ${Date.now()}-${i}`,
        phoneNumber: `555${Math.floor(100000000 + Math.random() * 900000000)}`,
        city: 'Test City',
        description: `Concurrent stress test lead #${i + 1}`,
        serviceId,
      })
        .then(res => ({ success: true, data: res }))
        .catch(e => ({ success: false, error: e.message }))
    })

    const results = await Promise.all(promises)
    const successCount = results.filter(r => r.success).length
    const failedCount = results.length - successCount

    return NextResponse.json({
      success: true,
      message: `Attempted to generate ${count} leads.`,
      successCount,
      failedCount,
      details: results,
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
