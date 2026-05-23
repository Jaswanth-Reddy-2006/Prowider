'use client'

import { useEffect, useState } from 'react'
import { Server, Activity, Radio } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

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
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Radio className="w-8 h-8 text-brand-accent animate-pulse" />
            Feature 4: Live SSE Feed
          </h1>
          <p className="text-neutral-400 mt-2">
            A raw Server-Sent Events (SSE) socket connection displaying real-time updates as they happen.
          </p>
        </div>

        <Card className="glass-panel border-white/5 bg-black/40">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-400" />
                Event Stream Terminal
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-white/10 rounded-full text-xs">
                <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-brand-accent animate-pulse' : 'bg-red-500'}`} />
                <span className="text-neutral-400 uppercase tracking-wider">{status}</span>
              </div>
            </div>

            <div className="bg-neutral-950 border border-white/10 rounded-lg h-[500px] overflow-auto p-4 font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-neutral-600 h-full flex flex-col items-center justify-center space-y-4">
                  <Activity className="w-8 h-8 opacity-20 animate-spin" />
                  <p>Listening on /api/dashboard...</p>
                  <p className="text-xs max-w-md text-center">To see real-time updates, open the Submit Lead or Test Console pages in another tab and create a lead.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className={`flex gap-3 p-2 rounded ${log.type === 'update' ? 'bg-brand-accent/10 border border-brand-accent/20' : 'hover:bg-white/[0.02]'}`}>
                      <span className="text-neutral-500 shrink-0">[{log.time}]</span>
                      <span className={log.type === 'update' ? 'text-brand-accent font-bold' : log.type === 'ping' ? 'text-neutral-600' : 'text-blue-400'}>
                        [{log.type.toUpperCase()}]
                      </span>
                      <span className="text-neutral-300 break-all">{log.raw}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
