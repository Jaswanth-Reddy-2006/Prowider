import prisma from '@/db/prisma'
import { realtimeService } from '@/services/realtime-service'

/**
 * Process a quota-reset webhook idempotently.
 * Uses a transaction with a unique constraint on eventId to guarantee
 * exactly-once processing even under concurrent duplicate calls.
 */
export async function processQuotaReset(eventId: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Attempt to record the webhook event — will throw on duplicate
      await tx.webhookEvent.create({ data: { eventId } })

      // Reset all providers' remainingQuota to their monthlyQuota
      await tx.$executeRaw`UPDATE "Provider" SET "remainingQuota" = "monthlyQuota"`

      // Also reset allocation state indices
      await tx.$executeRaw`UPDATE "AllocationState" SET "lastAssignedProviderIdx" = 0, "updatedAt" = NOW()`

      return { status: 'processed' as const, eventId }
    })

    // Emit realtime event after successful commit
    realtimeService.emit('quota_reset', { eventId })

    return result
  } catch (error: any) {
    // If it's a unique constraint violation, the event was already processed
    if (error?.code === 'P2002') {
      return { status: 'duplicate' as const, eventId }
    }
    throw error
  }
}

// Alias for backwards compatibility with the webhooks/reset-quota route
export const processWebhookResetQuota = processQuotaReset
