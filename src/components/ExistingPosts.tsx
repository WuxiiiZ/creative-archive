import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Post } from "../types/post";
import type { Section } from "../types/postSection";
import PostCard from "../reusableUI/PostCard";
import { useArchive } from "../hooks/useArchive";
import { useLocale } from "../hooks/useLocale";
import {
  PaperPanel,
  PaperPanelBody,
  PaperPanelHeader,
  PaperPanelTitle,
} from "../reusableUI/PaperPanel";
import {
  filterPosts,
  sortPostsByTime,
  type SectionFilter,
} from "../utils/posts";

const SECTION_OPTIONS: SectionFilter[] = ["all", "A", "B", "C"];

function parseSectionParam(value: string | null): SectionFilter {
  if (value === "A" || value === "B" || value === "C") return value;
  return "all";
}

interface ExistingPostsProps {
  posts: Post[];
  /** When set, list shows Edit / Delete controls for admin manage. */
  manage?: {
    editPath: (id: string) => string;
    onDelete: (id: string) => Promise<void>;
  };
  title?: string;
  /** Public “all content” page: section chips + search above the feed. */
  showFilters?: boolean;
}

export function ExistingPosts({
  posts,
  manage,
  title,
  showFilters = false,
}: ExistingPostsProps) {
  const { copy, localizePath } = useLocale();
  const {
    state: { loading, waking, error },
  } = useArchive();
  const waiting = (loading || waking || Boolean(error)) && posts.length === 0;
  const [searchParams, setSearchParams] = useSearchParams();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const section = showFilters
    ? parseSectionParam(searchParams.get("section"))
    : "all";

  const heading = title ?? copy.posts.title;
  const visiblePosts = useMemo(() => {
    if (!showFilters) return sortPostsByTime(posts);
    return filterPosts(posts, { section, query });
  }, [posts, showFilters, section, query]);

  function setSection(next: SectionFilter) {
    const params = new URLSearchParams(searchParams);
    if (next === "all") params.delete("section");
    else params.set("section", next);
    setSearchParams(params, { replace: true });
  }

  async function handleDelete(id: string) {
    if (!manage) return;
    const confirmed = window.confirm(copy.manage.deleteConfirm);
    if (!confirmed) return;

    setActionError(null);
    setDeletingId(id);
    try {
      await manage.onDelete(id);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : copy.manage.deleteFailed,
      );
    } finally {
      setDeletingId(null);
    }
  }

  function sectionLabel(value: SectionFilter) {
    return value === "all" ? copy.posts.filterAll : copy.section[value as Section];
  }

  return (
    <div className="feed-page">
      {showFilters ? (
        <section className="feed-toolbar" aria-label={copy.posts.filterLabel}>
          <div className="feed-toolbar__sections" role="group">
            {SECTION_OPTIONS.map((value) => {
              const active = section === value;
              return (
                <button
                  key={value}
                  type="button"
                  className={[
                    "feed-toolbar__chip",
                    active ? "feed-toolbar__chip--active" : "",
                    value !== "all" ? `feed-toolbar__chip--${value}` : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={active}
                  onClick={() => setSection(value)}
                >
                  {sectionLabel(value)}
                </button>
              );
            })}
          </div>
          <label className="feed-toolbar__search">
            <span className="visually-hidden">{copy.posts.searchLabel}</span>
            <span className="feed-toolbar__search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <circle
                  cx="10.5"
                  cy="10.5"
                  r="6.25"
                  stroke="currentColor"
                  strokeWidth="2.2"
                />
                <path
                  d="M15.4 15.4 20 20"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.posts.searchPlaceholder}
              autoComplete="off"
            />
          </label>
        </section>
      ) : null}

      <PaperPanel id="diary" variant="lavender" className="feed">
        <PaperPanelHeader>
          <div className="feed__header">
            <PaperPanelTitle>{heading}</PaperPanelTitle>
            <p className="feed__count">{copy.posts.count(visiblePosts.length)}</p>
          </div>
        </PaperPanelHeader>

        <PaperPanelBody>
          {actionError ? (
            <p className="compose-form__error" role="alert">
              {actionError}
            </p>
          ) : null}
          {visiblePosts.length === 0 ? (
            <div className="feed__empty">
              <strong>
                {waiting
                  ? copy.posts.waitingTitle
                  : showFilters && (query.trim() || section !== "all")
                    ? copy.posts.filterEmptyTitle
                    : copy.posts.emptyTitle}
              </strong>
              <p>
                {waiting
                  ? copy.posts.waitingBody
                  : showFilters && (query.trim() || section !== "all")
                    ? copy.posts.filterEmptyBody
                    : copy.posts.emptyBody}
              </p>
            </div>
          ) : (
            <ul className="feed__list">
              {visiblePosts.map((post) => (
                <li key={post.id}>
                  <PostCard
                    post={post}
                    detailTo={
                      manage ? undefined : localizePath(`/posts/${post.id}`)
                    }
                    showContent={!showFilters}
                    editTo={manage ? manage.editPath(post.id) : undefined}
                    onDelete={manage ? () => handleDelete(post.id) : undefined}
                    isDeleting={deletingId === post.id}
                  />
                </li>
              ))}
            </ul>
          )}
        </PaperPanelBody>
      </PaperPanel>
    </div>
  );
}
