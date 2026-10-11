'use client'

import React from 'react'
import Link from 'next/link'
import { BrandLogo } from '@/components/ui/brandLogo'

export function Footer() {
  return (
    <footer className="bg-[#121612] border-t border-[#263126] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <BrandLogo size="lg" />
          <div className="text-xs font-mono text-white/60">
            Municipal Autonomous Agricultural Extension Operating System
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs font-mono text-white/70">
          <div className="space-y-3">
            <span className="font-bold text-white uppercase block tracking-wider">Platform</span>
            <a href="#intelligence" className="block hover:text-white transition-colors">Agro-AI Engine</a>
            <a href="#diagnostics" className="block hover:text-white transition-colors">Camera Diagnostics</a>
            <a href="#agro-weather" className="block hover:text-white transition-colors">Agro-Weather Radar</a>
            <a href="#markets" className="block hover:text-white transition-colors">Adama Market Board</a>
          </div>
          <div className="space-y-3">
            <span className="font-bold text-white uppercase block tracking-wider">Role Desks</span>
            <Link href="/farmer" className="block hover:text-white transition-colors">Farmer Workspace</Link>
            <Link href="/da" className="block hover:text-white transition-colors">Development Agent Hub</Link>
            <Link href="/officer" className="block hover:text-white transition-colors">City Officer Desk</Link>
          </div>
          <div className="space-y-3">
            <span className="font-bold text-white uppercase block tracking-wider">Security</span>
            <Link href="/signIn" className="block hover:text-white transition-colors">Credential Access</Link>
            <Link href="/verifyOtp" className="block hover:text-white transition-colors">SMS OTP Token</Link>
            <Link href="/forgotPassword" className="block hover:text-white transition-colors">Access Recovery</Link>
            <Link href="/resetPassword" className="block hover:text-white transition-colors">Session Revocation</Link>
          </div>
          <div className="space-y-3">
            <span className="font-bold text-white uppercase block tracking-wider">Jurisdiction</span>
            <span className="block text-white">Adama City Agriculture Bureau</span>
            <span className="block">East Shewa Zone, Oromia</span>
            <span className="block">Federal Democratic Republic of Ethiopia</span>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/50">
          <div>
            © 2026 Autonomous Agricultural Intelligence & Extension System. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-block w-2 h-2 rounded-full bg-success" />
            <span>Ethio Telecom SMS Gateway: Connected</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
