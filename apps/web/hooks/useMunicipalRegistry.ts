'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { registryService } from '@/services/registryService'
import { officerService } from '@/services/officerService'
import type {
  RegistryFilterInput,
  ExportRegistryInput,
  RegistryFarmerItem,
  RegistrySummaryMetrics,
  AreaUnit,
  KebeleRow,
  StaffRow,
  CropRow,
} from '@repo/shared'

export function useMunicipalRegistry() {
  const queryClient = useQueryClient()

  // Filter state
  const [filters, setFilters] = useState<RegistryFilterInput>({
    page: 1,
    limit: 25,
    q: '',
    unit: 'hectare',
    isVerified: 'all',
  })

  // Selected farmers for bulk reassignment
  const [selectedFarmerIds, setSelectedFarmerIds] = useState<string[]>([])

  // Drawers & Modals
  const [detailFarmer, setDetailFarmer] = useState<RegistryFarmerItem | null>(null)
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [reassignModalOpen, setReassignModalOpen] = useState(false)
  const [reassignTargetFarmerId, setReassignTargetFarmerId] = useState<string | null>(null)

  // 1. Fetch Registry Data & Summary Metrics
  const {
    data: registryResult,
    isLoading: registryLoading,
    error: registryError,
    refetch: refetchRegistry,
  } = useQuery({
    queryKey: ['registry', 'master', filters],
    queryFn: async () => {
      const res = await registryService.queryRegistry(filters)
      if (!res.success) throw new Error(res.error || 'Failed to query land registry.')
      return res.data
    },
    staleTime: 30_000,
  })

  // 2. Auxiliary Lookups (Kebeles, Staff/DAs, Crops)
  const { data: kebeles = [] } = useQuery<KebeleRow[]>({
    queryKey: ['kebeles', 'list'],
    queryFn: async () => {
      const res = await officerService.listKebeles()
      return res.data ?? []
    },
    staleTime: 5 * 60_000,
  })

  const { data: staffList = [] } = useQuery<StaffRow[]>({
    queryKey: ['staff', 'list'],
    queryFn: async () => {
      const res = await officerService.listStaff()
      return res.data ?? []
    },
    staleTime: 5 * 60_000,
  })

  const daStaff = staffList.filter((s) => s.role === 'da' && !s.banned)

  const { data: crops = [] } = useQuery<CropRow[]>({
    queryKey: ['catalog', 'crops'],
    queryFn: async () => {
      const res = await officerService.listCrops()
      return res.data ?? []
    },
    staleTime: 5 * 60_000,
  })

  // 3. Export Mutation
  const exportMutation = useMutation({
    mutationFn: async (options: ExportRegistryInput) => {
      const res = await registryService.exportRegistry(options)
      if (!res.success) throw new Error(res.error || 'Failed to generate export.')
      return res.data
    },
    onSuccess: (data) => {
      toast.success(`Export generated (${data?.totalRows} records). Initiating download…`)
      setExportModalOpen(false)
      if (data?.downloadUrl) {
        window.open(registryService.getExportDownloadUrl(data.id), '_blank')
      }
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // 4. DA Reassignment Mutation
  const reassignMutation = useMutation({
    mutationFn: async ({
      farmerIds,
      assignedDaUserId,
    }: {
      farmerIds: string[]
      assignedDaUserId: string
    }) => {
      if (farmerIds.length === 1) {
        const res = await registryService.assignFarmerToDa(farmerIds[0]!, assignedDaUserId)
        if (!res.success) throw new Error(res.error || 'Failed to reassign farmer.')
        return 1
      } else {
        const res = await registryService.bulkAssignFarmersToDa(farmerIds, assignedDaUserId)
        if (!res.success) throw new Error(res.error || 'Failed to bulk reassign farmers.')
        return res.data?.updatedCount ?? farmerIds.length
      }
    },
    onSuccess: (count) => {
      toast.success(`Successfully assigned ${count} farmer(s) to the selected DA.`)
      setReassignModalOpen(false)
      setSelectedFarmerIds([])
      queryClient.invalidateQueries({ queryKey: ['registry'] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  // Filter setters
  const setFilterField = <K extends keyof RegistryFilterInput>(
    field: K,
    value: RegistryFilterInput[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? (value as number) : 1, // reset page on filter change
    }))
  };

  const handleToggleSelectFarmer = (id: string) => {
    setSelectedFarmerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll && registryResult?.data) {
      setSelectedFarmerIds(registryResult.data.map((f) => f.id))
    } else {
      setSelectedFarmerIds([])
    }
  }

  return {
    farmers: registryResult?.data ?? [],
    total: registryResult?.total ?? 0,
    page: registryResult?.page ?? 1,
    limit: registryResult?.limit ?? 25,
    totalPages: registryResult?.totalPages ?? 1,
    summary: registryResult?.summary,
    registryLoading,
    registryError,
    filters,
    setFilterField,
    kebeles,
    daStaff,
    crops,
    selectedFarmerIds,
    handleToggleSelectFarmer,
    handleSelectAll,
    detailFarmer,
    setDetailFarmer,
    exportModalOpen,
    setExportModalOpen,
    reassignModalOpen,
    setReassignModalOpen,
    reassignTargetFarmerId,
    setReassignTargetFarmerId,
    handleExport: (input: ExportRegistryInput) => exportMutation.mutate(input),
    isExporting: exportMutation.isPending,
    handleReassign: (assignedDaUserId: string) => {
      const ids = reassignTargetFarmerId ? [reassignTargetFarmerId] : selectedFarmerIds
      if (!ids.length) {
        toast.error('No farmer selected for reassignment.')
        return
      }
      reassignMutation.mutate({ farmerIds: ids, assignedDaUserId })
    },
    isReassigning: reassignMutation.isPending,
    refetchRegistry,
  }
}
