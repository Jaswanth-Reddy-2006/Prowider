# System Architecture & Engineering

The Prowider Mini Lead Distribution System is engineered with strong production safeguards prioritizing data integrity, fairness, and transactional safety over pure development speed.

## 1. Deterministic Lock Ordering
PostgreSQL `SELECT ... FOR UPDATE` row-level locks are susceptible to deadlocks if multiple concurrent transactions lock overlapping sets of rows in different orders.
We mitigate this in `allocation-engine.ts` by explicitly running:
```sql
ORDER BY p.id ASC FOR UPDATE
```
This guarantees that concurrent lead requests requiring overlapping providers will always acquire locks in a globally deterministic order, completely eliminating database deadlocks under high concurrency.

## 2. Virtual Time Fairness Engine
Instead of relying on a single bottleneck row (`AllocationState`) that restricts concurrency to a single thread per service, the system computes provider allocation dynamically using "Virtual Time":
- Providers are scored by `COUNT(assignments)` (fewest leads gets priority).
- Tie-breakers fall back to `MAX(assignedAt)` (oldest assignment gets priority).
This ensures long-term fairness, naturally handles new/reactivated providers without resetting rotation indexes, and allows massive horizontal scalability without state drift.

## 3. Quota Atomic Validation
During the interactive transaction, the engine decrements quota with `remainingQuota: { decrement: 1 }` and a condition `remainingQuota: { gt: 0 }`.
Because the row was already locked during the allocation step, the decrement is guaranteed to succeed unless an administrative override occurred. If `count !== providerIds.length` is returned, the transaction instantly rolls back, ensuring no provider ever falls below 0.

## 4. Webhook Security & Idempotency
- **Security**: The `/api/webhooks/reset-quota` endpoint requires a SHA-256 HMAC signature `X-Webhook-Signature` derived from the raw request body and a shared secret, preventing unauthorized actors from spamming quota resets.
- **Idempotency**: Webhook logic stores `eventId` in a table with a unique constraint. If a duplicate event is received due to network retries, PostgreSQL throws a `P2002` conflict error. The engine catches this error and returns `200 OK`, protecting downstream business logic.

## 5. SSE Real-time Robustness
The `/api/dashboard` Server-Sent Events endpoint includes a 15-second heartbeat (`ping` events). 
This prevents intermediary proxies (like Vercel or Nginx) from closing the stream due to idle timeouts, and immediately triggers cleanup of stale `ReadableStream` closures when a client silently drops, plugging potential memory leaks.

## 6. Observability
Structured logging is enabled using `pino`.
Every major state transition emits an event with a transaction correlation ID (`txId`), enabling deep traceability across Kibana/Datadog dashboards.
