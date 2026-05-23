import { NextResponse } from 'next/server'
import prisma from '@/db/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      orderBy: { id: 'asc' },
      include: {
        assignments: {
          select: { 
            leadId: true, 
            assignmentType: true, 
            assignedAt: true,
            lead: {
              select: { customerName: true, serviceId: true, createdAt: true }
            }
          },
          orderBy: { assignedAt: 'desc' },
        },
      },
    })

    const data = providers.map(p => ({
      id: p.id,
      name: p.name,
      isMandatory: p.isMandatory,
      status: p.status,
      remainingQuota: p.remainingQuota,
      monthlyQuota: p.monthlyQuota,
      totalLeadsAssigned: p.assignments.length,
      recentAssignments: p.assignments.slice(0, 10),
    }))

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json(
      { data: [], error: error.message },
      { status: 500 }
    )
  }
}
