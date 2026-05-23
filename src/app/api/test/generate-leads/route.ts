import { NextResponse } from 'next/server'
import * as z from 'zod'
import { createLeadWithAllocation } from '@/services/lead-service'

const generateSchema = z.object({
  count: z.number().int().positive().max(50),
  serviceId: z.number().int().positive()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { count, serviceId } = generateSchema.parse(body)

    const promises = Array.from({ length: count }).map((_, i) => {
      // Use random phone number to bypass duplicate lead prevention for test leads
      return createLeadWithAllocation({
        customerName: `Test User ${Date.now()}-${i}`,
        phoneNumber: `555-000-${Math.floor(1000 + Math.random() * 9000)}`,
        city: "Test City",
        description: `Concurrent stress test lead #${i+1}`,
        serviceId
      }).then(res => ({ success: true, data: res }))
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
      details: results 
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: (error as any).errors || (error as any).issues }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
