# Technical Documentation: Allocation Algorithm & Concurrency

## Fair Allocation Algorithm

### Overview
The system uses a **persistent virtual time allocation** strategy to ensure fair distribution of leads to providers over time. This algorithm:
- Respects mandatory provider assignments
- Distributes remaining slots fairly without randomness
- Persists allocation state in database (survives server restart)
- Respects monthly quota limits
- Is deterministic and auditable

### Algorithm Steps

#### Step 1: Mandatory Assignment
```
FOR each service:
  GET mandatory providers for service
  FOR each mandatory provider:
    IF provider.quota_remaining > 0:
      SELECT Provider for Lead
      DECREMENT available_slots
```

#### Step 2: Fair Distribution (Virtual Time)
```
WHILE available_slots > 0:
  GET optional_providers for service
  FILTER OUT: already assigned providers
  FILTER OUT: providers with 0 quota
  
  SORT by COUNT(assignedLeads) (ascending)
  THEN SORT by MAX(assignedAt) (ascending)
  
  SELECT top provider
  DECREMENT available_slots
```

### Example Walkthrough

**Setup**:
- Service 1: Mandatory=[1], Optional=[2,3,4]
- Initial state: All counts = 0
- All providers: quota = 10

**Scenario: 3 Service 1 Leads Created**

```
Lead 1:
├─ Assign Provider 1 (mandatory)
├─ Lowest count: Provider 2
├─ Lowest count: Provider 3
└─ Result: [1, 2, 3]

Lead 2:
├─ Assign Provider 1 (mandatory)
├─ Lowest count: Provider 4
├─ Tie breaker (oldest): Provider 2
└─ Result: [1, 4, 2]

Lead 3:
├─ Assign Provider 1 (mandatory)
├─ Lowest count: Provider 3
├─ Tie breaker (oldest): Provider 4
└─ Result: [1, 3, 4]
```

**Distribution After 3 Leads**:
- Provider 1: 3 leads (mandatory, always included)
- Provider 2: 2 leads
- Provider 3: 2 leads
- Provider 4: 2 leads

Result: **Fair and balanced** ✓

## Concurrency Handling

### Problem: Race Conditions

**Scenario**: 10 leads created simultaneously, all trying to allocate to Provider 1

Without proper handling:
```
Thread 1: Read quota=10, assign lead 1, quota becomes 9
Thread 2: Read quota=10, assign lead 2, quota becomes 9  ← WRONG!
Thread 3: Read quota=10, assign lead 3, quota becomes 9  ← WRONG!
```

### Solution: Deterministic Row-Level Locking

#### 1. SELECT FOR UPDATE
```sql
SELECT p.id, p."remainingQuota"
FROM "Provider" p
WHERE p."remainingQuota" > 0
ORDER BY p.id ASC
FOR UPDATE
```

**Effect**: Forces PostgreSQL to acquire an exclusive lock on the provider rows. Parallel threads wait their turn sequentially. Ordering by ID prevents deadlocks.

#### 2. Atomic Decrements
```typescript
await tx.provider.updateMany({
  where: { 
    id: { in: providerIds },
    remainingQuota: { gt: 0 } 
  },
  data: {
    remainingQuota: { decrement: 1 }
  }
})
```

#### 3. Unique Constraints
```sql
CREATE UNIQUE INDEX idx_lead_duplicate ON "Lead"("phoneNumber", "serviceId");
CREATE UNIQUE INDEX idx_provider_assignment ON "LeadAssignment"("providerId", "leadId");
```

## Webhook Idempotency

### Problem: Duplicate Executions
Webhook called twice with network retry. Without idempotency, quota reset could happen twice!

### Solution: Idempotency Keys

```typescript
model WebhookEvent {
  id          Int      @id @default(autoincrement())
  eventId     String   @unique
  processedAt DateTime @default(now())
}
```

### Flow

```typescript
try {
  await prisma.$transaction(async (tx) => {
    // 1. Idempotency Check (Will throw P2002 if duplicate)
    await tx.webhookEvent.create({ data: { eventId } })

    // 2. Safely Reset
    await tx.$executeRaw`UPDATE "Provider" SET "remainingQuota" = "monthlyQuota"`
  }, { isolationLevel: 'Serializable' })
} catch (e) {
  if (e.code === 'P2002') {
    // Already processed - return success (idempotent)
    return { success: true, idempotent: true };
  }
}
```

Result: **Idempotent operation verified under extreme concurrency** ✓
