export type BadgeVariant = 'alert' | 'ok' | 'pending'

export interface NavItem {
  id: string
  labelKey: string
  href: string
  icon: string
  tag?: string
  badgeKey?: string
  badgeVariant?: BadgeVariant
}

export interface NavSection {
  id: string
  labelKey: string
  sysTag: string
  icon: string
  items: NavItem[]
}
