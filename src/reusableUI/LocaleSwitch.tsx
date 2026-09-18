/**
 * LocaleSwitch — header-corner sliding tab for 中 ↔ EN.
 *
 * Drag follows the pointer 1:1; release (and tap) ease smoothly to the snapped side.
 */
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  startTransition,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../hooks/useLocale";
import type { Locale } from "../i18n/locale";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function localeFromOffset(offset: number, travel: number): Locale {
  return offset >= travel / 2 ? "en" : "zh";
}

/** Smooth ease-out cubic — natural settle without bounce. */
function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

export function LocaleSwitch() {
  const navigate = useNavigate();
  const { locale, copy, switchPath } = useLocale();
  const trackId = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);

  const travelRef = useRef(0);
  const offsetRef = useRef(0);
  const frameRef = useRef(0);
  const animRef = useRef<{
    from: number;
    to: number;
    start: number;
    duration: number;
  } | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    grabOffset: number;
    moved: boolean;
    startX: number;
  } | null>(null);

  const [dragging, setDragging] = useState(false);
  const [activeSide, setActiveSide] = useState<"zh" | "en">(
    locale === "en" ? "en" : "zh",
  );

  const paintThumb = useCallback((value: number) => {
    const thumb = thumbRef.current;
    if (thumb) {
      thumb.style.transform = `translate3d(${value}px, 0, 0)`;
    }
  }, []);

  const updateSide = useCallback((value: number) => {
    const side = localeFromOffset(value, Math.max(travelRef.current, 1));
    setActiveSide((prev) => (prev === side ? prev : side));
  }, []);

  const applyOffset = useCallback(
    (value: number) => {
      offsetRef.current = value;
      paintThumb(value);
      updateSide(value);
    },
    [paintThumb, updateSide],
  );

  const measure = useCallback(() => {
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!track || !thumb) return 0;
    const styles = getComputedStyle(track);
    const pad =
      parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    return Math.max(0, track.clientWidth - pad - thumb.offsetWidth);
  }, []);

  const stopAnim = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    animRef.current = null;
  }, []);

  const animateTo = useCallback(
    (to: number, duration = 280) => {
      stopAnim();

      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion || Math.abs(to - offsetRef.current) < 0.5) {
        applyOffset(to);
        return;
      }

      animRef.current = {
        from: offsetRef.current,
        to,
        start: performance.now(),
        duration,
      };

      const step = (now: number) => {
        const anim = animRef.current;
        if (!anim) return;
        const t = clamp((now - anim.start) / anim.duration, 0, 1);
        const value = anim.from + (anim.to - anim.from) * easeOutCubic(t);
        applyOffset(value);
        if (t < 1) {
          frameRef.current = requestAnimationFrame(step);
        } else {
          applyOffset(anim.to);
          animRef.current = null;
          frameRef.current = 0;
        }
      };

      frameRef.current = requestAnimationFrame(step);
    },
    [applyOffset, stopAnim],
  );

  const syncToLocale = useCallback(
    (nextLocale: Locale = locale, instant = true) => {
      const nextTravel = measure();
      travelRef.current = nextTravel;
      const end = nextLocale === "en" ? nextTravel : 0;

      // Don't yank the thumb if a settle animation is already heading there.
      if (animRef.current && Math.abs(animRef.current.to - end) < 0.5) {
        animRef.current.to = end;
        return;
      }

      if (instant) {
        stopAnim();
        applyOffset(end);
      } else {
        animateTo(end);
      }
    },
    [locale, measure, applyOffset, animateTo, stopAnim],
  );

  useEffect(() => {
    travelRef.current = measure();
    const settled = locale === "en" ? travelRef.current : 0;

    if (animRef.current) {
      animRef.current.to = settled;
      return;
    }

    // Keep thumb aligned after measure; skip jumps while a settle is in flight.
    if (Math.abs(offsetRef.current - settled) < 1) {
      applyOffset(settled);
      return;
    }

    // Browser back / deep link: jump without fighting a user gesture.
    if (!dragRef.current) {
      applyOffset(settled);
    }
  }, [locale, measure, applyOffset]);

  useEffect(() => {
    const onResize = () => {
      if (dragRef.current || animRef.current) return;
      syncToLocale(locale, true);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [locale, syncToLocale]);

  useEffect(() => () => stopAnim(), [stopAnim]);

  const go = useCallback(
    (next: Locale) => {
      const end = next === "en" ? travelRef.current : 0;
      const distance = Math.abs(end - offsetRef.current);
      const duration = clamp(220 + distance * 1.1, 220, 360);
      animateTo(end, duration);
      if (next !== locale) {
        // Keep the settle animation alive; layout stays mounted across locales.
        startTransition(() => {
          navigate(switchPath(next));
        });
      }
    },
    [locale, navigate, switchPath, animateTo],
  );

  function offsetFromClientX(clientX: number, grabOffset: number) {
    const track = trackRef.current;
    if (!track) return offsetRef.current;
    const rect = track.getBoundingClientRect();
    const styles = getComputedStyle(track);
    const padLeft = parseFloat(styles.paddingLeft);
    const raw = clientX - rect.left - padLeft - grabOffset;
    return clamp(raw, 0, travelRef.current);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const nextTravel = measure();
    travelRef.current = nextTravel;

    const thumb = thumbRef.current;
    let grabOffset = nextTravel > 0 ? nextTravel / 4 : 12;
    if (thumb) {
      const thumbRect = thumb.getBoundingClientRect();
      grabOffset = clamp(event.clientX - thumbRect.left, 0, thumbRect.width);
    }

    stopAnim();
    dragRef.current = {
      pointerId: event.pointerId,
      grabOffset,
      moved: false,
      startX: event.clientX,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (Math.abs(event.clientX - drag.startX) > 1.5) drag.moved = true;
    applyOffset(offsetFromClientX(event.clientX, drag.grabOffset));
  }

  function finishPointer(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!drag.moved) {
      go(locale === "zh" ? "en" : "zh");
      return;
    }

    go(localeFromOffset(offsetRef.current, travelRef.current));
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft" || event.key === "Home") {
      event.preventDefault();
      go("zh");
    } else if (event.key === "ArrowRight" || event.key === "End") {
      event.preventDefault();
      go("en");
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      go(locale === "zh" ? "en" : "zh");
    }
  }

  return (
    <div
      ref={trackRef}
      id={trackId}
      className={[
        "locale-switch",
        dragging ? "locale-switch--dragging" : "",
        `locale-switch--${activeSide}`,
      ]
        .filter(Boolean)
        .join(" ")}
      role="switch"
      tabIndex={0}
      aria-checked={locale === "en"}
      aria-label={copy.masthead.langNav}
      aria-valuetext={
        locale === "zh" ? copy.masthead.langZh : copy.masthead.langEn
      }
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishPointer}
      onPointerCancel={finishPointer}
      onKeyDown={onKeyDown}
    >
      <span
        className="locale-switch__label locale-switch__label--zh"
        lang="zh-CN"
      >
        {copy.masthead.langZh}
      </span>
      <span className="locale-switch__label locale-switch__label--en" lang="en">
        {copy.masthead.langEn}
      </span>
      <span ref={thumbRef} className="locale-switch__thumb" aria-hidden="true">
        <span className="locale-switch__thumb-text">
          {activeSide === "en" ? copy.masthead.langEn : copy.masthead.langZh}
        </span>
      </span>
    </div>
  );
}
