'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { farmerService } from '@/services/farmerService'
import { officerService } from '@/services/officerService'
import {
  farmerOnboardingSchema,
  claimFarmerProfileSchema,
  updateFarmerProfileSchema,
  type FarmerProfileRow,
  type FarmerOnboardingInput,
  type ClaimFarmerProfileInput,
  type UpdateFarmerProfileInput,
  type KebeleRow,
} from '@repo/shared'

export function useFarmerProfile() {
  const queryClient = useQueryClient()
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [claimOpen, setClaimOpen] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})

  // 1. Fetch current farmer profile
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ['farmer', 'profile'],
    queryFn: async () => {
      const res = await farmerService.getSelfProfile()
      if (!res.success) {
        if (res.error?.includes('404') || res.error?.includes('not_found')) {
          return null // Profile not yet registered (needs onboarding)
        }
        throw new Error(res.error || 'Failed to fetch farmer profile')
      }
      return res.data ?? null
    },
    staleTime: 60_000,
  })

  // 2. Fetch active kebeles for selection dropdown
  const { data: kebeles = [], isLoading: kebelesLoading } = useQuery<KebeleRow[]>({
    queryKey: ['kebeles', 'list'],
    queryFn: async () => {
      const res = await officerService.listKebeles()
      return res.data ?? []
    },
    staleTime: 5 * 60_000,
  })

  // 3. Self-onboard mutation
  const onboardMutation = useMutation({
    mutationFn: async (input: FarmerOnboardingInput) => {
      const parsed = farmerOnboardingSchema.safeParse(input)
      if (!parsed.success) {
        setFormErrors(parsed.error.flatten().fieldErrors)
        throw new Error('Please correct the validation errors in the form.')
      }
      setFormErrors({})
      const res = await farmerService.onboardSelf(parsed.data)
      if (!res.success) {
        throw new Error(res.error || 'Failed to create farmer profile')
      }
      return res.data
    },
    onSuccess: (data) => {
      toast.success('Farmer profile created successfully!')
      setOnboardingOpen(false)
      queryClient.setQueryData(['farmer', 'profile'], data)
      queryClient.invalidateQueries({ queryKey: ['farmer'] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  // 4. Claim profile mutation
  const claimMutation = useMutation({
    mutationFn: async (input: ClaimFarmerProfileInput) => {
      const parsed = claimFarmerProfileSchema.safeParse(input)
      if (!parsed.success) {
        setFormErrors(parsed.error.flatten().fieldErrors)
        throw new Error('Please enter a valid local ID number.')
      }
      setFormErrors({})
      const res = await farmerService.claimProfile(parsed.data)
      if (!res.success) {
        throw new Error(res.error || 'Could not find an unlinked profile matching this ID.')
      }
      return res.data
    },
    onSuccess: (data) => {
      toast.success('Farmer profile claimed and linked to your account!')
      setClaimOpen(false)
      queryClient.setQueryData(['farmer', 'profile'], data)
      queryClient.invalidateQueries({ queryKey: ['farmer'] })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  // 5. Update profile mutation
  const updateMutation = useMutation({
    mutationFn: async (input: UpdateFarmerProfileInput) => {
      const parsed = updateFarmerProfileSchema.safeParse(input)
      if (!parsed.success) {
        setFormErrors(parsed.error.flatten().fieldErrors)
        throw new Error('Invalid update payload.')
      }
      setFormErrors({})
      const res = await farmerService.updateSelfProfile(parsed.data)
      if (!res.success) {
        throw new Error(res.error || 'Failed to update farmer profile')
      }
      return res.data
    },
    onSuccess: (data) => {
      toast.success('Profile updated successfully.')
      queryClient.setQueryData(['farmer', 'profile'], data)
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  return {
    profile,
    profileLoading,
    profileError,
    kebeles,
    kebelesLoading,
    needsOnboarding: !profileLoading && profile === null,
    onboardingOpen,
    setOnboardingOpen,
    claimOpen,
    setClaimOpen,
    formErrors,
    handleOnboard: (data: FarmerOnboardingInput) => onboardMutation.mutate(data),
    handleClaim: (data: ClaimFarmerProfileInput) => claimMutation.mutate(data),
    handleUpdate: (data: UpdateFarmerProfileInput) => updateMutation.mutate(data),
    isOnboarding: onboardMutation.isPending,
    isClaiming: claimMutation.isPending,
    isUpdating: updateMutation.isPending,
    refetchProfile,
  }
}
