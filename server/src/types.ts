/**
 * Data model and request validation: define Post shape and normalize raw bodies.
 * This file does not open ports or register routes; index.ts consumes these exports.
 */

/** Section codes aligned with the frontend Section type */
export type Section = "A" | "B" | "C";

/** Content language chosen when publishing */
export type PostLanguage = "en" | "zh";

/** Full post document shape (fields aligned with the frontend Post type) */
export interface Post {
  id: string;
  title: string;
  /** Optional short blurb; empty string when omitted. */
  summary: string;
  content: string;
  section: Section;
  language: PostLanguage;
  tags: string[];
  subtags: string[];
  images: string[];
  /** Public detail-page view count. */
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

const SECTIONS: Section[] = ["A", "B", "C"];
const LANGUAGES: PostLanguage[] = ["en", "zh"];

/** Type guard: whether an unknown value is a valid Section */
export function isSection(value: unknown): value is Section {
  return typeof value === "string" && SECTIONS.includes(value as Section);
}

/** Type guard: whether an unknown value is a valid post language */
export function isPostLanguage(value: unknown): value is PostLanguage {
  return typeof value === "string" && LANGUAGES.includes(value as PostLanguage);
}

function asPostLanguage(
  value: unknown,
  fallback: PostLanguage = "zh",
): PostLanguage {
  return isPostLanguage(value) ? value : fallback;
}

/** Coerce an unknown value into string[]; non-arrays become [] */
function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

/**
 * Validate and normalize a create-post request body.
 * - Missing title, or section not in A|B|C → returns null
 * - Missing id / timestamps → filled in automatically
 */
export function parseNewPost(body: unknown): Post | null {
  if (!body || typeof body !== "object") return null;

  const data = body as Record<string, unknown>;
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const summary =
    typeof data.summary === "string" ? data.summary.trim() : "";
  const content = typeof data.content === "string" ? data.content : "";
  const section = data.section;
  const language = asPostLanguage(data.language);

  if (!title || !isSection(section)) return null;

  const now = new Date().toISOString();
  const id =
    typeof data.id === "string" && data.id.trim()
      ? data.id.trim()
      : crypto.randomUUID();

  return {
    id,
    title,
    summary,
    content,
    section,
    language,
    tags: asStringArray(data.tags),
    subtags: asStringArray(data.subtags),
    images: asStringArray(data.images),
    viewCount: 0,
    createdAt:
      typeof data.createdAt === "string" && data.createdAt
        ? data.createdAt
        : now,
    updatedAt:
      typeof data.updatedAt === "string" && data.updatedAt
        ? data.updatedAt
        : now,
  };
}

/**
 * Validate fields for updating an existing post.
 * Preserves id and createdAt; refreshes updatedAt.
 */
export function parsePostUpdate(
  body: unknown,
  existing: Post,
): Post | null {
  if (!body || typeof body !== "object") return null;

  const data = body as Record<string, unknown>;
  const title = typeof data.title === "string" ? data.title.trim() : "";
  const summary =
    typeof data.summary === "string"
      ? data.summary.trim()
      : existing.summary ?? "";
  const content =
    typeof data.content === "string" ? data.content : existing.content;
  const section = data.section !== undefined ? data.section : existing.section;
  const language =
    data.language !== undefined
      ? asPostLanguage(data.language, existing.language)
      : existing.language;

  if (!title || !isSection(section)) return null;

  return {
    id: existing.id,
    title,
    summary,
    content,
    section,
    language,
    tags: data.tags !== undefined ? asStringArray(data.tags) : existing.tags,
    subtags:
      data.subtags !== undefined
        ? asStringArray(data.subtags)
        : existing.subtags,
    images:
      data.images !== undefined
        ? asStringArray(data.images)
        : existing.images,
    viewCount: existing.viewCount,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };
}
