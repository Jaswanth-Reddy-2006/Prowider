import { NextResponse } from 'next/server'
import prisma from '@/db/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const webhooks = await prisma.webhookEvent.findMany({
      orderBy: { processedAt: 'desc' },
      take: 20
    })
    return NextResponse.json({ success: true, data: webhooks })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
