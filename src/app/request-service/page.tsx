'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Database, Send, CheckCircle2, Server } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const formSchema = z.object({
  customerName: z.string().min(2, "Required"),
  phoneNumber: z.string().min(10, "Required"),
  city: z.string().min(2, "Required"),
  description: z.string().optional(),
  serviceId: z.coerce.number().min(1).max(3),
})

export default function RequestServicePage() {
  const [allocationResult, setAllocationResult] = useState<any>(null)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      customerName: '', phoneNumber: '', city: '', description: '', serviceId: 3
    }
  })

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      setAllocationResult(null)
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create lead")
      return data
    },
    onSuccess: (data) => {
      setAllocationResult(data.data)
      form.reset()
    }
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate(values)
  }

  return (
    <div className="min-h-screen bg-background pt-24 px-6 pb-20">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
        {/* Left Column: Form */}
        <div>
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Lead Ingestion Endpoint</h1>
            <p className="text-neutral-400">Submit a lead to automatically distribute it based on backend rules.</p>
          </div>

          <Card className="glass-panel">
            <CardContent className="p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">Customer Name</label>
                    <input {...form.register('customerName')} className="w-full bg-black border border-white/10 rounded-md h-11 px-4 text-white focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none transition-all" placeholder="Jane Doe" />
                    {form.formState.errors.customerName && <p className="text-red-400 text-xs">{form.formState.errors.customerName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">Phone Number</label>
                    <input {...form.register('phoneNumber')} className="w-full bg-black border border-white/10 rounded-md h-11 px-4 text-white focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none transition-all" placeholder="9999999999" />
                    {form.formState.errors.phoneNumber && <p className="text-red-400 text-xs">{form.formState.errors.phoneNumber.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">City</label>
                    <input {...form.register('city')} className="w-full bg-black border border-white/10 rounded-md h-11 px-4 text-white focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none transition-all" placeholder="San Francisco" />
                    {form.formState.errors.city && <p className="text-red-400 text-xs">{form.formState.errors.city.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-300">Service Area ID (1-3)</label>
                    <select {...form.register('serviceId')} className="w-full bg-black border border-white/10 rounded-md h-11 px-4 text-white focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none transition-all">
                      <option value={1}>Service 1</option>
                      <option value={2}>Service 2</option>
                      <option value={3}>Service 3</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Request Details</label>
                  <textarea {...form.register('description')} className="w-full bg-black border border-white/10 rounded-md p-4 text-white focus:border-brand-accent focus:ring-1 focus:ring-brand-accent outline-none transition-all min-h-[100px]" placeholder="Optional description..." />
                </div>

                <Button type="submit" variant="neon" className="w-full h-12 text-base mt-4" disabled={mutation.isPending}>
                  {mutation.isPending ? "Processing Database Transaction..." : "Submit Lead"}
                  {!mutation.isPending && <Send className="ml-2 w-4 h-4" />}
                </Button>

                {mutation.isError && (
                  <div className="p-4 rounded-md bg-red-950/50 border border-red-900 text-red-400 text-sm">
                    {mutation.error.message}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Allocation Results Viewer */}
        <div className="flex flex-col pt-12 lg:pt-0">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
              <Server className="w-5 h-5 text-brand-accent" />
              Allocation Transparency
            </h2>
            <p className="text-neutral-400 text-sm">View exactly how the backend distributed your lead based on quota and fairness rules.</p>
          </div>

          <AnimatePresence mode="wait">
            {!allocationResult ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 border border-dashed border-white/10 rounded-xl flex items-center justify-center bg-black/20"
              >
                <div className="text-center text-neutral-500">
                  <Database className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p>Awaiting transaction payload...</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="space-y-6"
              >
                <Card className="border-brand-accent/30 bg-brand-accent/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <CheckCircle2 className="w-8 h-8 text-brand-accent" />
                      <div>
                        <h3 className="text-lg font-bold text-brand-accent">Transaction Committed</h3>
                        <p className="text-xs text-brand-accent/70 font-mono">Lead #{allocationResult.id} • Latency: {allocationResult.durationMs}ms</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-white border-b border-white/10 pb-2">Assigned Providers ({allocationResult.assignments.length}/3)</h4>
                      <ul className="space-y-3">
                        {allocationResult.assignments.map((a: any, i: number) => (
                          <li key={i} className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-white/5">
                            <div>
                              <span className="text-white font-medium block">{a.providerName}</span>
                              <span className="text-xs text-neutral-400">ID: {a.providerId}</span>
                            </div>
                            <div className="text-right">
                              <Badge variant={a.isMandatory ? 'secondary' : 'outline'} className="text-[10px]">
                                {a.isMandatory ? 'MANDATORY ASSIGNMENT' : 'FAIR ROTATION'}
                              </Badge>
                              <div className="text-xs text-neutral-500 mt-1">
                                Quota Updated
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  )
}
