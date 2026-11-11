/**
 * Base WatermelonDB model contract for AgrIntel synced entities.
 */
export abstract class BaseModel {
  id: string = '';
  syncVersion: number = 0;
  createdAt: string = new Date().toISOString();
  updatedAt: string = new Date().toISOString();
  deletedAt?: string | null = null;

  constructor(attributes?: Record<string, any>) {
    if (attributes) {
      Object.assign(this, attributes);
    }
  }
}
