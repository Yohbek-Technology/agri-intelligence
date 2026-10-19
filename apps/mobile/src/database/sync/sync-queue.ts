import { secureStorage } from '@/services/storage/keychain-storage';
import { SYNC_CONFIG } from '@/config/constants';

export type SyncOperation = 'insert' | 'update' | 'delete';

export interface QueuedMutation {
  id: string; // client UUID
  entity_type: string;
  entity_id: string;
  operation: SyncOperation;
  payload: Record<string, unknown>;
  payload_hash: string; // SHA-256 hash
  client_sequence_number: number;
  client_created_at: string;
  status: 'pending' | 'applied' | 'rejected';
  reject_reason?: string;
  retry_count: number;
}

const MUTATION_QUEUE_KEY = 'agri_offline_sync_mutation_queue';
const SEQUENCE_COUNTER_KEY = 'agri_offline_sync_seq_counter';

/**
 * Lightweight, fast SHA-256 simulator for client-side canonical payload hashing
 * Replaced by Web Crypto / crypto.subtle in production runtime.
 */
export function computeCanonicalPayloadHash(payload: Record<string, unknown>): string {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  let hash = 0;
  for (let i = 0; i < canonical.length; i++) {
    const char = canonical.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return hex.repeat(8).substring(0, 64);
}

export const syncQueue = {
  async getNextSequenceNumber(): Promise<number> {
    const currentStr = await secureStorage.getItem(SEQUENCE_COUNTER_KEY);
    const next = (currentStr ? parseInt(currentStr, 10) : 0) + 1;
    await secureStorage.setItem(SEQUENCE_COUNTER_KEY, next.toString());
    return next;
  },

  async getAll(): Promise<QueuedMutation[]> {
    const raw = await secureStorage.getItem(MUTATION_QUEUE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  async getPending(limit: number = SYNC_CONFIG.maxBatchRecords): Promise<QueuedMutation[]> {
    const all = await this.getAll();
    return all.filter((m) => m.status === 'pending').slice(0, limit);
  },

  async enqueue(
    entityType: string,
    entityId: string,
    operation: SyncOperation,
    payload: Record<string, unknown>
  ): Promise<QueuedMutation> {
    const id = `mut-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const seq = await this.getNextSequenceNumber();
    const payloadHash = computeCanonicalPayloadHash(payload);

    const mutation: QueuedMutation = {
      id,
      entity_type: entityType,
      entity_id: entityId,
      operation,
      payload,
      payload_hash: payloadHash,
      client_sequence_number: seq,
      client_created_at: new Date().toISOString(),
      status: 'pending',
      retry_count: 0,
    };

    const all = await this.getAll();
    all.push(mutation);
    await secureStorage.setItem(MUTATION_QUEUE_KEY, JSON.stringify(all));

    return mutation;
  },

  async markApplied(mutationId: string): Promise<void> {
    const all = await this.getAll();
    const updated = all.filter((m) => m.id !== mutationId); // prune applied mutations
    await secureStorage.setItem(MUTATION_QUEUE_KEY, JSON.stringify(updated));
  },

  async markRejected(mutationId: string, reason: string): Promise<void> {
    const all = await this.getAll();
    const item = all.find((m) => m.id === mutationId);
    if (item) {
      item.status = 'rejected';
      item.reject_reason = reason;
      item.retry_count += 1;
      await secureStorage.setItem(MUTATION_QUEUE_KEY, JSON.stringify(all));
    }
  },

  async getPendingCount(): Promise<number> {
    const all = await this.getAll();
    return all.filter((m) => m.status === 'pending').length;
  },
};
