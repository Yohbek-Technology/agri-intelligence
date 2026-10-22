'use client'

import { Toaster as SonnerToaster, toast } from 'sonner'

/**
 * Toast provider — wraps sonner with our theme colors.
 * Supports undo actions for destructive operations.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors={false}
      closeButton
      toastOptions={{
        style: {
          background: 'var(--color-surface)',
          border: '2px solid var(--color-border-strong)',
          color: 'var(--color-text-primary)',
          borderRadius: '12px',
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
        },
        classNames: {
          success: 'border-success',
          error: 'border-danger',
          warning: 'border-accent',
          info: 'border-officer-accent',
        },
      }}
    />
  )
}

/**
 * Show a success toast with an optional undo action.
 *
 * @param message   Toast body text
 * @param undoLabel Label for the undo button (default "Undo")
 * @param onUndo    Callback when undo is pressed
 */
export function showSuccessToast(
  message: string,
  undo?: { label?: string; onUndo: () => void },
) {
  if (undo) {
    toast.success(message, {
      action: { label: undo.label ?? 'Undo', onClick: undo.onUndo },
      duration: 6000,
    })
  } else {
    toast.success(message)
  }
}

/** Show an error toast. */
export function showErrorToast(message: string) {
  toast.error(message, { duration: 5000 })
}

/** Show a warning toast with an optional undo action. */
export function showWarningToast(
  message: string,
  undo?: { label?: string; onUndo: () => void },
) {
  if (undo) {
    toast.warning(message, {
      action: { label: undo.label ?? 'Undo', onClick: undo.onUndo },
      duration: 6000,
    })
  } else {
    toast.warning(message)
  }
}

/** Show an info toast with an optional undo action. */
export function showInfoToast(
  message: string,
  undo?: { label?: string; onUndo: () => void },
) {
  if (undo) {
    toast.info(message, {
      action: { label: undo.label ?? 'Undo', onClick: undo.onUndo },
      duration: 6000,
    })
  } else {
    toast.info(message)
  }
}

export { toast }
