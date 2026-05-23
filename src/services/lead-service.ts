import prisma from "@/db/prisma"
import { allocateProvidersForLead } from "./allocation-engine"
import { emitDashboardUpdate } from "./realtime-service"
import { logger } from "@/lib/logger"
import { randomUUID } from "crypto"

export type CreateLeadInput = {
  customerName: string
  phoneNumber: string
  city: string
  description: string
  serviceId: number
}

export async function createLeadWithAllocation(data: CreateLeadInput) {
  const txId = randomUUID()
  const startTime = Date.now()

  logger.info({ event: "LEAD_CREATION_START", txId, serviceId: data.serviceId }, "Starting lead creation transaction")

  // Use Interactive Transaction for atomicity
  const result = await prisma.$transaction(async (tx) => {
    // 1. Fair allocation engine with deterministic locking
    const allocatedProviders = await allocateProvidersForLead(tx, data.serviceId, txId)

    // 2. Decrement quotas atomically
    // Safe from deadlocks because locks were acquired deterministically in allocateProvidersForLead
    const providerIds = allocatedProviders.map(p => p.id)
    const updated = await tx.provider.updateMany({
      where: { 
        id: { in: providerIds },
        remainingQuota: { gt: 0 } 
      },
      data: {
        remainingQuota: { decrement: 1 }
      }
    })

    if (updated.count !== providerIds.length) {
      logger.error({ event: "QUOTA_UNDERFLOW", txId, expected: providerIds.length, updated: updated.count }, "Quota validation failed")
      throw new Error("Quota validation failed during atomic decrement. One or more providers reached limit.")
    }

    // 3. Create Lead and Assignments
    const lead = await tx.lead.create({
      data: {
        customerName: data.customerName,
        phoneNumber: data.phoneNumber,
        city: data.city,
        description: data.description,
        serviceId: data.serviceId,
        assignments: {
          create: providerIds.map(id => ({
            providerId: id
          }))
        }
      },
      include: {
        assignments: true
      }
    })

    logger.info({ event: "TRANSACTION_SUCCESS", txId, leadId: lead.id, durationMs: Date.now() - startTime }, "Transaction committed successfully")
    return { lead, allocatedProviders }
  }, {
    isolationLevel: 'ReadCommitted', // Sufficient since we use explicit SELECT FOR UPDATE
    maxWait: 5000,
    timeout: 10000,
  })

  // Emit real-time dashboard update event after successful commit (Compensating action safe)
  emitDashboardUpdate()

  return result
}
