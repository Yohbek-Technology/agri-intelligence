'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
}

/** Single animated skeleton bar — YouTube-style shimmer */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <motion.div
      className={`rounded-lg bg-surface-subtle overflow-hidden relative ${className}`}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}

/** Table skeleton — rows × cols grid */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div
      className="bg-surface rounded-xl overflow-hidden"
      style={{ border: '2px solid var(--color-border-ui)' }}
    >
      {/* Header */}
      <div
        className="flex gap-4 px-4 py-3 bg-surface-subtle"
        style={{ borderBottom: '2px solid var(--color-border-ui)' }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, ri) => (
        <div
          key={ri}
          className="flex gap-4 px-4 py-3.5"
          style={ri < rows - 1 ? { borderBottom: '2px solid var(--color-border-ui)' } : {}}
        >
          {Array.from({ length: cols }).map((_, ci) => (
            <Skeleton
              key={ci}
              className="h-3 flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Card skeleton — for settings sections */
export function CardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div
      className="bg-surface rounded-2xl p-6 space-y-4"
      style={{ border: '2px solid var(--color-border-ui)' }}
    >
      <Skeleton className="h-3 w-32" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** List skeleton — for kebele / staff lists */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 py-3 px-1"
          style={i < rows - 1 ? { borderBottom: '2px solid var(--color-border-ui)' } : {}}
        >
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
          <Skeleton className="h-7 w-16 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  )
}
