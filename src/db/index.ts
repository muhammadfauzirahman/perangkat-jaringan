import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum diset. Salin .env.example jadi .env.");
}

// ponytail: satu Pool global. Cukup untuk deploy single-process.
// Kalau nanti pindah ke serverless (banyak instance), ganti ke driver
// serverless atau tambah connection pooler di sisi database.
const globalForDb = globalThis as unknown as { pool?: Pool };

const pool =
  globalForDb.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
