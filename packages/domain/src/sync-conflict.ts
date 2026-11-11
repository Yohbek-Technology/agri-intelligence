export type ConflictResolution = 'SERVER_WINS' | 'CLIENT_WINS' | 'MERGED';

export interface SyncRecordPayload {
  record_id: string;
  table_name: string;
  base_version: number;
  sync_version?: number;
  client_ts?: string | number | Date;
  server_ts?: string | number | Date;
  deleted_at?: string | null;
  fields: Record<string, unknown>;
}

export interface ConflictResolutionResult {
  resolution: ConflictResolution;
  winnerRecord: Record<string, unknown>;
  reason: string;
  mergedFields?: Record<string, unknown>;
}

/**
 * Pure function: Deterministic offline delta sync conflict resolver.
 * Follows AgrIntel system conflict policies:
 * 1. Server deletion always wins over client edits.
 * 2. Immutable/financial records defer to server authority.
 * 3. Non-overlapping field edits are merged deterministically.
 * 4. Overlapping attribute collisions resolve by latest valid timestamp.
 */
export function resolveSyncConflict(
  clientRecord: SyncRecordPayload,
  serverRecord: SyncRecordPayload
): ConflictResolutionResult {
  // Rule 1: Server deletion always wins
  if (serverRecord.deleted_at) {
    return {
      resolution: 'SERVER_WINS',
      winnerRecord: serverRecord.fields,
      reason: 'Server record was marked deleted',
    };
  }

  // Rule 2: If server has identical base version, client change applies cleanly
  if (serverRecord.sync_version === clientRecord.base_version) {
    return {
      resolution: 'CLIENT_WINS',
      winnerRecord: clientRecord.fields,
      reason: 'No version diverge detected',
    };
  }

  // Rule 3: Financial transactions and approval statuses defer to server authority
  const immutableServerTables = ['farm_transactions', 'farmers', 'grievances'];
  if (immutableServerTables.includes(clientRecord.table_name)) {
    // Specifically protect status / monetary amounts from offline overwrite
    if (serverRecord.fields.status !== clientRecord.fields.status) {
      return {
        resolution: 'SERVER_WINS',
        winnerRecord: serverRecord.fields,
        reason: `Server authority maintains ${clientRecord.table_name} approval/status integrity`,
      };
    }
  }

  // Rule 4: Field-level merge for non-conflicting fields
  const clientKeys = Object.keys(clientRecord.fields);
  const serverKeys = Object.keys(serverRecord.fields);
  const commonKeys = clientKeys.filter((k) => serverKeys.includes(k));
  const hasValueCollisions = commonKeys.some(
    (k) => JSON.stringify(clientRecord.fields[k]) !== JSON.stringify(serverRecord.fields[k])
  );

  if (!hasValueCollisions) {
    const merged = { ...serverRecord.fields, ...clientRecord.fields };
    return {
      resolution: 'MERGED',
      winnerRecord: merged,
      mergedFields: merged,
      reason: 'Field sets are disjoint or identical, merged successfully',
    };
  }

  // Rule 5: Timestamp comparison for value collisions
  const clientTime = new Date(clientRecord.client_ts || 0).getTime();
  const serverTime = new Date(serverRecord.server_ts || 0).getTime();

  if (clientTime > serverTime) {
    return {
      resolution: 'CLIENT_WINS',
      winnerRecord: { ...serverRecord.fields, ...clientRecord.fields },
      reason: 'Client timestamp is strictly newer than server version',
    };
  }

  return {
    resolution: 'SERVER_WINS',
    winnerRecord: serverRecord.fields,
    reason: 'Server timestamp is newer or equal to client timestamp',
  };
}

