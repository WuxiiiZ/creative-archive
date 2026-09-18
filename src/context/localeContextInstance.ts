import { createContext } from "react";
import type { Locale } from "../i18n/locale";
import type { Messages } from "../i18n/messages";

export interface LocaleContextValue {
  locale: Locale;
  copy: Messages;
  localizePath: (path: string) => string;
  switchPath: (next: Locale) => string;
}

export const LocaleContext = createContext<LocaleContextValue | undefined>(
  undefined,
);
