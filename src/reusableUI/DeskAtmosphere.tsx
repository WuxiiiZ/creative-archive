/**
 * DeskAtmosphere — lamp glow plus a sparse field of twinkling stars
 * on the night desk, behind the scrapbook papers.
 */
import { useEffect, useState } from "react";

const STARS = [
  { top: "32%", left: "5%", size: 7, duration: "3.4s", delay: "0s", kind: "sparkle", tone: "cream" },
  { top: "38%", left: "92%", size: 3, duration: "4.1s", delay: "1.2s", kind: "dot", tone: "lilac" },
  { top: "47%", left: "8%", size: 2, duration: "2.8s", delay: "0.6s", kind: "dot", tone: "cream" },
  { top: "52%", left: "96%", size: 6, duration: "5.2s", delay: "2.1s", kind: "sparkle", tone: "mint" },
  { top: "58%", left: "3%", size: 4, duration: "3.8s", delay: "1.8s", kind: "sparkle", tone: "lilac" },
  { top: "61%", left: "88%", size: 2, duration: "2.6s", delay: "0.3s", kind: "dot", tone: "cream" },
  { top: "68%", left: "11%", size: 3, duration: "4.6s", delay: "2.8s", kind: "dot", tone: "mint" },
  { top: "72%", left: "94%", size: 7, duration: "3.1s", delay: "0.9s", kind: "sparkle", tone: "cream" },
  { top: "78%", left: "6%", size: 2, duration: "5.5s", delay: "3.4s", kind: "dot", tone: "lilac" },
  { top: "81%", left: "84%", size: 4, duration: "3.6s", delay: "1.5s", kind: "sparkle", tone: "rose" },
  { top: "86%", left: "16%", size: 6, duration: "4.8s", delay: "0.4s", kind: "sparkle", tone: "cream" },
  { top: "89%", left: "91%", size: 2, duration: "2.9s", delay: "2.4s", kind: "dot", tone: "cream" },
  { top: "41%", left: "18%", size: 2, duration: "3.3s", delay: "1.1s", kind: "dot", tone: "mint" },
  { top: "55%", left: "79%", size: 3, duration: "4.4s", delay: "2.6s", kind: "dot", tone: "lilac" },
  { top: "93%", left: "48%", size: 5, duration: "3.9s", delay: "0.7s", kind: "sparkle", tone: "cream" },
  { top: "36%", left: "74%", size: 2, duration: "5s", delay: "3s", kind: "dot", tone: "cream" },
  { top: "75%", left: "42%", size: 2, duration: "2.7s", delay: "1.6s", kind: "dot", tone: "lilac" },
  { top: "64%", left: "22%", size: 3, duration: "4.2s", delay: "2s", kind: "sparkle", tone: "mint" },
] as const;

export function DeskAtmosphere() {
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    setMotion(true);
  }, []);

  return (
    <div className="desk-atmosphere" aria-hidden="true">
      <div
        className={
          motion
            ? "desk-atmosphere__lamp desk-atmosphere__lamp--breathe"
            : "desk-atmosphere__lamp"
        }
      />
      {motion
        ? STARS.map((star, index) => (
            <span
              key={index}
              className={`desk-star desk-star--${star.kind} desk-star--${star.tone}`}
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                animationDuration: star.duration,
                animationDelay: star.delay,
              }}
            />
          ))
        : null}
    </div>
  );
}
