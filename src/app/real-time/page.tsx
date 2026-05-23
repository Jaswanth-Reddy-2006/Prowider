'use client'

import { useEffect, useState } from 'react'
import { Server, Activity, Radio } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RealTimeFeedPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [status, setStatus] = useState('connecting')

  useEffect(() => {
    const sse = new EventSource('/api/dashboard')
    
    sse.onopen = () => setStatus('connected')
    sse.onerror = () => setStatus('error')
    
    sse.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setLogs(prev => [{
        id: crypto.randomUUID(),
        time: new Date().toLocaleTimeString(),
        type: data.event,
        raw: e.data
      }, ...prev].slice(0, 100))
    }

    return () => sse.close()
  }, [])

  return (
    <div className="min-h-screen bg-background pt-24 px-6 pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Radio className="w-8 h-8 text-brand-accent animate-pulse" />
            Live Incoming Leads
          </h1>
          <p className="text-neutral-400 mt-2">
            This feed updates automatically when new leads are submitted, without refreshing the page.
          </p>
        </div>

        <Card className="glass-panel border-white/5 bg-black/40">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                Real-Time Stream
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-white/10 rounded-full text-xs">
                <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-brand-accent animate-pulse' : 'bg-red-500'}`} />
                <span className="text-neutral-400 uppercase tracking-wider">{status === 'connected' ? 'CONNECTED' : status}</span>
              </div>
            </div>

            <div className="space-y-4">
              {logs.length === 0 ? (
                <div className="text-neutral-600 py-12 flex flex-col items-center justify-center space-y-4 bg-neutral-950/50 rounded-lg border border-white/5">
                  <Activity className="w-8 h-8 opacity-20 animate-spin" />
                  <p>Waiting for incoming leads...</p>
                </div>
              ) : (
                logs.filter(l => l.type === 'update').length === 0 ? (
                  <div className="text-neutral-500 italic py-8 text-center bg-neutral-950/50 rounded-lg border border-white/5">
                    Connected. Waiting for the first lead to be submitted...
                  </div>
                ) : (
                  logs.filter(l => l.type === 'update').map((log) => {
                    const parsed = JSON.parse(log.raw.replace('data: ', ''))
                    return (
                      <div key={log.id} className="p-4 bg-brand-accent/10 border border-brand-accent/30 rounded-lg flex justify-between items-center shadow-[0_0_15px_rgba(0,255,128,0.1)]">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center">
                            <Radio className="w-5 h-5 text-brand-accent" />
                          </div>
                          <div>
                            <div className="text-white font-medium">New Lead Received!</div>
                            <div className="text-xs text-neutral-400">Database updated successfully.</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-white">Lead #{parsed.data?.lead?.id || 'Unknown'}</div>
                          <div className="text-xs text-brand-accent">Service {parsed.data?.lead?.serviceId || 'Unknown'}</div>
                        </div>
                      </div>
                    )
                  })
                )
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
