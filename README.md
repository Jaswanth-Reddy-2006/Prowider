# Prowider Mini - Lead Distribution System

A highly concurrent, real-time backend engine and SaaS operations dashboard designed for intelligent lead allocation. This platform is built to handle race conditions, enforce mandatory distribution rules, dynamically manage fair-rotation algorithms, and maintain strict idempotent safety.

![Dashboard Preview](docs/dashboard-preview.png) *(Note: You can add screenshots to a docs folder later)*

## 🚀 Core Features

1. **Public Customer Ingestion Form**
   - Captures lead details (Name, Phone, City, Service, Description).
   - Enforces database-level duplicate prevention using unique compound indexes (`phoneNumber` + `serviceId`).

2. **Concurrency-Safe Distribution Engine**
   - Atomically allocates exactly 3 providers per lead.
   - **Mandatory Logic:** Directly routes specific services to specific providers.
   - **Fair Rotation Algorithm:** Automatically rotates remaining lead slots across all active, available providers via a persistent round-robin index.
   - Leverages native PostgreSQL `SELECT FOR UPDATE` locks to entirely prevent race conditions during extreme traffic spikes.

3. **Real-Time Operations Dashboard**
   - Powered by **Server-Sent Events (SSE)**.
   - UI updates instantly in the background without refreshing as soon as database transactions commit.
   - Detailed provider modals displaying Remaining Quota, Total Leads, and comprehensive Assignment Histories.

4. **Idempotent Webhook Testing Console**
   - Simulate external API integrations (like a Stripe successful payment webhook) to reset provider quotas.
   - **Idempotency Guarantee:** Duplicate webhooks hitting the server at the exact same millisecond will only process *once*, guaranteed by Prisma unique constraints on `eventId`.
   - **Load Generation:** Built-in tool to instantly fire 10 concurrent leads to verify backend lock management under stress.

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Frontend:** React 19, Tailwind CSS, Framer Motion, Lucide React
- **Backend/ORM:** Prisma
- **Database:** PostgreSQL (Serializable Isolation)
- **State Management:** TanStack React Query

## 💻 Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (Local or hosted via Supabase/Neon/Render)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd Prowider
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory and add your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/prowider"
```

### 3. Database Initialization & Seeding
Push the schema to your database and seed it with the default providers:
```bash
npx prisma db push
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Access the application at `http://localhost:3000`.

## ☁️ Deployment Guide

To deploy this application to production, you need a serverless hosting provider (like Vercel) and a managed PostgreSQL database.

### 1. Database Hosting (Neon.tech or Supabase)
1. Create a free PostgreSQL database on [Neon](https://neon.tech/) or [Supabase](https://supabase.com/).
2. Copy the **Connection String** provided.

### 2. Vercel Deployment
1. Push this codebase to your GitHub repository.
2. Go to [Vercel](https://vercel.com/) and create a "New Project", selecting your GitHub repository.
3. In the **Environment Variables** section, add your `DATABASE_URL`.
4. The Build Command (`npm run build`) and Install Command (`npm install`) will be auto-detected.
5. Click **Deploy**. Vercel will automatically build your Next.js app and deploy it globally.

---

*Designed and engineered for backend-heavy SaaS operations.*
