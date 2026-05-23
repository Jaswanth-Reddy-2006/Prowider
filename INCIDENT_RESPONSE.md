# Incident Response & Operational Runbooks

## 1. Deadlock Alarms (`40P01`)
**Symptom**: Spikes in transaction failures with log `event: "LEAD_CREATION_FAILED"` and error code `40P01`.
**Root Cause**: While deterministic lock ordering mitigates logical deadlocks, extreme high concurrency might still trigger Postgres internal lock escalations or tuple locks.
**Resolution Playbook**:
1. Check the structured logs (`txId`) in Loki to identify the exact providers causing the contention.
2. If using PgBouncer, check `MAX_CLIENT_CONN`. If connections are queueing excessively, transactions may timeout mid-flight.
3. Temporarily increase application-level exponential backoff retries.

## 2. Quota Underflow Alarms
**Symptom**: `event: "QUOTA_UNDERFLOW"` logged.
**Root Cause**: Race condition bypassing `remainingQuota: { gt: 0 }` (extremely rare due to explicit lock).
**Resolution Playbook**:
1. The transaction naturally rolls back, preventing data corruption.
2. Investigate the specific `serviceId` receiving the burst traffic.
3. Verify if webhooks (`processWebhookResetQuota`) collided with the allocation engine without proper `Serializable` isolation handling.

## 3. SSE Disconnect Storms
**Symptom**: High memory usage on Node containers, or clients reporting stale dashboards.
**Resolution Playbook**:
1. Check if the 15-second heartbeat ping is reaching clients.
2. If Node containers crash with `OOM (Out Of Memory)`, there is a closure leak in the `ReadableStream`. Restart containers immediately.
3. Verify Nginx/Vercel proxy timeout limits aren't aggressively closing active SSE streams before the heartbeat fires.
