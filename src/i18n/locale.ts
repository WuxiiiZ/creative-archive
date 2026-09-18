export type Locale = "zh" | "en";

const EN_PREFIX = "/en";

export function localeFromPathname(pathname: string): Locale {
  if (pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`)) {
    return "en";
  }
  return "zh";
}

export function htmlLang(locale: Locale): string {
  return locale === "zh" ? "zh-CN" : "en";
}

/** Strip `/en` so `/en/posts` and `/posts` share the same path. */
export function stripLocalePrefix(pathname: string): string {
  if (pathname === EN_PREFIX || pathname === `${EN_PREFIX}/`) return "/";
  if (pathname.startsWith(`${EN_PREFIX}/`)) {
    const rest = pathname.slice(EN_PREFIX.length);
    return rest.startsWith("/") ? rest : `/${rest}`;
  }
  return pathname || "/";
}

/**
 * Prefix a path for the given locale.
 * Chinese lives at the root; English uses `/en` (including `/en/admin`).
 */
export function localizePath(locale: Locale, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === "zh") return normalized;
  if (normalized === "/") return EN_PREFIX;
  return `${EN_PREFIX}${normalized}`;
}

export function switchLocalePath(pathname: string, next: Locale): string {
  return localizePath(next, stripLocalePrefix(pathname));
}

/** Home is `/` (zh) or `/en` / `/en/` (en). */
export function isPublicHomePath(pathname: string): boolean {
  return (
    pathname === "/" || pathname === EN_PREFIX || pathname === `${EN_PREFIX}/`
  );
}

/** Admin desk home is `/admin` or `/en/admin`. */
export function isAdminHomePath(pathname: string): boolean {
  const bare = stripLocalePrefix(pathname);
  return bare === "/admin" || bare === "/admin/";
}
