import React from 'react'
import { Card, CardHeader } from '../ui/card'
import { Badge } from '../ui/badge'

export function CapabilitiesGrid() {
  const capabilities = [
    {
      badge: '[CAP-01: TELEMETRY]',
      title: 'Crop Input Logging',
      description:
        'Tactile, field-ready registration of sowing dates, certified seed cultivars (Magna Teff, Durum Wheat), Urea & NPS fertilizer doses, and irrigation events, tied to cadastral plots.',
      specs: 'Supported units: Timad, Kert, Hectares | Offline SQLite buffer with automatic sync.',
    },
    {
      badge: '[CAP-02: VISION-AI]',
      title: 'Multimodal Disease Diagnostics',
      description:
        'Camera-based foliage triage powered by multimodal vision models. Detects Stem Rust, Fall Armyworm, and leaf blight with localized treatment recommendations in Amharic & Afan Oromo.',
      specs: 'Confidence thresholding (&gt;0.65) | Fallback voice extension for low-literacy farmers.',
    },
    {
      badge: '[CAP-03: WEATHER-INTEL]',
      title: '7-Day Agro-Weather Intelligence',
      description:
        'High-resolution micro-basin weather telemetry calculating the definitive "Farm or Not" indicator for chemical spraying windows, washoff risk (&gt;6h), downpour alerts, and valley frost.',
      specs: 'Spray wind limit: 15 km/h | 10-day dry spell detection | Local onset accumulation.',
    },
    {
      badge: '[CAP-04: MARKET-COMMODITY]',
      title: 'Localized Market Price Boards',
      description:
        'Real-time grain exchange benchmarks from Adama, Wonji, and surrounding terminal markets. Monitors retail, wholesale, and farm-gate spreads with anomaly outlier guards.',
      specs: 'Plausibility band: 50% | 14-day stale quote rejection | Grain, pulse, & oilseed tracks.',
    },
    {
      badge: '[CAP-05: DISPATCH-DA]',
      title: 'Extension Officer & DA Hub',
      description:
        'Operational field terminal for Development Agents managing 30–50 farmers offline on a single device. Enables proxy logging, plot inspection queues, and kebele escalation triage.',
      specs: 'Emergency SMS broadcasting | Quota demand aggregation | Low-yield audit desk.',
    },
  ]

  return (
    <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center sm:text-left">
        <Badge variant="surface" className="mb-2">
          [CORE SYSTEM ARCHITECTURE]
        </Badge>
        <h2 className="text-2xl sm:text-3xl font-extrabold uppercase font-mono tracking-tight text-text-primary">
          Platform Capabilities & Field Workstations
        </h2>
        <p className="text-sm text-text-muted mt-2 max-w-2xl font-mono">
          Engineered for continuous field resilience, low-bandwidth telecom networks, and high-contrast sunlight visibility.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {capabilities.map((c, i) => (
          <Card key={i} className="flex flex-col justify-between">
            <div>
              <CardHeader title={c.title} badge={c.badge} />
              <p className="text-xs text-text-muted leading-relaxed mb-4">{c.description}</p>
            </div>
            <div className="pt-3 border-t border-border font-mono text-[10px] text-text-faint">
              {c.specs}
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
