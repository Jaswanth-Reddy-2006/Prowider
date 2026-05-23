import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createLeadAndAllocate } from '@/services/lead-service'
import prisma from '@/db/prisma'

export const dynamic = 'force-dynamic'

const LeadSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  phoneNumber: z.string().min(10, 'Phone must be at least 10 digits').max(15),
  city: z.string().min(1, 'City is required'),
  serviceId: z.coerce.number().int().min(1).max(3),
  description: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = LeadSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      )
    }

    const result = await createLeadAndAllocate(parsed.data)
    return NextResponse.json({ success: true, ...result })
  } catch (e: any) {
    // Handle Prisma unique constraint violation (duplicate phone+service)
    if (e?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A lead with this phone number already exists for this service.' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: e.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      include: {
        assignments: {
          include: { provider: true }
        }
      },
      orderBy: { id: 'desc' }
    });
    return NextResponse.json({ success: true, data: leads });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
