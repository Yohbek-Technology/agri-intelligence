import React, { createContext, useContext } from 'react';
import { useSync } from '@/hooks/useSync';

export interface SyncContextValue {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  pendingCount: number;
  lastError: string | null;
  triggerSync: () => Promise<{ pushedCount: number; pulledCount: number }>;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const syncState = useSync();

  return (
    <SyncContext.Provider value={syncState}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncContext(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }
  return ctx;
}

