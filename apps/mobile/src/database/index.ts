import { mobileDatabaseSchema } from './schema';
import { syncQueue } from './sync/sync-queue';

/**
 * Mobile Offline Database Interface
 * Manages reactive queries and asynchronous delta-sync
 */
export const localDatabase = {
  schema: mobileDatabaseSchema,
  syncQueue,
  isInitialized: true,
};

export { syncQueue };
