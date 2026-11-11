/**
 * useSync Hook
 * Exposes sync state, pending change queue counts, and manual sync trigger.
 */
import { useState, useEffect, useCallback } from 'react';
import { syncEngine, type SyncStatusState } from '@/database/sync';

export function useSync() {
  const [status, setStatus] = useState<SyncStatusState>(syncEngine.getStatus());

  const refreshStatus = useCallback(() => {
    setStatus(syncEngine.getStatus());
  }, []);

  useEffect(() => {
    const timer = setInterval(refreshStatus, 2000);
    return () => clearInterval(timer);
  }, [refreshStatus]);

  const triggerSync = useCallback(async () => {
    try {
      const res = await syncEngine.syncNow();
      refreshStatus();
      return res;
    } catch (err) {
      refreshStatus();
      throw err;
    }
  }, [refreshStatus]);

  return {
    isSyncing: status.isSyncing,
    lastSyncedAt: status.lastSyncedAt,
    pendingCount: status.pendingChangesCount,
    lastError: status.lastError,
    triggerSync,
  };
}

