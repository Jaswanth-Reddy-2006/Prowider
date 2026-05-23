import { NextResponse } from 'next/server'
import prisma from '@/db/prisma'

export async function DELETE() {
  try {
    // Delete all transactional data
    await prisma.webhookEvent.deleteMany()
    await prisma.leadAssignment.deleteMany()
    await prisma.lead.deleteMany()
    
    // Reset all providers to quota 10
    await prisma.$executeRaw`UPDATE "Provider" SET "remainingQuota" = 10, "monthlyQuota" = 10`
    
    // Reset allocation states
    await prisma.$executeRaw`UPDATE "AllocationState" SET "lastAssignedProviderIdx" = 0`

    return NextResponse.json({ success: true, message: 'System fully reset: Leads deleted, Quotas restored.' })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
