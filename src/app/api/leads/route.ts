import { NextResponse } from 'next/server'
import * as z from 'zod'
import { createLeadWithAllocation } from '@/services/lead-service'
import { apiLimiter } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import prisma from '@/db/prisma'

const leadSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  phoneNumber: z.string().min(10, "Valid phone number required"),
  city: z.string().min(2, "City is required"),
  description: z.string().optional().default(""),
  serviceId: z.number().int().positive()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = leadSchema.parse(body)

    const result = await createLeadWithAllocation(validatedData)

    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error: any) {
    console.error("DEBUG ERROR:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: (error as any).errors || (error as any).issues }, { status: 400 })
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        success: false, 
        error: "A lead with this phone number already exists for this service." 
      }, { status: 409 })
    }
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        assignments: {
          include: {
            provider: true
          }
        }
      }
    })

    const formatted = leads.map((l: any) => ({
      id: l.id,
      customerName: l.customerName,
      phoneNumber: l.phoneNumber,
      serviceId: l.serviceId,
      createdAt: l.createdAt,
      providers: l.assignments.map((a: any) => ({
        id: a.provider.id,
        name: a.provider.name,
      }))
    }))

    return NextResponse.json({ success: true, data: formatted })
  } catch (error: any) {
    logger.error({ event: "FETCH_LEADS_ERROR", error }, "Failed to fetch leads")
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
