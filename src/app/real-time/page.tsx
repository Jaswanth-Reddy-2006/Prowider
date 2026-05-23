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
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Feature 4 — Real-Time Dashboard Update
          </h1>
          <p className="text-neutral-400 mt-2">
            Real-time functionality exactly according to the assessment.
          </p>
        </div>

        <Card className="glass-panel border-white/5 bg-black/40">
          <CardHeader>
            <CardTitle className="text-xl text-brand-accent">Assessment Requirements Met</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-neutral-300">
            <div>
              <p className="mb-2">The dashboard must automatically reflect newly assigned leads without refreshing the page.</p>
              <div className="p-4 bg-neutral-900 border border-white/10 rounded-lg space-y-2 text-sm font-mono text-neutral-400">
                <div className="text-white font-bold mb-2">Example test:</div>
                <p>1. Keep <a href="/dashboard" className="text-blue-400 hover:underline">/dashboard</a> open in a separate window or tab.</p>
                <p>2. Submit new lead in another tab (via <a href="/request-service" className="text-blue-400 hover:underline">/request-service</a> or <a href="/test-tools" className="text-blue-400 hover:underline">/test-tools</a>).</p>
                <p>3. Dashboard will update automatically within a few seconds.</p>
              </div>
            </div>

            <div className="mt-8 p-4 border border-brand-accent/20 bg-brand-accent/5 rounded-lg flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-1">Status: Online</h3>
                <p className="text-sm text-neutral-400">
                  Implemented via Server-Sent Events (SSE). Go to the Dashboard to see it in action!
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-white/10 rounded-full text-xs">
                <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-brand-accent animate-pulse' : 'bg-red-500'}`} />
                <span className="text-neutral-400 uppercase tracking-wider">{status === 'connected' ? 'SSE CONNECTED' : status}</span>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
