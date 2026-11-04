'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LocaleSwitcher } from '@/components/ui/localeSwitcher'
import {
  PanelLeftClose, PanelLeftOpen,
  ChevronDown, ChevronUp,
  LayoutDashboard, MapPin, Sprout, Wheat,
  NotebookPen, BookOpen, TrendingUp, Microscope,
  FlaskConical, CloudSun, BarChart2, Headphones,
  TriangleAlert, Megaphone, Archive,
  ArrowLeftRight, UserCog, Settings2, RotateCw,
} from 'lucide-react'

const NAV = [
  {
    id: 'overview', labelKey: 'sec_overview',
    items: [
      { id: 'home',    labelKey: 'nav_home',   href: '/farmer',         icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    id: 'land', labelKey: 'sec_land',
    items: [
      { id: 'plots',   labelKey: 'nav_plots',  href: '/farmer/plots',   icon: <MapPin size={18} /> },
    ],
  },
  {
    id: 'agronomy', labelKey: 'sec_agronomy',
    items: [
      { id: 'cycles',  labelKey: 'nav_cycles',  href: '/farmer/cycles',  icon: <Wheat size={18} /> },
      { id: 'logger',  labelKey: 'nav_logger',  href: '/farmer/log',     icon: <NotebookPen size={18} /> },
      { id: 'harvest', labelKey: 'nav_harvest', href: '/farmer/harvest', icon: <Sprout size={18} /> },
      { id: 'ledger',  labelKey: 'nav_ledger',  href: '/farmer/ledger',  icon: <BookOpen size={18} /> },
    ],
  },
  {
    id: 'intelligence', labelKey: 'sec_intelligence',
    items: [
      { id: 'yield-gap', labelKey: 'nav_yield_gap', href: '/farmer/yield-gap', icon: <TrendingUp size={18} /> },
      { id: 'diagnosis', labelKey: 'nav_diagnosis', href: '/farmer/diagnosis', icon: <Microscope size={18} /> },
      { id: 'rotation',  labelKey: 'nav_rotation',  href: '/farmer/rotation',  icon: <RotateCw size={18} /> },
      { id: 'inputs',    labelKey: 'nav_inputs',    href: '/farmer/inputs',    icon: <FlaskConical size={18} /> },
    ],
  },
  {
    id: 'weather', labelKey: 'sec_weather',
    items: [
      { id: 'weather', labelKey: 'nav_weather', href: '/farmer/weather', icon: <CloudSun size={18} /> },
    ],
  },
  {
    id: 'support', labelKey: 'sec_support',
    items: [
      { id: 'grievances',    labelKey: 'nav_grievances',    href: '/farmer/grievances',    icon: <TriangleAlert size={18} /> },
      { id: 'announcements', labelKey: 'nav_announcements', href: '/farmer/announcements', icon: <Megaphone size={18} /> },
      { id: 'storage',       labelKey: 'nav_storage',       href: '/farmer/storage',       icon: <Archive size={18} /> },
    ],
  },
  {
    id: 'system', labelKey: 'sec_system',
    items: [
      { id: 'sync',    labelKey: 'nav_sync',    href: '/farmer/sync',    icon: <ArrowLeftRight size={18} /> },
      { id: 'profile', labelKey: 'nav_profile', href: '/farmer/profile', icon: <UserCog size={18} /> },
    ],
  },
] as const

function Section({
  section,
  sidebarCollapsed,
  isActive,
  t,
  onItemClick,
}: {
  section: (typeof NAV)[number]
  sidebarCollapsed: boolean
  isActive: (href: string) => boolean
  t: ReturnType<typeof useTranslations>
  onItemClick: () => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mb-1">
      {/* Section header — only visible when expanded */}
      {!sidebarCollapsed && (
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="w-full flex items-center gap-2 px-3 pt-2 pb-0.5 cursor-pointer select-none bg-transparent"
          aria-expanded={open}
        >
          <span className="flex-1 text-left text-xs font-semibold capitalize tracking-wide text-on-shell-muted">
            {t(section.labelKey as any)}
          </span>
          {open
            ? <ChevronUp size={12} className="text-on-shell-faint shrink-0" />
            : <ChevronDown size={12} className="text-on-shell-faint shrink-0" />
          }
        </button>
      )}

      {/* Items — always show when collapsed, show based on open when expanded */}
      {(open || sidebarCollapsed) && (
        <div className="space-y-[1px] pb-0.5">
          {section.items.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={onItemClick}
                title={sidebarCollapsed ? t(item.labelKey as any) : undefined}
                className={`
                  flex items-center gap-3 mx-2 px-2.5 py-1.5 rounded-lg
                  cursor-pointer select-none transition-colors duration-100
                  border-l-2
                  ${active
                    ? 'bg-shell-active border-on-shell-accent text-on-shell-strong'
                    : 'bg-transparent border-transparent text-on-shell hover:bg-shell-hover'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
              >
                <span className={`shrink-0 flex items-center justify-center ${active ? 'text-on-shell-accent' : 'text-on-shell-faint'}`}>
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium truncate leading-tight">
                    {t(item.labelKey as any)}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface SidebarProps {
  onClose?: () => void
}

export function FarmerSidebar({ onClose }: SidebarProps) {
  const t = useTranslations('Dashboard')
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const toggle = useCallback(() => setCollapsed((p) => !p), [])
  const isActive = useCallback(
    (href: string) => href === '/farmer' ? pathname === '/farmer' : pathname.startsWith(href),
    [pathname],
  )

  return (
    <aside
      className="flex flex-col bg-shell h-full overflow-hidden transition-all duration-[230ms] ease-in-out"
      style={{ width: collapsed ? '60px' : '260px' }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-3 h-14 shrink-0">
        {!collapsed && (
          <span className="text-xs font-mono text-on-shell-faint tracking-wider select-none truncate">
            AGRI.INTEL
          </span>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={t('toggleSidebar')}
          className={`flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer
            bg-shell-hover border border-shell-border text-on-shell-faint
            hover:text-on-shell hover:bg-shell-active transition-colors shrink-0
            ${collapsed ? 'mx-auto' : 'ml-auto'}
          `}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden py-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {NAV.map((section) => (
          <Section
            key={section.id}
            section={section}
            sidebarCollapsed={collapsed}
            isActive={isActive}
            t={t}
            onItemClick={onClose ?? (() => {})}
          />
        ))}
      </nav>

      {!collapsed && (
        <div className="px-3 pt-3 pb-4 shrink-0 space-y-3 border-t border-shell-border">
          <div className="lg:hidden">
            <LocaleSwitcher />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-on-shell-faint block">
            {t('buildTag')} · {new Date().getFullYear()}
          </span>
        </div>
      )}
    </aside>
  )
}
