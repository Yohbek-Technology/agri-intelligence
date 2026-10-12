'use client'

import React from 'react'
import Link from 'next/link'

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
  linkHref?: string
  className?: string
}

export function BrandLogo({
  size = 'md',
  showSubtitle = true,
  linkHref = '/',
  className = '',
}: BrandLogoProps) {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }[size]

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }[size]

  const content = (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className={`relative ${iconDimensions} flex-shrink-0`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(39,68,34,0.25)]"
        >
          <defs>
            <linearGradient id="leafGrad" x1="6" y1="42" x2="38" y2="6" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1C3318" />
              <stop offset="45%" stopColor="#2D5A27" />
              <stop offset="100%" stopColor="#4A8C3F" />
            </linearGradient>
            <linearGradient id="goldGrad" x1="12" y1="12" x2="42" y2="42" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F5BE47" />
              <stop offset="60%" stopColor="#C78326" />
              <stop offset="100%" stopColor="#8A5112" />
            </linearGradient>
            <linearGradient id="nodeGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#D9E6D5" />
            </linearGradient>
          </defs>

          <rect width="48" height="48" rx="12" fill="#1C2419" stroke="#2E3C2B" strokeWidth="1.5" />
          
          <path
            d="M24 40V16M24 16C24 10 32 8 36 8C36 14 30 18 24 18M24 24C18 24 12 21 12 15C18 15 22 19 24 24M24 31C30 31 36 28 36 22C30 22 26 26 24 31M24 37C19 37 14 34 14 29C19 29 22 33 24 37"
            stroke="url(#leafGrad)"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle cx="36" cy="8" r="3" fill="url(#goldGrad)" />
          <circle cx="12" cy="15" r="2.5" fill="url(#goldGrad)" />
          <circle cx="36" cy="22" r="2.5" fill="url(#goldGrad)" />
          <circle cx="14" cy="29" r="2.2" fill="url(#goldGrad)" />
          <circle cx="24" cy="40" r="2" fill="url(#goldGrad)" />

          <path
            d="M36 8L24 16L12 15M36 22L24 24L14 29"
            stroke="#5C9E50"
            strokeWidth="0.8"
            strokeDasharray="2 2"
            opacity="0.85"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-sans font-bold tracking-tight text-slate-900 ${titleSizes}`}>
            Agri<span className="text-emerald-700 font-extrabold">Intel</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
            ETHIOPIA
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
            Autonomous Agronomic Extension
          </span>
        )}
      </div>
    </div>
  )

  if (linkHref) {
    return (
      <Link href={linkHref} className="hover:opacity-95 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
