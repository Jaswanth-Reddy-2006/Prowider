'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Wrench, RefreshCw, Zap, Server, Shield, TerminalSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function TestToolsPage() {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<{ time: string; msg: string; error?: boolean }[]>([])

  // Fetch webhook event log
  const { data: webhookData, refetch: refetchWebhooks } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const res = await fetch('/api/webhooks')
      return res.json()
    },
    refetchOnWindowFocus: false,
  })

  const appendLog = (msg: string, error = false) => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg, error }, ...prev].slice(0, 100))
  }

  const resetQuota = async () => {
    setLoading(true)
    try {
      const eventId = `manual-reset-${Date.now()}`
      appendLog(`Sending quota reset webhook [${eventId}]...`)
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      })
      const data = await res.json()
      appendLog(`Webhook [${eventId}] → status: ${data.status}`)
      refetchWebhooks()
    } catch (e: any) {
      appendLog(`Error resetting quota: ${e.message}`, true)
    } finally {
      setLoading(false)
    }
  }

  const callWebhookRepeatedly = async () => {
    setLoading(true)
    try {
      const eventId = `idempotency-test-${Date.now()}`
      appendLog(`Testing idempotency with eventId: ${eventId}`)
      for (let i = 1; i <= 3; i++) {
        const res = await fetch('/api/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId }),
        })
        const data = await res.json()
        appendLog(`Call ${i}/3: status = ${data.status} ${data.status === 'duplicate' ? '⚠️ (DUPLICATE IGNORED)' : '✓'}`)
      }
      refetchWebhooks()
    } catch (e: any) {
      appendLog(`Error: ${e.message}`, true)
    } finally {
      setLoading(false)
    }
  }

  const generateLeads = async (count: number) => {
    setLoading(true)
    try {
      appendLog(`Firing ${count} concurrent lead creations...`)
      const startTime = performance.now()
      const res = await fetch('/api/test-tools/lead-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      })
      const elapsed = Math.round(performance.now() - startTime)
      const data = await res.json()
      if (data.results) {
        let success = 0, failed = 0
        data.results.forEach((r: any, i: number) => {
          if (r.error) {
            failed++
            appendLog(`Lead ${i + 1}: FAILED — ${r.error}`, true)
          } else {
            success++
            const provs = r.assignments?.map((a: any) => `${a.providerName || 'P' + a.providerId}(${a.assignmentType === 'MANDATORY' ? 'M' : 'FR'})`).join(', ')
            appendLog(`Lead ${i + 1}: ID #${r.lead?.id} → [${provs}]`)
          }
        })
        appendLog(`Batch complete: ${success} succeeded, ${failed} failed in ${elapsed}ms`)
      } else if (data.error) {
        appendLog(`Generator Error: ${data.error}`, true)
      }
    } catch (e: any) {
      appendLog(`Request failed: ${e.message}`, true)
    } finally {
      setLoading(false)
    }
  }

  const resetSystem = async () => {
    if (!confirm('Are you sure you want to delete all leads and reset quotas? This action cannot be undone.')) return
    setLoading(true)
    try {
      appendLog(`Initiating complete system reset...`)
      const res = await fetch('/api/test-tools/reset-system', {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        appendLog(`SYSTEM RESET SUCCESS: ${data.message}`)
      } else {
        appendLog(`SYSTEM RESET FAILED: ${data.error}`, true)
      }
    } catch (e: any) {
      appendLog(`Error resetting system: ${e.message}`, true)
    } finally {
      setLoading(false)
    }
  }

  const webhookEvents = webhookData?.data || []

  return (
    <div className="min-h-screen bg-background pt-24 px-6 pb-20 selection:bg-brand-accent selection:text-black">
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="flex items-center justify-between bg-brand-accent/5 border border-brand-accent/20 p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-accent/10 flex items-center justify-center border border-brand-accent/30">
              <TerminalSquare className="w-6 h-6 text-brand-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Advanced Testing Console</h1>
              <p className="text-neutral-400 text-sm mt-1">Simulate real-world loads, webhooks, and concurrency conflicts safely.</p>
            </div>
          </div>
          <Badge variant="outline" className="border-brand-accent/50 text-brand-accent">
            Debug Environment Active
          </Badge>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Controls - Left side 5 columns */}
          <div className="lg:col-span-5 space-y-6">
            
            <Card className="glass-panel border-white/5 bg-black/40">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" /> Webhook Simulation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-neutral-500 mb-4">Simulate external payment gateway webhooks confirming successful subscription renewals.</p>
                <Button
                  onClick={resetQuota}
                  disabled={loading}
                  className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  variant="outline"
                >
                  {loading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  Fire Webhook: Reset Quotas to 10
                </Button>
                <Button
                  onClick={callWebhookRepeatedly}
                  disabled={loading}
                  className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20"
                  variant="outline"
                >
                  {loading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Shield className="w-4 h-4 mr-2" />}
                  Fire Webhook 3× (Idempotency Test)
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-panel border-white/5 bg-black/40">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400" /> Load Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-neutral-500 mb-4">Fire simultaneous requests exactly at the same millisecond to test PostgreSQL serializable isolation limits.</p>
                <Button
                  onClick={() => generateLeads(10)}
                  disabled={loading}
                  className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  variant="outline"
                >
                  {loading ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Zap className="w-4 h-4 mr-2" />}
                  Generate 10 Concurrent Leads
                </Button>
              </CardContent>
            </Card>

          </div>

          {/* Execution Logs - Right side 7 columns */}
          <div className="lg:col-span-7 space-y-6 flex flex-col">
            <Card className="glass-panel border-white/5 bg-black/40 flex flex-col">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <TerminalSquare className="w-5 h-5 text-neutral-400" /> Live Terminal Log
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setLogs([])} className="h-6 text-xs text-neutral-500 hover:text-white">Clear</Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 bg-black/60 font-mono text-[12px] space-y-2 min-h-[100px]">
                {logs.length === 0 ? (
                  <div className="flex items-center justify-center text-neutral-600 italic py-10">
                    Awaiting instructions...
                  </div>
                ) : (
                  <AnimatePresence>
                    {logs.map((l, i) => (
                      <motion.div 
                        key={`${i}-${l.time}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`pl-3 border-l-2 ${l.error ? 'border-red-500 text-red-400' : 'border-brand-accent/50 text-neutral-300'}`}
                      >
                        <span className="text-neutral-500 mr-3">[{l.time}]</span>
                        {l.msg}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </CardContent>
            </Card>

            {/* Webhook Event Log Table */}
            <Card className="glass-panel border-white/5 bg-black/40 flex flex-col">
              <CardHeader className="pb-3 border-b border-white/5 shrink-0">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-400" /> Processed Webhook Events
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-neutral-900 text-neutral-500 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-2 font-medium">Event ID (Idempotency Key)</th>
                      <th className="px-4 py-2 font-medium">Processed At</th>
                      <th className="px-4 py-2 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {webhookEvents.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-6 text-neutral-600 text-xs">No webhooks processed yet.</td>
                      </tr>
                    ) : (
                      webhookEvents.map((w: any) => (
                        <tr key={w.eventId} className="hover:bg-white/[0.02]">
                          <td className="px-4 py-2.5 font-mono text-xs text-white">{w.eventId}</td>
                          <td className="px-4 py-2.5 text-xs text-neutral-400">{new Date(w.processedAt).toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right">
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">SUCCESS</Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  )
}
