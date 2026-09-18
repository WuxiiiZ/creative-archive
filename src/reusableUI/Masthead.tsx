/**
 * Masthead — site header for public and admin areas.
 *
 * Public: Home + All Content.
 * Admin: New Post + Manage Posts (+ desk home) + Sign out.
 * Language lives in a corner LocaleSwitch, not in this nav.
 */
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLocale } from "../hooks/useLocale";
import { isAdminHomePath, isPublicHomePath } from "../i18n/locale";
import { LocaleSwitch } from "./LocaleSwitch";

export type MastheadVariant = "public" | "admin";

function navClassName({ isActive }: { isActive: boolean }) {
  return isActive
    ? "masthead__link masthead__link--active"
    : "masthead__link";
}

interface MastheadProps {
  variant?: MastheadVariant;
}

export function Masthead({ variant = "public" }: MastheadProps) {
  const isAdmin = variant === "admin";
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { copy, localizePath } = useLocale();

  function handleSignOut() {
    logout();
    navigate(localizePath("/admin/login"), { replace: true });
  }

  return (
    <header className="masthead">
      <LocaleSwitch />
      <div className="masthead__inner">
        <p className="masthead__eyebrow">
          {isAdmin ? copy.masthead.adminEyebrow : copy.masthead.publicEyebrow}
        </p>
        <h1 className="masthead__brand">
          <Link to={isAdmin ? localizePath("/admin") : localizePath("/")}>
            Creative <em>Archive</em>
          </Link>
        </h1>
        <p className="masthead__lede">
          {isAdmin ? copy.masthead.adminLede : copy.masthead.publicLede}
        </p>
        <nav
          className="masthead__nav"
          aria-label={isAdmin ? "Admin" : "Primary"}
        >
          {isAdmin ? (
            <>
              <NavLink
                to={localizePath("/admin/new-post")}
                className={navClassName}
              >
                {copy.masthead.newPost}
              </NavLink>
              <NavLink
                to={localizePath("/admin/posts")}
                className={navClassName}
              >
                {copy.masthead.managePosts}
              </NavLink>
              <Link
                to={localizePath("/admin")}
                className={navClassName({
                  isActive: isAdminHomePath(pathname),
                })}
                aria-current={isAdminHomePath(pathname) ? "page" : undefined}
              >
                {copy.masthead.viewSite}
              </Link>
              <button
                type="button"
                className="masthead__link masthead__link--button"
                onClick={handleSignOut}
              >
                {copy.masthead.signOut}
              </button>
            </>
          ) : (
            <>
              <Link
                to={localizePath("/")}
                className={navClassName({
                  isActive: isPublicHomePath(pathname),
                })}
                aria-current={isPublicHomePath(pathname) ? "page" : undefined}
              >
                {copy.masthead.home}
              </Link>
              <NavLink to={localizePath("/posts")} className={navClassName}>
                {copy.masthead.posts}
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
