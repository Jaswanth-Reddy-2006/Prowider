import { AssignmentType, Prisma } from '@prisma/client'
import prisma from '@/db/prisma'

// Mandatory provider mapping per service
const MANDATORY_MAP: Record<number, number[]> = {
  1: [1],
  2: [5],
  3: [1, 4],
}

// Fair rotation pool per service
const FAIR_POOL_MAP: Record<number, number[]> = {
  1: [2, 3, 4],
  2: [6, 7, 8],
  3: [2, 3, 5, 6, 7, 8],
}

export type AllocationResult = {
  providerId: number
  providerName: string
  assignmentType: AssignmentType
  remainingQuota: number
  monthlyQuota: number
}

/**
 * Allocate exactly 3 providers for a lead inside an existing transaction.
 * Accepts a Prisma interactive transaction client to ensure atomicity
 * with lead creation.
 */
export async function allocateProviders(
  tx: Prisma.TransactionClient,
  leadId: number,
  serviceId: number
): Promise<AllocationResult[]> {
  // 1. Acquire row-level lock on allocation state FIRST
  // Use raw SQL for SELECT FOR UPDATE (Prisma doesn't support this natively)
  await tx.$executeRaw`
    INSERT INTO "AllocationState" ("serviceId", "lastAssignedProviderIdx", "updatedAt")
    VALUES (${serviceId}, 0, NOW())
    ON CONFLICT ("serviceId") DO NOTHING
  `

  const lockedState = await tx.$queryRaw<
    { serviceId: number; lastAssignedProviderIdx: number }[]
  >`SELECT "serviceId", "lastAssignedProviderIdx" FROM "AllocationState" WHERE "serviceId" = ${serviceId} FOR UPDATE`

  const state = lockedState[0]
  if (!state) throw new Error(`Allocation state not found for service ${serviceId}`)

  // 2. Load all relevant providers with deterministic lock ordering (by id ASC)
  const mandatoryIds = MANDATORY_MAP[serviceId] ?? []
  const fairPoolIds = FAIR_POOL_MAP[serviceId] ?? []
  const allProviderIds = [...new Set([...mandatoryIds, ...fairPoolIds])].sort((a, b) => a - b)

  // Lock providers in deterministic order to prevent deadlocks
  const providers = await tx.$queryRaw<
    { id: number; name: string; remainingQuota: number; monthlyQuota: number }[]
  >`SELECT id, name, "remainingQuota", "monthlyQuota" FROM "Provider" WHERE id IN (${Prisma.join(allProviderIds)}) ORDER BY id ASC FOR UPDATE`

  const providerMap = new Map(providers.map(p => [p.id, p]))
  const selected: AllocationResult[] = []

  // 3. Mandatory providers first
  for (const pid of mandatoryIds) {
    const prov = providerMap.get(pid)
    if (!prov) throw new Error(`Mandatory provider ${pid} not found`)
    if (prov.remainingQuota <= 0) throw new Error(`Mandatory provider ${pid} (${prov.name}) out of quota`)
    selected.push({
      providerId: pid,
      providerName: prov.name,
      assignmentType: AssignmentType.MANDATORY,
      remainingQuota: prov.remainingQuota - 1,
      monthlyQuota: prov.monthlyQuota,
    })
  }

  // 4. Fair rotation for remaining slots
  const needed = 3 - selected.length
  const fairPool = fairPoolIds
    .map(id => providerMap.get(id))
    .filter((p): p is NonNullable<typeof p> => p != null)

  if (fairPool.length === 0 && needed > 0) {
    throw new Error('No providers available in fair rotation pool')
  }

  const startIdx = state.lastAssignedProviderIdx % fairPool.length
  // Build ordered rotation starting from the last assigned index
  const ordered = [...fairPool.slice(startIdx), ...fairPool.slice(0, startIdx)]

  let assigned = 0
  for (const prov of ordered) {
    if (assigned >= needed) break
    // Skip providers already selected as mandatory
    if (selected.some(s => s.providerId === prov.id)) continue
    if (prov.remainingQuota <= 0) continue
    selected.push({
      providerId: prov.id,
      providerName: prov.name,
      assignmentType: AssignmentType.FAIR_ROTATION,
      remainingQuota: prov.remainingQuota - 1,
      monthlyQuota: prov.monthlyQuota,
    })
    assigned++
  }

  if (selected.length !== 3) {
    throw new Error(`Unable to allocate 3 providers (only found ${selected.length}) — quota exhausted`)
  }

  // 5. Persist assignments and decrement quotas atomically
  for (const sel of selected) {
    await tx.leadAssignment.create({
      data: {
        leadId,
        providerId: sel.providerId,
        assignmentType: sel.assignmentType,
      },
    })
    await tx.provider.update({
      where: { id: sel.providerId },
      data: { remainingQuota: { decrement: 1 } },
    })
  }

  // 6. Update round-robin index
  const newIdx = (state.lastAssignedProviderIdx + needed) % fairPool.length
  await tx.$executeRaw`UPDATE "AllocationState" SET "lastAssignedProviderIdx" = ${newIdx}, "updatedAt" = NOW() WHERE "serviceId" = ${serviceId}`

  return selected
}
