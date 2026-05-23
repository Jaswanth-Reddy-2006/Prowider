# Deployment Guide

## Production Readiness Checklist
Before deploying the Prowider Mini Lead Distribution System to production, ensure the following constraints are met:
- [x] Node.js 18+ runtime is available.
- [x] A managed PostgreSQL database (e.g., Supabase, Neon, AWS RDS) is provisioned.
- [x] Connection strings are securely stored in environment variables.

## Deploying to Vercel (Recommended)

Vercel is the native platform for Next.js 15 applications and offers the most seamless deployment experience.

### Step 1: Database Provisioning
1. Create a free PostgreSQL database on [Neon.tech](https://neon.tech/) or [Supabase](https://supabase.com/).
2. Copy your connection string (it will look like `postgresql://user:password@host/db`).

### Step 2: Vercel Project Setup
1. Push your code to a GitHub repository.
2. Log into [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Expand the **Environment Variables** section and add:
   - Key: `DATABASE_URL`
   - Value: `<Your PostgreSQL Connection String>`
   - Key: `WEBHOOK_SECRET`
   - Value: `<A secure random string for HMAC verification>`
5. Click **Deploy**.

### Step 3: Production Database Seeding
Once Vercel has built and deployed the application, you must apply your Prisma schema and seed data to the production database. Run these commands locally in your terminal, passing in the remote URL:

```bash
DATABASE_URL="<Your PostgreSQL Connection String>" npx prisma db push
DATABASE_URL="<Your PostgreSQL Connection String>" npx prisma db seed
```

## Deploying to Docker / Railway / Render

The application can also be containerized or run on standard PaaS providers.

### Standard Build Steps:
```bash
# 1. Install dependencies
pnpm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Build Next.js
npm run build

# 4. Start Production Server
npm run start
```

Make sure that `DATABASE_URL` is exposed to the runtime environment, and run `npx prisma db push` and `npx prisma db seed` during the release phase or manually.
