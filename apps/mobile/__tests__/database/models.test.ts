import { describe, it, expect } from 'vitest';
import { Farmer } from '../../src/database/models/Farmer';
import { Plot } from '../../src/database/models/Plot';
import { CropCycle } from '../../src/database/models/CropCycle';
import { OpQueueItem } from '../../src/database/models/OpQueueItem';

describe('WatermelonDB Models and Schema validation', () => {
  it('instantiates Farmer model with pending approval status', () => {
    const farmer = new Farmer({
      id: 'f-101',
      cityId: 'adama',
      kebeleId: 'kb-01',
      localIdNumber: 'KB-2024-001',
      fullName: 'Tolossa Gemeda',
    });

    expect(farmer.id).toBe('f-101');
    expect(farmer.status).toBe('PENDING');
    expect(farmer.localIdNumber).toBe('KB-2024-001');
    expect(Farmer.table).toBe('farmers');
  });

  it('instantiates Plot model with Ethiopian soil and zone classification', () => {
    const plot = new Plot({
      id: 'p-1',
      farmerId: 'f-101',
      cityId: 'adama',
      kebeleId: 'kb-01',
      plotName: 'Upper Ridge Plot',
      areaValue: 4,
      areaUnit: 'TIMAD',
      areaHectares: 1.0,
      zone: 'WEYNA_DEGA',
      soil: 'KOTICHA_VERTISOL',
    });

    expect(plot.areaHectares).toBe(1.0);
    expect(plot.soil).toBe('KOTICHA_VERTISOL');
    expect(Plot.table).toBe('plots');
  });

  it('instantiates CropCycle with LAND_PREPARATION stage', () => {
    const cycle = new CropCycle({
      id: 'cc-1',
      plotId: 'p-1',
      seasonYear: 2024,
      season: 'MEHER',
      cropId: 'teff-quncho',
    });

    expect(cycle.currentStage).toBe('LAND_PREPARATION');
    expect(cycle.status).toBe('ACTIVE');
    expect(CropCycle.table).toBe('crop_cycles');
  });

  it('instantiates OpQueueItem for offline mutations', () => {
    const op = new OpQueueItem({
      id: 'op-1',
      opId: 'op-101',
      tableName: 'plots',
      recordId: 'p-1',
      opType: 'CREATE',
      payload: JSON.stringify({ plotName: 'New Plot' }),
      baseVersion: 0,
    });

    expect(op.status).toBe('PENDING');
    expect(op.opType).toBe('CREATE');
    expect(OpQueueItem.table).toBe('op_queue_items');
  });
});

