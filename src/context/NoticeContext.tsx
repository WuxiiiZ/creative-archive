import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { NoticeContext } from "./noticeContextInstance";
import { useLocale } from "../hooks/useLocale";
import { NoticeToast } from "../reusableUI/NoticeToast";

const NOTICE_MS = 1600;
const NOTICE_EXIT_MS = 220;

export function NoticeProvider({ children }: { children: ReactNode }) {
  const { copy } = useLocale();
  const [notice, setNotice] = useState<{ id: number; message: string } | null>(
    null,
  );
  const [leaving, setLeaving] = useState(false);

  const dismissNotice = useCallback(() => {
    setLeaving((alreadyLeaving) => alreadyLeaving || true);
  }, []);

  const showNotice = useCallback((next: string) => {
    setLeaving(false);
    setNotice({ id: Date.now(), message: next });
  }, []);

  useEffect(() => {
    if (!notice || leaving) return;

    const timer = window.setTimeout(() => {
      setLeaving(true);
    }, NOTICE_MS);

    return () => window.clearTimeout(timer);
  }, [leaving, notice]);

  useEffect(() => {
    if (!leaving) return;

    const timer = window.setTimeout(() => {
      setNotice(null);
      setLeaving(false);
    }, NOTICE_EXIT_MS);

    return () => window.clearTimeout(timer);
  }, [leaving]);

  useEffect(() => {
    if (!notice) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        dismissNotice();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dismissNotice, notice]);

  const value = useMemo(
    () => ({
      message: notice?.message ?? null,
      showNotice,
      dismissNotice,
    }),
    [notice, showNotice, dismissNotice],
  );

  return (
    <NoticeContext.Provider value={value}>
      {children}
      {notice ? (
        <NoticeToast
          kicker={copy.form.noticeSuccess}
          message={notice.message}
          dismissLabel={copy.form.noticeDismiss}
          leaving={leaving}
          holdMs={NOTICE_MS}
          onDismiss={dismissNotice}
        />
      ) : null}
    </NoticeContext.Provider>
  );
}
