'use client'

const TABS = [
  { id: 'crops',      label: 'Crops' },
  { id: 'varieties',  label: 'Varieties' },
  { id: 'fertilizer', label: 'Fertilizer Rates' },
  { id: 'pests',      label: 'Pests & Diseases' },
  { id: 'chemicals',  label: 'Chemicals' },
] as const

type Tab = (typeof TABS)[number]['id']

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

export function CatalogTabs({ active, onChange }: Props) {
  return (
    <div className="flex gap-1 border-b border-border">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 cursor-pointer transition-colors ${
            active === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
