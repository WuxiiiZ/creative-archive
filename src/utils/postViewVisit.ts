import { stripLocalePrefix } from "../i18n/locale";

/** The post currently open on the public detail page, across locale remounts. */
let openDetailPostId: string | null = null;

export function isPublicPostDetailPath(pathname: string): boolean {
  return /^\/posts\/[^/]+$/.test(stripLocalePrefix(pathname));
}

/** True once per stay on a post; locale switches keep the same stay. */
export function claimPostViewVisit(id: string): boolean {
  if (openDetailPostId === id) return false;
  openDetailPostId = id;
  return true;
}

/** Leaving the detail page (home, list, another URL) starts a new visit next time. */
export function releasePostViewVisit(pathname: string) {
  if (!isPublicPostDetailPath(pathname)) {
    openDetailPostId = null;
  }
}
