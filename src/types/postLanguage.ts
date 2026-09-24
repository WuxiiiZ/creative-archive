export type PostLanguage = "en" | "zh";

export const postLanguages: PostLanguage[] = ["en", "zh"];

export function isPostLanguage(value: unknown): value is PostLanguage {
  return value === "en" || value === "zh";
}

export function asPostLanguage(value: unknown): PostLanguage {
  return isPostLanguage(value) ? value : "zh";
}
