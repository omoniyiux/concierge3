"use client";

import { createContext, useContext } from "react";
import type { PageCta, PageImage } from "@/lib/types";

/**
 * One set of renderers serves both the editor canvas and, from Phase 4, the
 * published site. The only thing that legitimately differs between them is
 * whether links do anything, so that is the only thing this context carries —
 * keeping the two outputs identical by construction rather than by discipline.
 */
export type RenderMode = "canvas" | "live";

const RenderModeContext = createContext<RenderMode>("live");

export const RenderModeProvider = RenderModeContext.Provider;

export const useRenderMode = () => useContext(RenderModeContext);

/** A call to action. In the canvas it is inert; nothing should navigate away. */
export function Cta({ cta, variant = "primary" }: { cta: PageCta; variant?: "primary" | "ghost" }) {
  const mode = useRenderMode();
  return (
    <a
      className={`ps-btn ps-btn--${variant}`}
      href={cta.href ?? "#"}
      data-action-id={cta.actionId}
      onClick={mode === "canvas" ? (e) => e.preventDefault() : undefined}
    >
      {cta.label}
    </a>
  );
}

/**
 * Images are optional and usually absent — an owner writes copy long before
 * they find photographs. The placeholder keeps the layout honest about the
 * space a picture will take rather than letting the page reflow later.
 */
export function Media({ image, label = "Image" }: { image?: PageImage; label?: string }) {
  if (image?.src) {
    return (
      <div className="ps-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt={image.alt} />
      </div>
    );
  }
  return <div className="ps-media">{image?.alt || label}</div>;
}

/** Shown when a section is on the page but has nothing in it yet. */
export const Empty = ({ children }: { children: string }) => <p className="ps-empty">{children}</p>;

export const Rating = ({ value }: { value: number }) => (
  <div className="ps-rating" aria-label={`${value} out of 5`}>
    {"★".repeat(Math.max(0, Math.min(5, value)))}
  </div>
);
