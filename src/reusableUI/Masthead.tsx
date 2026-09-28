/**
 * Masthead — site header for public and admin areas.
 *
 * Public: Home + All Content.
 * Admin: New Post + Manage Posts (+ desk home) + Sign out.
 * Language lives in a corner LocaleSwitch, not in this nav.
 */
import { useEffect, useState, type CSSProperties } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLocale } from "../hooks/useLocale";
import { isAdminHomePath, isPublicHomePath } from "../i18n/locale";
import { LocaleSwitch } from "./LocaleSwitch";

const METEOR_INTERVAL_MS = 5000;
const METEOR_FIRST_DELAY_MS = 350;
const CLUSTER_MIN = 5;
const CLUSTER_EXTRA = 3;

type MeteorTone = "lilac" | "mint" | "rose";

interface MeteorStreak {
  id: number;
  top: string;
  left: string;
  length: string;
  angle: string;
  delay: string;
  duration: string;
  travel: string;
  peak: string;
  tone: MeteorTone;
}

interface MeteorCluster {
  id: number;
  streaks: MeteorStreak[];
}

interface MeteorStyle extends CSSProperties {
  "--meteor-angle": string;
  "--meteor-delay": string;
  "--meteor-duration": string;
  "--meteor-travel": string;
  "--meteor-peak": string;
}

let meteorSeq = 0;

function pickTone(): MeteorTone {
  const roll = Math.random();
  if (roll > 0.78) return "mint";
  if (roll > 0.62) return "rose";
  return "lilac";
}

function makeMeteorCluster(): MeteorCluster {
  const fromLeft = Math.random() > 0.32;
  const count = CLUSTER_MIN + Math.floor(Math.random() * CLUSTER_EXTRA);
  const baseTop = 12 + Math.random() * 18;
  const baseLeft = fromLeft ? -14 + Math.random() * 12 : 70 + Math.random() * 14;
  const baseAngle = fromLeft ? 24 + Math.random() * 8 : 150 + Math.random() * 8;

  const streaks = Array.from({ length: count }, () => {
    const tone = pickTone();
    const lead = tone === "mint";
    return {
      id: ++meteorSeq,
      top: `${baseTop + (Math.random() - 0.5) * 9}%`,
      left: `${baseLeft + (Math.random() - 0.5) * 7}%`,
      length: `${lead ? 6.2 + Math.random() * 1.8 : 4.4 + Math.random() * 2.6}rem`,
      angle: `${baseAngle + (Math.random() - 0.5) * 4}deg`,
      delay: `${Math.random() * 0.22}s`,
      duration: `${1.45 + Math.random() * 0.4}s`,
      travel: `${18 + Math.random() * 7}rem`,
      peak: `${lead ? 0.95 : 0.72 + Math.random() * 0.2}`,
      tone,
    };
  });

  return { id: ++meteorSeq, streaks };
}

function MastheadMeteors() {
  const [cluster, setCluster] = useState<MeteorCluster | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    let timer = 0;
    const schedule = (delay: number) => {
      timer = window.setTimeout(() => {
        setCluster(makeMeteorCluster());
        schedule(METEOR_INTERVAL_MS);
      }, delay);
    };

    schedule(METEOR_FIRST_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!cluster) return null;

  return (
    <div className="masthead__sky" aria-hidden="true">
      {cluster.streaks.map((streak) => {
        const style: MeteorStyle = {
          top: streak.top,
          left: streak.left,
          width: streak.length,
          "--meteor-angle": streak.angle,
          "--meteor-delay": streak.delay,
          "--meteor-duration": streak.duration,
          "--meteor-travel": streak.travel,
          "--meteor-peak": streak.peak,
        };

        return (
          <span
            key={streak.id}
            className={`masthead__meteor masthead__meteor--${streak.tone}`}
            style={style}
          />
        );
      })}
    </div>
  );
}

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
      {isAdmin ? null : <MastheadMeteors />}
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
