# Testing Architecture & Guidelines

This project uses an enterprise-grade testing architecture to ensure high reliability.

## 1. Unit Testing
We use **Vitest** for fast, native TypeScript testing.
- `src/services/allocation-engine.test.ts` covers the Virtual Time Fairness logic in complete isolation from the database by mocking Prisma transactions.
- Run unit tests: `pnpm test:unit`

## 2. Integration Testing
- Integration tests require a live PostgreSQL database. The CI/CD pipeline spins up a Dockerized PostgreSQL 15 container for this.
- Supertest is used to validate Next.js API endpoints (`/api/leads` and `/api/webhooks/reset-quota`).
- Webhook signature generation is tested here.
- Run integration tests: `pnpm test:integration`

## 3. Concurrency & Load Testing
We use **k6** to simulate extreme traffic and expose race conditions.
- `scripts/load-test.js` ramps up to 100 concurrent Virtual Users targeting the `/api/leads` endpoint.
- Monitors P95 latency and ensures 0% duplicate or deadlocked errors.
- Run load test: `k6 run scripts/load-test.js`

## 4. Continuous Integration
GitHub Actions automatically runs:
- `pnpm lint` and `pnpm tsc --noEmit`
- `pnpm test:unit`
- `pnpm test:integration` (with isolated Postgres container)
- Only if all pass can the branch be merged to `main`.
