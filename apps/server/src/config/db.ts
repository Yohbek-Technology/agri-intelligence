import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '@/db/index.js'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('[db] DATABASE_URL environment variable is required.')
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  min: 0,
  idleTimeoutMillis: 20_000,
  // Neon serverless can have cold-start latency of 10–20s; use 30s to be safe.
  connectionTimeoutMillis: 30_000,
  allowExitOnIdle: true,
})

pool.on('error', (err) => {
  console.error('[db] Idle client error:', err.message)
})

export const db = drizzle({ client: pool, schema } as any)
