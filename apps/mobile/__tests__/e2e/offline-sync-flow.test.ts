import { describe, it, expect } from 'vitest';
import { SyncEngine } from '../../src/database/sync';
import { resolveSyncConflict } from '@repo/domain';

describe('E2E Flow 3: Offline Disconnection, Mutation Queuing, and Reconnection Sync', () => {
  it('queues offline operations and merges non-conflicting fields on reconnection', async () => {
    const engine = new SyncEngine();

    // 1. Device is offline: Farmer logs weeding activity and notes
    await engine.enqueueOperation('farm_activities', 'act-101', 'CREATE', {
      activity: 'WEEDING',
      activity_date: '2024-08-15',
      notes: 'Second hand-weeding completed',
    });

    const statusBefore = engine.getStatus();
    expect(statusBefore.pendingChangesCount).toBe(1);

    // 2. Server conflict resolution simulation
    const clientPayload = {
      record_id: 'act-101',
      table_name: 'farm_activities',
      base_version: 1,
      fields: { notes: 'Second hand-weeding completed' },
    };
    const serverPayload = {
      record_id: 'act-101',
      table_name: 'farm_activities',
      base_version: 1,
      sync_version: 2,
      fields: { verified_by_da: true },
    };

    const conflict = resolveSyncConflict(clientPayload, serverPayload);
    expect(conflict.resolution).toBe('MERGED');
    expect(conflict.winnerRecord).toEqual({
      verified_by_da: true,
      notes: 'Second hand-weeding completed',
    });
  });
});

