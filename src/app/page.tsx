'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Database, ShieldCheck, Zap, Server, Activity } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-brand-accent selection:text-black">
      {/* Navbar */}
      <nav className="fixed top-0 w-full border-b border-white/5 bg-black/50 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-brand-accent flex items-center justify-center">
              <Database className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Prowider<span className="text-brand-accent">.</span></span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/request-service" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Submit Lead</Link>
            <Link href="/dashboard" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/test-tools">
              <Button variant="outline" size="sm" className="border-brand-accent/30 text-brand-accent hover:bg-brand-accent/10">
                Feature 5: Test Console
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto mt-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="neon" className="mb-6 px-4 py-1.5 text-sm">
                <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse mr-2 inline-block"></span>
                Full Stack Assignment Ready
              </Badge>
              <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
                Prowider Mini <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-emerald-400">
                  Lead Distribution System
                </span>
              </h1>
              <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                A production-ready implementation fulfilling all 5 requested features, including real-time updates, idempotent webhooks, and concurrency-safe fair allocation.
              </p>
            </motion.div>
          </div>

          {/* 5 Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
            
            {/* Feature 1 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-panel glass-panel-hover border-white/5 bg-white/[0.01] h-full flex flex-col">
                <CardContent className="p-8 flex flex-col flex-1">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
                    <span className="font-bold text-blue-400">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Public Customer Form</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-6 flex-1">
                    Customer ingestion form with strict database-level unique constraints preventing duplicate phone numbers for the same service.
                  </p>
                  <Link href="/request-service">
                    <Button variant="outline" className="w-full">Open Form /request-service</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 2 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-panel glass-panel-hover border-white/5 bg-white/[0.01] h-full flex flex-col">
                <CardContent className="p-8 flex flex-col flex-1">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20">
                    <span className="font-bold text-purple-400">2</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Lead Distribution Logic</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-6 flex-1">
                    Core allocation engine using SELECT FOR UPDATE deterministic locking. Enforces mandatory providers and Virtual Time Fairness rotation.
                  </p>
                  <Link href="/dashboard">
                    <Button variant="secondary" className="w-full">View Results in Dashboard</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 3 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="glass-panel glass-panel-hover border-white/5 bg-white/[0.01] h-full flex flex-col">
                <CardContent className="p-8 flex flex-col flex-1">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                    <span className="font-bold text-emerald-400">3</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Provider Dashboard</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-6 flex-1">
                    Comprehensive UI showing remaining quotas, leads received counts, and individual assigned leads directly from real database state.
                  </p>
                  <Link href="/dashboard">
                    <Button variant="neon" className="w-full">Open /dashboard</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 4 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="glass-panel glass-panel-hover border-white/5 bg-white/[0.01] h-full flex flex-col">
                <CardContent className="p-8 flex flex-col flex-1">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4 border border-orange-500/20">
                    <span className="font-bold text-orange-400">4</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Real-Time Updates</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-6 flex-1">
                    Powered by Server-Sent Events (SSE). The dashboard automatically reflects newly assigned leads without any manual page refreshes.
                  </p>
                  <Link href="/request-service">
                    <Button variant="outline" className="w-full">Test by submitting a lead</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feature 5 */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="md:col-span-2 lg:col-span-1">
              <Card className="glass-panel glass-panel-hover border-brand-accent/20 bg-brand-accent/5 h-full flex flex-col">
                <CardContent className="p-8 flex flex-col flex-1">
                  <div className="w-10 h-10 rounded-lg bg-brand-accent/20 flex items-center justify-center mb-4 border border-brand-accent/40">
                    <span className="font-bold text-brand-accent">5</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Webhook Simulation Panel</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-6 flex-1">
                    Testing tools featuring idempotent Webhook calls to reset quotas, and a Concurrency injector to test simultaneous request handling.
                  </p>
                  <Link href="/test-tools">
                    <Button variant="outline" className="w-full border-brand-accent text-brand-accent hover:bg-brand-accent/10">Open /test-tools</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

          </div>
          
        </div>
      </main>
    </div>
  )
}
