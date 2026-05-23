# Prowider Mini - Lead Distribution System

A highly concurrent, real-time backend engine and SaaS operations dashboard designed for intelligent lead allocation.

## 🚀 Features
- **Public Customer Form:** Captures leads and enforces strict database-level duplicate prevention (`phoneNumber` + `serviceId`).
- **Concurrency-Safe Engine:** Distributes leads to exactly 3 providers using native PostgreSQL `SELECT FOR UPDATE` locks. Enforces Mandatory routing and Fair Rotation simultaneously.
- **Real-Time Dashboard:** Powered by Server-Sent Events (SSE). The UI updates instantly as backend database transactions commit.
- **Webhook Console:** An idempotent testing panel to safely simulate payment webhooks and execute concurrency load generation.

---

## ☁️ Production Deployment Guide (The Best Way)

This application is built with Next.js 15 App Router and Prisma. It is designed to be fully serverless. **Do not use Docker** for standard deployment. The best, fastest, and most resilient deployment strategy is **Vercel + Serverless PostgreSQL**.

### Step 1: Set up the Database (Neon.tech)
Because the allocation engine relies heavily on PostgreSQL locking mechanisms (`SELECT FOR UPDATE`), you need a real Postgres database.
1. Go to [Neon.tech](https://neon.tech/) (or Supabase) and create a free project.
2. Copy your **PostgreSQL Connection String**.
   *It will look like:* `postgresql://user:password@ep-cold-surf.us-east-2.aws.neon.tech/neondb?sslmode=require`

### Step 2: Deploy to Vercel
1. Go to [Vercel](https://vercel.com/) and click **"Add New Project"**.
2. Import your GitHub repository (`Prowider`).
3. Under **Environment Variables**, add the following key:
   - **Name:** `DATABASE_URL`
   - **Value:** *(paste your Neon.tech connection string)*
4. Click **Deploy**. Vercel will automatically run `npm install`, generate the Prisma client, and deploy your site globally.

### Step 3: Initialize the Production Database
Once Vercel finishes deploying, your application is live, but your production database is completely empty. You need to push your Prisma schema and seed it.

1. Open your terminal on your local machine inside the project folder.
2. In your local `.env` file, temporarily replace your local `DATABASE_URL` with your **Neon.tech connection string**.
3. Run the following command to push the tables to production:
   ```bash
   npx prisma db push
   ```
4. Run the following command to seed the production database with the 8 initial providers:
   ```bash
   npx prisma db seed
   ```
5. **Important:** Change your local `.env` file back to your local development database string so you don't accidentally edit production data when testing locally.

🎉 **You are fully live!** Visit your Vercel deployment URL to use the real-time system.
