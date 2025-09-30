import { Pool } from "pg";

// Simple singleton Pool to avoid creating many connections in dev hot reload
let _pool: Pool | null = null;

export function getPool() {
  if (!_pool) {
    _pool = new Pool({
      host: process.env.PGHOST,
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      max: 10,
      ssl:
        process.env.PGSSL === "true"
          ? { rejectUnauthorized: false }
          : undefined,
    });
  }
  return _pool;
}

export async function query(text: string, params?: any[]) {
  const pool = getPool();
  return pool.query(text, params);
}

export async function ensureOxfordTable() {
  // optional helper if we need to create table (won't auto-run to avoid surprises)
  const sql = `CREATE TABLE IF NOT EXISTS public.oxford_words (
		id SERIAL PRIMARY KEY,
		term TEXT NOT NULL,
		meaning TEXT NOT NULL,
		pos TEXT NULL,
		example TEXT NULL,
		image_url TEXT NULL
	);`;
  await query(sql);
}

// You can call ensureOxfordTable() manually somewhere (temporary) if needed.
