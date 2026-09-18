/**
 * Admin desk landing — settled daily stats, all-time panel, charts.
 */
import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  fetchDeskStats,
  type DeskDayStat,
  type DeskStatsResponse,
} from "../api/stats";
import { useArchive } from "../hooks/useArchive";
import { useLocale } from "../hooks/useLocale";
import { countChars } from "../utils/adminStats";

type DayTab = "today" | "yesterday";

function chartLabel(dayKey: string, locale: string): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
    weekday: "short",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

function ActivityChart({
  days,
  postsLabel,
  imagesLabel,
  locale,
}: {
  days: DeskDayStat[];
  postsLabel: string;
  imagesLabel: string;
  locale: string;
}) {
  const max = Math.max(1, ...days.map((d) => Math.max(d.posts, d.images)));
  const width = 420;
  const height = 180;
  const padL = 28;
  const padR = 12;
  const padT = 16;
  const padB = 36;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const groupW = innerW / Math.max(days.length, 1);
  const barW = Math.min(14, groupW * 0.28);

  return (
    <svg
      className="admin-desk__chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${postsLabel} / ${imagesLabel}`}
    >
      {[0.25, 0.5, 0.75, 1].map((t) => {
        const y = padT + innerH * (1 - t);
        return (
          <line
            key={t}
            className="admin-desk__grid"
            x1={padL}
            x2={width - padR}
            y1={y}
            y2={y}
          />
        );
      })}
      {days.map((day, index) => {
        const label = chartLabel(day.day, locale);
        const cx = padL + groupW * index + groupW / 2;
        const postH = (day.posts / max) * innerH;
        const imageH = (day.images / max) * innerH;
        return (
          <g key={day.day}>
            <rect
              className="admin-desk__bar admin-desk__bar--posts"
              x={cx - barW - 2}
              y={padT + innerH - postH}
              width={barW}
              height={Math.max(postH, day.posts > 0 ? 2 : 0)}
              rx={3}
            >
              <title>{`${label}: ${day.posts} ${postsLabel}`}</title>
            </rect>
            <rect
              className="admin-desk__bar admin-desk__bar--images"
              x={cx + 2}
              y={padT + innerH - imageH}
              width={barW}
              height={Math.max(imageH, day.images > 0 ? 2 : 0)}
              rx={3}
            >
              <title>{`${label}: ${day.images} ${imagesLabel}`}</title>
            </rect>
            <text
              className="admin-desk__axis"
              x={cx}
              y={height - 10}
              textAnchor="middle"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CharDonut({
  totalChars,
  todayChars,
  totalLabel,
  todayLabel,
  earlierLabel,
  emptyLabel,
}: {
  totalChars: number;
  todayChars: number;
  totalLabel: string;
  todayLabel: string;
  earlierLabel: string;
  emptyLabel: string;
}) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 72;
  const stroke = 28;
  const earlierChars = Math.max(0, totalChars - todayChars);
  const safeToday = Math.min(todayChars, totalChars);

  if (totalChars <= 0) {
    return (
      <div className="admin-desk__donut-wrap">
        <svg
          className="admin-desk__donut"
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={emptyLabel}
        >
          <circle
            className="admin-desk__donut-track"
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            strokeWidth={stroke}
          />
          <text
            className="admin-desk__donut-center-value"
            x={cx}
            y={cy - 4}
            textAnchor="middle"
          >
            0
          </text>
          <text
            className="admin-desk__donut-center-label"
            x={cx}
            y={cy + 16}
            textAnchor="middle"
          >
            {totalLabel}
          </text>
        </svg>
        <p className="admin-desk__donut-empty">{emptyLabel}</p>
      </div>
    );
  }

  const circumference = 2 * Math.PI * radius;
  const todayLen = (safeToday / totalChars) * circumference;
  const earlierLen = (earlierChars / totalChars) * circumference;

  return (
    <div className="admin-desk__donut-wrap">
      <svg
        className="admin-desk__donut"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${totalLabel} ${totalChars}, ${todayLabel} ${safeToday}`}
      >
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          <circle
            className="admin-desk__donut-slice admin-desk__donut-slice--earlier"
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeDasharray={`${earlierLen} ${circumference - earlierLen}`}
            strokeDashoffset={0}
          >
            <title>{`${earlierLabel}: ${earlierChars}`}</title>
          </circle>
          <circle
            className="admin-desk__donut-slice admin-desk__donut-slice--today"
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeDasharray={`${todayLen} ${circumference - todayLen}`}
            strokeDashoffset={-earlierLen}
          >
            <title>{`${todayLabel}: ${safeToday}`}</title>
          </circle>
        </g>
        <text
          className="admin-desk__donut-center-value"
          x={cx}
          y={cy - 4}
          textAnchor="middle"
        >
          {totalChars}
        </text>
        <text
          className="admin-desk__donut-center-label"
          x={cx}
          y={cy + 16}
          textAnchor="middle"
        >
          {totalLabel}
        </text>
      </svg>
      <ul className="admin-desk__donut-legend">
        <li>
          <span className="admin-desk__swatch admin-desk__swatch--today-chars" />
          {todayLabel}
          <strong>{safeToday}</strong>
        </li>
        <li>
          <span className="admin-desk__swatch admin-desk__swatch--earlier-chars" />
          {earlierLabel}
          <strong>{earlierChars}</strong>
        </li>
      </ul>
    </div>
  );
}

const emptyDay = (day: string): DeskDayStat => ({
  day,
  posts: 0,
  images: 0,
  chars: 0,
  sealed: true,
});

export function AdminHomePage() {
  const { copy, locale, localizePath } = useLocale();
  const {
    state: { posts, loading },
  } = useArchive();
  const [dayTab, setDayTab] = useState<DayTab>("today");
  const [desk, setDesk] = useState<DeskStatsResponse | null>(null);
  const [deskError, setDeskError] = useState<string | null>(null);

  const totals = useMemo(() => {
    let totalImages = 0;
    let totalViews = 0;
    let totalChars = 0;
    for (const post of posts) {
      totalImages += post.images?.filter(Boolean).length ?? 0;
      totalViews += post.viewCount ?? 0;
      totalChars += countChars(post.content ?? "");
    }
    return {
      totalPosts: posts.length,
      totalImages,
      totalViews,
      totalChars,
    };
  }, [posts]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const next = await fetchDeskStats();
        if (!cancelled) {
          setDesk(next);
          setDeskError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setDeskError(
            error instanceof Error ? error.message : copy.adminHome.loading,
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [copy.adminHome.loading, posts.length]);

  const activeDay =
    dayTab === "today"
      ? (desk?.today ?? emptyDay(""))
      : (desk?.yesterday ?? emptyDay(""));

  const dayMetrics = [
    {
      key: "posts",
      label:
        dayTab === "today"
          ? copy.adminHome.todayPosts
          : copy.adminHome.yesterdayPosts,
      value: activeDay.posts,
    },
    {
      key: "images",
      label:
        dayTab === "today"
          ? copy.adminHome.todayImages
          : copy.adminHome.yesterdayImages,
      value: activeDay.images,
    },
  ] as const;

  const allMetrics = [
    {
      key: "totalPosts",
      label: copy.adminHome.totalPosts,
      value: totals.totalPosts,
    },
    {
      key: "totalImages",
      label: copy.adminHome.totalImages,
      value: totals.totalImages,
    },
    {
      key: "totalViews",
      label: copy.adminHome.totalViews,
      value: totals.totalViews,
    },
  ] as const;

  return (
    <div className="admin-desk">
      <section className="home-welcome paper-panel paper-panel--lavender">
        <p className="home-welcome__eyebrow">{copy.adminHome.eyebrow}</p>
        <h2 className="home-welcome__title">{copy.adminHome.title}</h2>
        <p className="home-welcome__lede">{copy.adminHome.lede}</p>
        <div className="home-welcome__actions">
          <NavLink
            className="btn btn--sticker"
            to={localizePath("/admin/new-post")}
          >
            {copy.masthead.newPost}
          </NavLink>
          <NavLink
            className="btn btn--sticker"
            to={localizePath("/admin/posts")}
          >
            {copy.masthead.managePosts}
          </NavLink>
        </div>
      </section>

      <section
        className="admin-desk__stats paper-panel paper-panel--cream"
        aria-label={copy.adminHome.statsLabel}
      >
        <header className="admin-desk__stats-header admin-desk__stats-header--split">
          <div className="admin-desk__stats-copy">
            <p className="admin-desk__eyebrow">{copy.adminHome.statsEyebrow}</p>
            <h3 className="admin-desk__stats-title">
              {dayTab === "today"
                ? copy.adminHome.statsTitle
                : copy.adminHome.yesterdayTitle}
            </h3>
            <p className="admin-desk__hint">
              {dayTab === "today"
                ? copy.adminHome.statsHint
                : copy.adminHome.yesterdayHint}
            </p>
          </div>
          <div
            className="admin-desk__day-tabs"
            role="tablist"
            aria-label={copy.adminHome.dayTabsLabel}
          >
            <button
              type="button"
              role="tab"
              aria-selected={dayTab === "today"}
              className={
                dayTab === "today"
                  ? "admin-desk__day-tab is-active"
                  : "admin-desk__day-tab"
              }
              onClick={() => setDayTab("today")}
            >
              {copy.adminHome.tabToday}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={dayTab === "yesterday"}
              className={
                dayTab === "yesterday"
                  ? "admin-desk__day-tab is-active"
                  : "admin-desk__day-tab"
              }
              onClick={() => setDayTab("yesterday")}
            >
              {copy.adminHome.tabYesterday}
            </button>
          </div>
        </header>

        {deskError ? (
          <p className="admin-desk__loading" role="alert">
            {deskError}
          </p>
        ) : !desk ? (
          <p className="admin-desk__loading">{copy.adminHome.loading}</p>
        ) : (
          <>
            <ul className="admin-desk__metrics">
              {dayMetrics.map((metric) => (
                <li key={metric.key} className="admin-desk__metric">
                  <span className="admin-desk__metric-value">
                    {metric.value}
                  </span>
                  <span className="admin-desk__metric-label">
                    {metric.label}
                  </span>
                </li>
              ))}
            </ul>

            <div className="admin-desk__chart-block">
              <div className="admin-desk__chart-head">
                <h4 className="admin-desk__chart-title">
                  {copy.adminHome.chartTitle}
                </h4>
                <ul className="admin-desk__legend">
                  <li>
                    <span className="admin-desk__swatch admin-desk__swatch--posts" />
                    {copy.adminHome.chartPosts}
                  </li>
                  <li>
                    <span className="admin-desk__swatch admin-desk__swatch--images" />
                    {copy.adminHome.chartImages}
                  </li>
                </ul>
              </div>
              <ActivityChart
                days={desk.last7Days}
                postsLabel={copy.adminHome.chartPosts}
                imagesLabel={copy.adminHome.chartImages}
                locale={locale}
              />
            </div>
          </>
        )}
      </section>

      <section
        className="admin-desk__stats paper-panel paper-panel--cream"
        aria-label={copy.adminHome.allStatsLabel}
      >
        <header className="admin-desk__stats-header">
          <p className="admin-desk__eyebrow">{copy.adminHome.allStatsEyebrow}</p>
          <h3 className="admin-desk__stats-title">
            {copy.adminHome.allStatsTitle}
          </h3>
          <p className="admin-desk__hint">{copy.adminHome.allStatsHint}</p>
        </header>

        {loading && posts.length === 0 ? (
          <p className="admin-desk__loading">{copy.adminHome.loading}</p>
        ) : (
          <>
            <ul className="admin-desk__metrics">
              {allMetrics.map((metric) => (
                <li key={metric.key} className="admin-desk__metric">
                  <span className="admin-desk__metric-value">
                    {metric.value}
                  </span>
                  <span className="admin-desk__metric-label">
                    {metric.label}
                  </span>
                </li>
              ))}
            </ul>

            <div className="admin-desk__chart-block">
              <div className="admin-desk__chart-head">
                <h4 className="admin-desk__chart-title">
                  {copy.adminHome.charsChartTitle}
                </h4>
              </div>
              <CharDonut
                totalChars={totals.totalChars}
                todayChars={desk?.today.chars ?? 0}
                totalLabel={copy.adminHome.totalChars}
                todayLabel={copy.adminHome.todayChars}
                earlierLabel={copy.adminHome.earlierChars}
                emptyLabel={copy.adminHome.charsEmpty}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
