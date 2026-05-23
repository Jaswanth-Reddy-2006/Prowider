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
  const leads = data?.leads || []

  return (
    <div className="min-h-screen bg-background pt-24 px-6 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-brand-accent" />
            Allocation Logic
          </h1>
        </div>

        {/* Small Logic Box */}
        <Card className="glass-panel border-brand-accent/20 bg-brand-accent/5 max-w-2xl">
          <CardContent className="p-4">
            <p className="text-sm text-neutral-300">
              <strong>Why we allocate:</strong> Leads must be assigned to exactly 3 providers to ensure high conversion rates. 
              We first enforce <strong>Mandatory Rules</strong> (specific services go to specific providers). Remaining slots are filled using a <strong>Fair Rotation</strong> algorithm so no provider is unfairly favored.
            </p>
          </CardContent>
        </Card>

        {/* Global Leads Table moved from Dashboard */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            All Allocated Leads
          </h2>
          
          <div className="bg-black border border-white/10 rounded-xl overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-neutral-900 text-neutral-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-medium">Lead Details</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Assigned Providers</th>
                  <th className="px-6 py-4 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr><td colSpan={4} className="text-center py-10 text-neutral-500">Loading assignments...</td></tr>
                ) : leads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-brand-accent font-medium">#{lead.id}</span>
                        <span className="text-white">{lead.customerName}</span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">{lead.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-neutral-300">
                      <Badge variant="outline" className="bg-white/5 text-neutral-300 border-white/10">
                        Service {lead.serviceId}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {lead.providers.map((p: any) => {
                          const isMandatory = (lead.serviceId === 1 && p.id === 1) || 
                                              (lead.serviceId === 2 && p.id === 5) || 
                                              (lead.serviceId === 3 && (p.id === 1 || p.id === 4));
                          return (
                            <Badge key={p.id} variant={isMandatory ? 'secondary' : 'outline'} className={isMandatory ? "bg-blue-900/30 text-blue-300 border-blue-500/30" : "text-neutral-400"}>
                              {p.name} <span className="opacity-50 ml-1">{isMandatory ? ' (Mandatory)' : ' (Fair)'}</span>
                            </Badge>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-neutral-500 text-xs">
                      {new Date(lead.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leads.length === 0 && !isLoading && (
              <div className="text-center py-10 text-neutral-500">No leads generated yet.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
