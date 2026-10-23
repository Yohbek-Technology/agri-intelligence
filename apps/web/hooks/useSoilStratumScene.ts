'use client'

import { useEffect, useRef } from 'react'
import { SoilScene } from '@/lib/soilScene'
import type { SoilClass, DrainageClass, AgroZone } from '@repo/shared'

interface UseSoilStratumSceneProps {
  soilClass: SoilClass
  drainage: DrainageClass
  agroZone: AgroZone
  elevationMeters?: number
}

export function useSoilStratumScene({
  soilClass,
  drainage,
  agroZone,
  elevationMeters,
}: UseSoilStratumSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<SoilScene | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new SoilScene(containerRef.current, {
      soilClass,
      drainage,
      agroZone,
      elevationMeters,
    })
    sceneRef.current = scene

    const resizeObserver = new ResizeObserver(() => {
      scene.handleResize()
    })
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
      scene.destroy()
      sceneRef.current = null
    }
  }, []) // mount once

  // Dynamically update properties when props change
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateOptions({
        soilClass,
        drainage,
        agroZone,
        elevationMeters,
      })
    }
  }, [soilClass, drainage, agroZone, elevationMeters])

  return { containerRef }
}
