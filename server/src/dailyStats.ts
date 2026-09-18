/**
 * Daily archive stats: live for today, sealed after midnight so past days
 * no longer change when posts are edited.
 */
import { pool } from "./db.js";
import type { Post } from "./types.js";

export interface DayStat {
  day: string;
  posts: number;
  images: number;
  chars: number;
  sealed: boolean;
}

const STATS_TIMEZONE =
  process.env.STATS_TIMEZONE?.trim() || "America/New_York";

function countChars(text: string): number {
  return Array.from(text).length;
}

function imageCount(post: Post): number {
  return post.images?.filter(Boolean).length ?? 0;
}

/** Calendar YYYY-MM-DD in the configured stats timezone. */
export function dayKeyForDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STATS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function dayKeyForIso(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return dayKeyForDate(date);
}

function shiftDayKey(day: string, deltaDays: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  utc.setUTCDate(utc.getUTCDate() + deltaDays);
  const yy = utc.getUTCFullYear();
  const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** Normalize a Postgres DATE (or ISO string) to YYYY-MM-DD. */
function formatPgDate(value: Date | string): string {
  if (typeof value === "string") return value.slice(0, 10);
  const y = value.getUTCFullYear();
  const m = String(value.getUTCMonth() + 1).padStart(2, "0");
  const d = String(value.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const DAILY_STATS_SQL = `
CREATE TABLE IF NOT EXISTS daily_stats (
  day DATE PRIMARY KEY,
  posts INTEGER NOT NULL DEFAULT 0,
  images INTEGER NOT NULL DEFAULT 0,
  chars INTEGER NOT NULL DEFAULT 0,
  sealed BOOLEAN NOT NULL DEFAULT FALSE
);
`;

export async function ensureDailyStatsSchema(): Promise<void> {
  await pool.query(DAILY_STATS_SQL);
  await backfillIfEmpty();
  await sealPastDays();
  await ensureOpenDay(dayKeyForDate());
}

async function backfillIfEmpty(): Promise<void> {
  const count = await pool.query<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM daily_stats`,
  );
  if (Number(count.rows[0]?.n ?? 0) > 0) return;

  const posts = await pool.query<{
    created_at: Date;
    content: string;
    images: string[] | null;
  }>(`SELECT created_at, content, images FROM posts`);

  if (posts.rows.length === 0) return;

  const today = dayKeyForDate();
  const map = new Map<string, { posts: number; images: number; chars: number }>();

  for (const row of posts.rows) {
    const key = dayKeyForDate(row.created_at);
    const bucket = map.get(key) ?? { posts: 0, images: 0, chars: 0 };
    bucket.posts += 1;
    bucket.images += Array.isArray(row.images)
      ? row.images.filter(Boolean).length
      : 0;
    bucket.chars += countChars(row.content ?? "");
    map.set(key, bucket);
  }

  for (const [day, bucket] of map) {
    await pool.query(
      `INSERT INTO daily_stats (day, posts, images, chars, sealed)
       VALUES ($1::date, $2, $3, $4, $5)
       ON CONFLICT (day) DO NOTHING`,
      [day, bucket.posts, bucket.images, bucket.chars, day < today],
    );
  }
}

/** Freeze every calendar day before today. */
export async function sealPastDays(): Promise<void> {
  const today = dayKeyForDate();
  await pool.query(
    `UPDATE daily_stats
     SET sealed = TRUE
     WHERE day < $1::date AND sealed = FALSE`,
    [today],
  );
}

async function ensureOpenDay(day: string): Promise<void> {
  await pool.query(
    `INSERT INTO daily_stats (day, posts, images, chars, sealed)
     VALUES ($1::date, 0, 0, 0, FALSE)
     ON CONFLICT (day) DO NOTHING`,
    [day],
  );
}

async function getRow(day: string): Promise<DayStat | null> {
  const result = await pool.query<{
    day: Date;
    posts: number;
    images: number;
    chars: number;
    sealed: boolean;
  }>(
    `SELECT day, posts, images, chars, sealed
     FROM daily_stats
     WHERE day = $1::date`,
    [day],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    day: formatPgDate(row.day),
    posts: Number(row.posts),
    images: Number(row.images),
    chars: Number(row.chars),
    sealed: Boolean(row.sealed),
  };
}

async function addToDay(
  day: string,
  delta: { posts?: number; images?: number; chars?: number },
): Promise<void> {
  await sealPastDays();
  const today = dayKeyForDate();
  // Never mutate a sealed day, or any day that is not the open "today".
  if (day !== today) return;

  await ensureOpenDay(day);
  const existing = await getRow(day);
  if (existing?.sealed) return;

  await pool.query(
    `UPDATE daily_stats
     SET
       posts = GREATEST(0, posts + $2),
       images = GREATEST(0, images + $3),
       chars = GREATEST(0, chars + $4)
     WHERE day = $1::date AND sealed = FALSE`,
    [day, delta.posts ?? 0, delta.images ?? 0, delta.chars ?? 0],
  );
}

export async function recordPostCreated(post: Post): Promise<void> {
  const day = dayKeyForIso(post.createdAt);
  if (!day) return;
  await addToDay(day, {
    posts: 1,
    images: imageCount(post),
    chars: countChars(post.content ?? ""),
  });
}

export async function recordPostUpdated(
  before: Post,
  after: Post,
): Promise<void> {
  const day = dayKeyForIso(before.createdAt);
  if (!day) return;
  await addToDay(day, {
    images: imageCount(after) - imageCount(before),
    chars:
      countChars(after.content ?? "") - countChars(before.content ?? ""),
  });
}

export async function recordPostDeleted(post: Post): Promise<void> {
  const day = dayKeyForIso(post.createdAt);
  if (!day) return;
  await addToDay(day, {
    posts: -1,
    images: -imageCount(post),
    chars: -countChars(post.content ?? ""),
  });
}

export async function getDeskDailyStats(): Promise<{
  timezone: string;
  today: DayStat;
  yesterday: DayStat;
  last7Days: DayStat[];
}> {
  await sealPastDays();
  const todayKey = dayKeyForDate();
  const yesterdayKey = shiftDayKey(todayKey, -1);
  await ensureOpenDay(todayKey);

  const today = (await getRow(todayKey)) ?? {
    day: todayKey,
    posts: 0,
    images: 0,
    chars: 0,
    sealed: false,
  };
  const yesterday = (await getRow(yesterdayKey)) ?? {
    day: yesterdayKey,
    posts: 0,
    images: 0,
    chars: 0,
    sealed: true,
  };

  const last7Days: DayStat[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const key = shiftDayKey(todayKey, -i);
    if (key === todayKey) await ensureOpenDay(key);
    last7Days.push(
      (await getRow(key)) ?? {
        day: key,
        posts: 0,
        images: 0,
        chars: 0,
        sealed: key < todayKey,
      },
    );
  }

  return { timezone: STATS_TIMEZONE, today, yesterday, last7Days };
}
