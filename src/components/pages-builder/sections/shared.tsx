import type { PageCta, PageImage } from "@/lib/types";

/* ============================================================================
   SHARED SECTION PIECES
   ----------------------------------------------------------------------------
   No "use client" and no hooks, deliberately. These render in two places: the
   editor canvas, where they are pulled into the client bundle, and the
   published page, where they are rendered to HTML on the server. Keeping them
   free of client-only APIs is what lets one set of components serve both, so
   the preview cannot drift from the live site.

   Nothing here has to know it is in the editor. The canvas already swallows
   every click in the capture phase to make the page inert, so a link needs no
   special casing to stop it navigating while someone is editing.
   ========================================================================== */

/** A call to action. In the canvas it is inert; nothing should navigate away. */
export function Cta({ cta, variant = "primary" }: { cta: PageCta; variant?: "primary" | "ghost" }) {
  return (
    <a className={`ps-btn ps-btn--${variant}`} href={cta.href ?? "#"} data-action-id={cta.actionId}>
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
