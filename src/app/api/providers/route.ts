import { NextResponse } from 'next/server'
import prisma from '@/db/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      include: {
        _count: {
          select: { assignments: true }
        },
        assignments: {
          include: {
            lead: true
          },
          orderBy: { assignedAt: 'desc' },
          take: 5 // Latest 5 leads for the UI
        }
      },
      orderBy: { id: 'asc' }
    })
    
    const formatted = providers.map(p => ({
      id: p.id,
      name: p.name,
      monthlyQuota: p.monthlyQuota,
      remainingQuota: p.remainingQuota,
      totalLeadsAssigned: p._count.assignments,
      recentAssignments: p.assignments.map(a => ({
        leadId: a.leadId,
        customerName: a.lead.customerName,
        serviceId: a.lead.serviceId,
        assignedAt: a.assignedAt
      }))
    }))
    
    return NextResponse.json({ success: true, data: formatted })
  } catch (error: any) {
    console.error("Fetch Providers Error:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
