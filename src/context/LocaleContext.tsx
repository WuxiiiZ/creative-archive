import {
  useLayoutEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { LocaleContext } from "./localeContextInstance";
import {
  htmlLang,
  localeFromPathname,
  localizePath,
  switchLocalePath,
} from "../i18n/locale";
import { messages } from "../i18n/messages";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const locale = localeFromPathname(pathname);

  useLayoutEffect(() => {
    document.documentElement.lang = htmlLang(locale);
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      copy: messages[locale],
      localizePath: (path: string) => localizePath(locale, path),
      switchPath: (next: typeof locale) => switchLocalePath(pathname, next),
    }),
    [locale, pathname],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}
