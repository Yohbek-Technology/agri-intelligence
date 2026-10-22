'use client'

import { useOfficeSummary } from '@/hooks/useOfficeSettings'
import { useOfficeParamsForm } from '@/hooks/useOfficeSettings'
import { ParameterSection } from '@/components/officer/settings/ParameterSection'
import { ParameterNumberField } from '@/components/officer/settings/ParameterNumberField'
import { SettingsSaveBar } from '@/components/officer/settings/SettingsSaveBar'
import type { OfficeParametersUpdate } from '@repo/shared'

export default function SettingsPage() {
  const { data: office, isLoading } = useOfficeSummary()
  const {
    formValues,
    setField,
    isDirty,
    isSubmitting,
    generalError,
    fieldErrors,
    handleSubmit,
    handleReset,
  } = useOfficeParamsForm()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <span className="text-text-muted text-sm">Loading settings…</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-32 space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Office Settings</h1>
        {office && (
          <p className="text-sm text-text-muted mt-1">{office.name}</p>
        )}
      </div>

      <ParameterSection title="Land Units">
        <ParameterNumberField
          label="Timad to Hectare"
          unit="ha"
          value={formValues.land_unit_timad_to_ha}
          onChange={(v) => setField('land_unit_timad_to_ha', v)}
          min={0.01} max={1} step={0.01}
          error={fieldErrors.land_unit_timad_to_ha}
        />
        <ParameterNumberField
          label="Kert to Hectare"
          unit="ha"
          value={formValues.land_unit_kert_to_ha}
          onChange={(v) => setField('land_unit_kert_to_ha', v)}
          min={0.01} max={1} step={0.01}
          error={fieldErrors.land_unit_kert_to_ha}
        />
        <ParameterNumberField
          label="Hectare to Hectare"
          unit="ha"
          value={1}
          onChange={() => {}}
          readOnly
          hint="Always 1 (fixed)"
        />
      </ParameterSection>

      <ParameterSection title="Agro Zone Elevation">
        <ParameterNumberField
          label="Kolla Max Elevation"
          unit="m"
          value={formValues.agro_zone_kolla_max_m}
          onChange={(v) => setField('agro_zone_kolla_max_m', v)}
          min={100} max={2000}
          error={fieldErrors.agro_zone_kolla_max_m}
        />
        <ParameterNumberField
          label="Dega Min Elevation"
          unit="m"
          value={formValues.agro_zone_dega_min_m}
          onChange={(v) => setField('agro_zone_dega_min_m', v)}
          min={1500} max={4000}
          error={fieldErrors.agro_zone_dega_min_m}
        />
      </ParameterSection>

      <ParameterSection title="Weather Thresholds">
        <ParameterNumberField
          label="Max Spray Wind"
          unit="km/h"
          value={formValues.weather_spray_wind_max_kmh}
          onChange={(v) => setField('weather_spray_wind_max_kmh', v)}
          min={1} max={50}
          error={fieldErrors.weather_spray_wind_max_kmh}
        />
        <ParameterNumberField
          label="Spray Washoff Hours"
          unit="hrs"
          value={formValues.weather_spray_washoff_hours}
          onChange={(v) => setField('weather_spray_washoff_hours', v)}
          min={1} max={24}
          error={fieldErrors.weather_spray_washoff_hours}
        />
        <ParameterNumberField
          label="Harvest Rain Prob Max"
          unit="%"
          value={formValues.weather_harvest_rain_prob_max_pct}
          onChange={(v) => setField('weather_harvest_rain_prob_max_pct', v)}
          min={0} max={100}
          error={fieldErrors.weather_harvest_rain_prob_max_pct}
        />
        <ParameterNumberField
          label="Frost Minimum"
          unit="°C"
          value={formValues.weather_frost_min_c}
          onChange={(v) => setField('weather_frost_min_c', v)}
          min={-10} max={10} step={0.5}
          error={fieldErrors.weather_frost_min_c}
        />
        <ParameterNumberField
          label="Downpour Threshold"
          unit="mm/day"
          value={formValues.weather_downpour_mm_per_day}
          onChange={(v) => setField('weather_downpour_mm_per_day', v)}
          min={10} max={200}
          error={fieldErrors.weather_downpour_mm_per_day}
        />
        <ParameterNumberField
          label="Dry Spell Days"
          unit="days"
          value={formValues.weather_dry_spell_days}
          onChange={(v) => setField('weather_dry_spell_days', v)}
          min={3} max={30}
          error={fieldErrors.weather_dry_spell_days}
        />
        <ParameterNumberField
          label="Rain Onset Accumulation"
          unit="mm"
          value={formValues.rain_onset_accumulation_mm}
          onChange={(v) => setField('rain_onset_accumulation_mm', v)}
          min={5} max={50}
          error={fieldErrors.rain_onset_accumulation_mm}
        />
        <ParameterNumberField
          label="Rain Onset Window"
          unit="days"
          value={formValues.rain_onset_window_days}
          onChange={(v) => setField('rain_onset_window_days', v)}
          min={1} max={14}
          error={fieldErrors.rain_onset_window_days}
        />
      </ParameterSection>

      <ParameterSection title="AI & Voice">
        <ParameterNumberField
          label="Voice Confidence Threshold"
          value={formValues.voice_intent_confidence_threshold}
          onChange={(v) => setField('voice_intent_confidence_threshold', v)}
          min={0} max={1} step={0.05}
          error={fieldErrors.voice_intent_confidence_threshold}
        />
        <ParameterNumberField
          label="AI Daily Call Quota"
          value={formValues.ai_daily_call_quota}
          onChange={(v) => setField('ai_daily_call_quota', v)}
          min={1} max={10000}
          error={fieldErrors.ai_daily_call_quota}
        />
      </ParameterSection>

      <ParameterSection title="Yield & Diagnosis">
        <ParameterNumberField
          label="Yield Cohort Min Size"
          value={formValues.yield_cohort_min_size}
          onChange={(v) => setField('yield_cohort_min_size', v)}
          min={3} max={20}
          error={fieldErrors.yield_cohort_min_size}
        />
        <ParameterNumberField
          label="Diagnosis Low Confidence"
          value={formValues.diagnosis_low_confidence}
          onChange={(v) => setField('diagnosis_low_confidence', v)}
          min={0} max={1} step={0.05}
          error={fieldErrors.diagnosis_low_confidence}
        />
      </ParameterSection>

      <ParameterSection title="Outbreak & Triage">
        <ParameterNumberField
          label="Outbreak Radius"
          unit="km"
          value={formValues.outbreak_radius_km}
          onChange={(v) => setField('outbreak_radius_km', v)}
          min={1} max={50}
          error={fieldErrors.outbreak_radius_km}
        />
        <ParameterNumberField
          label="Outbreak Window"
          unit="days"
          value={formValues.outbreak_window_days}
          onChange={(v) => setField('outbreak_window_days', v)}
          min={1} max={30}
          error={fieldErrors.outbreak_window_days}
        />
        <ParameterNumberField
          label="Outbreak Min Cases"
          value={formValues.outbreak_min_cases}
          onChange={(v) => setField('outbreak_min_cases', v)}
          min={2} max={20}
          error={fieldErrors.outbreak_min_cases}
        />
        <ParameterNumberField
          label="Triage Overdue Hours"
          unit="hrs"
          value={formValues.triage_overdue_hours}
          onChange={(v) => setField('triage_overdue_hours', v)}
          min={1} max={168}
          error={fieldErrors.triage_overdue_hours}
        />
      </ParameterSection>

      <ParameterSection title="Demand & Market">
        <ParameterNumberField
          label="Demand Critical Gap"
          unit="%"
          value={formValues.demand_critical_gap_pct}
          onChange={(v) => setField('demand_critical_gap_pct', v)}
          min={0} max={100}
          error={fieldErrors.demand_critical_gap_pct}
        />
        <ParameterNumberField
          label="Demand Max Margin"
          unit="%"
          value={formValues.demand_max_margin_pct}
          onChange={(v) => setField('demand_max_margin_pct', v)}
          min={0} max={100}
          error={fieldErrors.demand_max_margin_pct}
        />
        <ParameterNumberField
          label="Market Stale Days"
          unit="days"
          value={formValues.market_stale_days}
          onChange={(v) => setField('market_stale_days', v)}
          min={1} max={60}
          error={fieldErrors.market_stale_days}
        />
        <ParameterNumberField
          label="Market Plausibility Band"
          unit="%"
          value={formValues.market_plausibility_band_pct}
          onChange={(v) => setField('market_plausibility_band_pct', v)}
          min={0} max={100}
          error={fieldErrors.market_plausibility_band_pct}
        />
      </ParameterSection>

      <ParameterSection title="Broadcast">
        <ParameterNumberField
          label="SMS Fallback Minutes"
          unit="min"
          value={formValues.broadcast_sms_fallback_minutes}
          onChange={(v) => setField('broadcast_sms_fallback_minutes', v)}
          min={1} max={1440}
          error={fieldErrors.broadcast_sms_fallback_minutes}
        />
      </ParameterSection>

      <SettingsSaveBar
        isDirty={isDirty}
        isSubmitting={isSubmitting}
        generalError={generalError}
        onSave={handleSubmit}
        onReset={handleReset}
      />
    </div>
  )
}
