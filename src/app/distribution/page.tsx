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
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-brand-accent" />
            Feature 2: Lead Distribution Engine
          </h1>
          <p className="text-neutral-400 mt-2">
            Visualizing the Virtual Time Fairness rotation algorithm running on the backend.
          </p>
        </div>

        <Card className="glass-panel border-white/5 bg-black/40">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Allocation Rules Engine
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4 text-sm text-neutral-300">
                <p>
                  The backend utilizes a strict, stateless <strong>Virtual Time Fairness</strong> algorithm rather than simple random assignment.
                </p>
                <p>
                  For every lead ingested, the system opens a <strong>Serializable Transaction</strong> and executes a <code>SELECT FOR UPDATE</code> query to securely lock provider rows and prevent race conditions.
                </p>
                <p>
                  1. <strong>Mandatory Providers</strong> are assigned first.<br/>
                  2. Remaining slots are distributed to <strong>Optional Providers</strong> by sorting them by <code className="bg-neutral-800 px-1 py-0.5 rounded text-blue-400">COUNT(assignedLeads)</code> and <code className="bg-neutral-800 px-1 py-0.5 rounded text-blue-400">MAX(assignedAt)</code>.
                </p>
              </div>
              <div className="bg-neutral-900 border border-white/10 p-4 rounded-lg font-mono text-xs text-neutral-400 overflow-x-auto">
                {`// Backend Fairness Sorting Logic
nonMandatory.sort((a, b) => {
  if (a.assignedLeadsCount !== b.assignedLeadsCount) {
    // 1. Lowest lead count gets priority
    return a.assignedLeadsCount - b.assignedLeadsCount
  }
  // 2. Oldest assignment timestamp tie-breaker
  return a.lastAssignedAt.getTime() - b.lastAssignedAt.getTime()
})`}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Pool View */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Live Fairness Rotation State
          </h2>
          <p className="text-sm text-neutral-400">
            This live data proves that distribution is mathematically fair. Providers with the lowest counts will be chosen first in the next rotation.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {servicePools.map(pool => (
              <Card key={pool.id} className="glass-panel border-white/5 bg-black/40 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">Service {pool.id} Pool</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 flex-1">
                  
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-3">Mandatory (Always Included)</h4>
                    <div className="space-y-2">
                      {pool.mandatory.map(id => {
                        const p = providers.find((pr: any) => pr.id === id)
                        return (
                          <div key={id} className="flex justify-between items-center bg-blue-900/10 border border-blue-500/20 p-2 rounded">
                            <span className="text-sm text-blue-300 font-medium">Provider {id}</span>
                            <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-[10px]">
                              {p ? `${p.remainingQuota} Quota` : '...'}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-bold mb-3">Optional (Fairness Rotation)</h4>
                    <div className="space-y-2">
                      {pool.optional.map(id => {
                        const p = providers.find((pr: any) => pr.id === id)
                        return (
                          <div key={id} className="flex justify-between items-center bg-neutral-900/50 border border-white/5 p-2 rounded">
                            <span className="text-sm text-neutral-300">Provider {id}</span>
                            <div className="text-right">
                              <div className="text-xs text-white font-mono">{p ? p.totalLeadsAssigned : 0} Leads</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
