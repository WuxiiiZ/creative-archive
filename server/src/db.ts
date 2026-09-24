/**
 * PostgreSQL pool + schema bootstrap.
 * Posts persist across restarts; connection string comes from DATABASE_URL.
 */
import pg from "pg";

const { Pool } = pg;

const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://localhost:5432/creative_archive";

export const pool = new Pool({ connectionString: DATABASE_URL });

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  section TEXT NOT NULL CHECK (section IN ('A', 'B', 'C')),
  language TEXT NOT NULL DEFAULT 'zh' CHECK (language IN ('en', 'zh')),
  tags TEXT[] NOT NULL DEFAULT '{}',
  subtags TEXT[] NOT NULL DEFAULT '{}',
  images TEXT[] NOT NULL DEFAULT '{}',
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS posts_created_at_idx ON posts (created_at DESC);

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'zh';
`;

/** Create tables/indexes if missing. Call once before listening. */
export async function ensureSchema(): Promise<void> {
  await pool.query(SCHEMA_SQL);
}
