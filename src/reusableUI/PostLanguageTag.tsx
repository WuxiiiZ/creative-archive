/**
 * PostLanguageTag — compact EN / 中文 chip for a post’s chosen language.
 */
import type { PostLanguage } from "../types/postLanguage";
import { asPostLanguage } from "../types/postLanguage";
import { useLocale } from "../hooks/useLocale";

interface PostLanguageTagProps {
  language: PostLanguage | string | undefined;
  className?: string;
}

export function PostLanguageTag({ language, className }: PostLanguageTagProps) {
  const { copy } = useLocale();
  const value = asPostLanguage(language);
  const classes = ["post-entry__lang", `post-entry__lang--${value}`];
  if (className) classes.push(className);

  return <span className={classes.join(" ")}>{copy.language[value]}</span>;
}
