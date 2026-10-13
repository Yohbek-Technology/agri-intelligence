'use client'

import React from 'react'
import Link from 'next/link'

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
  linkHref?: string
  className?: string
  inverted?: boolean
}

export function BrandLogo({
  size = 'md',
  showSubtitle = true,
  linkHref = '/',
  className = '',
  inverted = false,
}: BrandLogoProps) {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  }[size]

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }[size]

  const content = (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* 100% Transparent Background SVG Logo Mark */}
      <div className={`relative ${iconDimensions} flex-shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(39,68,34,0.3)] transition-transform duration-300 hover:scale-105"
        >
          <defs>
            <linearGradient id="mainLeafGrad" x1="4" y1="32" x2="28" y2="4" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E6F38" />
              <stop offset="50%" stopColor="#274422" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="accentLeafGrad" x1="18" y1="30" x2="32" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#C78326" />
              <stop offset="100%" stopColor="#A3E635" />
            </linearGradient>
            <linearGradient id="glowGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Central Stem & Main Growth Curve (NO BACKGROUND RECTANGLE) */}
          <path
            d="M8 29C13 28 17 23 18 17V7"
            stroke="url(#mainLeafGrad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Left Primary Leaf */}
          <path
            d="M18 17C14 17 9 14 8 9C13 9 17 12 18 17Z"
            fill="url(#mainLeafGrad)"
          />

          {/* Right Upper Leaf */}
          <path
            d="M18 11C22 11 27 8 28 3C23 3 19 6 18 11Z"
            fill="url(#accentLeafGrad)"
          />

          {/* Right Lower Sprout */}
          <path
            d="M17.5 22C22 22 26 19 27 15C22.5 15 19 18 17.5 22Z"
            fill="url(#mainLeafGrad)"
            opacity="0.9"
          />

          {/* Intelligent Telemetry Nodes */}
          <circle cx="28" cy="3" r="2" fill="#A3E635" />
          <circle cx="8" cy="9" r="1.8" fill="#10B981" />
          <circle cx="27" cy="15" r="1.8" fill="#C78326" />
          <circle cx="18" cy="7" r="2.2" fill="#10B981" />

          {/* Connecting Sensor Constellation Links */}
          <path
            d="M8 9L18 7L28 3M18 17L27 15"
            stroke="#10B981"
            strokeWidth="0.75"
            strokeDasharray="1.5 1.5"
            opacity="0.7"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-sans font-bold tracking-tight ${inverted ? 'text-white' : 'text-[var(--color-text-primary)]'} ${titleSizes}`}>
            Agri<span className="text-[var(--color-primary)] font-extrabold">Intel</span>
          </span>
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold border border-[var(--color-primary)]/20">
            ETHIOPIA
          </span>
        </div>
        {showSubtitle && (
          <span className={`text-[10px] font-mono tracking-wider ${inverted ? 'text-slate-400' : 'text-[var(--color-text-muted)]'} uppercase`}>
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
