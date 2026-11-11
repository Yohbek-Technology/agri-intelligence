import { describe, it, expect } from 'vitest';
import { resolveSyncConflict } from '@repo/domain';

describe('Delta sync conflict policy integration', () => {
  it('protects server authority for financial transaction mutations', () => {
    const res = resolveSyncConflict(
      {
        record_id: 'txn-1',
        table_name: 'farm_transactions',
        base_version: 1,
        fields: { amount_etb: 5000, status: 'APPROVED' },
      },
      {
        record_id: 'txn-1',
        table_name: 'farm_transactions',
        base_version: 1,
        sync_version: 2,
        fields: { amount_etb: 4500, status: 'REJECTED' },
      }
    );

    expect(res.resolution).toBe('SERVER_WINS');
    expect(res.winnerRecord.status).toBe('REJECTED');
  });

  it('honors server deletions over offline edits', () => {
    const res = resolveSyncConflict(
      {
        record_id: 'plot-1',
        table_name: 'plots',
        base_version: 1,
        fields: { plot_name: 'Renamed Plot' },
      },
      {
        record_id: 'plot-1',
        table_name: 'plots',
        base_version: 1,
        sync_version: 3,
        deleted_at: '2026-11-09T00:00:00Z',
        fields: { plot_name: 'Original Plot' },
      }
    );

    expect(res.resolution).toBe('SERVER_WINS');
    expect(res.reason).toContain('marked deleted');
  });
});

