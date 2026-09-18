import type { Post } from "../types/post";

export interface DayBucket {
  /** Local calendar date YYYY-MM-DD */
  key: string;
  /** Short label for chart axis */
  label: string;
  posts: number;
  images: number;
}

export interface ArchiveStats {
  todayPosts: number;
  todayImages: number;
  totalPosts: number;
  totalImages: number;
  totalViews: number;
  /** Characters in all post bodies. */
  totalChars: number;
  /** Characters in post bodies created today. */
  todayChars: number;
  /** Oldest → newest, last 7 local days including today */
  last7Days: DayBucket[];
}

/** Count characters in a way that works well for Chinese + Latin text. */
export function countChars(text: string): number {
  return Array.from(text).length;
}

function localDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shortDayLabel(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
    weekday: "short",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Build desk stats from the in-memory post list. */
export function buildArchiveStats(
  posts: Post[],
  locale: string,
  now = new Date(),
): ArchiveStats {
  const todayKey = localDayKey(now);
  let todayPosts = 0;
  let todayImages = 0;
  let totalImages = 0;
  let totalViews = 0;
  let totalChars = 0;
  let todayChars = 0;

  const dayMap = new Map<string, { posts: number; images: number }>();
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - i,
    );
    dayMap.set(localDayKey(day), { posts: 0, images: 0 });
  }

  for (const post of posts) {
    const images = post.images?.filter(Boolean).length ?? 0;
    const chars = countChars(post.content ?? "");
    totalImages += images;
    totalViews += post.viewCount ?? 0;
    totalChars += chars;

    const created = new Date(post.createdAt);
    if (Number.isNaN(created.getTime())) continue;
    const key = localDayKey(created);

    if (key === todayKey) {
      todayPosts += 1;
      todayImages += images;
      todayChars += chars;
    }

    const bucket = dayMap.get(key);
    if (bucket) {
      bucket.posts += 1;
      bucket.images += images;
    }
  }

  const last7Days: DayBucket[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const day = startOfLocalDay(
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - i),
    );
    const key = localDayKey(day);
    const bucket = dayMap.get(key) ?? { posts: 0, images: 0 };
    last7Days.push({
      key,
      label: shortDayLabel(day, locale),
      posts: bucket.posts,
      images: bucket.images,
    });
  }

  return {
    todayPosts,
    todayImages,
    totalPosts: posts.length,
    totalImages,
    totalViews,
    totalChars,
    todayChars,
    last7Days,
  };
}
