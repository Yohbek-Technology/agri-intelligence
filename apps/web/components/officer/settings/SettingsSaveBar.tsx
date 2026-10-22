import React from 'react'
import { Button } from '@/components/ui/button'
import { Notice } from '@/components/ui/notice'

interface SettingsSaveBarProps {
  isDirty: boolean
  isSubmitting: boolean
  generalError: string | null
  onSave: () => void
  onReset: () => void
}

export function SettingsSaveBar({
  isDirty,
  isSubmitting,
  generalError,
  onSave,
  onReset,
}: SettingsSaveBarProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-10 bg-surface border-t border-border px-6 py-4 space-y-3">
      {generalError && (
        <Notice type="error" message={generalError} />
      )}
      <div className="flex items-center justify-between gap-4">
        {isDirty ? (
          <p className="text-xs text-accent font-mono font-medium">You have unsaved changes</p>
        ) : (
          <p className="text-xs text-text-faint font-mono">All changes saved</p>
        )}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={!isDirty || isSubmitting}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onSave}
            disabled={!isDirty}
            isLoading={isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
