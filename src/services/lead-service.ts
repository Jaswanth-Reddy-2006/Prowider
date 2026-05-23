import prisma from '@/db/prisma'
import { allocateProviders, AllocationResult } from '@/services/allocation-engine'
import { realtimeService } from '@/services/realtime-service'

export type LeadAllocationResponse = {
  lead: {
    id: number
    customerName: string
    phoneNumber: string
    city: string
    serviceId: number
    description: string | null
    createdAt: Date
  }
  assignments: AllocationResult[]
  transactionDurationMs: number
}

/**
 * Create a lead AND allocate providers inside ONE atomic transaction.
 * Returns the lead, assignments with provider details, and transaction timing.
 */
export async function createLeadAndAllocate(payload: {
  customerName: string
  phoneNumber: string
  city: string
  serviceId: number
  description?: string
}): Promise<LeadAllocationResponse> {
  const startTime = performance.now()

    const maxRetries = 5;
    let result;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        result = await prisma.$transaction(async (tx) => {
          // 1. Create lead — UNIQUE(phoneNumber, serviceId) enforced at DB level
          const lead = await tx.lead.create({
            data: {
              customerName: payload.customerName,
              phoneNumber: payload.phoneNumber,
              city: payload.city,
              serviceId: payload.serviceId,
              description: payload.description ?? null,
            },
          })

          // 2. Run allocation inside the SAME transaction
          const assignments = await allocateProviders(tx, lead.id, lead.serviceId)

          return { lead, assignments }
        }, {
          isolationLevel: 'Serializable',
          timeout: 10000, // 10 second timeout
        });
        break; // Success, exit retry loop
      } catch (error: any) {
        // P2034 = Prisma transaction conflict, 40001 = Postgres serialization failure
        if ((error?.code === 'P2034' || error?.message?.includes('40001') || error?.message?.includes('deadlock')) && attempt < maxRetries) {
          // Add exponential backoff jitter before retrying
          await new Promise(r => setTimeout(r, Math.random() * 50 * attempt));
          continue;
        }
        throw error;
      }
    }
    
    if (!result) throw new Error('Failed to allocate lead after maximum retries');

  const transactionDurationMs = Math.round(performance.now() - startTime)

  const response: LeadAllocationResponse = {
    lead: result.lead,
    assignments: result.assignments,
    transactionDurationMs,
  }

  // Emit SSE event AFTER commit (outside transaction)
  realtimeService.emit('lead_created', response)

  return response
}
