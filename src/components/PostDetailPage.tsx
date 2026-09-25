/**
 * PostDetailPage — full post view with a clean labeled layout.
 */
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { recordPostView } from "../api/posts";
import { useArchive } from "../hooks/useArchive";
import { useLocale } from "../hooks/useLocale";
import {
  PaperPanel,
  PaperPanelBody,
} from "../reusableUI/PaperPanel";
import { PostLanguageTag } from "../reusableUI/PostLanguageTag";

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { locale, copy, localizePath } = useLocale();
  const {
    state: { posts, loading, waking, error },
    refreshPosts,
  } = useArchive();

  const post = posts.find((item) => item.id === id);
  const tags = post?.tags.filter(Boolean) ?? [];
  const subtags = post?.subtags.filter(Boolean) ?? [];
  const images = post?.images.filter(Boolean) ?? [];

  useEffect(() => {
    if (!id || !post) return;
    const key = `creative-archive:viewed:${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // private mode — still record once this mount
    }
    void recordPostView(id);
  }, [id, post]);

  if ((loading || waking) && !post) {
    return (
      <PaperPanel variant="cream" className="post-detail">
        <PaperPanelBody>
          <p className="post-detail__status">{copy.connection.wakingBody}</p>
        </PaperPanelBody>
      </PaperPanel>
    );
  }

  if (error && !post) {
    return (
      <PaperPanel variant="lavender" className="post-detail">
        <PaperPanelBody>
          <p className="post-detail__status" role="alert">
            {copy.connection.unavailableBody}
          </p>
          <button
            type="button"
            className="btn btn--sticker"
            onClick={() => {
              void refreshPosts();
            }}
          >
            {copy.connection.retry}
          </button>
          <Link className="post-detail__back" to={localizePath("/posts")}>
            ← {copy.postDetail.back}
          </Link>
        </PaperPanelBody>
      </PaperPanel>
    );
  }

  if (!post) {
    return (
      <PaperPanel variant="lavender" className="post-detail">
        <PaperPanelBody>
          <p className="post-detail__eyebrow">{copy.postDetail.missingEyebrow}</p>
          <h1 className="post-detail__title">{copy.postDetail.missingTitle}</h1>
          <p className="post-detail__lede">{copy.postDetail.missingLede}</p>
          <Link className="post-detail__back" to={localizePath("/posts")}>
            ← {copy.postDetail.back}
          </Link>
        </PaperPanelBody>
      </PaperPanel>
    );
  }

  return (
    <article className="post-detail paper-panel paper-panel--cream">
      <Link className="post-detail__back" to={localizePath("/posts")}>
        ← {copy.postDetail.back}
      </Link>

      <header className="post-detail__header">
        <div className="post-detail__meta-row">
          <span
            className={`post-entry__section post-entry__section--${post.section}`}
          >
            {copy.section[post.section]}
          </span>
          <PostLanguageTag language={post.language} />
          <time className="post-detail__time" dateTime={post.createdAt}>
            {formatDate(post.createdAt, locale)}
          </time>
        </div>
        <h1 className="post-detail__title">{post.title}</h1>
      </header>

      <dl className="post-detail__fields">
        {post.summary?.trim() ? (
          <div className="post-detail__field">
            <dt>{copy.compose.summary}</dt>
            <dd>{post.summary.trim()}</dd>
          </div>
        ) : null}

        <div className="post-detail__field">
          <dt>{copy.compose.section}</dt>
          <dd>{copy.section[post.section]}</dd>
        </div>

        <div className="post-detail__field">
          <dt>{copy.compose.language}</dt>
          <dd>
            <PostLanguageTag language={post.language} />
          </dd>
        </div>

        <div className="post-detail__field">
          <dt>{copy.compose.tags}</dt>
          <dd>
            {tags.length > 0 ? (
              <ul className="post-detail__chips">
                {tags.map((tag) => (
                  <li className="post-entry__tag" key={`tag-${tag}`}>
                    {tag}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="post-detail__empty">{copy.postDetail.none}</span>
            )}
          </dd>
        </div>

        <div className="post-detail__field">
          <dt>{copy.compose.subtags}</dt>
          <dd>
            {subtags.length > 0 ? (
              <ul className="post-detail__chips">
                {subtags.map((subtag) => (
                  <li className="post-entry__subtag" key={`subtag-${subtag}`}>
                    {subtag}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="post-detail__empty">{copy.postDetail.none}</span>
            )}
          </dd>
        </div>

        <div className="post-detail__field post-detail__field--body">
          <dt>{copy.compose.content}</dt>
          <dd className="post-detail__content">{post.content}</dd>
        </div>

        {images.length > 0 ? (
          <div className="post-detail__field post-detail__field--images">
            <dt>{copy.compose.images}</dt>
            <dd>
              <ul className="post-detail__gallery">
                {images.map((url) => (
                  <li key={url}>
                    <img src={url} alt="" />
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}
