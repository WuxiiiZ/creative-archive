/**
 * HomePage — a welcome slip, then three paper stocks with their latest entries.
 */
import { Link } from "react-router-dom";
import { useArchive } from "../hooks/useArchive";
import { useLocale } from "../hooks/useLocale";
import type { Section } from "../types/postSection";
import { PostLanguageTag } from "../reusableUI/PostLanguageTag";
import { postsInSection } from "../utils/posts";

const SECTIONS: Section[] = ["A", "B", "C"];

function clip(text: string, max: number) {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

function formatHomeDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
    dateStyle: "medium",
  }).format(new Date(iso));
}

function GhostCards({ count }: { count: number }) {
  return (
    <ul className="home-section__list home-section__list--ghosts" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <span className="home-section__ghost" />
        </li>
      ))}
    </ul>
  );
}

export function HomePage() {
  const { copy, locale, localizePath } = useLocale();
  const {
    state: { posts, loading, waking, error },
  } = useArchive();
  const waiting = (loading || waking || Boolean(error)) && posts.length === 0;

  return (
    <div className="home-desk">
      <aside className="home-slip paper-panel paper-panel--cream">
        <span className="home-slip__tape" aria-hidden="true" />
        <p className="home-slip__eyebrow">{copy.home.eyebrow}</p>
        <h2 className="home-slip__title">{copy.home.title}</h2>
        <p className="home-slip__lede">{copy.home.lede}</p>
        <Link className="btn btn--sticker" to={localizePath("/posts")}>
          {copy.home.postsCta}
        </Link>
      </aside>

      <section className="home-sections" aria-label={copy.home.sectionsLabel}>
        {SECTIONS.map((section) => {
          const sectionPosts = postsInSection(posts, section);
          const entries = sectionPosts.slice(0, 6);
          const ghostCount = section === "A" ? 3 : 2;
          return (
            <article
              key={section}
              className={`home-section paper-panel home-section--${section}`}
            >
              <span className="home-section__tape" aria-hidden="true" />
              <header className="home-section__header">
                <p className="home-section__eyebrow">
                  {copy.home.sectionKind[section]}
                </p>
                <h2 className="home-section__title">{copy.section[section]}</h2>
                <p className="home-section__count">
                  {copy.posts.count(sectionPosts.length)}
                </p>
              </header>

              {entries.length === 0 ? (
                waiting ? (
                  <>
                    <GhostCards count={ghostCount} />
                    <p className="home-section__waiting">{copy.home.sectionWaiting}</p>
                  </>
                ) : (
                  <p
                    className={`home-section__empty home-section__empty--${section}`}
                  >
                    {copy.home.sectionEmpty[section]}
                  </p>
                )
              ) : (
                <ul className="home-section__list">
                  {entries.map((post) => {
                    const tags = post.tags.filter(Boolean).slice(0, 3);
                    const subtags = post.subtags.filter(Boolean).slice(0, 2);
                    const summary = post.summary?.trim() ?? "";
                    const images = post.images?.filter(Boolean) ?? [];
                    const polaroid = section === "C";
                    const showPhoto = polaroid && images.length > 0;
                    const blurb = summary || clip(post.content, 72);
                    return (
                      <li key={post.id}>
                        <Link
                          className={
                            polaroid
                              ? "home-section__link home-section__link--polaroid"
                              : "home-section__link"
                          }
                          to={localizePath(`/posts/${post.id}`)}
                        >
                          {showPhoto ? (
                            <span className="home-section__photo" aria-hidden="true">
                              <img
                                className="home-section__photo-image"
                                src={images[0]}
                                alt=""
                              />
                              {images.length > 1 ? (
                                <span className="post-entry__more-images">
                                  +{images.length - 1}
                                </span>
                              ) : null}
                            </span>
                          ) : null}
                          <span className="home-section__post-heading">
                            <PostLanguageTag
                              language={post.language}
                              className="home-section__post-lang"
                            />
                            <span className="home-section__post-title">
                              {post.title}
                            </span>
                          </span>
                          <time
                            className="home-section__post-date"
                            dateTime={post.createdAt}
                          >
                            {formatHomeDate(post.createdAt, locale)}
                          </time>
                          {!showPhoto && blurb ? (
                            <span className="home-section__post-summary">
                              {blurb}
                            </span>
                          ) : null}
                          {(tags.length > 0 || subtags.length > 0) && (
                            <span className="home-section__post-taxonomies">
                              {tags.map((tag) => (
                                <span
                                  className="post-entry__tag"
                                  key={`${post.id}-tag-${tag}`}
                                >
                                  {tag}
                                </span>
                              ))}
                              {subtags.map((subtag) => (
                                <span
                                  className="post-entry__subtag"
                                  key={`${post.id}-subtag-${subtag}`}
                                >
                                  {subtag}
                                </span>
                              ))}
                            </span>
                          )}
                          {!polaroid && images.length > 0 ? (
                            <span className="post-entry__thumb" aria-hidden="true">
                              <img
                                className="post-entry__image"
                                src={images[0]}
                                alt=""
                              />
                              {images.length > 1 ? (
                                <span className="post-entry__more-images">
                                  +{images.length - 1}
                                </span>
                              ) : null}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}

              <Link
                className="home-section__more"
                to={`${localizePath("/posts")}?section=${section}`}
              >
                <span>{copy.home.sectionMore}</span>
                <span className="home-section__more-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </article>
          );
        })}
      </section>
    </div>
  );
}
