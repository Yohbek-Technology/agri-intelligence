// import * as dotenv from "dotenv";

// dotenv.config();
// dotenv.config({ path: ".env.local" });

// import { drizzle } from "drizzle-orm/node-postgres";

// export const db = drizzle(process.env.DATABASE_URL!);

import 'dotenv/config';
import { drizzle} from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "@/db/index.js"

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
})

export const db = drizzle({
  client: pool,
  schema: {
    ...schema,
  },
  casing: "snake_case",
}  as any);