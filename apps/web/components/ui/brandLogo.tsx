'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showSubtitle?: boolean
  linkHref?: string
  className?: string
  inverted?: boolean
}

export function BrandLogo({
  size = 'md',
  showSubtitle: _showSubtitle = true,
  linkHref = '/',
  className = '',
  inverted: _inverted = false,
}: BrandLogoProps) {
  const dimensions = {
    xs: { width: 80, height: 20 },
    sm: { width: 112, height: 30 },
    md: { width: 144, height: 40 },
    lg: { width: 176, height: 52 },
  }[size]

  const content = (
    <div className={`flex items-center select-none ${className}`}>
      <Image
        src="/images/logo.png"
        alt="AgriIntel Ethiopia"
        width={dimensions.width}
        height={dimensions.height}
        style={{ objectFit: 'contain' }}
        priority
      />
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
