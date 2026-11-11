import { describe, it, expect } from 'vitest';
import { resolveSyncConflict, type SyncRecordPayload } from '../src/sync-conflict.js';

describe('resolveSyncConflict', () => {
  it('server deletion always wins over client modification', () => {
    const client: SyncRecordPayload = {
      record_id: 'rec-1',
      table_name: 'plots',
      base_version: 1,
      fields: { plot_name: 'Updated Offline' },
    };
    const server: SyncRecordPayload = {
      record_id: 'rec-1',
      table_name: 'plots',
      base_version: 1,
      sync_version: 2,
      deleted_at: '2026-11-08T12:00:00Z',
      fields: { plot_name: 'Original Plot' },
    };

    const res = resolveSyncConflict(client, server);
    expect(res.resolution).toBe('SERVER_WINS');
    expect(res.reason).toContain('deleted');
  });

  it('client wins if server version matches client base version', () => {
    const client: SyncRecordPayload = {
      record_id: 'rec-2',
      table_name: 'plots',
      base_version: 3,
      fields: { plot_name: 'New Plot Name' },
    };
    const server: SyncRecordPayload = {
      record_id: 'rec-2',
      table_name: 'plots',
      base_version: 3,
      sync_version: 3,
      fields: { plot_name: 'Old Plot Name' },
    };

    const res = resolveSyncConflict(client, server);
    expect(res.resolution).toBe('CLIENT_WINS');
    expect(res.winnerRecord.plot_name).toBe('New Plot Name');
  });

  it('protects immutable status fields on server authority tables', () => {
    const client: SyncRecordPayload = {
      record_id: 'farmer-1',
      table_name: 'farmers',
      base_version: 1,
      fields: { status: 'APPROVED', full_name: 'Farmer Test' },
    };
    const server: SyncRecordPayload = {
      record_id: 'farmer-1',
      table_name: 'farmers',
      base_version: 1,
      sync_version: 2,
      fields: { status: 'SUSPENDED', full_name: 'Farmer Test' },
    };

    const res = resolveSyncConflict(client, server);
    expect(res.resolution).toBe('SERVER_WINS');
    expect(res.winnerRecord.status).toBe('SUSPENDED');
  });

  it('merges non-overlapping disjoint field sets', () => {
    const client: SyncRecordPayload = {
      record_id: 'cycle-1',
      table_name: 'crop_cycles',
      base_version: 1,
      fields: { notes: 'Weeded on Tuesday' },
    };
    const server: SyncRecordPayload = {
      record_id: 'cycle-1',
      table_name: 'crop_cycles',
      base_version: 1,
      sync_version: 2,
      fields: { current_stage: 'VEGETATIVE' },
    };

    const res = resolveSyncConflict(client, server);
    expect(res.resolution).toBe('MERGED');
    expect(res.winnerRecord).toEqual({
      current_stage: 'VEGETATIVE',
      notes: 'Weeded on Tuesday',
    });
  });
});

