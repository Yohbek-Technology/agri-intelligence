'use client'

import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { officeParametersUpdateSchema } from '@repo/shared'
import type { OfficeParametersUpdate } from '@repo/shared'
import { officerService } from '@/services/officerService'

export function useOfficeSummary() {
  return useQuery({
    queryKey: ['office', 'me'],
    queryFn: async () => {
      const res = await officerService.getOffice()
      if (!res.success) throw new Error(res.error ?? 'Failed to load office')
      return res.data!
    },
    staleTime: 30_000,
  })
}

export function useOfficeConfig() {
  return useQuery({
    queryKey: ['office', 'config'],
    queryFn: async () => {
      const res = await officerService.getOfficeConfig()
      if (!res.success) throw new Error(res.error ?? 'Failed to load config')
      return res.data!
    },
    staleTime: 60_000,
  })
}

export function useUpdateOfficeParams() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: { defaultLanguage?: string; parameters?: OfficeParametersUpdate }) =>
      officerService.updateOfficeParams(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['office'] })
    },
  })
}

export function useOfficeParamsForm() {
  const { data: office } = useOfficeSummary()
  const mutation = useUpdateOfficeParams()

  const [formValues, setFormValues] = useState<OfficeParametersUpdate>({})
  const [initialValues, setInitialValues] = useState<OfficeParametersUpdate>({})
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof OfficeParametersUpdate, string>>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  // Populate form from loaded office parameters
  useEffect(() => {
    if (!office?.parameters) return
    const params = office.parameters as Record<string, unknown>

    const keyMap: Record<string, keyof OfficeParametersUpdate> = {
      'land_unit.timad_to_ha':             'land_unit_timad_to_ha',
      'land_unit.kert_to_ha':              'land_unit_kert_to_ha',
      'land_unit.hectare_to_ha':           'land_unit_hectare_to_ha',
      'agro_zone.kolla_max_m':             'agro_zone_kolla_max_m',
      'agro_zone.dega_min_m':              'agro_zone_dega_min_m',
      'voice.intent_confidence_threshold': 'voice_intent_confidence_threshold',
      'weather.spray_wind_max_kmh':        'weather_spray_wind_max_kmh',
      'weather.spray_washoff_hours':       'weather_spray_washoff_hours',
      'weather.harvest_rain_prob_max_pct': 'weather_harvest_rain_prob_max_pct',
      'weather.frost_min_c':               'weather_frost_min_c',
      'weather.downpour_mm_per_day':       'weather_downpour_mm_per_day',
      'weather.dry_spell_days':            'weather_dry_spell_days',
      'rain_onset.accumulation_mm':        'rain_onset_accumulation_mm',
      'rain_onset.window_days':            'rain_onset_window_days',
      'yield.cohort_min_size':             'yield_cohort_min_size',
      'diagnosis.low_confidence':          'diagnosis_low_confidence',
      'outbreak.radius_km':                'outbreak_radius_km',
      'outbreak.window_days':              'outbreak_window_days',
      'outbreak.min_cases':                'outbreak_min_cases',
      'triage.overdue_hours':              'triage_overdue_hours',
      'demand.critical_gap_pct':           'demand_critical_gap_pct',
      'demand.max_margin_pct':             'demand_max_margin_pct',
      'market.stale_days':                 'market_stale_days',
      'market.plausibility_band_pct':      'market_plausibility_band_pct',
      'broadcast.sms_fallback_minutes':    'broadcast_sms_fallback_minutes',
      'ai.daily_call_quota':               'ai_daily_call_quota',
    }

    const values: OfficeParametersUpdate = {}
    for (const [dottedKey, underKey] of Object.entries(keyMap)) {
      if (params[dottedKey] !== undefined) {
        (values as Record<string, unknown>)[underKey] = params[dottedKey]
      }
    }

    setFormValues(values)
    setInitialValues(values)
  }, [office?.parameters])

  const setField = useCallback((key: keyof OfficeParametersUpdate, value: number | undefined) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
    setGeneralError(null)
  }, [])

  const isDirty = JSON.stringify(formValues) !== JSON.stringify(initialValues)

  const handleSubmit = useCallback(async () => {
    const parsed = officeParametersUpdateSchema.safeParse(formValues)
    if (!parsed.success) {
      const errors: Partial<Record<keyof OfficeParametersUpdate, string>> = {}
      for (const issue of parsed.error.issues) {
        const path = issue.path[0] as keyof OfficeParametersUpdate
        if (path && !errors[path]) errors[path] = issue.message
      }
      setFieldErrors(errors)
      return
    }

    const result = await mutation.mutateAsync({ parameters: parsed.data })
    if (!result.success) {
      setGeneralError(result.error ?? 'Failed to save settings.')
    } else {
      setGeneralError(null)
      setInitialValues(formValues)
    }
  }, [formValues, mutation])

  const handleReset = useCallback(() => {
    setFormValues(initialValues)
    setFieldErrors({})
    setGeneralError(null)
  }, [initialValues])

  return {
    formValues,
    setField,
    isDirty,
    isSubmitting: mutation.isPending,
    generalError,
    fieldErrors,
    handleSubmit,
    handleReset,
  }
}
