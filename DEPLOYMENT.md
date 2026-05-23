# Deployment Architecture

The Prowider Mini Lead Distribution System uses a robust multi-container DevOps architecture designed to maximize horizontal scalability while protecting the database.

## 1. Docker Multi-Stage Builds
We utilize Next.js `output: 'standalone'` mode. The provided `Dockerfile` builds a highly optimized, minimized Node.js container that only includes the compiled server code and stripped dependencies, avoiding the bloated `node_modules` directory in production.

## 2. PgBouncer Connection Pooling
Since Node.js/Next.js creates a new database connection per API invocation (particularly problematic in Serverless environments like Vercel), we deploy **PgBouncer** as a sidecar container in `docker-compose.prod.yml`.
- `POOL_MODE: transaction` guarantees safe lock handling across requests.
- Max client connections are scaled to 1000, while limiting physical Postgres connections to 20, protecting the database CPU from connection storms during traffic spikes.

## 3. Deployment Workflow
1. Commit code to `main`.
2. GitHub Actions CI pipeline runs Lint, Tests, and Build.
3. If successful, CD pipeline builds the new Docker image and pushes it to the registry.
4. Blue/Green Deployment strategy swaps the load balancer to the new container only once it passes its health check.
5. `npx prisma migrate deploy` is triggered automatically on the newest database schema.
