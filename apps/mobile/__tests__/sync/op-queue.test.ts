import { describe, it, expect } from 'vitest';
import { SyncEngine } from '../../src/database/sync';

describe('Offline Op-Queue and Retry logic', () => {
  it('enqueues offline mutations with initial PENDING status', async () => {
    const engine = new SyncEngine();

    await engine.enqueueOperation('plots', 'plot-99', 'CREATE', {
      plot_name: 'Parcel A',
      area_hectares: 0.5,
    });

    const status = engine.getStatus();
    expect(status.pendingChangesCount).toBe(1);
    expect(status.isSyncing).toBe(false);
  });
});

