import type { Post } from "../types/post";
import { asPostLanguage } from "../types/postLanguage";
import { API_BASE_URL } from "./config";
import { getToken } from "./token";

async function readErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) return data.error;
  } catch {
    // keep fallback
  }
  return fallback;
}

function requireAuthHeaders(): HeadersInit {
  const token = getToken();
  if (!token) {
    throw new Error("Sign in required");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function normalizePost(post: Post): Post {
  return {
    ...post,
    summary: typeof post.summary === "string" ? post.summary : "",
    language: asPostLanguage(post.language),
    tags: Array.isArray(post.tags) ? post.tags : [],
    subtags: Array.isArray(post.subtags) ? post.subtags : [],
    images: Array.isArray(post.images) ? post.images : [],
    viewCount:
      typeof post.viewCount === "number" && Number.isFinite(post.viewCount)
        ? post.viewCount
        : 0,
  };
}

export async function fetchPosts(): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/api/posts`);
  if (!response.ok) {
    throw new Error(`Failed to load posts (${response.status})`);
  }
  const posts = (await response.json()) as Post[];
  return posts.map(normalizePost);
}

export async function createPost(post: Post): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/api/posts`, {
    method: "POST",
    headers: requireAuthHeaders(),
    body: JSON.stringify(post),
  });

  if (response.status === 401) {
    throw new Error("Session expired. Please sign in again.");
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        `Failed to create post (${response.status})`,
      ),
    );
  }

  return normalizePost((await response.json()) as Post);
}

export async function updatePost(post: Post): Promise<Post> {
  const response = await fetch(`${API_BASE_URL}/api/posts/${post.id}`, {
    method: "PUT",
    headers: requireAuthHeaders(),
    body: JSON.stringify(post),
  });

  if (response.status === 401) {
    throw new Error("Session expired. Please sign in again.");
  }

  if (response.status === 404) {
    throw new Error("Post not found.");
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        `Failed to update post (${response.status})`,
      ),
    );
  }

  return normalizePost((await response.json()) as Post);
}

export async function deletePost(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/posts/${id}`, {
    method: "DELETE",
    headers: requireAuthHeaders(),
  });

  if (response.status === 401) {
    throw new Error("Session expired. Please sign in again.");
  }

  if (response.status === 404) {
    throw new Error("Post not found.");
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        `Failed to delete post (${response.status})`,
      ),
    );
  }
}

/** Record one public view (caller should session-dedupe). */
export async function recordPostView(id: string): Promise<number | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/posts/${id}/view`, {
      method: "POST",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { viewCount?: number };
    return typeof data.viewCount === "number" ? data.viewCount : null;
  } catch {
    return null;
  }
}
