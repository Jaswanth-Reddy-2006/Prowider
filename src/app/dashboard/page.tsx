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
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Server className="w-8 h-8 text-brand-accent" />
            Operational Lead Distribution Dashboard
          </h1>
          <p className="text-neutral-400 mt-1">Real-time view of actual database allocations, quotas, and provider status.</p>
        </div>

        {/* Real Provider Quotas */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Provider Quotas & Status
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {providersLoading ? (
              <div className="col-span-4 text-neutral-500 py-10 text-center">Loading providers...</div>
            ) : providers.map((p: any) => (
              <Card key={p.id} className="glass-panel border-white/5 bg-black/40">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-medium">{p.name}</h3>
                      <Badge variant={p.remainingQuota === 0 ? 'destructive' : 'outline'} className="text-[10px]">
                        {p.remainingQuota === 0 ? 'EXHAUSTED' : 'AVAILABLE'}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500 mb-4">ID: {p.id} • Assigned: {p.totalLeadsAssigned}</p>
                    
                    <div className="mb-4 space-y-1">
                      <div className="text-xs text-neutral-400">Mandatory For:</div>
                      <div className="text-sm font-medium text-blue-400">{getMandatoryServices(p.id)}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-auto">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-400">Quota</span>
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Real Lead Assignment Table */}
        <div className="space-y-4 pt-8 border-t border-white/5">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Recent Lead Assignments (Realtime DB State)
          </h2>
          
          <div className="bg-black border border-white/10 rounded-xl overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-neutral-900 text-neutral-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Lead ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Assigned Providers</th>
                  <th className="px-6 py-4 font-medium text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leadsLoading ? (
                  <tr><td colSpan={5} className="text-center py-10 text-neutral-500">Loading assignments...</td></tr>
                ) : leads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-brand-accent">#{lead.id}</td>
                    <td className="px-6 py-4 text-white">
                      <div>{lead.customerName}</div>
                      <div className="text-xs text-neutral-500">{lead.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-neutral-300">Service {lead.serviceId}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {lead.providers.map((p: any) => {
                          const isMandatory = (lead.serviceId === 1 && p.id === 1) || 
                                              (lead.serviceId === 2 && p.id === 5) || 
                                              (lead.serviceId === 3 && (p.id === 1 || p.id === 4));
                          return (
                            <Badge key={p.id} variant={isMandatory ? 'secondary' : 'outline'} className="text-[10px]">
                              {p.name} {isMandatory ? '(M)' : '(F)'}
                            </Badge>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-neutral-500">
                      {new Date(lead.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leads.length === 0 && !leadsLoading && (
              <div className="text-center py-10 text-neutral-500">No leads generated yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
