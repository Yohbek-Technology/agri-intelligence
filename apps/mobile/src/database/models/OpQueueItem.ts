import { BaseModel } from './BaseModel';

export type SyncOpType = 'CREATE' | 'UPDATE' | 'DELETE';
export type SyncOpStatus = 'PENDING' | 'SYNCING' | 'FAILED' | 'RESOLVED';

export class OpQueueItem extends BaseModel {
  static table = 'op_queue_items';

  opId!: string;
  tableName!: string;
  recordId!: string;
  opType!: SyncOpType;
  payload!: string; // JSON string of mutation attributes
  baseVersion: number = 0;
  clientTs!: string;
  status: SyncOpStatus = 'PENDING';
  retryCount: number = 0;
  errorMessage?: string | null;

  constructor(attributes?: Partial<OpQueueItem>) {
    super();
    if (attributes) {
      Object.assign(this, attributes);
    }
  }
}
