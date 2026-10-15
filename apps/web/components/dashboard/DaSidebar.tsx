'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LocaleSwitcher } from '@/components/ui/localeSwitcher'
import {
  PanelLeftClose, PanelLeftOpen,
  ChevronDown, ChevronUp,
  LayoutDashboard, Users, MapPin, NotebookPen,
  Wheat, Microscope, TriangleAlert, Megaphone,
  ClipboardList, ArrowLeftRight, UserCog, CloudSun,
} from 'lucide-react'

const NAV = [
  {
    id: 'overview', labelKey: 'sec_overview',
    items: [
      { id: 'home', labelKey: 'nav_home', href: '/da', icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    id: 'farmers', labelKey: 'da_sec_farmers',
    items: [
      { id: 'my-farmers',  labelKey: 'da_nav_my_farmers',  href: '/da/farmers',         icon: <Users size={18} /> },
      { id: 'register',    labelKey: 'da_nav_register',    href: '/da/farmers/register', icon: <UserCog size={18} /> },
      { id: 'plots',       labelKey: 'da_nav_plots',       href: '/da/plots',            icon: <MapPin size={18} /> },
    ],
  },
  {
    id: 'agronomy', labelKey: 'sec_agronomy',
    items: [
      { id: 'logger',   labelKey: 'nav_logger',   href: '/da/log',      icon: <NotebookPen size={18} /> },
      { id: 'cycles',   labelKey: 'nav_cycles',   href: '/da/cycles',   icon: <Wheat size={18} /> },
      { id: 'tasks',    labelKey: 'da_nav_tasks', href: '/da/tasks',    icon: <ClipboardList size={18} /> },
    ],
  },
  {
    id: 'intelligence', labelKey: 'sec_intelligence',
    items: [
      { id: 'diagnosis', labelKey: 'nav_diagnosis', href: '/da/diagnosis', icon: <Microscope size={18} /> },
    ],
  },
  {
    id: 'weather', labelKey: 'sec_weather',
    items: [
      { id: 'weather', labelKey: 'nav_weather', href: '/da/weather', icon: <CloudSun size={18} /> },
    ],
  },
  {
    id: 'support', labelKey: 'sec_support',
    items: [
      { id: 'grievances',    labelKey: 'nav_grievances',    href: '/da/grievances',    icon: <TriangleAlert size={18} /> },
      { id: 'announcements', labelKey: 'nav_announcements', href: '/da/announcements', icon: <Megaphone size={18} /> },
    ],
  },
  {
    id: 'system', labelKey: 'sec_system',
    items: [
      { id: 'sync',    labelKey: 'nav_sync',    href: '/da/sync',    icon: <ArrowLeftRight size={18} /> },
      { id: 'profile', labelKey: 'nav_profile', href: '/da/profile', icon: <UserCog size={18} /> },
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

export function DaSidebar({ onClose }: Props) {
  const t = useTranslations('Dashboard')
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const toggle = useCallback(() => setCollapsed((p) => !p), [])
  const isActive = useCallback(
    (href: string) => href === '/da' ? pathname === '/da' : pathname.startsWith(href),
    [pathname],
  )

  return (
    <aside className="flex flex-col bg-shell h-full overflow-hidden transition-all duration-[230ms] ease-in-out"
      style={{ width: collapsed ? '60px' : '260px' }}>
      <div className="flex items-center justify-between px-3 h-14 shrink-0">
        {!collapsed && (
          <span className="text-xs font-mono text-on-shell-faint tracking-wider select-none truncate">
            AGRI.INTEL / DA
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
