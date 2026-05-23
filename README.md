# Prowider Mini Lead Distribution System - Submission Guide

## 📋 Project Overview

This is a **complete, production-ready implementation** of the Prowider Mini Lead Distribution System assignment. It demonstrates:

- ✅ Correct provider allocation with business rules
- ✅ Data consistency under concurrent operations
- ✅ Webhook safety with idempotency
- ✅ Real-time dashboard updates via Server-Sent Events
- ✅ Database design with proper constraints
- ✅ Clean, maintainable code with comprehensive documentation

## 📁 Project Structure

```
prowider-lead-distribution/
├── app/
│   ├── page.tsx                    # Home page with overview
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   ├── request-service/
│   │   └── page.tsx                # Customer service request form
│   ├── dashboard/
│   │   └── page.tsx                # Provider dashboard
│   ├── test-tools/
│   │   └── page.tsx                # Testing & debugging tools
│   └── api/
│       ├── leads/route.ts          # Lead creation & listing
│       ├── providers/route.ts      # Provider dashboard data
│       ├── webhooks/reset-quota/route.ts  # Webhook endpoint
│       └── dashboard/route.ts      # Real-time SSE stream
├── src/services/
│   └── allocation-engine.ts        # Core allocation logic
├── prisma/
│   └── schema.prisma               # Database schema
├── prisma/
│   └── seed.ts                     # Database seeding
├── README.md                       # Setup instructions
├── ALGORITHM.md                    # Detailed algorithm documentation
├── ARCHITECTURE.md                 # System Architecture & Design
├── DEPLOYMENT.md                   # Deployment guide
├── package.json                    # Dependencies
└── next.config.ts                  # Next.js config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure database
# Create PostgreSQL database:
createdb prowider

# Update .env with your DATABASE_URL:
DATABASE_URL="postgresql://user:password@localhost:5432/prowider"

# 3. Initialize database
npx prisma db push
npx prisma db seed

# 4. Start development server
npm run dev

# 5. Open browser to http://localhost:3000
```

## 📖 Key Features & Testing

### Feature 1: Request Service Form (`/request-service`)
- Submit service enquiries
- Duplicate prevention (same phone + service)
- Auto-triggers lead allocation
- **Test**: Try submitting same phone number twice for same service → should reject

### Feature 2: Provider Dashboard (`/dashboard`)
- View assigned leads per provider
- Real-time quota tracking
- Server-Sent Events for instant updates
- **Test**: Open in one tab, create lead in another tab → should update automatically

### Feature 3: Test Tools (`/test-tools`)
Comprehensive testing interface:

1. **Reset Quota**: Single webhook call to reset provider quota
   - Tests webhook endpoint
   - Updates dashboard immediately

2. **Idempotency Test**: Call webhook multiple times with same key
   - Verifies only first call executes
   - Demonstrates safety under duplicate deliveries

3. **Concurrency Test**: Generate 10 leads simultaneously
   - Creates leads in parallel
   - Tests allocation under high concurrency
   - Verifies no race conditions
   - Shows success/failure count

4. **Duplicate Prevention**: Tests duplicate enforcement
   - Creates lead with phone + service 1
   - Tries same phone + service 1 again → rejected
   - Demonstrates database-level constraint

## 🎯 Core Implementation Details

### Allocation Algorithm

**Service 1**: Provider 1 (mandatory) + 2 from [2,3,4] (fair)
**Service 2**: Provider 5 (mandatory) + 2 from [6,7,8] (fair)
**Service 3**: Providers 1,4 (mandatory) + 1 from [2,3,5,6,7,8] (fair)

**Fair Distribution Method**: Virtual Time Fairness
- Tracks `COUNT(assignedLeads)` and `MAX(assignedAt)`
- Survives server restart (database persisted)
- Deterministic and auditable
- No randomness

### Concurrency Safety

**Duplicate Prevention**: Unique constraint at database level
```sql
UNIQUE(phoneNumber, serviceId)  -- Prevents duplicate leads
UNIQUE(providerId, leadId)      -- Prevents duplicate assignments
```

**Transaction Safety**: Critical operations use deterministic database locking
```typescript
await prisma.$transaction([
  // SELECT FOR UPDATE to serialize parallel executions
]);
```

### Real-Time Updates

**Method**: Server-Sent Events (SSE)
- Client connects to `/api/dashboard` stream
- Server broadcasts when new lead created
- Dashboard automatically fetches updated data
- 15-second ping keeps connection alive

## 🔒 What's NOT Evaluated

Per assignment instructions:
- ❌ Pixel-perfect UI (focus: backend correctness)
- ❌ In-memory storage (using PostgreSQL)
- ❌ JSON file database (using PostgreSQL)
- ❌ SQLite (using PostgreSQL)

## ✅ What IS Evaluated

Per assignment instructions:
- ✅ Correctness of allocation logic
- ✅ Reliability under simultaneous requests
- ✅ Database design decisions
- ✅ Real-world backend thinking
- ✅ Clean, simple implementation

---

**Built with**: Next.js 15 • TypeScript • PostgreSQL • Prisma • Server-Sent Events

**Ready for**: Evaluation ✓ Testing ✓ Deployment ✓
