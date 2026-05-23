import { PrismaClient } from "@prisma/client"
import { logger } from "@/lib/logger"

export async function allocateProvidersForLead(
  tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">, 
  serviceId: number,
  txId: string
) {
  // Determine mandatory providers
  const mandatoryProviderIds = getMandatoryProvidersForService(serviceId)

  // Explicitly fetch all eligible providers FOR UPDATE and ORDER BY ID
  // This deterministic ordering prevents Postgres deadlocks
  const providersRaw = await tx.$queryRaw<any[]>`
    SELECT p.id, p.name, p."monthlyQuota", p."remainingQuota",
           (SELECT COUNT(la.id) FROM "LeadAssignment" la WHERE la."providerId" = p.id) as "assignedLeadsCount",
           (SELECT MAX(la."assignedAt") FROM "LeadAssignment" la WHERE la."providerId" = p.id) as "lastAssignedAt"
    FROM "Provider" p
    JOIN "_ProviderServices" ps ON p.id = ps."A"
    WHERE ps."B" = ${serviceId} AND p."remainingQuota" > 0
    ORDER BY p.id ASC
    FOR UPDATE
  `
  
  if (providersRaw.length === 0) {
    throw new Error("No providers available with sufficient quota")
  }

  // Parse raw integers since COUNT/MAX come back as BigInt/Date sometimes
  const eligibleProviders = providersRaw.map(p => ({
    id: Number(p.id),
    name: p.name,
    monthlyQuota: Number(p.monthlyQuota),
    remainingQuota: Number(p.remainingQuota),
    assignedLeadsCount: Number(p.assignedLeadsCount),
    lastAssignedAt: p.lastAssignedAt || new Date(0) // Default to epoch if never assigned
  }))

  const allocatedMandatory = eligibleProviders.filter(p => mandatoryProviderIds.includes(p.id))
  const nonMandatory = eligibleProviders.filter(p => !mandatoryProviderIds.includes(p.id))

  // Virtual Time fairness sorting:
  // Sort non-mandatory by lowest assigned count, then oldest assigned time
  nonMandatory.sort((a, b) => {
    if (a.assignedLeadsCount !== b.assignedLeadsCount) {
      return a.assignedLeadsCount - b.assignedLeadsCount
    }
    return a.lastAssignedAt.getTime() - b.lastAssignedAt.getTime()
  })

  let remainingSlots = 3 - allocatedMandatory.length
  const selectedNonMandatory = []

  if (remainingSlots > 0 && nonMandatory.length > 0) {
    for (let i = 0; i < nonMandatory.length && remainingSlots > 0; i++) {
      selectedNonMandatory.push(nonMandatory[i])
      remainingSlots--
    }
  }

  const finalProviders = [...allocatedMandatory, ...selectedNonMandatory]
  
  if (finalProviders.length === 0) {
    throw new Error("No providers available after rule application")
  }

  logger.info({
    event: "ALLOCATION_CALCULATED",
    txId,
    serviceId,
    mandatory: allocatedMandatory.map(p => p.id),
    fair: selectedNonMandatory.map(p => p.id)
  }, "Virtual Time fairness engine calculated provider assignments")

  return finalProviders
}

function getMandatoryProvidersForService(serviceId: number): number[] {
  if (serviceId === 1) return [1]
  if (serviceId === 2) return [5]
  if (serviceId === 3) return [1, 4]
  return []
}

