'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { daService, type DaFarmerFilterParams } from '@/services/daService'
import { officerService } from '@/services/officerService'
import {
  proxyFarmerOnboardingSchema,
  type FarmerProfileRow,
  type ProxyFarmerOnboardingInput,
  type KebeleRow,
} from '@repo/shared'

const ACTIVE_FARMER_KEY = 'agri_da_active_farmer_id'

export function useDaFieldHub() {
  const queryClient = useQueryClient()

  // Persistent active farmer selection
  const [activeFarmerId, setActiveFarmerIdState] = useState<string | null>(null)
  const [proxyDrawerOpen, setProxyDrawerOpen] = useState(false)
  const [filterParams, setFilterParams] = useState<DaFarmerFilterParams>({
    page: 1,
    limit: 50,
    is_verified: 'all',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})

  // Initialize active farmer from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(ACTIVE_FARMER_KEY)
      if (stored) setActiveFarmerIdState(stored)
    }
  }, [])

  const setActiveFarmerId = (id: string | null) => {
    setActiveFarmerIdState(id)
    if (typeof window !== 'undefined') {
      if (id) localStorage.setItem(ACTIVE_FARMER_KEY, id)
      else localStorage.removeItem(ACTIVE_FARMER_KEY)
    }
  }

  // 1. Fetch assigned farmers list
  const {
    data: farmersData,
    isLoading: farmersLoading,
    error: farmersError,
    refetch: refetchFarmers,
  } = useQuery({
    queryKey: ['da', 'farmers', filterParams],
    queryFn: async () => {
      const res = await daService.listFarmers(filterParams)
      if (!res.success) throw new Error(res.error || 'Failed to fetch assigned farmers.')
      return res.data
    },
    staleTime: 30_000,
  })

  // 2. Fetch Active Farmer detail
  const {
    data: activeFarmer,
    isLoading: activeFarmerLoading,
  } = useQuery<FarmerProfileRow | null>({
    queryKey: ['da', 'activeFarmer', activeFarmerId],
    queryFn: async () => {
      if (!activeFarmerId) return null
      const res = await daService.getFarmer(activeFarmerId)
      if (!res.success) return null
      return res.data ?? null
    },
    enabled: Boolean(activeFarmerId),
    staleTime: 30_000,
  })

  // 3. Kebeles for proxy onboarding dropdown
  const { data: kebeles = [] } = useQuery<KebeleRow[]>({
    queryKey: ['kebeles', 'list'],
    queryFn: async () => {
      const res = await officerService.listKebeles()
      return res.data ?? []
    },
    staleTime: 5 * 60_000,
  })

  // 4. Proxy Onboarding Mutation
  const proxyMutation = useMutation({
    mutationFn: async (input: ProxyFarmerOnboardingInput) => {
      const parsed = proxyFarmerOnboardingSchema.safeParse(input)
      if (!parsed.success) {
        setFormErrors(parsed.error.flatten().fieldErrors)
        throw new Error('Please fix the validation errors in the form.')
      }
      setFormErrors({})

      const res = await daService.createProxyFarmer(parsed.data)
      if (!res.success) throw new Error(res.error || 'Failed to onboard proxy farmer.')
      return res.data
    },
    onSuccess: (newFarmer) => {
      toast.success(`Proxy profile for ${newFarmer?.fullName} created (verified by trigger)!`)
      setProxyDrawerOpen(false)
      if (newFarmer?.id) setActiveFarmerId(newFarmer.id)
      queryClient.invalidateQueries({ queryKey: ['da', 'farmers'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // 5. Field Verification Mutation
  const verifyMutation = useMutation({
    mutationFn: async (farmerId: string) => {
      const res = await daService.verifyFarmer(farmerId)
      if (!res.success) throw new Error(res.error || 'Failed to verify farmer.')
      return res.data
    },
    onSuccess: (updated) => {
      toast.success(`${updated?.fullName} has been field-verified!`)
      queryClient.invalidateQueries({ queryKey: ['da', 'farmers'] })
      queryClient.invalidateQueries({ queryKey: ['da', 'activeFarmer'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  return {
    farmers: farmersData?.data ?? [],
    totalFarmers: farmersData?.total ?? 0,
    farmersLoading,
    farmersError,
    activeFarmerId,
    activeFarmer,
    activeFarmerLoading,
    setActiveFarmerId,
    kebeles,
    filterParams,
    setFilterParams,
    proxyDrawerOpen,
    setProxyDrawerOpen,
    formErrors,
    handleCreateProxyFarmer: (input: ProxyFarmerOnboardingInput) => proxyMutation.mutate(input),
    isCreatingProxy: proxyMutation.isPending,
    handleVerifyFarmer: (farmerId: string) => verifyMutation.mutate(farmerId),
    isVerifying: verifyMutation.isPending,
    refetchFarmers,
  }
}
