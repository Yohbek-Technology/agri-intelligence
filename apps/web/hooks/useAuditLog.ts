'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { officerService } from '@/services/officerService'

export function useAuditLog() {
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')
  const [page, setPage]                 = useState(1)
  const LIMIT = 50

  const params = {
    action: actionFilter || undefined,
    from:   dateFrom || undefined,
    to:     dateTo || undefined,
    page,
    limit:  LIMIT,
  }

  const query = useQuery({
    queryKey: ['audit', params],
    queryFn: async () => {
      const res = await officerService.listAuditLogs(params)
      if (!res.success) throw new Error(res.error ?? 'Failed to load audit logs')
      return res.data!
    },
    staleTime: 10_000,
  })

  const handleSetActionFilter = useCallback((v: string) => {
    setActionFilter(v)
    setPage(1)
  }, [])

  const handleSetDateFrom = useCallback((v: string) => {
    setDateFrom(v)
    setPage(1)
  }, [])

  const handleSetDateTo = useCallback((v: string) => {
    setDateTo(v)
    setPage(1)
  }, [])

  return {
    logs:            query.data ?? [],
    isLoading:       query.isLoading,
    error:           query.error?.message ?? null,
    actionFilter,
    setActionFilter: handleSetActionFilter,
    dateFrom,
    setDateFrom:     handleSetDateFrom,
    dateTo,
    setDateTo:       handleSetDateTo,
    page,
    setPage,
  }
}
