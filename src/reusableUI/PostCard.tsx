/**
 * PostCard — one post shown as a single card.
 *
 * Public “All Content” hides the full body and shows title / summary / tags.
 * Home and detail pages use their own layouts. Admin manage can keep a short body.
 */
import { memo } from "react";
import { Link } from "react-router-dom";
import type { Post } from "../types/post";
import { useLocale } from "../hooks/useLocale";
import { PostLanguageTag } from "./PostLanguageTag";

interface PostCardProps {
  post: Post;
  editTo?: string;
  onDelete?: () => void;
  isDeleting?: boolean;
  /** When set, the card opens the full post page. */
  detailTo?: string;
  /** Public all-content list omits the full content body. */
  showContent?: boolean;
}

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function PostCard({
  post,
  editTo,
  onDelete,
  isDeleting,
  detailTo,
  showContent = true,
}: PostCardProps) {
  const { locale, copy } = useLocale();
  const tags = post.tags.filter(Boolean);
  const subtags = post.subtags.filter(Boolean);
  const images = post.images?.filter(Boolean) ?? [];
  const showActions = Boolean(editTo || onDelete);
  const summary = post.summary?.trim() ?? "";

  const preview = (
    <>
      <h3 className="post-entry__title">{post.title}</h3>
      {summary ? (
        <p className="post-entry__summary">
          {copy.posts.summaryPrefix}
          {summary}
        </p>
      ) : null}
      {showContent ? (
        <p className="post-entry__body">{post.content}</p>
      ) : null}
      {images.length > 0 ? (
        <div className="post-entry__thumb" aria-hidden={Boolean(detailTo)}>
          <img className="post-entry__image" src={images[0]} alt="" />
          {images.length > 1 ? (
            <span className="post-entry__more-images">
              +{images.length - 1}
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );

  return (
    <article className="post-entry paper-panel paper-panel--cream">
      <div className="post-entry__top">
        <div className="post-entry__top-main">
          <span
            className={`post-entry__section post-entry__section--${post.section}`}
          >
            {copy.section[post.section]}
          </span>
          <PostLanguageTag language={post.language} />
          <time className="post-entry__time" dateTime={post.createdAt}>
            {formatDate(post.createdAt, locale)}
          </time>
        </div>
        <span className="post-entry__views">
          {copy.posts.views(post.viewCount ?? 0)}
        </span>
      </div>

      {detailTo ? (
        <Link className="post-entry__permalink" to={detailTo}>
          {preview}
        </Link>
      ) : (
        preview
      )}

      {(tags.length > 0 || subtags.length > 0) && (
        <div className="post-entry__taxonomies">
          {tags.map((tag) => (
            <span className="post-entry__tag" key={`tag-${tag}`}>
              {tag}
            </span>
          ))}
          {subtags.map((subtag) => (
            <span className="post-entry__subtag" key={`subtag-${subtag}`}>
              {subtag}
            </span>
          ))}
        </div>
      )}

      {showActions ? (
        <div className="post-entry__actions">
          {editTo ? (
            <Link className="post-entry__action" to={editTo}>
              {copy.manage.edit}
            </Link>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              className="post-entry__action post-entry__action--danger"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? copy.manage.deleting : copy.manage.delete}
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default memo(PostCard);
