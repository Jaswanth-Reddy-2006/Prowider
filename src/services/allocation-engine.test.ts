import { describe, it, expect, vi, beforeEach } from 'vitest'
import { allocateProviders } from './allocation-engine'
import { AssignmentType } from '@prisma/client'

describe('Allocation Engine', () => {
  let mockTx: any

  beforeEach(() => {
    mockTx = {
      $executeRaw: vi.fn(),
      $queryRaw: vi.fn(),
      leadAssignment: { create: vi.fn() },
      provider: { update: vi.fn() }
    }
  })

  it('should throw if allocation state not found', async () => {
    mockTx.$queryRaw.mockResolvedValueOnce([]) // state
    await expect(allocateProviders(mockTx, 1, 1)).rejects.toThrow('Allocation state not found for service 1')
  })

  it('should allocate exactly 3 providers', async () => {
    mockTx.$queryRaw
      .mockResolvedValueOnce([{ serviceId: 1, lastAssignedProviderIdx: 0 }]) // state
      .mockResolvedValueOnce([ // providers
        { id: 1, name: 'Provider 1', remainingQuota: 10, monthlyQuota: 10 },
        { id: 2, name: 'Provider 2', remainingQuota: 10, monthlyQuota: 10 },
        { id: 3, name: 'Provider 3', remainingQuota: 10, monthlyQuota: 10 },
        { id: 4, name: 'Provider 4', remainingQuota: 10, monthlyQuota: 10 },
      ])

    const result = await allocateProviders(mockTx, 1, 1)

    expect(result).toHaveLength(3)
    // Mandatory for service 1 is Provider 1
    expect(result[0].providerId).toBe(1)
    expect(result[0].assignmentType).toBe(AssignmentType.MANDATORY)
    
    // Remaining are fair rotation
    expect(result[1].assignmentType).toBe(AssignmentType.FAIR_ROTATION)
    expect(result[2].assignmentType).toBe(AssignmentType.FAIR_ROTATION)
  })

  it('should throw if quota exhausted', async () => {
    mockTx.$queryRaw
      .mockResolvedValueOnce([{ serviceId: 1, lastAssignedProviderIdx: 0 }]) // state
      .mockResolvedValueOnce([ // providers
        { id: 1, name: 'Provider 1', remainingQuota: 0, monthlyQuota: 10 }, // Exhausted
        { id: 2, name: 'Provider 2', remainingQuota: 10, monthlyQuota: 10 },
      ])

    await expect(allocateProviders(mockTx, 1, 1)).rejects.toThrow('Mandatory provider 1 (Provider 1) out of quota')
  })
})
