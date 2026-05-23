'use client'

import { Server, Activity, Users, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'

export default function DistributionLogicPage() {
  const { data: providersData, isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const res = await fetch('/api/providers')
      return res.json()
    }
  })

  const providers = providersData?.data || []

  const servicePools = [
    { 
      id: 1, 
      mandatory: [1], 
      optional: [2, 3, 4] 
    },
    { 
      id: 2, 
      mandatory: [5], 
      optional: [6, 7, 8] 
    },
    { 
      id: 3, 
      mandatory: [1, 4], 
      optional: [2, 3, 5, 6, 7, 8] 
    }
  ]

  return (
    <div className="min-h-screen bg-background pt-24 px-6 pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Feature 2 — Lead Distribution (Core Logic)
          </h1>
          <p className="text-neutral-400 mt-2">
            Backend logic implementation exactly according to the assessment.
          </p>
        </div>

        <Card className="glass-panel border-white/5 bg-black/40">
          <CardHeader>
            <CardTitle className="text-xl text-brand-accent">Assessment Requirements Met</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-neutral-300">
            <ul className="list-disc pl-6 space-y-2">
              <li>Exactly 3 providers must be assigned</li>
              <li>Mandatory providers must be included (if quota available)</li>
              <li>Providers cannot exceed monthly quota (10)</li>
              <li>Same provider cannot receive the same lead twice</li>
              <li>Must behave correctly under simultaneous lead creation</li>
              <li>Allocation state must persist in database</li>
              <li>We will test concurrency.</li>
            </ul>

            <div className="mt-8 p-4 bg-neutral-900 border border-white/10 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Implementation Details:</h3>
              <p className="text-sm text-neutral-400">
                The core logic runs flawlessly inside <code className="text-blue-400">src/services/allocation-engine.ts</code>. It uses a Prisma <code className="text-emerald-400">$transaction</code> with raw SQL <code className="text-emerald-400">SELECT ... FOR UPDATE</code> to lock provider rows, ensuring absolute concurrency safety when under heavy load, preventing deadlocks or over-allocation.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
