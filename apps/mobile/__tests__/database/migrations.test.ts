import { describe, it, expect } from 'vitest';
import { migrations } from '../../src/database/migrations';
import { schema } from '../../src/database/schema';

describe('WatermelonDB Schema & Versioned Migrations', () => {
  it('defines schema version 1 with all 11 domain tables', () => {
    expect(schema.version).toBe(1);
    expect(schema.tables.length).toBe(11);

    const tableNames = schema.tables.map((t) => t.name);
    expect(tableNames).toContain('farmers');
    expect(tableNames).toContain('plots');
    expect(tableNames).toContain('crop_cycles');
    expect(tableNames).toContain('fertilizer_applications');
    expect(tableNames).toContain('farm_activities');
    expect(tableNames).toContain('farm_transactions');
    expect(tableNames).toContain('pest_diagnoses');
    expect(tableNames).toContain('grievances');
    expect(tableNames).toContain('grievance_responses');
    expect(tableNames).toContain('announcements');
    expect(tableNames).toContain('op_queue_items');
  });

  it('provides version 1 migration steps', () => {
    expect(migrations.migrations.length).toBeGreaterThan(0);
    expect(migrations.migrations[0].toVersion).toBe(1);
  });
});

