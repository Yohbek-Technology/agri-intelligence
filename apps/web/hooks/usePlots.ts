'use client'

import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { farmerService } from '@/services/farmerService'
import { officerService } from '@/services/officerService'
import {
  createPlotSchema,
  type PlotRow,
  type CreatePlotInput,
  type AreaUnit,
  type GeoResolutionResult,
  type CropRow,
} from '@repo/shared'

interface UsePlotsOptions {
  farmerId?: string
  initialUnit?: AreaUnit
}

export function usePlots({ farmerId, initialUnit = 'timad' }: UsePlotsOptions = {}) {
  const queryClient = useQueryClient()
  const [displayUnit, setDisplayUnit] = useState<AreaUnit>(initialUnit)
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived'>('active')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})

  // Geo-resolution state during plot creation
  const [isResolvingGeo, setIsResolvingGeo] = useState(false)
  const [geoResolution, setGeoResolution] = useState<GeoResolutionResult | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)

  // 1. Fetch plots list
  const {
    data: plots = [],
    isLoading: plotsLoading,
    error: plotsError,
    refetch: refetchPlots,
  } = useQuery<PlotRow[]>({
    queryKey: ['plots', farmerId, statusFilter, displayUnit],
    queryFn: async () => {
      if (!farmerId) return []
      const res = await farmerService.listPlots(farmerId, {
        status: statusFilter,
        unit: displayUnit,
      })
      if (!res.success) {
        throw new Error(res.error || 'Failed to fetch plots')
      }
      return res.data ?? []
    },
    enabled: Boolean(farmerId),
    staleTime: 30_000,
  })

  // 2. Fetch approved crops catalog for planned crop selection
  const { data: crops = [] } = useQuery<CropRow[]>({
    queryKey: ['catalog', 'crops'],
    queryFn: async () => {
      const res = await officerService.listCrops()
      return res.data ?? []
    },
    staleTime: 5 * 60_000,
  })

  // 3. Resolve Coordinates via PostGIS & Elevation API
  const resolveCoordinates = useCallback(
    async (lat: number, lng: number) => {
      setIsResolvingGeo(true)
      try {
        const res = await farmerService.resolveGeo(lat, lng, displayUnit)
        if (res.success && res.data) {
          setGeoResolution(res.data)
          if (!res.data.isInJurisdiction) {
            toast.warning('Warning: Selected coordinates fall outside the municipal jurisdiction boundary.')
          }
          return res.data
        } else {
          toast.error(res.error || 'Failed to resolve location attributes.')
          return null
        }
      } catch (err) {
        toast.error('Network error during geo-resolution.')
        return null
      } finally {
        setIsResolvingGeo(false)
      }
    },
    [displayUnit]
  )

  // 4. GPS Auto-acquisition
  const acquireGps = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.')
      return
    }

    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Math.round(pos.coords.latitude * 1000000) / 1000000
        const lng = Math.round(pos.coords.longitude * 1000000) / 1000000
        const accuracy = Math.round(pos.coords.accuracy)

        toast.success(`GPS acquired: ${lat}, ${lng} (±${accuracy}m)`)
        await resolveCoordinates(lat, lng)
        setGpsLoading(false)
      },
      (err) => {
        setGpsLoading(false)
        toast.error(`GPS Error: ${err.message}`)
      },
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 0,
      }
    )
  }, [resolveCoordinates])

  // 5. Create Plot Mutation
  const createPlotMutation = useMutation({
    mutationFn: async (input: CreatePlotInput) => {
      if (!farmerId) throw new Error('No farmer selected.')
      const parsed = createPlotSchema.safeParse(input)
      if (!parsed.success) {
        setFormErrors(parsed.error.flatten().fieldErrors)
        throw new Error('Please fix the validation errors in the plot form.')
      }
      setFormErrors({})

      const res = await farmerService.createPlot(farmerId, parsed.data)
      if (!res.success) {
        throw new Error(res.error || 'Failed to register plot.')
      }
      return res.data
    },
    onSuccess: () => {
      toast.success('Plot parcel registered successfully!')
      setDrawerOpen(false)
      setGeoResolution(null)
      queryClient.invalidateQueries({ queryKey: ['plots'] })
      queryClient.invalidateQueries({ queryKey: ['registry'] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  // 6. Archive / Restore Mutations
  const archiveMutation = useMutation({
    mutationFn: async (plotId: string) => {
      const res = await farmerService.archivePlot(plotId)
      if (!res.success) throw new Error(res.error || 'Failed to archive plot.')
      return res.data
    },
    onSuccess: () => {
      toast.success('Plot archived.')
      queryClient.invalidateQueries({ queryKey: ['plots'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const restoreMutation = useMutation({
    mutationFn: async (plotId: string) => {
      const res = await farmerService.restorePlot(plotId)
      if (!res.success) throw new Error(res.error || 'Failed to restore plot.')
      return res.data
    },
    onSuccess: () => {
      toast.success('Plot restored to active inventory.')
      queryClient.invalidateQueries({ queryKey: ['plots'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return {
    plots,
    plotsLoading,
    plotsError,
    crops,
    displayUnit,
    setDisplayUnit,
    statusFilter,
    setStatusFilter,
    drawerOpen,
    setDrawerOpen,
    formErrors,
    isResolvingGeo,
    geoResolution,
    gpsLoading,
    acquireGps,
    resolveCoordinates,
    handleCreatePlot: (input: CreatePlotInput) => createPlotMutation.mutate(input),
    isCreatingPlot: createPlotMutation.isPending,
    handleArchivePlot: (plotId: string) => archiveMutation.mutate(plotId),
    handleRestorePlot: (plotId: string) => restoreMutation.mutate(plotId),
    refetchPlots,
  }
}
