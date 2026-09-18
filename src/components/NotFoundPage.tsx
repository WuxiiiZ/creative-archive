import { Link } from "react-router-dom";
import { useLocale } from "../hooks/useLocale";

export function NotFoundPage() {
  const { copy, localizePath } = useLocale();

  return (
    <section className="home-welcome paper-panel paper-panel--lavender">
      <p className="home-welcome__eyebrow">{copy.notFound.eyebrow}</p>
      <h2 className="home-welcome__title">{copy.notFound.title}</h2>
      <p className="home-welcome__lede">{copy.notFound.lede}</p>
      <div className="home-welcome__actions">
        <Link className="btn btn--sticker" to={localizePath("/")}>
          {copy.notFound.backHome}
        </Link>
      </div>
    </section>
  );
}
