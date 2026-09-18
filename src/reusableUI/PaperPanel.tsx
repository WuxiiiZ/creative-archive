/**
 * PaperPanel — a reusable "paper card" wrapper.
 *
 * Many screens put content inside a soft paper-looking box. This file gives
 * you that box (PaperPanel) plus small helpers for the title area and body
 * (PaperPanelHeader, PaperPanelTitle, PaperPanelBody), so pages do not have
 * to rebuild the same card layout each time.
 */
import type { ReactNode } from "react";

interface PaperPanelProps {
  children: ReactNode;
  variant?: "cream" | "lavender" | "note" | "polaroid";
  className?: string;
  tilt?: "left" | "right" | "none";
  id?: string;
}

export function PaperPanel({
  children,
  variant = "cream",
  className = "",
  tilt = "none",
  id,
}: PaperPanelProps) {
  const classes = [
    "paper-panel",
    `paper-panel--${variant}`,
    tilt !== "none" ? `paper-panel--tilt-${tilt}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} id={id}>
      {children}
    </section>
  );
}

export function PaperPanelHeader({ children }: { children: ReactNode }) {
  return <div className="paper-panel__header">{children}</div>;
}

export function PaperPanelTitle({ children }: { children: ReactNode }) {
  return <h2 className="paper-panel__title">{children}</h2>;
}

export function PaperPanelBody({ children }: { children: ReactNode }) {
  return <div className="paper-panel__body">{children}</div>;
}
