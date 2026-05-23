# Prowider Mini Lead Distribution System

This is a production-grade backend assignment demonstrating a highly concurrent, transaction-safe, and real-time lead distribution system.

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (running locally or via Docker)

### 2. Installation
```bash
# Clone the repository and install dependencies
pnpm install
```

### 3. Database Configuration
Create a `.env` file in the root directory and add your PostgreSQL connection string:
```
DATABASE_URL="postgresql://user:password@localhost:5432/prowider?schema=public"
```

### 4. Database Seeding & Migration
Run the following commands to setup the schema and insert the required seed data (3 Services, 8 Providers, rules):
```bash
npx prisma db push
npx prisma db seed
```

### 5. Running the Application
```bash
npm run dev
```
Open `http://localhost:3000` to view the application.

---

## Architectural Explanations (Assignment Requirements)

### 1. Allocation Algorithm (Virtual Time Fairness)
The allocation engine uses a deterministic, persistent fairness model rather than a random or stateful round-robin index.
- **Filtering:** We first filter providers by checking `remainingQuota > 0` and ensuring they are connected to the requested Service.
- **Mandatory Assignment:** We identify mandatory providers based on business rules (e.g., Service 1 -> Provider 1) and forcefully allocate them a slot if they have quota.
- **Fair Rotation:** For the remaining available slots (up to 3 total), we select eligible non-mandatory providers and sort them dynamically using two database metrics:
  1. `COUNT(assignedLeads)` (Ascending) — Prioritize providers with the fewest leads.
  2. `MAX(assignedAt)` (Ascending) — In case of a tie, prioritize the provider who has waited the longest since their last assignment.
- This guarantees long-term fairness, prevents repeated assignments to the same provider in a short burst, and natively persists across server restarts without maintaining external state.

### 2. How Concurrency was Handled
Concurrency is handled directly at the database layer using explicit row-level locking to prevent race conditions during high-volume simultaneous lead ingestion.
- Inside an **Interactive Prisma Transaction**, we execute a raw SQL query to fetch eligible providers.
- This query uses `SELECT ... FOR UPDATE` ordered by `Provider.id ASC`.
- **`FOR UPDATE`** places an exclusive lock on the selected provider rows, meaning if 10 simultaneous requests attempt to allocate leads, Postgres forces them to execute sequentially.
- **Ordering by ID** prevents deadlocks when multiple transactions attempt to lock overlapping sets of providers.
- Finally, quota decrements (`decrement: 1` with a `gt: 0` condition) and lead assignments are executed safely within the same atomic transaction block.

### 3. How Webhook Idempotency is Ensured
Webhook idempotency is critical to prevent accidental double-resets of provider quotas if the payment gateway retries a webhook payload.
- We maintain a dedicated `WebhookEvent` table in PostgreSQL with a unique `eventId` column.
- When a webhook is received, we execute a transaction with `Serializable` isolation level.
- The transaction attempts to insert the `eventId` into the `WebhookEvent` table.
- If the `eventId` already exists, PostgreSQL throws a Unique Constraint Violation (`P2002`).
- We catch this specific error, halt the transaction, and return a `200 OK` (idempotent success) to the gateway *without* resetting the quotas again.
- In addition, all webhook payloads are cryptographically verified using HMAC SHA-256 signatures to prevent spoofing.

---

## Testing Features
Navigate to `/test-tools` to use the built-in database console to:
1. Fire 10 concurrent requests simultaneously to verify `FOR UPDATE` locking.
2. Replay webhooks to verify Idempotency.
3. Reset provider quotas safely.

Navigate to `/dashboard` to view live Server-Sent Events (SSE) updates representing true database state without relying on artificial frontend reactivity.
