'use client'

import { Activity, FileText, ChevronRight, User, MapPin, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

export default function DistributionLogicPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['leadsHistory'],
    queryFn: async () => {
      const res = await fetch('/api/leads')
      return res.json()
    },
    refetchInterval: 5000
  })

  const [selectedLead, setSelectedLead] = useState<any>(null)

  const leads = data?.data || []

  return (
    <div className="min-h-screen bg-background pt-24 px-6 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-brand-accent" />
            Allocation Logic
          </h1>
        </div>

        {/* Small Logic Box */}
        <Card className="glass-panel border-brand-accent/20 bg-brand-accent/5 max-w-4xl">
          <CardContent className="p-6">
            <h3 className="text-brand-accent text-lg font-bold mb-3">How the Engine Allocates</h3>
            <div className="text-sm text-neutral-300 space-y-3 leading-relaxed">
              <p>Every single lead must be distributed to exactly <strong>3 unique providers total</strong>.</p>
              <div className="bg-black/30 p-4 rounded-lg border border-white/5 my-3">
                <p className="font-bold text-white mb-2">Mandatory Assignment Rules</p>
                <p className="mb-2 text-neutral-400">For every new lead:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-emerald-400">
                  <li><strong className="text-white">Service 1</strong> → Provider 1 must always receive</li>
                  <li><strong className="text-white">Service 2</strong> → Provider 5 must always receive</li>
                  <li><strong className="text-white">Service 3</strong> → Provider 1 AND Provider 4 must always receive</li>
                </ul>
              </div>
              <p><strong>Fair Rotation Rules:</strong> The remaining slots are systematically rotated amongst all available active providers using a persistent round-robin index pool to guarantee mathematical fairness.</p>
            </div>
          </CardContent>
        </Card>

        {/* Global Leads Table */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            All Allocated Leads
          </h2>
          
          <div className="bg-black border border-white/10 rounded-xl overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Lead ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Provider 1</th>
                  <th className="px-6 py-4 font-medium">Provider 2</th>
                  <th className="px-6 py-4 font-medium">Provider 3</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr><td colSpan={7} className="text-center py-10 text-neutral-500">Loading assignments...</td></tr>
                ) : leads.map((lead: any) => {
                  const p1 = lead.assignments?.[0]
                  const p2 = lead.assignments?.[1]
                  const p3 = lead.assignments?.[2]

                  const renderProvider = (p: any) => {
                    if (!p) return <span className="text-neutral-600">-</span>
                    return (
                      <Badge variant={p.assignmentType === 'MANDATORY' ? 'secondary' : 'outline'} className={p.assignmentType === 'MANDATORY' ? "bg-blue-900/30 text-blue-300 border-blue-500/30 text-[10px]" : "text-neutral-400 text-[10px]"}>
                        {p.provider.name} <span className="opacity-50 ml-1">{p.assignmentType === 'MANDATORY' ? '(M)' : '(F)'}</span>
                      </Badge>
                    )
                  }

                  return (
                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-brand-accent font-medium">#{lead.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{lead.customerName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-xs">Service {lead.serviceId}</Badge>
                      </td>
                      <td className="px-6 py-4">{renderProvider(p1)}</td>
                      <td className="px-6 py-4">{renderProvider(p2)}</td>
                      <td className="px-6 py-4">{renderProvider(p3)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="h-8 text-neutral-400 hover:text-white hover:bg-white/10" onClick={() => setSelectedLead(lead)}>
                          Details <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {leads.length === 0 && !isLoading && (
              <div className="text-center py-10 text-neutral-500">No leads generated yet.</div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedLead(null)}>
            <div className="bg-neutral-900 border border-white/10 rounded-xl max-w-lg w-full p-6 space-y-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-accent" />
                  Lead #{selectedLead.id} Details
                </h3>
                <Badge variant="outline" className="bg-white/5 border-white/10 text-xs text-neutral-400">
                  {new Date(selectedLead.createdAt).toLocaleString()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Customer Name</p>
                  <p className="text-white font-medium flex items-center gap-1.5"><User className="w-4 h-4 text-neutral-400"/> {selectedLead.customerName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Phone</p>
                  <p className="text-white font-mono">{selectedLead.phoneNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">City</p>
                  <p className="text-white flex items-center gap-1.5"><MapPin className="w-4 h-4 text-neutral-400"/> {selectedLead.city}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Service Requested</p>
                  <p className="text-white">Service {selectedLead.serviceId}</p>
                </div>
              </div>

              <div className="space-y-1 border-t border-white/10 pt-4">
                <p className="text-xs text-neutral-500 uppercase tracking-wider">Description</p>
                <p className={selectedLead.description ? "text-neutral-300 text-sm" : "text-neutral-500 text-sm italic"}>
                  {selectedLead.description || '-'}
                </p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Assigned Providers</p>
                <div className="space-y-2">
                  {selectedLead.assignments?.map((a: any) => (
                    <div key={a.providerId} className="flex justify-between items-center bg-black/50 p-2.5 rounded-lg border border-white/5">
                      <span className="text-white font-medium">{a.provider.name}</span>
                      <Badge variant={a.assignmentType === 'MANDATORY' ? 'secondary' : 'outline'} className={a.assignmentType === 'MANDATORY' ? "bg-blue-900/30 text-blue-300 border-blue-500/30 text-[10px]" : "text-neutral-400 text-[10px]"}>
                        {a.assignmentType === 'MANDATORY' ? 'Mandatory' : 'Fair Rotation'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full bg-white/10 hover:bg-white/20 text-white" onClick={() => setSelectedLead(null)}>
                Close
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
