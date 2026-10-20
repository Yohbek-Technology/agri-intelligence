import { syncQueue, type QueuedMutation } from './sync-queue';
import { apiRequest } from '@/services/api/client';
import { SYNC_CONFIG, APP_VERSION } from '@/config/constants';
import { API_ENDPOINTS } from '@/config/env';
import { secureStorage } from '@/services/storage/keychain-storage';

export interface MutationResult {
  id: string;
  status: 'applied' | 'duplicate' | 'rejected';
  reject_reason?: string;
}

export interface PushResponseData {
  results: MutationResult[];
  server_cursor: number;
}

export interface PullResponseData {
  changes: Array<{
    sequence_number: number;
    entity_type: string;
    entity_id: string;
    operation: 'insert' | 'update' | 'delete';
    record: Record<string, unknown>;
    server_timestamp: string;
  }>;
  next_cursor: number;
  has_more: boolean;
}

export interface AppVersionData {
  min_supported_app_version: string;
  latest_app_version: string;
  update_required: boolean;
}

const SERVER_CURSOR_KEY = 'agri_sync_server_cursor';

export const deltaSyncEngine = {
  async getServerCursor(): Promise<number> {
    const raw = await secureStorage.getItem(SERVER_CURSOR_KEY);
    return raw ? parseInt(raw, 10) : 0;
  },

  async setServerCursor(cursor: number): Promise<void> {
    await secureStorage.setItem(SERVER_CURSOR_KEY, cursor.toString());
  },

  /**
   * Pushes pending mutations from local queue to the backend.
   * Batch size <= 50 records or <= 500 KB.
   */
  async pushPendingMutations(): Promise<{ pushed: number; applied: number; rejected: number }> {
    const pending = await syncQueue.getPending(SYNC_CONFIG.maxBatchRecords);
    if (pending.length === 0) {
      return { pushed: 0, applied: 0, rejected: 0 };
    }

    const payload = {
      mutations: pending.map((m) => ({
        id: m.id,
        client_sequence_number: m.client_sequence_number,
        entity_type: m.entity_type,
        entity_id: m.entity_id,
        operation: m.operation,
        payload: m.payload,
        payload_hash: m.payload_hash,
        client_created_at: m.client_created_at,
      })),
    };

    const res = await apiRequest<PushResponseData>(API_ENDPOINTS.sync.push, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.success || !res.data) {
      return { pushed: pending.length, applied: 0, rejected: 0 };
    }

    let appliedCount = 0;
    let rejectedCount = 0;

    for (const result of res.data.results) {
      if (result.status === 'applied' || result.status === 'duplicate') {
        await syncQueue.markApplied(result.id);
        appliedCount++;
      } else if (result.status === 'rejected') {
        await syncQueue.markRejected(result.id, result.reject_reason || 'Unknown error');
        rejectedCount++;
      }
    }

    if (res.data.server_cursor) {
      await this.setServerCursor(res.data.server_cursor);
    }

    return { pushed: pending.length, applied: appliedCount, rejected: rejectedCount };
  },

  /**
   * Pulls server changes since the saved cursor.
   */
  async pullServerChanges(): Promise<{ receivedChanges: number; nextCursor: number }> {
    const currentCursor = await this.getServerCursor();
    const url = `${API_ENDPOINTS.sync.pull}?cursor=${currentCursor}&limit=${SYNC_CONFIG.maxBatchRecords}`;

    const res = await apiRequest<PullResponseData>(url, {
      method: 'GET',
    });

    if (!res.success || !res.data) {
      return { receivedChanges: 0, nextCursor: currentCursor };
    }

    // Apply changes locally
    for (const change of res.data.changes) {
      // In a full implementation, this writes to WatermelonDB / local SQLite
      console.log(`[DeltaSync] Ingesting change: ${change.entity_type}:${change.entity_id} (${change.operation})`);
    }

    if (res.data.next_cursor) {
      await this.setServerCursor(res.data.next_cursor);
    }

    return {
      receivedChanges: res.data.changes.length,
      nextCursor: res.data.next_cursor ?? currentCursor,
    };
  },

  /**
   * Verifies if installed app satisfies server minimum version policy.
   * If outdated, client enters update-required mode (MOB-DIST-3) allowing sync but warning user.
   */
  async checkVersionCompatibility(): Promise<AppVersionData> {
    const res = await apiRequest<{ min_supported_app_version: string; latest_app_version: string }>(
      API_ENDPOINTS.appVersion,
      { method: 'GET' }
    );

    if (!res.success || !res.data) {
      return {
        min_supported_app_version: APP_VERSION,
        latest_app_version: APP_VERSION,
        update_required: false,
      };
    }

    const isOutdated = this.compareSemver(APP_VERSION, res.data.min_supported_app_version) < 0;

    return {
      min_supported_app_version: res.data.min_supported_app_version,
      latest_app_version: res.data.latest_app_version,
      update_required: isOutdated,
    };
  },

  compareSemver(v1: string, v2: string): number {
    const p1 = v1.split('.').map((n) => parseInt(n, 10) || 0);
    const p2 = v2.split('.').map((n) => parseInt(n, 10) || 0);
    for (let i = 0; i < 3; i++) {
      if ((p1[i] ?? 0) > (p2[i] ?? 0)) return 1;
      if ((p1[i] ?? 0) < (p2[i] ?? 0)) return -1;
    }
    return 0;
  },

  /**
   * Performs a complete bidirectional sync cycle (Push mutations -> Pull deltas).
   */
  async performSyncCycle(): Promise<{ pushed: number; received: number }> {
    const pushResult = await this.pushPendingMutations();
    const pullResult = await this.pullServerChanges();
    return {
      pushed: pushResult.applied,
      received: pullResult.receivedChanges,
    };
  },
};
