'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Cpu, RefreshCw, Layers, ShieldCheck, Database } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

async function generateSignature(bodyString: string, secret = 'test_secret') {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(bodyString))
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function TestConsolePage() {
  const queryClient = useQueryClient()
  const [txnLogs, setTxnLogs] = useState<any[]>([])

  const { data: webhooksData, isLoading: webhooksLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const res = await fetch('/api/webhooks')
      return res.json()
    }
  })
  
  const webhooks = webhooksData?.data || []

  const logTxn = (msg: string, success: boolean = true) => {
    setTxnLogs(prev => [{ id: crypto.randomUUID(), time: new Date().toLocaleTimeString(), msg, success }, ...prev].slice(0, 50))
  }

  const stressTestMutation = useMutation({
    mutationFn: async (count: number) => {
      logTxn(`Dispatching ${count} simultaneous database transactions...`, true)
      const res = await fetch('/api/test/generate-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, serviceId: 3 })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return data
    },
    onSuccess: (data) => {
      logTxn(`Stress test completed: ${data.successCount} succeeded, ${data.failedCount} failed.`, true)
      if (data.results) {
        data.results.forEach((r: any) => {
          if (r.status === 'fulfilled') {
            logTxn(`Lead #${r.value.data.id} allocated in ${r.value.data.durationMs}ms`, true)
          } else {
            logTxn(`Failed transaction: ${r.reason}`, false)
          }
        })
      }
    },
    onError: (err: any) => logTxn(`Stress test error: ${err.message}`, false)
  })

  const webhookMutation = useMutation({
    mutationFn: async (isIdempotent: boolean) => {
      const eventId = isIdempotent ? "fixed-idempotent-event-id-123" : `reset-${Date.now()}`
      const body = JSON.stringify({ eventId })
      const signature = await generateSignature(body)
      
      const res = await fetch('/api/webhooks/reset-quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-webhook-signature': signature },
        body
      })
      const data = await res.json()
      return { data, isIdempotent }
    },
    onSuccess: ({ data, isIdempotent }) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] })
    },
  })

  return (
    <div className="min-h-screen bg-background pt-24 px-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Cpu className="w-8 h-8 text-brand-accent" />
            Database Testing Console
          </h1>
          <p className="text-neutral-400 mt-1">Directly invoke backend systems to verify concurrency, quotas, and idempotency.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Concurrency Testing */}
          <Card className="glass-panel border-white/5 bg-black/40">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                Concurrency & Lock Injector
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-neutral-400">
                Spawns simultaneous Node.js promises to force PostgreSQL row lock contention on the quotas table.
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => stressTestMutation.mutate(10)}
                  disabled={stressTestMutation.isPending}
                  className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Inject 10 Requests
                </Button>
              </div>

              <div className="bg-neutral-950 border border-white/10 rounded-lg h-[300px] overflow-auto p-4 font-mono text-xs space-y-2">
                {txnLogs.length === 0 ? (
                  <div className="text-neutral-600 h-full flex items-center justify-center">Awaiting payload injection...</div>
                ) : (
                  txnLogs.map(log => (
                    <div key={log.id} className="flex gap-2">
                      <span className="text-neutral-500 shrink-0">[{log.time}]</span>
                      <span className={log.success ? 'text-emerald-400' : 'text-red-400'}>{log.msg}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Webhook Testing */}
          <Card className="glass-panel border-white/5 bg-black/40">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                Webhook Idempotency Tester
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-neutral-400">
                Transmits cryptographically signed webhooks to test duplicate handling (Prisma <code className="text-neutral-300 bg-neutral-800 px-1 rounded">P2002</code>).
              </p>
              <div className="flex gap-4">
                <Button 
                  onClick={() => webhookMutation.mutate(false)}
                  disabled={webhookMutation.isPending}
                  className="flex-1 h-12" variant="outline"
                >
                  Send Unique Webhook (Reset Quotas)
                </Button>
                <Button 
                  onClick={() => webhookMutation.mutate(true)}
                  disabled={webhookMutation.isPending}
                  className="flex-1 h-12 bg-blue-900/40 hover:bg-blue-900/60 text-blue-300 border border-blue-500/30"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Replay Webhook
                </Button>
              </div>

              <div className="bg-neutral-950 border border-white/10 rounded-lg h-[300px] overflow-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-900 text-neutral-500 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 font-medium">Timestamp</th>
                      <th className="px-4 py-2 font-medium">Event ID</th>
                      <th className="px-4 py-2 font-medium">DB Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {webhooksLoading ? (
                      <tr><td colSpan={3} className="text-center py-8 text-neutral-600">Loading logs...</td></tr>
                    ) : webhooks.map((w: any) => (
                      <tr key={w.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-neutral-500">{new Date(w.processedAt).toLocaleTimeString()}</td>
                        <td className="px-4 py-3 font-mono text-neutral-300">{w.eventId}</td>
                        <td className="px-4 py-3">
                          <Badge variant={w.status === 'PROCESSED' ? 'neon' : 'secondary'} className="text-[10px]">
                            {w.status === 'IGNORED_DUPLICATE' ? 'IGNORED (DUPLICATE)' : w.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
