import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'
import Link from 'next/link'
import { Database } from 'lucide-react'
import { Button } from '@/components/ui/button'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prowider Enterprise Platform',
  description: 'A premium distributed lead allocation engine.',
}

function Navbar() {
  return (
    <nav className="fixed top-0 w-full border-b border-white/5 bg-black/50 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-brand-accent flex items-center justify-center">
            <Database className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Prowider<span className="text-brand-accent">.</span></span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/request-service">
            <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">Form</Button>
          </Link>
          <Link href="/distribution">
            <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">Allocation</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">Dashboard</Button>
          </Link>
          <Link href="/real-time">
            <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">Live Feed</Button>
          </Link>
          <Link href="/test-tools">
            <Button variant="outline" size="sm" className="border-brand-accent/30 text-brand-accent hover:bg-brand-accent/10">
              Test Console
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased selection:bg-brand-accent selection:text-black`}>
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
