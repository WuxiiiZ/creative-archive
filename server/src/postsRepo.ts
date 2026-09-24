/**
 * Post persistence: map between API Post shape and Postgres rows.
 */
import { pool } from "./db.js";
import type { Post } from "./types.js";

interface PostRow {
  id: string;
  title: string;
  summary: string;
  content: string;
  section: "A" | "B" | "C";
  language: "en" | "zh" | null;
  tags: string[] | null;
  subtags: string[] | null;
  images: string[] | null;
  view_count: number | string | null;
  created_at: Date;
  updated_at: Date;
}

const POST_COLUMNS = `id, title, summary, content, section, language, tags, subtags, images,
            view_count, created_at, updated_at`;

function rowToPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary ?? "",
    content: row.content,
    section: row.section,
    language: row.language === "en" ? "en" : "zh",
    tags: row.tags ?? [],
    subtags: row.subtags ?? [],
    images: row.images ?? [],
    viewCount: Number(row.view_count ?? 0),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listPosts(): Promise<Post[]> {
  const result = await pool.query<PostRow>(
    `SELECT ${POST_COLUMNS}
     FROM posts
     ORDER BY created_at DESC`,
  );
  return result.rows.map(rowToPost);
}

export async function insertPost(post: Post): Promise<Post> {
  const result = await pool.query<PostRow>(
    `INSERT INTO posts (
       id, title, summary, content, section, language, tags, subtags, images,
       view_count, created_at, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::timestamptz, $12::timestamptz
     )
     RETURNING ${POST_COLUMNS}`,
    [
      post.id,
      post.title,
      post.summary,
      post.content,
      post.section,
      post.language,
      post.tags,
      post.subtags,
      post.images,
      post.viewCount ?? 0,
      post.createdAt,
      post.updatedAt,
    ],
  );
  return rowToPost(result.rows[0]);
}

export async function findPostById(id: string): Promise<Post | null> {
  const result = await pool.query<PostRow>(
    `SELECT ${POST_COLUMNS}
     FROM posts
     WHERE id = $1`,
    [id],
  );
  const row = result.rows[0];
  return row ? rowToPost(row) : null;
}

export async function updatePostById(post: Post): Promise<Post | null> {
  const result = await pool.query<PostRow>(
    `UPDATE posts SET
       title = $2,
       summary = $3,
       content = $4,
       section = $5,
       language = $6,
       tags = $7,
       subtags = $8,
       images = $9,
       updated_at = $10::timestamptz
     WHERE id = $1
     RETURNING ${POST_COLUMNS}`,
    [
      post.id,
      post.title,
      post.summary,
      post.content,
      post.section,
      post.language,
      post.tags,
      post.subtags,
      post.images,
      post.updatedAt,
    ],
  );
  const row = result.rows[0];
  return row ? rowToPost(row) : null;
}

export async function deletePostById(id: string): Promise<Post | null> {
  const result = await pool.query<PostRow>(
    `DELETE FROM posts
     WHERE id = $1
     RETURNING ${POST_COLUMNS}`,
    [id],
  );
  const row = result.rows[0];
  return row ? rowToPost(row) : null;
}

/** Increment public view counter; returns new count or null if missing. */
export async function incrementPostView(id: string): Promise<number | null> {
  const result = await pool.query<{ view_count: number | string }>(
    `UPDATE posts
     SET view_count = view_count + 1
     WHERE id = $1
     RETURNING view_count`,
    [id],
  );
  const row = result.rows[0];
  return row ? Number(row.view_count) : null;
}
