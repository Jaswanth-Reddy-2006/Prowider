import prisma from "@/db/prisma"
import { emitDashboardUpdate } from "./realtime-service"
import { logger } from "@/lib/logger"

export async function processWebhookResetQuota(eventId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Idempotency Check
      await tx.webhookEvent.create({
        data: { eventId }
      })

      // 2. Perform the quota reset safely
      // Reset remainingQuota to monthlyQuota for all providers using Serializable isolation equivalent for safe resets
      await tx.$executeRaw`UPDATE "Provider" SET "remainingQuota" = "monthlyQuota"`
    }, {
      isolationLevel: 'Serializable'
    })

    logger.info({ event: "WEBHOOK_PROCESSED", eventId }, "Webhook quotas reset successfully")
    emitDashboardUpdate()
    
    return { success: true, message: "Quotas reset successfully" }
  } catch (error: any) {
    if (error.code === 'P2002') {
      logger.info({ event: "WEBHOOK_IDEMPOTENT", eventId }, "Webhook duplicate rejected safely")
      return { success: true, message: "Webhook already processed (idempotent)" }
    }
    logger.error({ event: "WEBHOOK_INTERNAL_ERROR", eventId, error }, "Webhook processing failed")
    throw error
  }
}
