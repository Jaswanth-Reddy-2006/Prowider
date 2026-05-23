'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, AlertCircle, Clock, Users, Shield, RotateCw } from 'lucide-react'

const leadSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  phoneNumber: z.string().min(10, 'Phone must be at least 10 digits'),
  city: z.string().min(1, 'City is required'),
  serviceId: z.coerce.number().min(1).max(3),
  description: z.string().optional(),
})

type LeadInput = z.infer<typeof leadSchema>

export default function RequestServicePage() {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<any | null>(null)
  const [serviceVal, setServiceVal] = useState<string>('1')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const mutation = useMutation({
    mutationFn: async (values: LeadInput) => {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit')
      return data
    },
    onSuccess: data => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['providers'] })
        setError(null)
        setFieldErrors({})
        setSuccessData(data)
      }
    },
    onError: e => {
      setError((e as Error).message)
      setSuccessData(null)
    },
  })

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccessData(null)
    setFieldErrors({})

    const form = e.currentTarget
    const raw = Object.fromEntries(new FormData(form)) as any
    raw.serviceId = serviceVal

    const result = leadSchema.safeParse(raw)
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.errors.forEach(err => {
        if (err.path[0]) errors[err.path[0] as string] = err.message
      })
      setFieldErrors(errors)
      return
    }
    mutation.mutate(result.data)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-24 px-4 relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-1/4 -left-64 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl" />

      <div className="w-full max-w-lg relative z-10 space-y-6">
        <Card className="glass-panel border-brand-accent/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white font-bold tracking-tight">
              Request Service
            </CardTitle>
            <p className="text-sm text-neutral-400">Submit an enquiry and instantly match with providers.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Customer Name</label>
                <Input name="customerName" placeholder="e.g. John Doe" required className="bg-black/50 border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-brand-accent/50 py-6" />
                {fieldErrors.customerName && <p className="text-red-400 text-xs">{fieldErrors.customerName}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Phone Number</label>
                <Input name="phoneNumber" placeholder="e.g. 9999999999" required className="bg-black/50 border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-brand-accent/50 py-6" />
                {fieldErrors.phoneNumber && <p className="text-red-400 text-xs">{fieldErrors.phoneNumber}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">City</label>
                <Input name="city" placeholder="e.g. New York" required className="bg-black/50 border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-brand-accent/50 py-6" />
                {fieldErrors.city && <p className="text-red-400 text-xs">{fieldErrors.city}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Service Type</label>
                <select
                  value={serviceVal}
                  onChange={e => setServiceVal(e.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/50 px-3 py-3.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                >
                  <option value="1">Service 1</option>
                  <option value="2">Service 2</option>
                  <option value="3">Service 3</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Description (optional)</label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Additional details..."
                  className="w-full rounded-md bg-black/50 border border-white/10 text-white placeholder:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50 p-4 text-sm resize-y transition-all"
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4">
                <Button type="submit" disabled={mutation.isPending} className="w-full h-12 bg-brand-accent hover:bg-brand-accent/90 text-black font-bold text-base">
                  {mutation.isPending ? <><Loader2 className="animate-spin mr-2 w-5 h-5" /> Processing Allocation...</> : 'Submit Enquiry & Allocate'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Success Result Card */}
        <AnimatePresence>
          {successData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="glass-panel border-brand-accent/30 bg-brand-accent/5">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-brand-accent">
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="text-lg font-bold">Lead Created Successfully!</span>
                  </div>

                  <div className="text-sm text-neutral-300 space-y-1">
                    <p>Lead ID: <strong className="text-white font-mono">#{successData.lead?.id}</strong></p>
                    <p>Customer: <strong className="text-white">{successData.lead?.customerName}</strong></p>
                    <p>Service: <strong className="text-white">Service {successData.lead?.serviceId}</strong></p>
                  </div>

                  <div className="border-t border-white/10 pt-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-brand-accent" />
                      <span className="text-sm font-semibold text-brand-accent">Assigned Providers</span>
                    </div>
                    <div className="space-y-2">
                      {successData.assignments?.map((a: any) => (
                        <div key={a.providerId} className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-white/5">
                          <div className="flex items-center gap-2">
                            {a.assignmentType === 'MANDATORY' ? (
                              <Shield className="w-4 h-4 text-blue-400" />
                            ) : (
                              <RotateCw className="w-4 h-4 text-emerald-400" />
                            )}
                            <span className="text-white font-medium text-sm">{a.providerName || `Provider ${a.providerId}`}</span>
                            <Badge
                              variant={a.assignmentType === 'MANDATORY' ? 'secondary' : 'outline'}
                              className={a.assignmentType === 'MANDATORY' ? 'bg-blue-900/30 text-blue-300 border-blue-500/30 text-xs' : 'text-emerald-300 border-emerald-500/30 text-xs'}
                            >
                              {a.assignmentType === 'MANDATORY' ? 'Mandatory' : 'Fair Rotation'}
                            </Badge>
                          </div>
                          <span className="font-mono text-xs text-neutral-400">
                            {a.remainingQuota ?? '?'}/{a.monthlyQuota ?? 10}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-neutral-500 border-t border-white/10 pt-3">
                    <Clock className="w-3.5 h-3.5" />
                    Transaction Duration: <span className="text-brand-accent font-mono">{successData.transactionDurationMs ?? '—'}ms</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
