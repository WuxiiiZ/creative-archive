import type { Section } from "./postSection";

export interface Post {
  id: string;
  title: string;
  /** Optional short blurb; empty string when omitted. */
  summary: string;
  content: string;
  section: Section;
  tags: string[];
  subtags: string[];
  images: string[];
  /** Public detail-page views (session-deduped on the client). */
  viewCount: number;

  createdAt: string;
  updatedAt: string;
}
