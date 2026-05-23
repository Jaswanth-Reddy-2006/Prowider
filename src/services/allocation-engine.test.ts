import { describe, it, expect, vi, beforeEach } from 'vitest'
import { allocateProvidersForLead } from './allocation-engine'

describe('Allocation Engine', () => {
  let mockTx: any

  beforeEach(() => {
    mockTx = {
      $queryRaw: vi.fn()
    }
  })

  it('should throw if no providers are eligible', async () => {
    mockTx.$queryRaw.mockResolvedValue([])
    await expect(allocateProvidersForLead(mockTx, 1, 'tx-1')).rejects.toThrow('No providers available with sufficient quota')
  })

  it('should allocate mandatory provider 1 for service 1 and two fair providers', async () => {
    const mockProviders = [
      { id: 1, name: 'Provider 1', remainingQuota: 10, assignedLeadsCount: 5, lastAssignedAt: new Date('2023-01-01') },
      { id: 2, name: 'Provider 2', remainingQuota: 10, assignedLeadsCount: 2, lastAssignedAt: new Date('2023-01-02') },
      { id: 3, name: 'Provider 3', remainingQuota: 10, assignedLeadsCount: 1, lastAssignedAt: new Date('2023-01-03') },
      { id: 4, name: 'Provider 4', remainingQuota: 10, assignedLeadsCount: 10, lastAssignedAt: new Date('2023-01-04') },
    ]
    mockTx.$queryRaw.mockResolvedValue(mockProviders)

    const result = await allocateProvidersForLead(mockTx, 1, 'tx-1')

    expect(result).toHaveLength(3)
    // Mandatory
    expect(result[0].id).toBe(1)
    
    // Virtual time: sorted by count ASC -> Provider 3 (count 1), Provider 2 (count 2)
    expect(result[1].id).toBe(3)
    expect(result[2].id).toBe(2)
  })

  it('should use oldest assignment time as tie-breaker', async () => {
    const mockProviders = [
      { id: 2, name: 'Provider 2', remainingQuota: 10, assignedLeadsCount: 2, lastAssignedAt: new Date('2023-01-02') },
      { id: 3, name: 'Provider 3', remainingQuota: 10, assignedLeadsCount: 2, lastAssignedAt: new Date('2023-01-01') }, // Older
    ]
    mockTx.$queryRaw.mockResolvedValue(mockProviders)

    const result = await allocateProvidersForLead(mockTx, 4, 'tx-1') // Service 4 has no mandatory

    // Provider 3 should be chosen first because lastAssignedAt is older
    expect(result[0].id).toBe(3)
    expect(result[1].id).toBe(2)
  })

  it('should handle less than 3 providers available gracefully', async () => {
    const mockProviders = [
      { id: 1, name: 'Provider 1', remainingQuota: 10, assignedLeadsCount: 5, lastAssignedAt: new Date() },
    ]
    mockTx.$queryRaw.mockResolvedValue(mockProviders)

    const result = await allocateProvidersForLead(mockTx, 1, 'tx-1')

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })
})
