# System Architecture & Design

## High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ /request     │    │ /dashboard   │    │ /test-tools  │  │
│  │ -service     │    │              │    │              │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                   │                    │          │
│         └───────────────────┼────────────────────┘          │
│                             │                               │
│                      ┌──────▼──────┐                        │
│                      │ SSE Browser │                        │
│                      │   Stream    │                        │
│                      └──────┬──────┘                        │
└─────────────────────────────┼──────────────────────────────┘
                              │
                    HTTP/JSON │ Real-time updates
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   NEXT.JS API ROUTES                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ POST /api/   │    │ GET /api/    │    │ POST /api/   │  │
│  │ leads        │    │ providers    │    │ webhooks/    │  │
│  │              │    │              │    │ reset-quota  │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
│         │                   │                    │          │
│         └───────────────────┼────────────────────┘          │
│                             │                               │
│        ┌────────────────────┼────────────────────┐          │
│        │                    │                    │          │
│  ┌─────▼────────────────────────────────────────▼────┐     │
│  │  Business Logic Layer                             │     │
│  │  ┌────────────────────────────────────────────┐   │     │
│  │  │ src/services/allocation-engine.ts          │   │     │
│  │  │ - allocateProvidersForLead()               │   │     │
│  │  │ - getMandatoryProvidersForService()        │   │     │
│  │  └────────────────────────────────────────────┘   │     │
│  │                                                    │     │
│  │  ┌────────────────────────────────────────────┐   │     │
│  │  │ Real-Time Broadcast                        │   │     │
│  │  │ - SSE subscription management              │   │     │
│  │  │ - Event broadcasting                       │   │     │
│  │  └────────────────────────────────────────────┘   │     │
│  └─────┬────────────────────────────────────────────┘      │
│        │                                                    │
└────────┼────────────────────────────────────────────────────┘
         │
         │ Prisma ORM
         │
┌────────▼────────────────────────────────────────────────────┐
│             DATABASE LAYER (PostgreSQL)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Services    │  │  Providers   │  │     Leads    │     │
│  │  (3 records) │  │  (8 records) │  │ (dynamic)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  LeadAssignment                                      │   │
│  │  (Links providers to leads)                          │   │
│  │  ├─ PK: id                                           │   │
│  │  ├─ FK: providerId, leadId                          │   │
│  │  ├─ Unique constraint: (providerId, leadId)         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  WebhookEvent                                        │   │
│  │  (Idempotency enforcement)                          │   │
│  │  ├─ PK: id                                           │   │
│  │  ├─ eventId: String                                 │   │
│  │  ├─ processedAt: DateTime                           │   │
│  │  └─ Unique constraint: (eventId)                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Lead Creation & Allocation Flow

```
Customer Form Submission
         │
         ▼
    POST /api/leads
         │
    ┌────┴──────────────────────────────────────────┐
    │  Validate Input (Zod schema)                   │
    └────┬──────────────────────────────────────────┘
         │
         ▼
    Trigger Allocation Transaction
    (createLeadWithAllocation())
         │
         ├─ Get Eligible Providers
         │  ├─ SELECT FOR UPDATE (Locks rows deterministically)
         │  └─ Filter those with quota > 0
         │
         ├─ Assign Mandatory Providers
         │
         ├─ Get Fair Distribution Pool
         │  └─ Round-Robin sorting using assigned counts & dates
         │
         ├─ Execute DB Mutations
         │  ├─ Decrement Provider Quotas
         │  └─ Create Lead & Assignments
         │
         ├─ Duplicate Found (Prisma P2002) ──▶ Return 409 Conflict
         │
         └─ Commit Transaction
            └─▶ Success
         │
         ▼
    Broadcast Update via SSE
    └─ All connected dashboards refresh
```

## Security Considerations

✅ **Implemented**:
- SQL Injection Protection: Protected by Prisma parameterized queries.
- Duplicate Prevention: Database constraints.
- Idempotency: Unique key enforcement on Webhooks.
- Data Validation: Zod input validation on all endpoints.
- Rate Limiting: API Rate Limiter using LRU Cache.
- Deadlocks: Ordering locks by Primary Key ID during transaction bursts.
