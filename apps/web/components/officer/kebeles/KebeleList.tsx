'use client'

import type { KebeleRow } from '@repo/shared'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Edit, Trash2 } from 'lucide-react'

interface KebeleListProps {
  kebeles: KebeleRow[]
  onEdit: (kebele: KebeleRow) => void
  onDelete: (kebele: KebeleRow) => void
  isDeleting: boolean
}

export function KebeleList({ kebeles, onEdit, onDelete, isDeleting }: KebeleListProps) {
  if (kebeles.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted text-sm">
        <MapPin className="mx-auto mb-3 opacity-40" size={32} />
        <p>No kebeles defined yet. Add one to get started.</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {kebeles.map((kebele) => (
        <li key={kebele.id} className="flex items-center justify-between py-3 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <MapPin size={16} className="text-officer-accent shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{kebele.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {kebele.boundary ? (
                  <Badge variant="primary" size="sm">MultiPolygon</Badge>
                ) : (
                  <Badge variant="default" size="sm">
                    {kebele.centroidLatitude ? `${Number(kebele.centroidLatitude).toFixed(4)}, ${Number(kebele.centroidLongitude).toFixed(4)}` : 'Centroid'}
                  </Badge>
                )}
                {kebele.radiusMeters && (
                  <span className="text-xs text-text-faint">{kebele.radiusMeters}m radius</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => onEdit(kebele)} aria-label="Edit kebele">
              <Edit size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(kebele)}
              disabled={isDeleting}
              aria-label="Delete kebele"
            >
              <Trash2 size={14} className="text-danger" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
