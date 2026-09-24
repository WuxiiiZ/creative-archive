/**
 * NoticeToast — a scrapbook “approval stamp” flash for short confirmations.
 *
 * Overlay + paper slip + rubber-stamp mark. Escape, scrim click, or × closes it.
 * A meter on the slip shows the remaining auto-dismiss time.
 */
interface NoticeToastProps {
  kicker: string;
  message: string;
  dismissLabel: string;
  leaving?: boolean;
  holdMs: number;
  onDismiss: () => void;
}

export function NoticeToast({
  kicker,
  message,
  dismissLabel,
  leaving = false,
  holdMs,
  onDismiss,
}: NoticeToastProps) {
  const titleId = "notice-toast-title";

  return (
    <div
      className={["notice-toast", leaving ? "notice-toast--leaving" : ""]
        .filter(Boolean)
        .join(" ")}
      role="status"
      aria-live="polite"
      aria-labelledby={titleId}
      onClick={onDismiss}
    >
      <div
        className="notice-toast__slip"
        style={{ ["--notice-hold" as string]: `${holdMs}ms` }}
        onClick={(event) => event.stopPropagation()}
      >
        <span className="notice-toast__tape" aria-hidden="true" />

        <svg
          className="notice-toast__seal"
          viewBox="0 0 72 72"
          aria-hidden="true"
        >
          <circle
            cx="36"
            cy="36"
            r="31"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeDasharray="5 4"
          />
          <circle
            className="notice-toast__seal-fill"
            cx="36"
            cy="36"
            r="24"
            stroke="currentColor"
            strokeWidth="2.75"
          />
          <path
            d="M23 37.2 32.2 46.4 50.4 26.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <p className="notice-toast__kicker">{kicker}</p>
        <p className="notice-toast__text" id={titleId}>
          {message}
        </p>

        <span className="notice-toast__meter" aria-hidden="true">
          <span className="notice-toast__meter-bar" />
        </span>

        <button
          type="button"
          className="notice-toast__dismiss"
          onClick={onDismiss}
          aria-label={dismissLabel}
        >
          ×
        </button>
      </div>
    </div>
  );
}
