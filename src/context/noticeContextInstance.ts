import { createContext } from "react";

export interface NoticeContextValue {
  message: string | null;
  showNotice: (message: string) => void;
  dismissNotice: () => void;
}

export const NoticeContext = createContext<NoticeContextValue | undefined>(
  undefined,
);
