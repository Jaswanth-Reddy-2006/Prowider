# Prowider Mini - Lead Distribution System 🚀

**Live Deployment:** [https://prowider-taupe.vercel.app](https://prowider-taupe.vercel.app)

> **Note:** This project was built as an **Internship Assignment** to demonstrate advanced backend engineering, concurrent transaction handling, and real-time operations. The goal was to build a highly scalable, real-time lead distribution engine capable of handling race conditions and strict allocation algorithms.

## 🌟 Assignment Overview & Technical Implementation

This project implements a complete SaaS backend engine and operations dashboard designed for intelligent lead allocation. 

To satisfy the internship requirements, the system was engineered with a focus on **concurrency safety**, **idempotency**, and **real-time UI updates**:

- **Concurrency-Safe Engine:** Distributes leads to exactly 3 providers using native PostgreSQL `SELECT FOR UPDATE` locks. This guarantees mathematically perfect distribution even if thousands of webhooks hit the server at the exact same millisecond.
- **Advanced Distribution Algorithms:** Implements simultaneous execution of both *Mandatory Direct Routing* (e.g. Service 1 → Provider 1) and *Persistent Fair Rotation* for the remaining slots.
- **Idempotency Guarantee:** Duplicate webhooks (simulating payment processors) are safely caught and ignored using Prisma unique constraints on `eventId`.
- **Real-Time Dashboard (SSE):** The operations dashboard is powered by Server-Sent Events (SSE). The UI automatically updates in the background instantly as backend database transactions commit—no manual refreshing required.

---

## 🛠 Tech Stack Used
- **Framework:** Next.js 15 (App Router, Turbopack)
- **Frontend UI:** React 19, Tailwind CSS, Framer Motion, Lucide React
- **Backend/ORM:** Prisma ORM
- **Database:** Serverless PostgreSQL (Neon.tech) with Serializable Isolation
- **State Management:** TanStack React Query
- **Deployment:** Vercel

---

## ☁️ Production Deployment Details

This application is designed to be fully serverless and is currently deployed on **Vercel** with a **Neon.tech Serverless Postgres** database.

### How to Run Locally

If you want to clone and run this assignment locally on your own machine:

1. Clone the repository: `git clone https://github.com/Jaswanth-Reddy-2006/Prowider.git`
2. Install dependencies: `npm install`
3. Set up your `.env` file with a local PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/prowider"
   ```
4. Push the schema and seed the initial assignment data:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
5. Start the Next.js development server:
   ```bash
   npm run dev
   ```
