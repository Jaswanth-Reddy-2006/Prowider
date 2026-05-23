'use client'

import { useEffect, useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, ShieldCheck, ChevronRight, FileText } from 'lucide-react'

export default function DashboardPage() {
  const [selectedProvider, setSelectedProvider] = useState<any>(null)

  const { data: providersData, refetch } = useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const res = await fetch('/api/providers')
      return res.json()
    },
    refetchOnWindowFocus: false,
  })

  // SSE Connection for realtime updates without Live Feed table
  useEffect(() => {
    const es = new EventSource('/api/dashboard')
    es.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data)
        if (parsed.event === 'lead_created' || parsed.event === 'quota_reset' || parsed.event === 'init') {
          refetch()
        }
      } catch {
        // ignore parse errors
      }
    }
    return () => es.close()
  }, [refetch])

  const providers = providersData?.data || []

  return (
    <div className="min-h-screen bg-background pt-24 px-6 pb-20 selection:bg-brand-accent selection:text-black">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-brand-accent" />
          <h1 className="text-3xl font-bold text-white tracking-tight">Provider Operations</h1>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl">
            <div className="text-xs text-neutral-500 uppercase tracking-wider">Total Providers</div>
            <div className="text-2xl font-bold text-white mt-1">{providers.length}</div>
          </div>
          <div className="glass-panel p-4 rounded-xl">
            <div className="text-xs text-neutral-500 uppercase tracking-wider">Total Leads Assigned</div>
            <div className="text-2xl font-bold text-brand-accent mt-1">{providers.reduce((s: number, p: any) => s + (p.totalLeadsAssigned || 0), 0)}</div>
          </div>
          <div className="glass-panel p-4 rounded-xl">
            <div className="text-xs text-neutral-500 uppercase tracking-wider">Total Quota Remaining</div>
            <div className="text-2xl font-bold text-white mt-1">{providers.reduce((s: number, p: any) => s + (p.remainingQuota || 0), 0)}</div>
          </div>
          <div className="glass-panel p-4 rounded-xl">
            <div className="text-xs text-neutral-500 uppercase tracking-wider">Exhausted Providers</div>
            <div className="text-2xl font-bold text-red-400 mt-1">{providers.filter((p: any) => p.remainingQuota <= 0).length}</div>
          </div>
        </div>

        {/* Provider Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {providers.map((p: any) => (
            <motion.div key={p.id} layout>
              <Card className={`glass-panel border-white/5 bg-black/40 hover:bg-black/60 transition-colors h-full flex flex-col ${
                p.remainingQuota <= 0 ? 'border-red-500/20' : ''
              }`}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-medium flex items-center gap-2 text-sm">
                      {p.name}
                      {p.isMandatory && <ShieldCheck className="w-4 h-4 text-blue-400" />}
                    </h3>
                    <span className={`text-[10px] font-bold tracking-wider ${p.remainingQuota <= 0 ? 'text-red-400' : 'text-neutral-500'}`}>
                      {p.remainingQuota <= 0 ? 'EXHAUSTED' : 'ACTIVE'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-3 flex-1 flex flex-col">
                  {/* Quota Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-500">Remaining Quota</span>
                      <span className="font-mono text-white">{p.remainingQuota}/{p.monthlyQuota}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          p.remainingQuota <= 0 ? 'bg-red-500' :
                          p.remainingQuota <= 3 ? 'bg-yellow-500' : 'bg-brand-accent'
                        }`}
                        style={{ width: `${(p.remainingQuota / p.monthlyQuota) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-500">Leads Received Count</span>
                    <span className="font-mono text-white">{p.totalLeadsAssigned || 0}</span>
                  </div>
                  
                  {/* Assigned Leads (ALL) - truncated vertically via scroll if too long */}
                  <div className="pt-2 border-t border-white/5 flex-1">
                    <span className="text-[10px] text-neutral-600 uppercase tracking-wider block mb-1.5">Assigned Leads List</span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                      {p.recentAssignments?.length > 0 ? (
                        p.recentAssignments.map((a: any) => (
                          <Badge key={a.leadId} variant="outline" className="text-[10px] bg-white/5 text-neutral-300 border-white/10 px-1.5 py-0">
                            #{a.leadId} {a.assignmentType === 'MANDATORY' ? '(M)' : '(F)'}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-[10px] text-neutral-600">No leads assigned yet</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-auto">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full h-8 text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 flex items-center justify-center"
                      onClick={() => setSelectedProvider(p)}
                    >
                      View Provider Details <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Provider Details Modal */}
        <AnimatePresence>
          {selectedProvider && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedProvider(null)}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-neutral-900 border border-white/10 rounded-xl max-w-lg w-full p-6 space-y-6 relative" 
                onClick={e => e.stopPropagation()}
              >
                <button 
                  onClick={() => setSelectedProvider(null)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                >
                  ✕
                </button>

                <div className="flex items-center justify-between pr-8">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {selectedProvider.name}
                    {selectedProvider.isMandatory && <ShieldCheck className="w-5 h-5 text-blue-400" />}
                  </h3>
                  <span className={`text-[10px] font-bold tracking-wider ${selectedProvider.remainingQuota <= 0 ? 'text-red-400' : 'text-neutral-500'}`}>
                    {selectedProvider.remainingQuota <= 0 ? 'EXHAUSTED' : 'ACTIVE'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/50 border border-white/5 rounded-lg p-3">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider">Remaining Quota</p>
                    <p className="text-2xl font-mono text-white mt-1">{selectedProvider.remainingQuota} <span className="text-sm text-neutral-500">/ {selectedProvider.monthlyQuota}</span></p>
                  </div>
                  <div className="bg-black/50 border border-white/5 rounded-lg p-3">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider">Total Leads Received</p>
                    <p className="text-2xl font-mono text-brand-accent mt-1">{selectedProvider.totalLeadsAssigned || 0}</p>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Full Assigned Leads History
                  </p>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedProvider.recentAssignments?.length > 0 ? (
                      selectedProvider.recentAssignments.map((a: any) => (
                        <div key={a.leadId} className="flex justify-between items-center bg-black/50 p-3 rounded-lg border border-white/5">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-mono text-sm">#{a.leadId}</span>
                              <span className="text-neutral-300 text-sm font-medium">{a.lead?.customerName || 'Customer'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-500 uppercase tracking-wider">
                              <span>Service {a.lead?.serviceId || '?'}</span>
                              <span>•</span>
                              <span>{a.assignedAt ? new Date(a.assignedAt).toLocaleDateString() : 'Recent'}</span>
                            </div>
                          </div>
                          <Badge variant={a.assignmentType === 'MANDATORY' ? 'secondary' : 'outline'} className={a.assignmentType === 'MANDATORY' ? "bg-blue-900/30 text-blue-300 border-blue-500/30 text-[10px]" : "text-neutral-400 text-[10px]"}>
                            {a.assignmentType === 'MANDATORY' ? 'Mandatory Rule' : 'Fair Rotation Algorithm'}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-neutral-600 text-sm">No leads assigned to this provider yet.</div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
