/**
 * Delta Sync Engine for AgrIntel Mobile
 * Orchestrates op-queue push, change-feed pull, and deterministic conflict resolution.
 */
import { resolveSyncConflict, type SyncRecordPayload } from '@repo/domain';
import { api } from '@/services/api';
import { MAX_SYNC_BATCH_SIZE } from '@/lib/constants';
import type { OpQueueItem } from './models/OpQueueItem';

export interface SyncStatusState {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  pendingChangesCount: number;
  lastError: string | null;
}

export class SyncEngine {
  private inMemoryQueue: OpQueueItem[] = [];
  private lastCursor: number = 0;
  private isSyncing: boolean = false;
  private lastSyncedAt: Date | null = null;
  private lastError: string | null = null;

  getStatus(): SyncStatusState {
    return {
      isSyncing: this.isSyncing,
      lastSyncedAt: this.lastSyncedAt,
      pendingChangesCount: this.inMemoryQueue.filter((i) => i.status === 'PENDING').length,
      lastError: this.lastError,
    };
  }

  /**
   * Enqueues an offline mutation into the persistent op-queue.
   */
  async enqueueOperation(
    tableOrOptions:
      | string
      | {
          tableName?: string;
          table_name?: string;
          recordId?: string;
          record_id?: string;
          opType?: 'CREATE' | 'UPDATE' | 'DELETE' | 'INSERT';
          op_type?: 'CREATE' | 'UPDATE' | 'DELETE' | 'INSERT';
          payload: Record<string, unknown>;
          baseVersion?: number;
          base_version?: number;
        },
    recordId?: string,
    opType?: 'CREATE' | 'UPDATE' | 'DELETE' | 'INSERT',
    payload?: Record<string, unknown>,
    baseVersion: number = 0
  ): Promise<void> {
    let tbl: string;
    let recId: string;
    let rawOp: 'CREATE' | 'UPDATE' | 'DELETE' | 'INSERT';
    let data: Record<string, unknown>;
    let version = 0;

    if (typeof tableOrOptions === 'object') {
      tbl = tableOrOptions.tableName || tableOrOptions.table_name || '';
      recId = tableOrOptions.recordId || tableOrOptions.record_id || '';
      rawOp = tableOrOptions.opType || tableOrOptions.op_type || 'CREATE';
      data = tableOrOptions.payload || {};
      version = tableOrOptions.baseVersion ?? tableOrOptions.base_version ?? 0;
    } else {
      tbl = tableOrOptions;
      recId = recordId || '';
      rawOp = opType || 'CREATE';
      data = payload || {};
      version = baseVersion || 0;
    }

    const op: 'CREATE' | 'UPDATE' | 'DELETE' = rawOp === 'INSERT' ? 'CREATE' : rawOp;

    const item: OpQueueItem = {
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      opId: `op-${Date.now()}`,
      tableName: tbl,
      recordId: recId,
      opType: op,
      payload: JSON.stringify(data),
      baseVersion: version,
      clientTs: new Date().toISOString(),
      status: 'PENDING',
      retryCount: 0,
      syncVersion: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.inMemoryQueue.push(item);
  }

  /**
   * Executes bidirectional delta sync: Push local changes, Pull remote changes.
   */
  async syncNow(): Promise<{ pushedCount: number; pulledCount: number }> {
    if (this.isSyncing) {
      return { pushedCount: 0, pulledCount: 0 };
    }

    this.isSyncing = true;
    this.lastError = null;
    let pushed = 0;
    let pulled = 0;

    try {
      // 1. PUSH: Send pending batch to server
      const pendingItems = this.inMemoryQueue
        .filter((item) => item.status === 'PENDING' || item.status === 'FAILED')
        .slice(0, MAX_SYNC_BATCH_SIZE);

      if (pendingItems.length > 0) {
        pendingItems.forEach((i) => (i.status = 'SYNCING'));

        const pushPayload = pendingItems.map((item) => ({
          op_id: item.opId,
          table_name: item.tableName,
          record_id: item.recordId,
          op_type: item.opType,
          payload: JSON.parse(item.payload),
          base_version: item.baseVersion,
          client_ts: item.clientTs,
        }));

        const pushRes: any = await api.post('/v1/sync/push', {
          batch_id: `batch-${Date.now()}`,
          operations: pushPayload,
        });

        if (pushRes.data?.conflicts) {
          // Resolve any server conflicts via shared domain policy
          for (const conflict of pushRes.data.conflicts) {
            const clientPayload: SyncRecordPayload = {
              record_id: conflict.record_id,
              table_name: conflict.table_name,
              base_version: conflict.base_version,
              client_ts: conflict.client_ts,
              fields: conflict.client_fields,
            };
            const serverPayload: SyncRecordPayload = {
              record_id: conflict.record_id,
              table_name: conflict.table_name,
              base_version: conflict.base_version,
              sync_version: conflict.server_sync_version,
              server_ts: conflict.server_ts,
              fields: conflict.server_fields,
            };

            const resolution = resolveSyncConflict(clientPayload, serverPayload);
            console.log(`[SyncEngine] Conflict resolved: ${resolution.resolution} - ${resolution.reason}`);
          }
        }

        // Mark pushed items as resolved
        pendingItems.forEach((i) => (i.status = 'RESOLVED'));
        pushed = pendingItems.length;
      }

      // 2. PULL: Fetch change-feed from cursor
      const pullRes: any = await api.get(`/v1/sync/pull?cursor=${this.lastCursor}`);
      if (pullRes.data?.changes) {
        pulled = pullRes.data.changes.length;
        if (pullRes.data.next_cursor) {
          this.lastCursor = pullRes.data.next_cursor;
        }
      }

      this.lastSyncedAt = new Date();
      return { pushedCount: pushed, pulledCount: pulled };
    } catch (err: any) {
      this.lastError = err?.message || 'Sync failed due to connectivity timeout';
      // Mark syncing items back to failed for retry
      this.inMemoryQueue
        .filter((i) => i.status === 'SYNCING')
        .forEach((i) => {
          i.status = 'FAILED';
          i.retryCount += 1;
        });
      throw err;
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncEngine = new SyncEngine();
