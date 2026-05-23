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
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Providers & Assigned Leads
          </h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {providersLoading ? (
              <div className="col-span-2 text-neutral-500 py-10 text-center">Loading providers...</div>
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
                      <div className="text-xs text-neutral-400 mt-1">
                        Mandatory Services: <span className="text-blue-400 font-medium">{getMandatoryServices(p.id)}</span>
                      </div>
                    </div>
                    <Badge variant={p.remainingQuota === 0 ? 'destructive' : 'outline'}>
                      {p.remainingQuota === 0 ? 'EXHAUSTED' : 'AVAILABLE'}
                    </Badge>
                  </div>

                  {/* Quota Progress */}
                  <div className="mb-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Monthly Quota Remaining</span>
                      <span className={p.remainingQuota === 0 ? "text-red-400 font-bold" : "text-white font-bold"}>
                        {p.remainingQuota} / {p.monthlyQuota}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${p.remainingQuota === 0 ? 'bg-red-500' : 'bg-brand-accent'}`} 
                        style={{ width: `${Math.min((p.remainingQuota / p.monthlyQuota) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-right text-xs text-neutral-500 mt-1">
                      Total Leads Received: <strong className="text-white">{p.totalLeadsAssigned}</strong>
                    </div>
                  </div>
                  
                  {/* Assigned Leads Table */}
                  <div className="flex-1 border border-white/10 rounded-lg overflow-hidden bg-neutral-950/50">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-900/80 text-neutral-400 uppercase text-[10px]">
                        <tr>
                          <th className="px-4 py-2 font-medium">Lead ID</th>
                          <th className="px-4 py-2 font-medium">Service</th>
                          <th className="px-4 py-2 font-medium text-right">Assigned At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {p.recentAssignments?.length > 0 ? (
                          p.recentAssignments.map((a: any, idx: number) => (
                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-4 py-3 font-mono text-white">#{a.leadId}</td>
                              <td className="px-4 py-3 text-neutral-300">Service {a.serviceId}</td>
                              <td className="px-4 py-3 text-right font-mono text-neutral-500">
                                {new Date(a.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-neutral-600 italic">
                              No leads assigned yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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
