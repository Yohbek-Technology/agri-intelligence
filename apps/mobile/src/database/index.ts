import { mobileDatabaseSchema } from './schema';
import { syncQueue } from './sync/sync-queue';
import { deltaSyncEngine } from './sync/delta-sync';

/**
 * Mobile Offline Database Interface
 * Manages 19 synchronized local tables, transactional mutation queue, and delta-sync
 */
export const localDatabase = {
  schema: mobileDatabaseSchema,
  syncQueue,
  deltaSync: deltaSyncEngine,
  isInitialized: true,
};

export { syncQueue, deltaSyncEngine };
