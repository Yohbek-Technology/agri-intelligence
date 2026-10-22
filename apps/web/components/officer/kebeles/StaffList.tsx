'use client'

import type { StaffRow } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Edit, UserX } from 'lucide-react'

interface StaffListProps {
  staff: StaffRow[]
  onEdit: (member: StaffRow) => void
  onDeactivate: (member: StaffRow) => void
  isDeactivating: boolean
}

export function StaffList({ staff, onEdit, onDeactivate, isDeactivating }: StaffListProps) {
  if (staff.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted text-sm">
        <Users className="mx-auto mb-3 opacity-40" size={32} />
        <p>No staff members yet. Add a DA or Officer.</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {staff.map((member) => (
        <li key={member.id} className="flex items-center justify-between py-3 gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-text-primary truncate">{member.name}</p>
              <Badge
                variant={member.role === 'da' ? 'accent' : 'primary'}
                size="sm"
              >
                {member.role.toUpperCase()}
              </Badge>
              {member.banned && (
                <Badge variant="danger" size="sm">Inactive</Badge>
              )}
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {member.phoneNumber ?? '—'} · {member.preferredLanguage.toUpperCase()}
            </p>
            {member.assignedKebeleIds.length > 0 && (
              <p className="text-xs text-text-faint mt-0.5">
                {member.assignedKebeleIds.length} kebele{member.assignedKebeleIds.length !== 1 ? 's' : ''} assigned
              </p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => onEdit(member)} aria-label="Edit staff">
              <Edit size={14} />
            </Button>
            {!member.banned && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeactivate(member)}
                disabled={isDeactivating}
                aria-label="Deactivate staff"
              >
                <UserX size={14} className="text-danger" />
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
