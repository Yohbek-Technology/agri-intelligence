'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LocaleSwitcher } from '@/components/ui/localeSwitcher'
import {
  PanelLeftClose, PanelLeftOpen,
  ChevronDown, ChevronUp,
  LayoutDashboard, Users, MapPin, BarChart2,
  Megaphone, TriangleAlert, ShoppingBasket,
  Warehouse, Settings2, ArrowLeftRight,
  UserCog, ScrollText, BookOpen,
} from 'lucide-react'

const NAV = [
  {
    id: 'overview', labelKey: 'sec_overview',
    items: [
      { id: 'home', labelKey: 'nav_home', href: '/officer', icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    id: 'registry', labelKey: 'off_sec_registry',
    items: [
      { id: 'farmers',  labelKey: 'off_nav_farmers',  href: '/officer/farmers',  icon: <Users size={18} /> },
      { id: 'land',     labelKey: 'off_nav_land',     href: '/officer/land',     icon: <MapPin size={18} /> },
      { id: 'kebeles',  labelKey: 'off_nav_kebeles',  href: '/officer/kebeles',  icon: <MapPin size={18} /> },
    ],
  },
  {
    id: 'analytics', labelKey: 'off_sec_analytics',
    items: [
      { id: 'analytics', labelKey: 'off_nav_analytics', href: '/officer/analytics', icon: <BarChart2 size={18} /> },
      { id: 'audit',     labelKey: 'off_nav_audit',     href: '/officer/audit',     icon: <ScrollText size={18} /> },
    ],
  },
  {
    id: 'demand', labelKey: 'off_sec_demand',
    items: [
      { id: 'demand',  labelKey: 'off_nav_demand',  href: '/officer/demand',  icon: <ShoppingBasket size={18} /> },
      { id: 'depots',  labelKey: 'off_nav_depots',  href: '/officer/depots',  icon: <Warehouse size={18} /> },
      { id: 'catalog', labelKey: 'off_nav_catalog', href: '/officer/catalog', icon: <BookOpen size={18} /> },
    ],
  },
  {
    id: 'communication', labelKey: 'off_sec_communication',
    items: [
      { id: 'broadcast',  labelKey: 'off_nav_broadcast',  href: '/officer/broadcast',  icon: <Megaphone size={18} /> },
      { id: 'grievances', labelKey: 'nav_grievances',     href: '/officer/grievances', icon: <TriangleAlert size={18} /> },
      { id: 'market',     labelKey: 'off_nav_market',     href: '/officer/market',     icon: <BarChart2 size={18} /> },
    ],
  },
  {
    id: 'system', labelKey: 'sec_system',
    items: [
      { id: 'settings', labelKey: 'off_nav_settings', href: '/officer/settings', icon: <Settings2 size={18} /> },
      { id: 'sync',     labelKey: 'nav_sync',         href: '/officer/sync',     icon: <ArrowLeftRight size={18} /> },
      { id: 'profile',  labelKey: 'nav_profile',      href: '/officer/profile',  icon: <UserCog size={18} /> },
    ],
  },
] as const

function Section({
  section, sidebarCollapsed, isActive, t, onItemClick,
}: {
  section: (typeof NAV)[number]
  sidebarCollapsed: boolean
  isActive: (href: string) => boolean
  t: ReturnType<typeof useTranslations>
  onItemClick: () => void
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="mb-0.5">
      {!sidebarCollapsed && (
        <button type="button" onClick={() => setOpen((p) => !p)}
          className="w-full flex items-center gap-2 px-3 pt-2 pb-0.5 cursor-pointer select-none bg-transparent"
          aria-expanded={open}>
          <span className="flex-1 text-left text-xs font-semibold capitalize tracking-wide text-on-shell-muted">
            {t(section.labelKey as any)}
          </span>
          {open ? <ChevronUp size={12} className="text-on-shell-faint shrink-0" />
                : <ChevronDown size={12} className="text-on-shell-faint shrink-0" />}
        </button>
      )}
      {(open || sidebarCollapsed) && (
        <div className="space-y-[1px] pb-0.5">
          {section.items.map((item) => {
            const active = isActive(item.href)
            return (
              <Link key={item.id} href={item.href} onClick={onItemClick}
                title={sidebarCollapsed ? t(item.labelKey as any) : undefined}
                className={`flex items-center gap-3 mx-2 px-2.5 py-1.5 rounded-lg cursor-pointer select-none
                  transition-colors duration-100 border-l-2
                  ${active
                    ? 'bg-shell-active border-on-shell-accent text-on-shell-strong'
                    : 'bg-transparent border-transparent text-on-shell hover:bg-shell-hover'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}>
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

interface Props { onClose?: () => void }

export function OfficerSidebar({ onClose }: Props) {
  const t = useTranslations('Dashboard')
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const toggle = useCallback(() => setCollapsed((p) => !p), [])
  const isActive = useCallback(
    (href: string) => href === '/officer' ? pathname === '/officer' : pathname.startsWith(href),
    [pathname],
  )

  return (
    <aside className="flex flex-col bg-shell h-full overflow-hidden transition-all duration-[230ms] ease-in-out"
      style={{ width: collapsed ? '60px' : '260px' }}>
      <div className="flex items-center justify-between px-3 h-14 shrink-0">
        {!collapsed && (
          <span className="text-xs font-mono text-on-shell-faint tracking-wider select-none truncate">
            AGRI.INTEL / OFFICER
          </span>
        )}
        <button type="button" onClick={toggle} aria-label={t('toggleSidebar')}
          className={`flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer
            bg-shell-hover border border-shell-border text-on-shell-faint
            hover:text-on-shell hover:bg-shell-active transition-colors shrink-0
            ${collapsed ? 'mx-auto' : 'ml-auto'}`}>
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-1" style={{ scrollbarWidth: 'none' }}>
        {NAV.map((section) => (
          <Section key={section.id} section={section} sidebarCollapsed={collapsed}
            isActive={isActive} t={t} onItemClick={onClose ?? (() => {})} />
        ))}
      </nav>

      {!collapsed && (
        <div className="px-3 pt-3 pb-4 shrink-0 border-t border-shell-border space-y-3">
          <div className="lg:hidden"><LocaleSwitcher /></div>
          <span className="text-[10px] font-mono tracking-widest text-on-shell-faint block">
            {t('buildTag')} · {new Date().getFullYear()}
          </span>
        </div>
      )}
    </aside>
  )
}
