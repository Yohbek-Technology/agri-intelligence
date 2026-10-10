import React from 'react'

export function RegionalWeatherBar() {
  const metrics = [
    { label: 'BASIN ZONE', val: 'Adama Vertisol Basin', sub: '1,710m ASL' },
    { label: 'SOIL MOISTURE', val: '68% Capacity', sub: 'Optimal for Magna Teff' },
    { label: 'SPRAY WINDOW', val: 'PERMITTED (GREEN)', sub: 'Wind 8 km/h | Safe <15' },
    { label: 'PRECIPITATION', val: '12% Prob', sub: 'Washoff Safe (>6h)' },
    { label: 'TEMPERATURE', val: '24.2°C', sub: 'Min 14°C | Max 28°C' },
  ]

  return (
    <div className="bg-surface-subtle border-y-[1.5px] border-border-strong py-4">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">
          {metrics.map((m, i) => (
            <div key={i} className="p-2.5 bg-surface border-[1px] border-border rounded-[2px]">
              <span className="text-[10px] text-text-faint uppercase block tracking-wider font-bold">
                [{m.label}]
              </span>
              <div className="text-xs font-bold text-text-primary mt-1">{m.val}</div>
              <div className="text-[10px] text-text-muted mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
