'use client'

import { motion } from 'framer-motion'
import { Database, ShieldCheck, Zap, Activity, Users, Settings } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-brand-accent selection:text-black">
      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto mt-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 border border-brand-accent/30 flex items-center justify-center">
                  <Database className="w-8 h-8 text-brand-accent" />
                </div>
              </div>
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
                Prowider Mini <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-emerald-400">
                  Lead Distribution System
                </span>
              </h1>
              <p className="text-lg text-neutral-400 max-w-3xl mx-auto leading-relaxed">
                This system simulates a highly concurrent, real-time backend engine for automatically assigning incoming leads to exactly 3 correct providers, respecting mandatory business rules, dynamic fair-rotation algorithms, and strict idempotent database safety.
              </p>
            </motion.div>
          </div>

          {/* 5 Features Detailed Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mt-24">
            
            {/* Feature 1 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-panel glass-panel-hover border-white/5 bg-black/40 h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Users className="w-32 h-32" />
                </div>
                <CardContent className="p-8 flex flex-col flex-1 relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                      <span className="font-bold text-blue-400 text-xl">1</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">Public Customer Form</h3>
                  </div>
                  <div className="text-neutral-400 text-sm leading-relaxed mb-6 flex-1 space-y-3">
                    <p>A customer ingestion interface that simulates lead capture.</p>
                    <ul className="list-disc pl-5 space-y-1 text-neutral-300">
                      <li>Captures Name, Phone, City, Service Type, and Description.</li>
                      <li><strong>Database-Level Duplicate Prevention:</strong> The system enforces a strict unique compound index on <code className="bg-white/10 px-1 rounded text-white">phoneNumber + serviceId</code> to mathematically guarantee the same phone number cannot submit another lead for the same service.</li>
                    </ul>
                  </div>
                  <Link href="/request-service">
                    <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10">Try Feature 1: Customer Form</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 2 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-panel glass-panel-hover border-white/5 bg-black/40 h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <ShieldCheck className="w-32 h-32" />
                </div>
                <CardContent className="p-8 flex flex-col flex-1 relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
                      <span className="font-bold text-purple-400 text-xl">2</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">Concurrency-Safe Distribution</h3>
                  </div>
                  <div className="text-neutral-400 text-sm leading-relaxed mb-6 flex-1 space-y-3">
                    <p>The core allocation engine operating as a single atomic transaction.</p>
                    <ul className="list-disc pl-5 space-y-1 text-neutral-300">
                      <li>Assigns exactly 3 providers per lead.</li>
                      <li>Calculates Mandatory matches (e.g. Service 1 → Provider 1).</li>
                      <li>Applies <strong>Fair Allocation Logic</strong> for the remaining slots using a persistent round-robin index pool.</li>
                      <li>Uses PostgreSQL <code className="bg-white/10 px-1 rounded text-white">SELECT FOR UPDATE</code> locks and serializable isolation to perfectly prevent race conditions and over-assignments even under simultaneous traffic.</li>
                    </ul>
                  </div>
                  <Link href="/distribution">
                    <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10">View Feature 2: Allocation Logic</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 3 & 4 Combined */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
              <Card className="glass-panel glass-panel-hover border-brand-accent/20 bg-brand-accent/5 h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-brand-accent">
                  <Activity className="w-48 h-48" />
                </div>
                <CardContent className="p-8 flex flex-col md:flex-row gap-8 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                        <span className="font-bold text-emerald-400 text-xl">3</span>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                        <span className="font-bold text-emerald-400 text-xl">4</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">Real-Time Provider Dashboard</h3>
                    </div>
                    <div className="text-neutral-400 text-sm leading-relaxed mb-6 space-y-3">
                      <p>The command center for providers, updated invisibly in the background.</p>
                      <ul className="list-disc pl-5 space-y-1 text-neutral-300">
                        <li>Displays real-world database truth: Total Quotas, Remaining Quotas, and complete Lead Assignment histories.</li>
                        <li><strong>Feature 4 integration:</strong> Powered by <code className="bg-white/10 px-1 rounded text-white text-emerald-400">Server-Sent Events (SSE)</code>. As soon as a transaction commits in PostgreSQL, the event bus pushes the update directly into the UI. No refreshing required.</li>
                      </ul>
                    </div>
                    <Link href="/dashboard">
                      <Button variant="neon" className="w-full sm:w-auto">Open Features 3 & 4: Dashboard</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 5 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
              <Card className="glass-panel glass-panel-hover border-white/5 bg-black/40 h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Settings className="w-48 h-48" />
                </div>
                <CardContent className="p-8 flex flex-col md:flex-row gap-8 relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shrink-0">
                        <span className="font-bold text-orange-400 text-xl">5</span>
                      </div>
                      <h3 className="text-xl font-bold text-white">Idempotent Webhook Testing Panel</h3>
                    </div>
                    <div className="text-neutral-400 text-sm leading-relaxed mb-6 space-y-3">
                      <p>A specialized console for simulating external system integration (like Stripe payment webhooks) and load testing the backend logic.</p>
                      <ul className="list-disc pl-5 space-y-1 text-neutral-300">
                        <li>Allows resetting all quotas accurately via a simulated external HTTP endpoint.</li>
                        <li><strong>Idempotency Guaranteed:</strong> Even if a webhook payload is received 10 times in the exact same millisecond, the Prisma unique constraint on <code className="bg-white/10 px-1 rounded text-white">eventId</code> mathematically guarantees the database quota will only be reset exactly <em>once</em>.</li>
                        <li>Built-in concurrency injector to fire 10 leads simultaneously, proving the backend lock management works under extreme load.</li>
                      </ul>
                    </div>
                    <Link href="/test-tools">
                      <Button variant="outline" className="w-full sm:w-auto bg-white/5 border-white/10 hover:bg-white/10">Try Feature 5: Test Console</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>
          
        </div>
      </main>
    </div>
  )
}
