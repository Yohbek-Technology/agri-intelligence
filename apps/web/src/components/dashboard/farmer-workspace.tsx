import React from 'react'
import { Card, CardHeader } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

export interface FarmerWorkspaceProps {
  userName?: string | null
  phoneNumber?: string | null
}

export function FarmerWorkspace({ userName, phoneNumber }: FarmerWorkspaceProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-surface p-4 sm:p-5 border-[1.5px] border-border-strong rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary">[PLOT-PORTAL]</Badge>
            <h1 className="text-lg sm:text-xl font-bold uppercase font-mono tracking-tight text-text-primary">
              Farmer Operations Workspace
            </h1>
          </div>
          <p className="text-xs text-text-muted mt-1 font-mono">
            Operator: {userName || 'Smallholder'} | Telemetry: {phoneNumber || 'Local SIM'} | Kebele: Adama 03
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="accent">[TELECOM-SYNC: ONLINE]</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="md:col-span-2">
          <CardHeader
            title="7-Day Agro-Weather Intelligence"
            subtitle="Calculated for Adama Woreda Vertisol Basin"
            badge="[AGRO-WEATHER]"
          />
          <div className="p-4 bg-background border-[1.5px] border-primary rounded-[2px] mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-primary uppercase">[FARM OR NOT DECISION]</span>
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-primary text-background rounded-[2px]">
                OPTIMAL CONDITIONS
              </span>
            </div>
            <p className="text-sm font-semibold text-text-primary">
              Green Light: Suitable for Chemical Spraying & Top-Dressing Fertilizer
            </p>
            <div className="grid grid-cols-3 gap-2 mt-3 text-xs font-mono text-text-muted pt-3 border-t border-border">
              <div>
                <span className="text-[10px] block text-text-faint">WIND SPEED</span>
                <span className="font-bold text-text-primary">9 km/h (Safe &lt;15)</span>
              </div>
              <div>
                <span className="text-[10px] block text-text-faint">RAIN RISK</span>
                <span className="font-bold text-text-primary">12% (Washoff safe)</span>
              </div>
              <div>
                <span className="text-[10px] block text-text-faint">TEMP / FROST</span>
                <span className="font-bold text-text-primary">24°C / No Frost</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-center text-xs font-mono">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div
                key={day}
                className={`p-2 border rounded-[2px] ${
                  i === 0
                    ? 'bg-surface-subtle border-primary-subtle text-text-primary font-bold'
                    : 'bg-surface border-border text-text-muted'
                }`}
              >
                <div className="text-[10px] uppercase text-text-faint">{day}</div>
                <div className="text-xs my-1 font-bold">{i === 3 ? '🌧️ 60%' : '☀️ 24°'}</div>
                <div className="text-[9px] uppercase">{i === 3 ? 'HOLD' : 'GO'}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Rapid Input Logging"
            subtitle="Tap to register field event"
            badge="[INPUT-TRIG]"
          />
          <div className="space-y-2.5">
            <Button variant="secondary" fullWidth className="justify-between text-xs font-mono">
              <span>🌾 Sowing / Emergence Log</span>
              <span>→</span>
            </Button>
            <Button variant="secondary" fullWidth className="justify-between text-xs font-mono">
              <span>🧪 Urea / NPS Application</span>
              <span>→</span>
            </Button>
            <Button variant="secondary" fullWidth className="justify-between text-xs font-mono">
              <span>💧 Irrigation / Rainfall</span>
              <span>→</span>
            </Button>
            <Button variant="secondary" fullWidth className="justify-between text-xs font-mono">
              <span>🚜 Weeding & Crop Stage</span>
              <span>→</span>
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader
            title="Registered Farmland Plots"
            subtitle="Verified Cadastral Survey Records"
            badge="[LAND-SURVEY]"
          />
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-surface-subtle border-[1.5px] border-border rounded-[2px]">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-text-primary">PLOT-01: Wonji High Teff</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-primary text-background rounded-[2px]">ACTIVE</span>
              </div>
              <div className="text-text-muted text-[11px] space-y-0.5">
                <div>Area: 1.20 Hectares (4.8 Timad) | Soil: Vertisol</div>
                <div>Crop: Magna Teff | Stage: Tillering | Moisture: Normal</div>
              </div>
            </div>

            <div className="p-3 bg-surface-subtle border-[1.5px] border-border rounded-[2px]">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-text-primary">PLOT-02: Boku Wheat Parcel</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-accent text-background rounded-[2px]">TOP-DRESSING</span>
              </div>
              <div className="text-text-muted text-[11px] space-y-0.5">
                <div>Area: 0.85 Hectares (3.4 Timad) | Soil: Brown Clay</div>
                <div>Crop: Durum Wheat | Action: Urea 50kg due in 3 days</div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Diagnostics & Multimodal AI"
            subtitle="Voice & Camera Extension Assitant"
            badge="[ASSIST-AI]"
          />
          <div className="space-y-4">
            <div className="p-3.5 bg-surface-subtle border-[1.5px] border-border rounded-[2px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">📸</span>
                <span className="font-mono text-xs font-bold text-text-primary">Camera Pest & Disease Scanner</span>
              </div>
              <p className="text-xs text-text-muted mb-3">
                Photograph affected foliage or pest infestation. Offline-capable Gemini vision model evaluates symptoms.
              </p>
              <Button variant="primary" fullWidth size="sm" className="font-mono text-xs">
                Launch Camera Diagnostic Tool
              </Button>
            </div>

            <div className="p-3.5 bg-surface-subtle border-[1.5px] border-border rounded-[2px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">🎙️</span>
                <span className="font-mono text-xs font-bold text-text-primary">Localized Voice Extension</span>
              </div>
              <p className="text-xs text-text-muted mb-3">
                Ask farming advice in Afan Oromo or Amharic. Audio responses rendered through highland acoustic models.
              </p>
              <Button variant="accent" fullWidth size="sm" className="font-mono text-xs">
                Activate Voice Assistant [AM / OM]
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
