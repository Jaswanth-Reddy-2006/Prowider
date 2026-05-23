import { NextResponse } from 'next/server'
import { createLeadAndAllocate } from '@/services/lead-service'

/** Generate N concurrent leads for stress testing */
export async function POST(req: Request) {
  try {
    const { count } = await req.json()
    const num = Math.min(Number(count) || 10, 50) // limit to max 50 for safety
    const promises = []
    
    // Create random unique prefix for phone numbers to avoid UNIQUE constraint violation
    const runId = Math.floor(Math.random() * 10000).toString().padStart(4, '0')

    for (let i = 0; i < num; i++) {
      const data = {
        customerName: `Test User ${runId}-${i}`,
        phoneNumber: `555${runId}${String(i).padStart(3, '0')}`,
        city: 'Test City',
        serviceId: (i % 3) + 1,
        description: i % 2 === 0 ? `Dummy description for bulk test lead ${i}. Requires immediate routing and attention.` : undefined,
      }
      promises.push(
        createLeadAndAllocate(data).catch(e => ({ error: e.message }))
      )
    }
    const results = await Promise.all(promises)
    return NextResponse.json({ results })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
