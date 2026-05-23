'use client'

import { useEffect } from 'react'
import { Server, Users, ShieldCheck, FileText, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useQuery, useQueryClient } from '@tanstack/react-query'

function getMandatoryServices(providerId: number) {
  if (providerId === 1) return 'Service 1, Service 3'
  if (providerId === 4) return 'Service 3'
  if (providerId === 5) return 'Service 2'
  return 'None'
}

export default function DashboardPage() {
  const queryClient = useQueryClient()

  const { data: providersData, isLoading: providersLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const res = await fetch('/api/providers')
      return res.json()
    }
  })

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await fetch('/api/leads')
      return res.json()
    }
  })

  useEffect(() => {
    const sse = new EventSource('/api/dashboard')
    sse.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.event !== 'connected' && data.event !== 'ping') {
        // Triggers UI refresh when backend state changes
        queryClient.invalidateQueries({ queryKey: ['providers'] })
        queryClient.invalidateQueries({ queryKey: ['leads'] })
      }
    }
    return () => sse.close()
  }, [queryClient])

  const providers = providersData?.data || []
  const leads = leadsData?.data || []

  return (
    <div className="min-h-screen bg-background pt-24 px-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Allocation Logic Card */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Server className="w-8 h-8 text-brand-accent" />
              Operational Lead Distribution Dashboard
            </h1>
            <p className="text-neutral-400 mt-1">Real-time view of actual database allocations, quotas, and provider status.</p>
          </div>
          <Card className="glass-panel border-brand-accent/20 bg-brand-accent/5">
            <CardContent className="p-4">
              <h3 className="font-semibold text-brand-accent mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Allocation Logic
              </h3>
              <p className="text-xs text-neutral-300 space-y-2">
                <span className="block"><strong>1. Mandatory Rule:</strong> Specific providers must receive leads for specific services.</span>
                <span className="block"><strong>2. Virtual Time Fairness:</strong> Remaining slots go to optional providers sorted by <em>lowest assignment count</em> and <em>oldest assignment time</em>.</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Real Provider Quotas & Tables */}
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {providersLoading ? (
              <div className="col-span-4 text-neutral-500 py-10 text-center">Loading providers...</div>
            ) : providers.map((p: any) => (
              <Card key={p.id} className="glass-panel border-white/5 bg-black/40 flex flex-col">
                <CardContent className="p-6 flex flex-col flex-1">
                  
                  {/* Provider Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg text-white font-semibold flex items-center gap-2">
                        {p.name}
                        <Badge variant="outline" className="bg-white/5 text-[10px]">ID: {p.id}</Badge>
                      </h3>
                    </div>
                  </div>

                  {/* Core Data Required by Assessment */}
                  <div className="space-y-4 flex-1">
                    <div>
                      <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1">Remaining Quota</div>
                      <div className={p.remainingQuota === 0 ? "text-red-400 font-bold text-xl" : "text-white font-bold text-xl"}>
                        {p.remainingQuota} / {p.monthlyQuota}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1">Leads Received Count</div>
                      <div className="text-white font-bold text-xl">{p.totalLeadsAssigned}</div>
                    </div>

                    <div>
                      <div className="text-xs text-neutral-500 uppercase tracking-wider font-semibold mb-1">Assigned Leads List</div>
                      <div className="text-sm text-neutral-300">
                        {p.recentAssignments?.length > 0 
                          ? p.recentAssignments.map((a: any) => `Lead #${a.leadId}`).join(', ')
                          : <span className="text-neutral-600 italic">None</span>
                        }
                      </div>
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
