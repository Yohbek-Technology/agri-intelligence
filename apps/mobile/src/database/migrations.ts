/**
 * WatermelonDB Schema Migrations for AgrIntel Mobile
 * Versioned local migrations to prevent broken installations when schema evolves.
 */

export interface MigrationStep {
  toVersion: number;
  steps: unknown[];
}

export interface SchemaMigrationsDefinition {
  migrations: MigrationStep[];
}

export function schemaMigrations({
  migrations,
}: {
  migrations: MigrationStep[];
}): SchemaMigrationsDefinition {
  return { migrations };
}

export const migrations = schemaMigrations({
  migrations: [
    // Initial schema migration to version 1
    {
      toVersion: 1,
      steps: [],
    },
  ],
});

