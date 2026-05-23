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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto mt-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="neon" className="mb-6 px-4 py-1.5 text-sm">
                <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse mr-2 inline-block"></span>
                v2.0 Enterprise Engine Live
              </Badge>
              <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight text-white mb-6">
                Distributed Lead <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-emerald-400">
                  Allocation Engine
                </span>
              </h1>
              <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                A battle-tested production backend demonstrating absolute concurrency safety, Virtual Time fairness rotation, and deterministic row-level locking.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-4 pt-4"
            >
              <Link href="/dashboard">
                <Button variant="neon" size="lg" className="h-14 px-8 text-lg">
                  Open Control Center
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/request-service">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg">
                  Simulate Ingestion
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Architecture Highlights Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-32">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="glass-panel glass-panel-hover border-white/5 bg-white/[0.01]">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Deterministic Locking</h3>
                  <p className="text-neutral-400 leading-relaxed">
                    Zero deadlocks under extreme load. PostgreSQL <code className="text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded text-sm">SELECT FOR UPDATE</code> ensures sequential processing of overlapping provider states.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="glass-panel glass-panel-hover border-white/5 bg-white/[0.01]">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                    <Activity className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Virtual Time Fairness</h3>
                  <p className="text-neutral-400 leading-relaxed">
                    Eliminates stateful rotation bottlenecks. Eligibility is scored dynamically via <code className="text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded text-sm">COUNT(assigned)</code> & <code className="text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded text-sm">MAX(assignedAt)</code>.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="glass-panel glass-panel-hover border-white/5 bg-white/[0.01]">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
                    <Zap className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Realtime Observability</h3>
                  <p className="text-neutral-400 leading-relaxed">
                    SSE-powered operational streams with 15-second persistent heartbeats and memory-leak protection for live dashboard sync.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          <div className="mt-32 text-center pb-20">
            <h2 className="text-2xl font-bold text-white mb-4">Production Ready.</h2>
            <p className="text-neutral-500">Engineered with Next.js 15, PostgreSQL, Prisma, and Pino.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
