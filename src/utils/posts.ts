import type { Post } from "../types/post";
import type { Section } from "../types/postSection";

export type SectionFilter = Section | "all";

/** Newest first by createdAt (falls back to updatedAt). */
export function sortPostsByTime(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    const aTime = Date.parse(a.createdAt || a.updatedAt);
    const bTime = Date.parse(b.createdAt || b.updatedAt);
    return bTime - aTime;
  });
}

export function postsInSection(posts: Post[], section: Section): Post[] {
  return sortPostsByTime(posts.filter((post) => post.section === section));
}

export function filterPosts(
  posts: Post[],
  options: { section: SectionFilter; query: string },
): Post[] {
  const needle = options.query.trim().toLowerCase();
  let next = sortPostsByTime(posts);

  if (options.section !== "all") {
    next = next.filter((post) => post.section === options.section);
  }

  if (!needle) return next;

  return next.filter((post) => {
    const haystack = [
      post.title,
      post.summary ?? "",
      post.content,
      ...post.tags,
      ...post.subtags,
    ]
      .join("\n")
      .toLowerCase();
    return haystack.includes(needle);
  });
}
