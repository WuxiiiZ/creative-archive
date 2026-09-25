/**
 * HomePage — three scrapbook sections with their latest entries.
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

export function HomePage() {
  const { copy, localizePath } = useLocale();
  const {
    state: { posts, loading, waking, error },
  } = useArchive();
  const waiting = (loading || waking || Boolean(error)) && posts.length === 0;

  return (
    <section className="home-sections" aria-label={copy.home.sectionsLabel}>
      {SECTIONS.map((section) => {
        const sectionPosts = postsInSection(posts, section);
        const entries = sectionPosts.slice(0, 6);
        return (
          <article
            key={section}
            className={`home-section paper-panel home-section--${section}`}
          >
            <header className="home-section__header">
              <p className="home-section__eyebrow">{copy.home.sectionEyebrow}</p>
              <h2 className="home-section__title">{copy.section[section]}</h2>
              <p className="home-section__count">
                {copy.posts.count(sectionPosts.length)}
              </p>
            </header>

            {entries.length === 0 ? (
              <p className="home-section__empty">
                {waiting ? copy.home.sectionWaiting : copy.home.sectionEmpty}
              </p>
            ) : (
              <ul className="home-section__list">
                {entries.map((post) => {
                  const tags = post.tags.filter(Boolean);
                  const subtags = post.subtags.filter(Boolean);
                  const summary = post.summary?.trim() ?? "";
                  const images = post.images?.filter(Boolean) ?? [];
                  return (
                    <li key={post.id}>
                      <Link
                        className="home-section__link"
                        to={localizePath(`/posts/${post.id}`)}
                      >
                        <span className="home-section__post-heading">
                          <PostLanguageTag
                            language={post.language}
                            className="home-section__post-lang"
                          />
                          <span className="home-section__post-title">
                            {post.title}
                          </span>
                        </span>
                        {summary ? (
                          <span className="home-section__post-summary">
                            {copy.posts.summaryPrefix}
                            {clip(summary, 80)}
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
                        <span className="home-section__post-snippet">
                          {clip(post.content, 72)}
                        </span>
                        {images.length > 0 ? (
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
  );
}
