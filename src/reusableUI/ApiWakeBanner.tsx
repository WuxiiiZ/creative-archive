/**
 * Sticky-note banner while the Render API is waking, or after retries fail.
 *
 * Hidden on fast loads: the first-request spinner only appears after a short
 * delay so a warm backend does not flash a wake-up message.
 */
import { useEffect, useState } from "react";
import { useArchive } from "../hooks/useArchive";
import { useLocale } from "../hooks/useLocale";

const SHOW_AFTER_MS = 700;

export function ApiWakeBanner() {
  const { copy } = useLocale();
  const {
    state: { loading, waking, error, posts },
    refreshPosts,
  } = useArchive();
  const [showSlowLoad, setShowSlowLoad] = useState(false);

  const waiting = loading && posts.length === 0;
  const failed = Boolean(error) && !loading && posts.length === 0;

  useEffect(() => {
    if (!waiting || showSlowLoad) return;
    const timer = window.setTimeout(() => setShowSlowLoad(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [showSlowLoad, waiting]);

  if (!failed && !waking && !showSlowLoad) return null;

  const unavailable = failed;
  const title = unavailable
    ? copy.connection.unavailableTitle
    : copy.connection.wakingTitle;
  const body = unavailable
    ? copy.connection.unavailableBody
    : copy.connection.wakingBody;

  return (
    <aside
      className={[
        "api-wake",
        unavailable ? "api-wake--failed" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role={unavailable ? "alert" : "status"}
      aria-live={unavailable ? "assertive" : "polite"}
    >
      <span className="api-wake__tape" aria-hidden="true" />
      <div className="api-wake__copy">
        <p className="api-wake__title">
          {!unavailable ? (
            <span className="api-wake__pulse" aria-hidden="true" />
          ) : null}
          {title}
        </p>
        <p className="api-wake__body">{body}</p>
      </div>
      {unavailable ? (
        <button
          type="button"
          className="btn btn--sticker api-wake__retry"
          onClick={() => {
            void refreshPosts();
          }}
        >
          {copy.connection.retry}
        </button>
      ) : null}
    </aside>
  );
}
